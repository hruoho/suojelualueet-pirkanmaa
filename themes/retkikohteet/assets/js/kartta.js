(function() {
  var data = JSON.parse(document.getElementById('places-data').textContent);

  // Center on Pirkanmaa
  var map = L.map('map').setView([61.5, 23.8], 9);

  // OpenStreetMap tiles
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 17,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(map);

  // Marker colors by category
  var colors = {
    default: { fill: '#C4933F', stroke: '#A67B2F' },
    lps:     { fill: '#5B7A5E', stroke: '#3d5440' },
    lsa:     { fill: '#B54C3A', stroke: '#8C3A2B' }
  };

  function getCategory(feature) {
    var tags = feature.properties.tags || [];
    if (tags.indexOf('luonnonperintösäätiö') !== -1) return 'lps';
    if (tags.indexOf('luonnonsuojelualue') !== -1) return 'lsa';
    return 'default';
  }

  function areaRadius(ha) {
    if (!ha || ha <= 0) return 5;
    // log10: 1-10→4, 10-100→6, 100-1000→8, 1000+→10
    return Math.min(Math.max(Math.floor(Math.log10(ha)) * 2 + 2, 4), 10);
  }

  function getStyle(feature) {
    var c = colors[getCategory(feature)];
    var r = areaRadius(feature.properties.pinta_ala_ha);
    return { radius: r, fillColor: c.fill, color: c.stroke, weight: 2, opacity: 1, fillOpacity: 0.85 };
  }

  function getHoverStyle(feature) {
    var c = colors[getCategory(feature)];
    var r = areaRadius(feature.properties.pinta_ala_ha) + 2;
    return { radius: r, fillColor: c.fill, color: c.stroke, weight: 3, opacity: 1, fillOpacity: 1 };
  }

  function buildPopupHTML(p, coords) {
    var lat = coords[1];
    var lon = coords[0];
    var html = '<div class="map-popup">';
    html += '<h3><a href="' + p.url + '">' + p.name + '</a></h3>';

    // Meta
    html += '<p class="map-popup__meta">' + p.kunta;
    if (p.pinta_ala_ha) html += ' · ' + p.pinta_ala_ha + ' ha';
    html += '</p>';

    // Description
    var desc = p.description || '';
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

    // Links
    html += '<div class="map-popup__links">';
    html += '<a href="https://www.google.com/maps/dir/?api=1&destination=' + lat + ',' + lon + '" class="map-popup__link" target="_blank" rel="noopener">Navigoi</a>';
    if (p.karttapaikka) {
      html += '<a href="' + p.karttapaikka + '" class="map-popup__link" target="_blank" rel="noopener">Maastokartta</a>';
    } else {
      html += '<a href="#" class="map-popup__link map-popup__link--mml" data-lat="' + lat + '" data-lon="' + lon + '" data-name="' + p.name + '" target="_blank" rel="noopener">Maastokartta</a>';
    }
    if (p.luontoon_fi) html += '<a href="' + p.luontoon_fi + '" class="map-popup__link" target="_blank" rel="noopener">Luontoon.fi</a>';
    html += '</div>';

    html += '</div>';
    return html;
  }

  // Simple fuzzy match: all query chars appear in order
  function fuzzy(query, text) {
    query = query.toLowerCase();
    text = text.toLowerCase();
    var qi = 0;
    for (var ti = 0; ti < text.length && qi < query.length; ti++) {
      if (text[ti] === query[qi]) qi++;
    }
    return qi === query.length;
  }

  var allLayers = [];
  var activeLayer = null;

  var geoLayer = L.geoJSON(data, {
    pointToLayer: function(feature, latlng) {
      return L.circleMarker(latlng, getStyle(feature));
    },
    onEachFeature: function(feature, layer) {
      allLayers.push(layer);

      // Lightweight tooltip on hover
      var tip = feature.properties.name;
      if (feature.properties.pinta_ala_ha) tip += ', ' + feature.properties.pinta_ala_ha + ' ha';
      layer.bindTooltip(tip, {
        direction: 'top',
        offset: [0, -10],
        className: 'map-tooltip'
      });

      // Rich popup on click
      layer.bindPopup(buildPopupHTML(feature.properties, feature.geometry.coordinates), {
        maxWidth: 320,
        minWidth: 240,
        className: 'map-popup-container'
      });

      layer.on('mouseover', function() {
        layer.setStyle(getHoverStyle(feature));
      });

      layer.on('mouseout', function() {
        if (activeLayer !== layer) {
          layer.setStyle(getStyle(feature));
        }
      });

      layer.on('click', function() {
        if (activeLayer && activeLayer !== layer) {
          activeLayer.setStyle(getStyle(activeLayer.feature));
        }
        activeLayer = layer;
      });

      layer.on('popupclose', function() {
        layer.setStyle(getStyle(feature));
        if (activeLayer === layer) activeLayer = null;
      });
    }
  }).addTo(map);

  // Search control
  var search = L.control({ position: 'topleft' });
  search.onAdd = function() {
    var div = L.DomUtil.create('div', 'map-search');
    div.innerHTML = '<input type="text" class="map-search__input" placeholder="Hae kohteita…">';
    L.DomEvent.disableClickPropagation(div);
    L.DomEvent.disableScrollPropagation(div);
    var input = div.querySelector('input');
    input.addEventListener('input', function() {
      var q = this.value.trim();
      var visible = [];
      allLayers.forEach(function(layer) {
        var name = layer.feature.properties.name || '';
        var kunta = layer.feature.properties.kunta || '';
        if (!q || fuzzy(q, name) || fuzzy(q, kunta)) {
          if (!geoLayer.hasLayer(layer)) geoLayer.addLayer(layer);
          visible.push(layer);
        } else {
          if (geoLayer.hasLayer(layer)) geoLayer.removeLayer(layer);
        }
      });
      updateLabels(visible);
    });
    return div;
  };
  search.addTo(map);

  // Permanent labels when few markers visible
  var labelMarkers = [];
  function updateLabels(visible) {
    labelMarkers.forEach(function(m) { map.removeLayer(m); });
    labelMarkers = [];
    if (visible.length > 0 && visible.length <= 10) {
      visible.forEach(function(layer) {
        var latlng = layer.getLatLng();
        var label = L.marker(latlng, {
          icon: L.divIcon({
            className: 'map-label',
            html: '<span>' + layer.feature.properties.name + '</span>',
            iconAnchor: [-12, 12]
          }),
          interactive: false
        });
        label.addTo(map);
        labelMarkers.push(label);
      });
    }
  }

  // Legend
  var legend = L.control({ position: 'bottomright' });
  legend.onAdd = function() {
    var div = L.DomUtil.create('div', 'map-legend');
    div.innerHTML =
      '<div class="map-legend__item"><span class="map-legend__dot" style="background:#C4933F"></span> Virkistysalueet</div>' +
      '<div class="map-legend__item"><span class="map-legend__dot" style="background:#5B7A5E"></span> Luonnonperintösäätiö</div>' +
      '<div class="map-legend__item"><span class="map-legend__dot" style="background:#B54C3A"></span> Luonnonsuojelualueet</div>';
    return div;
  };
  legend.addTo(map);

  // WGS84 to ETRS-TM35FIN for Maastokartta links
  function wgs84ToETRS(lat, lon) {
    var a = 6378137, f = 1/298.257222101, k0 = 0.9996, lon0 = 27, falseE = 500000;
    var e2 = 2*f - f*f, e4 = e2*e2, e6 = e4*e2, ep2 = e2/(1-e2);
    var latR = lat*Math.PI/180, lonR = lon*Math.PI/180, dLon = lonR - lon0*Math.PI/180;
    var N = a/Math.sqrt(1 - e2*Math.sin(latR)*Math.sin(latR));
    var T = Math.tan(latR)*Math.tan(latR);
    var C = ep2*Math.cos(latR)*Math.cos(latR);
    var A = Math.cos(latR)*dLon;
    var M = a*((1-e2/4-3*e4/64-5*e6/256)*latR - (3*e2/8+3*e4/32+45*e6/1024)*Math.sin(2*latR) + (15*e4/256+45*e6/1024)*Math.sin(4*latR) - (35*e6/3072)*Math.sin(6*latR));
    var easting = falseE + k0*N*(A + (1-T+C)*A*A*A/6 + (5-18*T+T*T+72*C-58*ep2)*A*A*A*A*A/120);
    var northing = k0*(M + N*Math.tan(latR)*(A*A/2 + (5-T+9*C+4*C*C)*A*A*A*A/24 + (61-58*T+T*T+600*C-330*ep2)*A*A*A*A*A*A/720));
    return { e: Math.round(easting), n: Math.round(northing) };
  }

  document.addEventListener('click', function(e) {
    var link = e.target.closest('.map-popup__link--mml');
    if (!link) return;
    e.preventDefault();
    var lat = parseFloat(link.dataset.lat);
    var lon = parseFloat(link.dataset.lon);
    var c = wgs84ToETRS(lat, lon);
    var url = 'https://asiointi.maanmittauslaitos.fi/karttapaikka/?lang=fi&n=' + c.n + '&e=' + c.e + '&zoom=11&share=customMarker&title=' + encodeURIComponent(link.dataset.name);
    window.open(url, '_blank');
  });
})();
