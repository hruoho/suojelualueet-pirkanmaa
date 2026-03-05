(function() {
  var data = JSON.parse(document.getElementById('places-data').textContent);
  var panel = document.getElementById('info-panel');
  var closeBtn = panel.querySelector('.info-panel__close');

  // Center on Pirkanmaa
  var map = L.map('map').setView([61.5, 23.8], 9);

  // OpenStreetMap tiles
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 17,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(map);

  // Marker styles
  var goldMarker = {
    radius: 8, fillColor: '#C4933F', color: '#A67B2F',
    weight: 2, opacity: 1, fillOpacity: 0.85
  };
  var goldMarkerHover = {
    radius: 10, fillColor: '#C4933F', color: '#A67B2F',
    weight: 3, opacity: 1, fillOpacity: 1
  };
  var greenMarker = {
    radius: 7, fillColor: '#5B7A5E', color: '#3d5440',
    weight: 2, opacity: 1, fillOpacity: 0.85
  };
  var greenMarkerHover = {
    radius: 9, fillColor: '#5B7A5E', color: '#3d5440',
    weight: 3, opacity: 1, fillOpacity: 1
  };

  function isLPS(feature) {
    var tags = feature.properties.tags || [];
    return tags.indexOf('luonnonperintösäätiö') !== -1;
  }

  function showPanel(p) {
    // Title
    panel.querySelector('.info-panel__title').innerHTML =
      '<a href="' + p.url + '">' + p.name + '</a>';

    // Meta: kunta + area
    var meta = p.kunta;
    if (p.pinta_ala_ha) meta += ' · ' + p.pinta_ala_ha + ' ha';
    panel.querySelector('.info-panel__meta').textContent = meta;

    // Tags
    var tagsEl = panel.querySelector('.info-panel__tags');
    tagsEl.innerHTML = '';
    if (p.tags && p.tags.length) {
      p.tags.forEach(function(tag) {
        tagsEl.innerHTML += '<span class="kohde-tag">' + tag + '</span>';
      });
    }

    // Description (truncated)
    var desc = p.description || '';
    if (desc.length > 300) desc = desc.substring(0, 300) + '…';
    panel.querySelector('.info-panel__desc').textContent = desc;

    // Facilities
    var fac = [];
    if (p.vaellusreitit_km) fac.push('Reittejä: ' + p.vaellusreitit_km + ' km');
    if (p.tulipaikkoja) fac.push('Tulipaikkoja: ' + p.tulipaikkoja);
    if (p.laavuja) fac.push('Laavuja: ' + p.laavuja);
    if (p.vuokratupia && p.vuokratupia.length) fac.push('Vuokratupia: ' + p.vuokratupia.join(', '));
    var facEl = panel.querySelector('.info-panel__facilities');
    if (fac.length) {
      facEl.innerHTML = '<ul>' + fac.map(function(f) { return '<li>' + f + '</li>'; }).join('') + '</ul>';
    } else {
      facEl.innerHTML = '';
    }

    // Links
    var links = '<a href="' + p.url + '" class="kohde-map-link">Avaa kohde</a>';
    panel.querySelector('.info-panel__links').innerHTML = links;

    panel.hidden = false;
  }

  function hidePanel() {
    panel.hidden = true;
  }

  closeBtn.addEventListener('click', hidePanel);

  var activeLayer = null;

  L.geoJSON(data, {
    pointToLayer: function(feature, latlng) {
      var style = isLPS(feature) ? greenMarker : goldMarker;
      return L.circleMarker(latlng, style);
    },
    onEachFeature: function(feature, layer) {
      layer.on('mouseover', function() {
        var hover = isLPS(feature) ? greenMarkerHover : goldMarkerHover;
        layer.setStyle(hover);
        showPanel(feature.properties);
      });
      layer.on('mouseout', function() {
        if (activeLayer !== layer) {
          var normal = isLPS(feature) ? greenMarker : goldMarker;
          layer.setStyle(normal);
        }
      });
      layer.on('click', function() {
        // Reset previously active
        if (activeLayer && activeLayer !== layer) {
          var prevLPS = isLPS(activeLayer.feature);
          activeLayer.setStyle(prevLPS ? greenMarker : goldMarker);
        }
        activeLayer = layer;
        var hover = isLPS(feature) ? greenMarkerHover : goldMarkerHover;
        layer.setStyle(hover);
        showPanel(feature.properties);
      });
    }
  }).addTo(map);

  // Close panel when clicking on empty map
  map.on('click', function(e) {
    if (!e.originalEvent.target.closest('.info-panel')) {
      if (activeLayer) {
        var prevLPS = isLPS(activeLayer.feature);
        activeLayer.setStyle(prevLPS ? greenMarker : goldMarker);
        activeLayer = null;
      }
      hidePanel();
    }
  });
})();
