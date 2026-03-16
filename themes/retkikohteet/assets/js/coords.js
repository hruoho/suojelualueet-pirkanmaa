// WGS84 to ETRS-TM35FIN coordinate conversion
// Shared between kartta.js and single page maps
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
