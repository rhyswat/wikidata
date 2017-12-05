require('babel-polyfill');

const L = require('leaflet');

const getPoints = require('./places');

const app = {
  init: function () {
    const map = L.map('map').setView([52.591, -3.849], 8);

    L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    getPoints((err, points) => {
      points.forEach(element => {
        let marker = L.marker([element.lat, element.lon]).addTo(map);
        let t = '<ul>'
        element.wikidata.forEach((u, i) => {
          t += `<li class="am-list"><a href=${u}>${element.label[i]}</a>`;
        });
        t += '</ul>'
        marker.bindPopup(t).openPopup();
      });
    })
  }
};

$(window).on('load', function () {
  app.init();
});