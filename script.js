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
    { name: 'LinkedIn Professional Search', domain: 'people', read_rate_usd: 0.10, is_real: true,
      description: 'Keyword search for LinkedIn people by name, company and location.' },
    { name: 'Restaurant Equipment Marketplace', domain: 'food_service', read_rate_usd: 0.01, is_real: false,
      description: 'Listings of restaurant and commercial kitchen equipment for sale.' },
    { name: 'Chicago Business Registry', domain: 'government', read_rate_usd: 0.05, is_real: false,
      description: 'Registered businesses and licensing records for Chicago.' },
    { name: 'Heavy Machinery Valuation Database', domain: 'construction', read_rate_usd: 0.01, is_real: false,
      description: 'Valuations and depreciation for heavy construction machinery.' },
    { name: 'Commercial Real Estate Listings', domain: 'real_estate', read_rate_usd: 0.01, is_real: false,
      description: 'Commercial property listings and lease data.' },
    { name: 'Legal & Compliance Records', domain: 'legal', read_rate_usd: 0.08, is_real: false,
      description: 'Legal filings and compliance records for businesses.' },
    { name: 'Logistics & Shipping Database', domain: 'logistics', read_rate_usd: 0.01, is_real: false,
      description: 'Carriers, routes and shipping records.' }
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

  function render(catalogs, live) {
    list.innerHTML = '';
    catalogs.forEach(function (c) {
      var badge = c.is_real
        ? '<span class="badge badge--live">live</span>'
        : '<span class="badge badge--test">TEST_ONLY</span>';
      var card = document.createElement('article');
      card.className = 'card catalog-card' + (c.is_real ? '' : ' catalog-card--test');
      card.innerHTML =
        '<div class="catalog-card__head"><h3>' + esc(c.name) + '</h3>' + badge + '</div>' +
        '<span class="catalog-pill">' + prettyDomain(c.domain) + '</span>' +
        '<p>' + esc(c.description) + '</p>' +
        '<div class="catalog-card__rate"><span>Read rate</span><strong>' + rateLabel(c.read_rate_usd) + '</strong></div>';
      list.appendChild(card);
    });
    if (note) note.textContent = live ? '' : 'Showing the latest known catalogs.';
  }

  fetch(CATALOGS_API, { mode: 'cors' })
    .then(function (r) { if (!r.ok) throw new Error('http ' + r.status); return r.json(); })
    .then(function (data) {
      var cats = (data && data.catalogs) || [];
      if (!cats.length) throw new Error('empty');
      render(cats, true);
    })
    .catch(function () { render(FALLBACK, false); });
})();
