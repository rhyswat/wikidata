require('./leaflet'); // pull in all leaflet assets before bootstrap
require('bootstrap/dist/css/bootstrap.min.css');
require('../style/style.scss');

const Map = require('./map');
const WikidatatAPI = require('./wikidataAPI');

const app = {
  init: function () {
    
    const map = new Map();
    map.initialise();

    const api = new WikidatatAPI();
    api.getPoints((err, points) => {
      points.forEach(birthLocation => {
        map.addMarker(birthLocation);
      });
    });
  }
};

$(window).on('load', function () {
  app.init();
});