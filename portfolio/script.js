// initialize the map using leaflet
const map = L.map('map').setView([40.7128, -74.0060], 13); // New York as default

// add openstreetmap tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// add marker on click
map.on('click', function(e) {
  const { lat, lng } = e.latlng;
  L.marker([lat, lng]).addTo(map)
    .bindPopup(`Latitude: ${lat.toFixed(4)}<br>Longitude: ${lng.toFixed(4)}`)
    .openPopup();
});