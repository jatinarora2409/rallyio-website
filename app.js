// rallyio account dashboard — Google Sign-In + credits + API keys.
(function () {
  // Public OAuth Web client ID (set after creating it in the GCP console).
  var GOOGLE_CLIENT_ID = '491899586229-g8ot55ojq6oqnkda9cvqg47bc7uene3h.apps.googleusercontent.com';
  var API_BASE = 'https://rallyio-hfr-bmurezb4na-uc.a.run.app';
  var TOKEN_KEY = 'rallyio_gtoken';

  var $ = function (id) { return document.getElementById(id); };
  var yearEl = $('year'); if (yearEl) yearEl.textContent = new Date().getFullYear();

  function show(id) {
    ['signedOut', 'loading', 'dashboard'].forEach(function (s) {
      var el = $(s); if (el) el.hidden = (s !== id);
    });
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function mask(k) { return k.length > 12 ? esc(k.slice(0, 7)) + '…' + esc(k.slice(-4)) : esc(k); }
  function token() { return localStorage.getItem(TOKEN_KEY) || ''; }

  // ---- API ----
  function api(path, opts) {
    opts = opts || {};
    opts.headers = opts.headers || {};
    if (token()) opts.headers['Authorization'] = 'Bearer ' + token();
    return fetch(API_BASE + path, opts).then(function (r) {
      if (r.status === 401) { signOut('Your session expired — please sign in again.'); throw new Error('unauthorized'); }
      return r.json().then(function (body) {
        if (!r.ok) throw new Error(body && body.message ? body.message : ('HTTP ' + r.status));
        return body;
      });
    });
  }

  // ---- Render ----
  function renderDashboard(d) {
    $('userName').textContent = d.name || 'Researcher';
    $('userEmail').textContent = d.email || '';
    var av = $('avatar');
    if (d.picture) { av.src = d.picture; av.style.display = ''; } else { av.style.display = 'none'; }
    $('credits').textContent = '$' + Number(d.credits_usd || 0).toFixed(2);
    if (d.payments_enabled) $('buyBox').hidden = false;
    show('dashboard');
    loadUsage();
    loadCatalogPrefs();

    var params = new URLSearchParams(window.location.search);
    if (params.get('paid')) {
      if ($('buyNote')) $('buyNote').textContent = 'Payment received — adding your credits…';
      window.history.replaceState({}, '', window.location.pathname);
      setTimeout(refreshBalance, 2500);  // webhook credits asynchronously
    } else if (params.get('canceled')) {
      window.history.replaceState({}, '', window.location.pathname);
    }
  }

  function refreshBalance() {
    api('/me').then(function (d) {
      $('credits').textContent = '$' + Number(d.credits_usd || 0).toFixed(2);
      if ($('buyNote')) $('buyNote').textContent = 'Pay by card — $1 = $1 of credits.';
    }).catch(function () {});
  }

  // ---- Usage history ----
  function toolLabel(t) {
    return t === 'structured_catalog_search' ? 'read'
      : t === 'federated_entity_lookup' ? 'lookup' : (t || '');
  }
  function fmtTime(s) {
    if (!s) return '';
    var d = new Date(String(s).replace(' ', 'T') + 'Z');
    return isNaN(d) ? s : d.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  }
  function loadUsage() {
    var list = $('usageList');
    list.innerHTML = '<p class="usage-empty">Loading…</p>';
    api('/me/usage')
      .then(function (d) { renderUsage(d.usage || []); })
      .catch(function (e) { if (e.message !== 'unauthorized') list.innerHTML = '<p class="usage-empty">Couldn\'t load usage.</p>'; });
  }
  function renderUsage(rows) {
    var list = $('usageList');
    if (!rows.length) {
      list.innerHTML = '<p class="usage-empty">No reads yet. Connect rallyio in Claude and run a search.</p>';
      return;
    }
    list.innerHTML =
      '<div class="usage-row usage-row--head"><span>When</span><span>Action</span><span>Catalog</span><span>Charge</span><span>Balance</span></div>' +
      rows.map(function (r) {
        var amt = Math.abs(Number(r.amount) || 0).toFixed(2);
        return '<div class="usage-row">' +
          '<span>' + esc(fmtTime(r.at)) + '</span>' +
          '<span>' + esc(toolLabel(r.tool)) + '</span>' +
          '<span class="usage-cat">' + esc(r.catalog_id || '—') + '</span>' +
          '<span class="usage-amt">−$' + amt + '</span>' +
          '<span>$' + (Number(r.balance_after) || 0).toFixed(2) + '</span>' +
          '</div>';
      }).join('');
  }

  // ---- Catalog preferences (per-account enable/disable) ----
  var catPrefs = { cats: [] };

  function loadCatalogPrefs() {
    var box = $('catalogPrefs'); if (!box) return;
    box.innerHTML = '<p class="usage-empty">Loading…</p>';
    api('/me/catalogs').then(function (d) {
      catPrefs.cats = d.catalogs || [];
      renderCatalogPrefs();
    }).catch(function (e) {
      if (e.message !== 'unauthorized') box.innerHTML = '<p class="usage-empty">Couldn\'t load catalogs.</p>';
    });
  }

  function disabledList() {
    return catPrefs.cats.filter(function (c) { return !c.enabled; }).map(function (c) { return c.catalog_id; });
  }

  function renderCatalogPrefs() {
    var box = $('catalogPrefs'); if (!box) return;
    var q = (($('catPrefsSearch') || {}).value || '').trim().toLowerCase();
    var enabled = catPrefs.cats.filter(function (c) { return c.enabled; }).length;
    if ($('catPrefsCount')) $('catPrefsCount').textContent = enabled + ' of ' + catPrefs.cats.length + ' enabled';
    var list = catPrefs.cats.filter(function (c) {
      return !q || (String(c.name) + ' ' + c.catalog_id + ' ' + (c.domain || '')).toLowerCase().indexOf(q) !== -1;
    });
    if (!list.length) { box.innerHTML = '<p class="usage-empty">No catalogs match.</p>'; return; }
    box.innerHTML = list.map(function (c) {
      var paid = Number(c.read_rate_usd) > 0;
      var meta = esc(String(c.domain || '').replace(/_/g, ' ')) + (paid ? ' · $' + (c.read_rate_usd * 1000) + ' / 1k reads' : ' · free');
      return '<label class="cat-pref">' +
        '<span class="cat-pref__info"><strong>' + esc(c.name) + '</strong>' +
        '<span class="cat-pref__meta">' + meta + '</span></span>' +
        '<input type="checkbox" class="cat-pref__toggle" data-id="' + esc(c.catalog_id) + '"' +
        (c.enabled ? ' checked' : '') + ' /></label>';
    }).join('');
  }

  function setCatById(id, enabled) {
    for (var i = 0; i < catPrefs.cats.length; i++) {
      if (catPrefs.cats[i].catalog_id === id) { catPrefs.cats[i].enabled = enabled; return; }
    }
  }

  function saveCatalogPrefs() {
    api('/me/catalogs', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ disabled: disabledList() })
    }).catch(function () {});
  }

  var prefsBox = $('catalogPrefs');
  if (prefsBox) {
    prefsBox.addEventListener('change', function (e) {
      var t = e.target;
      if (!t.classList || !t.classList.contains('cat-pref__toggle')) return;
      setCatById(t.getAttribute('data-id'), t.checked);
      if ($('catPrefsCount')) {
        var enabled = catPrefs.cats.filter(function (c) { return c.enabled; }).length;
        $('catPrefsCount').textContent = enabled + ' of ' + catPrefs.cats.length + ' enabled';
      }
      saveCatalogPrefs();
    });
  }
  if ($('catPrefsSearch')) $('catPrefsSearch').addEventListener('input', renderCatalogPrefs);
  if ($('catPrefsAll')) $('catPrefsAll').addEventListener('click', function () {
    catPrefs.cats.forEach(function (c) { c.enabled = true; }); saveCatalogPrefs(); renderCatalogPrefs();
  });
  if ($('catPrefsNone')) $('catPrefsNone').addEventListener('click', function () {
    catPrefs.cats.forEach(function (c) { c.enabled = false; }); saveCatalogPrefs(); renderCatalogPrefs();
  });

  // ---- Auth ----
  function onCredential(resp) {
    localStorage.setItem(TOKEN_KEY, resp.credential);
    show('loading');
    api('/auth/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential: resp.credential })
    }).then(renderDashboard).catch(function (e) {
      if (e.message !== 'unauthorized') signOut(e.message);
    });
  }

  function signOut(note) {
    localStorage.removeItem(TOKEN_KEY);
    try { if (window.google) google.accounts.id.disableAutoSelect(); } catch (e) {}
    $('authNote').textContent = note || '';
    show('signedOut');
    renderSignInButton();
  }

  function renderSignInButton() {
    if (GOOGLE_CLIENT_ID.indexOf('__GOOGLE_CLIENT_ID__') === 0) {
      $('gsiButton').innerHTML = '';
      $('authNote').textContent = 'Sign-in is being set up — check back shortly.';
      return;
    }
    waitForGsi(function () {
      google.accounts.id.initialize({ client_id: GOOGLE_CLIENT_ID, callback: onCredential });
      google.accounts.id.renderButton($('gsiButton'), {
        theme: 'outline', size: 'large', shape: 'pill', text: 'signin_with', width: 260
      });
    });
  }

  function waitForGsi(cb) {
    if (window.google && google.accounts && google.accounts.id) return cb();
    var n = 0, t = setInterval(function () {
      if (window.google && google.accounts && google.accounts.id) { clearInterval(t); cb(); }
      else if (++n > 50) { clearInterval(t); $('authNote').textContent = 'Could not load Google sign-in.'; }
    }, 100);
  }

  // ---- Copy the connector URL ----
  var copyConnect = $('copyConnect');
  if (copyConnect) {
    copyConnect.addEventListener('click', function () {
      var v = $('connectUrl').textContent.trim();
      navigator.clipboard && navigator.clipboard.writeText(v);
      this.textContent = 'Copied';
      var self = this; setTimeout(function () { self.textContent = 'Copy'; }, 1500);
    });
  }

  // ---- Buy credits (Stripe Checkout) ----
  var buyBtn = $('buyBtn');
  if (buyBtn) {
    buyBtn.addEventListener('click', function () {
      var amt = parseFloat($('buyAmount').value);
      if (!amt || amt < 1) { $('buyNote').textContent = 'Enter an amount of at least $1.'; return; }
      buyBtn.disabled = true;
      $('buyNote').textContent = 'Redirecting to secure checkout…';
      api('/me/checkout', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount_usd: amt })
      })
        .then(function (d) { if (d.url) { window.location.href = d.url; } else { throw new Error('No checkout URL'); } })
        .catch(function (e) {
          if (e.message !== 'unauthorized') { $('buyNote').textContent = e.message; buyBtn.disabled = false; }
        });
    });
  }

  $('refreshUsage').addEventListener('click', loadUsage);

  $('signOut').addEventListener('click', function () { signOut(''); });

  // ---- Boot: resume an existing session or show sign-in ----
  if (token()) {
    show('loading');
    api('/me').then(renderDashboard).catch(function (e) {
      if (e.message !== 'unauthorized') signOut('');
    });
  } else {
    signOut('');
  }
})();
