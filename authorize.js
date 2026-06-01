// rallyio MCP OAuth — hosted Google login step.
// Reached as: authorize.html?txn=<id>  (the MCP server's authorize endpoint
// redirects here). After Google sign-in we hand the credential + txn to the
// backend, which mints an auth code and tells us where to redirect the client.
(function () {
  var GOOGLE_CLIENT_ID = '491899586229-g8ot55ojq6oqnkda9cvqg47bc7uene3h.apps.googleusercontent.com';
  var API_BASE = 'https://rallyio-hfr-bmurezb4na-uc.a.run.app';

  var status = document.getElementById('status');
  var txn = new URLSearchParams(window.location.search).get('txn');

  function setStatus(msg) { if (status) status.textContent = msg || ''; }

  if (!txn) {
    setStatus('Invalid authorization link — start again from your assistant.');
    return;
  }

  function onCredential(resp) {
    setStatus('Signing you in…');
    fetch(API_BASE + '/auth/mcp/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ txn: txn, credential: resp.credential })
    })
      .then(function (r) { return r.json().then(function (b) { return { ok: r.ok, b: b }; }); })
      .then(function (res) {
        if (!res.ok || !res.b.redirect) throw new Error(res.b && res.b.message ? res.b.message : 'Authorization failed.');
        setStatus('Connected — returning to your assistant…');
        window.location.href = res.b.redirect;
      })
      .catch(function (e) { setStatus(e.message || 'Authorization failed.'); });
  }

  function renderButton() {
    if (!(window.google && google.accounts && google.accounts.id)) return false;
    google.accounts.id.initialize({ client_id: GOOGLE_CLIENT_ID, callback: onCredential });
    google.accounts.id.renderButton(document.getElementById('gsiButton'), {
      theme: 'filled_blue', size: 'large', shape: 'pill', text: 'continue_with', width: 280
    });
    return true;
  }

  var n = 0, t = setInterval(function () {
    if (renderButton()) { clearInterval(t); }
    else if (++n > 50) { clearInterval(t); setStatus('Could not load Google sign-in.'); }
  }, 100);
})();
