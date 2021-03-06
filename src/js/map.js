const L = require('leaflet');

const Map = function (divId) {
    divId = divId || 'map';
    this.map = L.map(divId).setView([52.591, -3.849], 8);
}

Map.prototype.initialise = function () {
    let mapOptions = {
        attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
    }
    L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', mapOptions).addTo(this.map);
};

// pass in a BirthLocation object
Map.prototype.addMarker = function (birthLocation) {
    let marker = L.marker([birthLocation.lat, birthLocation.lon]).addTo(this.map);
    marker.bindPopup(birthLocation.render());
};

// exports
module.exports = Map;