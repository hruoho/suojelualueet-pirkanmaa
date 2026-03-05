(function() {
  var data = JSON.parse(document.getElementById('places-data').textContent);

  // Center on Pirkanmaa
  var map = L.map('map').setView([61.5, 23.8], 9);

  // OpenStreetMap tiles
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 17,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(map);

  // Marker styles by type
  var goldMarker = {
    radius: 8,
    fillColor: '#C4933F',
    color: '#A67B2F',
    weight: 2,
    opacity: 1,
    fillOpacity: 0.85
  };

  var greenMarker = {
    radius: 7,
    fillColor: '#5B7A5E',
    color: '#3d5440',
    weight: 2,
    opacity: 1,
    fillOpacity: 0.85
  };

  function isLPS(feature) {
    var tags = feature.properties.tags || [];
    return tags.indexOf('luonnonperintösäätiö') !== -1;
  }

  L.geoJSON(data, {
    pointToLayer: function(feature, latlng) {
      var style = isLPS(feature) ? greenMarker : goldMarker;
      return L.circleMarker(latlng, style);
    },
    onEachFeature: function(feature, layer) {
      var p = feature.properties;
      var popup = '<div class="map-popup">';
      popup += '<h3><a href="' + p.url + '">' + p.name + '</a></h3>';
      popup += '<p>' + p.kunta;
      if (p.pinta_ala_ha) {
        popup += ' · ' + p.pinta_ala_ha + ' ha';
      }
      popup += '</p></div>';
      layer.bindPopup(popup);
    }
  }).addTo(map);
})();
