#!/usr/bin/env node
// Convert ETRS-TM35FIN coordinates to WGS84
// Usage: node etrs-to-wgs84.js "N=6864063.957, E=331992.277"

function etrsToWGS84(n, e) {
  var a = 6378137, f = 1/298.257222101, k0 = 0.9996, lon0 = 27, falseE = 500000;
  var e2 = 2*f - f*f, e1 = (1 - Math.sqrt(1 - e2)) / (1 + Math.sqrt(1 - e2));
  var M = n / k0, mu = M / (a * (1 - e2/4 - 3*e2*e2/64 - 5*e2*e2*e2/256));
  var phi = mu + (3*e1/2 - 27*e1*e1*e1/32)*Math.sin(2*mu) + (21*e1*e1/16 - 55*e1*e1*e1*e1/32)*Math.sin(4*mu) + (151*e1*e1*e1/96)*Math.sin(6*mu);
  var sp = Math.sin(phi), cp = Math.cos(phi), tp = Math.tan(phi);
  var ep2 = e2/(1-e2), C = ep2*cp*cp, T = tp*tp;
  var N = a/Math.sqrt(1 - e2*sp*sp), R = a*(1-e2)/Math.pow(1 - e2*sp*sp, 1.5);
  var D = (e - falseE) / (N * k0);
  var lat = phi - (N*tp/R)*(D*D/2 - (5+3*T+10*C-4*C*C-9*ep2)*D*D*D*D/24 + (61+90*T+298*C+45*T*T-252*ep2-3*C*C)*D*D*D*D*D*D/720);
  var lon = lon0*Math.PI/180 + (D - (1+2*T+C)*D*D*D/6 + (5-2*C+28*T-3*C*C+8*ep2+24*T*T)*D*D*D*D*D/120) / cp;
  return { lat: lat*180/Math.PI, lon: lon*180/Math.PI };
}

var input = process.argv.slice(2).join(' ');
var match = input.match(/N\s*=\s*([\d.]+)\s*,\s*E\s*=\s*([\d.]+)/i);

if (!match) {
  console.error('Usage: node etrs-to-wgs84.js "N=6864063.957, E=331992.277"');
  process.exit(1);
}

var result = etrsToWGS84(parseFloat(match[1]), parseFloat(match[2]));
console.log('[' + result.lat.toFixed(6) + ', ' + result.lon.toFixed(6) + ']');
