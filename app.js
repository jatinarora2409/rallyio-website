// rallyio account dashboard — Google Sign-In + credits + API keys.
(function () {
  // Public OAuth Web client ID (set after creating it in the GCP console).
  var GOOGLE_CLIENT_ID = '__GOOGLE_CLIENT_ID__';
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
  function token() { return sessionStorage.getItem(TOKEN_KEY) || ''; }

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
    renderKeys(d.keys || []);
    show('dashboard');
  }

  function renderKeys(keys) {
    var list = $('keyList');
    if (!keys.length) {
      list.innerHTML = '<p class="key-empty">No keys yet. Generate one to start reading data.</p>';
      return;
    }
    list.innerHTML = keys.map(function (k) {
      return '<div class="key-row">' +
        '<code>' + mask(k.api_key) + '</code>' +
        '<span class="key-meta">' + (k.label ? esc(k.label) + ' · ' : '') +
        (k.active ? 'active' : 'inactive') + '</span>' +
        '</div>';
    }).join('');
  }

  // ---- Auth ----
  function onCredential(resp) {
    sessionStorage.setItem(TOKEN_KEY, resp.credential);
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
    sessionStorage.removeItem(TOKEN_KEY);
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

  // ---- Generate key ----
  $('genKey').addEventListener('click', function () {
    var btn = this; btn.disabled = true;
    api('/me/keys', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' })
      .then(function (d) {
        $('newKeyValue').textContent = d.api_key;
        $('newKey').hidden = false;
        $('credits').textContent = '$' + Number(d.credits_usd || 0).toFixed(2);
        renderKeys(d.keys || []);
      })
      .catch(function (e) { if (e.message !== 'unauthorized') alert(e.message); })
      .then(function () { btn.disabled = false; });
  });

  $('copyKey').addEventListener('click', function () {
    var v = $('newKeyValue').textContent;
    navigator.clipboard && navigator.clipboard.writeText(v);
    this.textContent = 'Copied';
    var self = this; setTimeout(function () { self.textContent = 'Copy'; }, 1500);
  });

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
