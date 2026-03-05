(function() {
  var data = JSON.parse(document.getElementById('places-data').textContent);

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

  function buildPopupHTML(p) {
    var html = '<div class="map-popup">';
    html += '<h3><a href="' + p.url + '">' + p.name + '</a></h3>';

    // Meta
    html += '<p class="map-popup__meta">' + p.kunta;
    if (p.pinta_ala_ha) html += ' · ' + p.pinta_ala_ha + ' ha';
    html += '</p>';

    // Tags
    if (p.tags && p.tags.length) {
      html += '<div class="map-popup__tags">';
      p.tags.forEach(function(tag) {
        html += '<span class="map-popup__tag">' + tag + '</span>';
      });
      html += '</div>';
    }

    // Description
    var desc = p.description || '';
    if (desc.length > 200) desc = desc.substring(0, 200) + '…';
    if (desc) html += '<p class="map-popup__desc">' + desc + '</p>';

    // Facilities
    var fac = [];
    if (p.vaellusreitit_km) fac.push('Reittejä ' + p.vaellusreitit_km + ' km');
    if (p.tulipaikkoja) fac.push('Tulipaikkoja ' + p.tulipaikkoja);
    if (p.laavuja) fac.push('Laavuja ' + p.laavuja);
    if (p.vuokratupia && p.vuokratupia.length) fac.push('Vuokratupia: ' + p.vuokratupia.join(', '));
    if (fac.length) {
      html += '<div class="map-popup__facilities">' + fac.join(' · ') + '</div>';
    }

    // Link
    html += '<a href="' + p.url + '" class="map-popup__link">Avaa kohde →</a>';
    html += '</div>';
    return html;
  }

  // Tooltip for hover (name only, lightweight)
  // Popup for click (full details)
  var activeLayer = null;

  L.geoJSON(data, {
    pointToLayer: function(feature, latlng) {
      var style = isLPS(feature) ? greenMarker : goldMarker;
      return L.circleMarker(latlng, style);
    },
    onEachFeature: function(feature, layer) {
      // Lightweight tooltip on hover
      layer.bindTooltip(feature.properties.name, {
        direction: 'top',
        offset: [0, -10],
        className: 'map-tooltip'
      });

      // Rich popup on click
      layer.bindPopup(buildPopupHTML(feature.properties), {
        maxWidth: 320,
        minWidth: 240,
        className: 'map-popup-container'
      });

      layer.on('mouseover', function() {
        var hover = isLPS(feature) ? greenMarkerHover : goldMarkerHover;
        layer.setStyle(hover);
      });

      layer.on('mouseout', function() {
        if (activeLayer !== layer) {
          var normal = isLPS(feature) ? greenMarker : goldMarker;
          layer.setStyle(normal);
        }
      });

      layer.on('click', function() {
        if (activeLayer && activeLayer !== layer) {
          var prevLPS = isLPS(activeLayer.feature);
          activeLayer.setStyle(prevLPS ? greenMarker : goldMarker);
        }
        activeLayer = layer;
      });

      layer.on('popupclose', function() {
        var normal = isLPS(feature) ? greenMarker : goldMarker;
        layer.setStyle(normal);
        if (activeLayer === layer) activeLayer = null;
      });
    }
  }).addTo(map);
})();
