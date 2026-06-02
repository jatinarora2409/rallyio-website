// rallyio site — mobile nav, footer year, and dynamic catalog listing.
(function () {
  // ---- Mobile nav toggle ----
  var toggle = document.getElementById('navToggle');
  var links = document.getElementById('navLinks');
  if (toggle && links) {
    toggle.addEventListener('click', function () {
      var open = links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    links.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        links.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // ---- Footer year ----
  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  // ---- Catalogs: dynamic from the live API, with a built-in fallback ----
  var CATALOGS_API = 'https://rallyio-hfr-bmurezb4na-uc.a.run.app/catalogs';

  // Fallback used if the live API is unreachable (keeps the page useful offline
  // / before the backend is up). Mirrors the live catalog line-up.
  var FALLBACK = [
    { catalog_id: 'linkedin_people', name: 'LinkedIn Professional Search', domain: 'people', read_rate_usd: 0.10, is_real: true,
      description: 'Find people and look up individuals by name, company and location.' },
    { catalog_id: 'clinical_trials', name: 'Clinical Trials (ClinicalTrials.gov)', domain: 'health', read_rate_usd: 0.02, is_real: true,
      description: 'Registered clinical trials by condition, sponsor or status — phase, enrollment and more.' },
    { catalog_id: 'sec_filings', name: 'SEC Filings (EDGAR)', domain: 'finance', read_rate_usd: 0.03, is_real: true,
      description: 'Full-text search of U.S. public-company SEC filings (10-K, 10-Q, 8-K, S-1).' },
    { catalog_id: 'federal_contracts', name: 'U.S. Federal Contracts & Grants (USAspending)', domain: 'government', read_rate_usd: 0.02, is_real: true,
      description: 'Federal contracts and grants by keyword, recipient or agency.' },
    { catalog_id: 'research_papers', name: 'Academic Papers (OpenAlex)', domain: 'research', read_rate_usd: 0.01, is_real: true,
      description: '250M+ scholarly works — title, authors, year, venue, citations and DOI.' },
    { catalog_id: 'github_repos', name: 'GitHub Repositories', domain: 'software', read_rate_usd: 0.01, is_real: true,
      description: 'Search public repos by keyword or language — stars, forks, license, topics.' }
  ];

  var list = document.getElementById('catalogList');
  var note = document.getElementById('catalogNote');
  if (!list) return;

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function rateLabel(r) {
    var n = Number(r) || 0;
    return n > 0 ? '$' + n.toFixed(2) + ' / record' : 'free';
  }

  function prettyDomain(d) {
    return esc(String(d || '—').replace(/_/g, ' '));
  }

  var search = document.getElementById('catalogSearch');
  var allCatalogs = [];
  var isLive = true;

  function cardHtml(c) {
    var badge = c.is_real
      ? '<span class="badge badge--live">live</span>'
      : '<span class="badge badge--test">TEST_ONLY</span>';
    var href = 'catalog.html?id=' + encodeURIComponent(c.catalog_id || '');
    return '<a class="catalog-card-link" href="' + href + '">' +
      '<article class="card catalog-card' + (c.is_real ? '' : ' catalog-card--test') + '">' +
      '<div class="catalog-card__head"><h3>' + esc(c.name) + '</h3>' + badge + '</div>' +
      '<span class="catalog-pill">' + prettyDomain(c.domain) + '</span>' +
      '<p>' + esc(c.description) + '</p>' +
      '<div class="catalog-card__rate"><span>Read rate</span><strong>' + rateLabel(c.read_rate_usd) + '</strong>' +
      '<span class="catalog-card__more">Details →</span></div>' +
      '</article></a>';
  }

  function applyFilter() {
    var q = ((search && search.value) || '').trim().toLowerCase();
    var filtered = !q ? allCatalogs : allCatalogs.filter(function (c) {
      return (String(c.name || '') + ' ' + String(c.domain || '') + ' ' + String(c.description || ''))
        .toLowerCase().indexOf(q) !== -1;
    });
    list.innerHTML = filtered.length
      ? filtered.map(cardHtml).join('')
      : '<p class="catalog-loading">No catalogs match “' + esc(q) + '”.</p>';
    if (note) note.textContent = isLive ? '' : 'Showing the latest known catalogs.';
  }

  function load(catalogs, live) { allCatalogs = catalogs; isLive = live; applyFilter(); }

  if (search) search.addEventListener('input', applyFilter);

  fetch(CATALOGS_API, { mode: 'cors' })
    .then(function (r) { if (!r.ok) throw new Error('http ' + r.status); return r.json(); })
    .then(function (data) {
      var cats = (data && data.catalogs) || [];
      if (!cats.length) throw new Error('empty');
      load(cats, true);
    })
    .catch(function () { load(FALLBACK, false); });
})();

// Reflect signed-in state in the nav (so "Sign in" becomes "Dashboard" when logged in).
(function () {
  var TOKEN_KEY = 'rallyio_gtoken';
  function decodeJwt(t) {
    try {
      var p = t.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      return JSON.parse(decodeURIComponent(escape(atob(p))));
    } catch (e) { return null; }
  }
  var tok = null;
  try { tok = localStorage.getItem(TOKEN_KEY); } catch (e) {}
  var claims = tok ? decodeJwt(tok) : null;
  var loggedIn = !!(claims && claims.exp && claims.exp * 1000 > Date.now());
  if (!loggedIn) return;
  var first = String(claims.name || claims.email || 'Account').split(' ')[0];
  var greeting = document.getElementById('navGreeting');
  var cta = document.getElementById('navCta');
  if (greeting) { greeting.textContent = 'Hi, ' + first; greeting.hidden = false; }
  if (cta) cta.textContent = 'Dashboard';
})();
