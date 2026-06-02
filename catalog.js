// rallyio — per-catalog detail page. Reads ?id=<catalog_id>, fetches /catalogs/{id}.
(function () {
  var API_BASE = 'https://rallyio-hfr-bmurezb4na-uc.a.run.app';
  var $ = function (x) { return document.getElementById(x); };
  var y = $('year'); if (y) y.textContent = new Date().getFullYear();

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function showError() { $('catLoading').hidden = true; $('catError').hidden = false; }

  var id = new URLSearchParams(window.location.search).get('id');
  if (!id) { showError(); return; }

  fetch(API_BASE + '/catalogs/' + encodeURIComponent(id), { mode: 'cors' })
    .then(function (r) { if (!r.ok) throw new Error('not found'); return r.json(); })
    .then(render)
    .catch(showError);

  function render(c) {
    document.title = 'rallyio — ' + c.name;
    $('catLoading').hidden = true;
    $('catView').hidden = false;

    $('catName').textContent = c.name;
    $('catBadge').innerHTML = c.is_real
      ? '<span class="badge badge--live">live</span>'
      : '<span class="badge badge--test">TEST_ONLY</span>';
    $('catDomain').textContent = String(c.domain || '—').replace(/_/g, ' ');
    var rate = Number(c.read_rate_usd) || 0;
    if (rate > 0) {
      var per1k = rate * 1000;
      $('catRate').textContent = '$' + (per1k % 1 === 0 ? per1k.toFixed(0) : per1k.toFixed(2)) + ' / 1,000 records';
    } else {
      $('catRate').textContent = 'free';
    }
    $('catDesc').textContent = c.description || '';

    var filters = c.filters || [];
    $('catFilters').innerHTML = filters.length
      ? filters.map(function (f) {
          return '<div class="cat-filter"><div class="cat-filter__head"><code>' + esc(f.name) + '</code>' +
            (f.required ? '<span class="req">required</span>' : '') + '</div><p>' + esc(f.description) + '</p></div>';
        }).join('')
      : '<p class="usage-empty">Free-text search.</p>';

    var samples = c.sample_queries || [];
    if (samples.length) {
      $('catSamples').innerHTML = samples.map(function (s) {
        return '<span class="cat-sample">' + esc(s) + '</span>';
      }).join('');
      $('catFirstSample').textContent = samples[0];
    } else {
      $('catSamplesWrap').hidden = true;
      $('catFirstSample').textContent = 'Search ' + c.name;
    }
  }

  var cc = $('copyConnect');
  if (cc) {
    cc.addEventListener('click', function () {
      var v = $('connectUrl').textContent.trim();
      navigator.clipboard && navigator.clipboard.writeText(v);
      this.textContent = 'Copied';
      var self = this; setTimeout(function () { self.textContent = 'Copy'; }, 1500);
    });
  }
})();
