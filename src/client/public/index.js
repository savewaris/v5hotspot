const L = require('leaflet');
const axios = require('axios');

const map = L.map('map').setView([51.505, -0.09], 13);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

axios.get('http://localhost:5000/data')
  .then(response => {
    const data = response.data;

    data.forEach(item => {
      const geoJSON = JSON.parse(item.geometry);
      L.geoJSON(geoJSON).addTo(map)
        .bindPopup(`Frequency: ${item.freq}`)
        .openPopup();
    });
  })
  .catch(error => {
    console.error('Error fetching data', error);
  });
