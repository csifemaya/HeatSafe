// File: js/gps.js
(function (root) {
  const ns = root.CSIFHeatSafe = root.CSIFHeatSafe || {};
  let marker = null;
  let map = null;

  function initMap(lat, lon) {
    if (typeof L === 'undefined') return null;
    const element = document.getElementById('map');
    if (!element) return null;
    if (map) return map;
    map = L.map('map').setView([lat, lon], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);
    marker = L.marker([lat, lon]).addTo(map);
    return map;
  }

  function updateMap(lat, lon) {
    if (!map) initMap(lat, lon);
    if (map) {
      map.setView([lat, lon], 13);
      if (marker) marker.setLatLng([lat, lon]);
    }
  }

  function getLocation() {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve({ lat: 40.4168, lon: -3.7038 });
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (position) => resolve({ lat: position.coords.latitude, lon: position.coords.longitude }),
        () => resolve({ lat: 40.4168, lon: -3.7038 })
      );
    });
  }

  async function startLocation() {
    const loc = await getLocation();
    ns.state.coords = loc;
    initMap(loc.lat, loc.lon);
    updateMap(loc.lat, loc.lon);
    document.getElementById('gpsText').textContent = `Lat ${loc.lat.toFixed(4)} · Lon ${loc.lon.toFixed(4)}`;
    document.getElementById('locationText').textContent = `Ubicación: ${loc.lat.toFixed(4)}, ${loc.lon.toFixed(4)}`;
    return loc;
  }

  Object.assign(ns, { initMap, updateMap, getLocation, startLocation });
})(window);
