/** Progressive filtering for /map/ and /find-my-coach/. */
(function () {
  'use strict';
  var root = document.querySelector('[data-location-tool]');
  var form = document.getElementById('location-tool-filters');
  if (!root || !form) return;
  var query = document.getElementById('tool-query');
  var category = document.getElementById('tool-category');
  var area = document.getElementById('tool-area');
  var program = document.getElementById('tool-program');
  var status = document.getElementById('location-tool-status');
  var list = document.getElementById('location-result-list');
  var toolData = {};
  try { toolData = JSON.parse((document.getElementById('location-tool-data') || {}).textContent || '{}'); } catch (_) {}
  var mapData = toolData.type === 'map' && Array.isArray(toolData.records) ? toolData.records : [];
  var records = Array.prototype.slice.call(document.querySelectorAll('[data-tool-record]'));
  var cards = records.filter(function (el) { return el.classList.contains('location-result-card'); });
  var pins = records.filter(function (el) { return el.classList.contains('location-pin'); });

  function value(el) { return el ? String(el.value || '').toLowerCase() : 'all'; }
  function matches(el) {
    var q = value(query).trim();
    var cat = value(category), ar = value(area), prog = value(program);
    if (q && String(el.getAttribute('data-name') || '').indexOf(q) === -1) return false;
    if (cat !== 'all' && el.getAttribute('data-category') !== cat) return false;
    if (ar !== 'all' && el.getAttribute('data-area') !== ar) return false;
    if (prog !== 'all' && (' ' + (el.getAttribute('data-program') || '') + ' ').indexOf(' ' + prog + ' ') === -1) return false;
    return true;
  }
  function matchesData(item) {
    var q = value(query).trim();
    var cat = value(category), ar = value(area);
    if (q && String(item.name || '').toLowerCase().indexOf(q) === -1) return false;
    if (cat !== 'all' && item.category !== cat) return false;
    if (ar !== 'all' && String(item.area || '').toLowerCase() !== ar) return false;
    return true;
  }
  function renderMapCards(items) {
    if (!list) return;
    var fragment = document.createDocumentFragment();
    items.slice(0, 24).forEach(function (item) {
      var article = document.createElement('article');
      article.className = 'location-result-card';
      var copy = document.createElement('div');
      var tag = document.createElement('span');
      tag.className = 'result-card-tag';
      tag.textContent = '// ' + (item.categoryLabel || item.category || 'Sport');
      var heading = document.createElement('h3');
      var recordLink = document.createElement('a');
      recordLink.href = '/gyms/' + encodeURIComponent(item.id) + '/';
      recordLink.textContent = item.name;
      heading.appendChild(recordLink);
      var detail = document.createElement('p');
      detail.textContent = item.area + ' · ' + item.precision;
      copy.appendChild(tag); copy.appendChild(heading); copy.appendChild(detail);
      var actions = document.createElement('div');
      actions.className = 'location-card-actions';
      var evidence = document.createElement('a');
      evidence.href = recordLink.href;
      evidence.textContent = 'Evidence record';
      var mapLink = document.createElement('a');
      mapLink.href = item.mapsUrl;
      mapLink.target = '_blank';
      mapLink.rel = 'noopener noreferrer';
      mapLink.textContent = 'Open map listing ↗';
      actions.appendChild(evidence); actions.appendChild(mapLink);
      article.appendChild(copy); article.appendChild(actions); fragment.appendChild(article);
    });
    list.replaceChildren(fragment);
  }
  function update() {
    if (mapData.length) {
      pins.forEach(function (el) { el.hidden = !matches(el); });
      var matchingMapRecords = mapData.filter(matchesData);
      renderMapCards(matchingMapRecords);
      var rendered = Math.min(24, matchingMapRecords.length);
      if (status) status.textContent = matchingMapRecords.length > rendered
        ? 'Showing ' + rendered + ' of ' + matchingMapRecords.length + ' matching venues; refine the filters to narrow the list'
        : 'Showing ' + matchingMapRecords.length + ' matching venue' + (matchingMapRecords.length === 1 ? '' : 's');
      root.classList.toggle('has-no-tool-results', matchingMapRecords.length === 0);
      return;
    }
    records.forEach(function (el) { el.hidden = !matches(el); });
    var shown = cards.filter(matches).length;
    if (status) status.textContent = 'Showing ' + shown + ' matching venue' + (shown === 1 ? '' : 's');
    root.classList.toggle('has-no-tool-results', shown === 0);
  }
  form.addEventListener('input', update);
  form.addEventListener('change', update);
  form.addEventListener('submit', function (event) { event.preventDefault(); update(); });
  form.addEventListener('reset', function () { window.setTimeout(update, 0); });
  update();
})();
