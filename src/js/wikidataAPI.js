const async = require('async');
const wdk = require('wikidata-sdk');
const _ = require('underscore');

const BirthLocation = require('./birthLocation');

// data of interest
const assembly = 'Member_of_the_5th_National_Assembly_for_Wales';
const wdq = 'Q42310659';
const query = `
SELECT ?${assembly} ?${assembly}Label ?place_of_birth ?place_of_birthLabel WHERE {
    SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }

    ?${assembly} wdt:P39 wd:${wdq}.
    OPTIONAL { ?${assembly} wdt:P19 ?place_of_birth. }
  }
`

// constructor
const WikidataAPI = function () {
}

// For an individual place of birth by P625
WikidataAPI.prototype.parseLatLong = function (json, birthLocation) {
    if (json) {
        let p625 = json.entities[birthLocation.q].claims['P625'];
        if (p625 && p625.length > 0) {
            let value = p625[0].mainsnak.datavalue.value;
            birthLocation.lat = value.latitude;
            birthLocation.lon = value.longitude;
        }
    }

    return birthLocation;
}

WikidataAPI.prototype.aggregatePlacesOfBirth = function (json) {
    let entities = {};
    json.results.bindings.forEach(element => {
        let wikidataUrl = element[assembly].value;
        let name = element[assembly + 'Label'].value;

        if (element.place_of_birth && element.place_of_birth.value) {
            let elts = element.place_of_birth.value.split('/');
            let q = elts[elts.length - 1];
            let location = entities[q] || new BirthLocation(q);
            entities[q] = location;
            location.addPerson(wikidataUrl, name);
        }
    });

    return entities;
}

// pass an array of BirthLocation objects;
WikidataAPI.prototype.createTasks = function (birthLocations) {
    const self = this;
    let tasks = _.map(birthLocations, entity => {
        return function (callback) {
            let jsonUrl = 'https://www.wikidata.org/wiki/Special:EntityData/' + entity.q + '.json';
            $.ajax(self.fetchPlaceOfBirthJSON(jsonUrl, entity, (err, data) => {
                return callback(err, data);
            }));
        }
    });

    return tasks;
}

WikidataAPI.prototype.fetchPlaceOfBirthJSON = function (url, birthLocation, callback) {
    const self = this;
    return {
        url: url,
        type: 'GET',
        dataType: 'json',
        timeout: 30000,
        crossOrigin: true,
        error: function () {
            callback(null, {});
        },
        success: function (json, status) {
            let result = self.parseLatLong(json, birthLocation);
            return callback(null, result);
        }
    }
};

// callback = f(error, list of )
WikidataAPI.prototype.getPoints = function (applicationCallback) {
    const self = this;

    var ajaxConfig = {
        url: wdk.sparqlQuery(query),
        type: 'GET',
        dataType: 'json',
        timeout: 30000,
        crossOrigin: true,
        error: function (jqXHR, textStatus) {
            return applicationCallback(null, {});
        },
        success: function (json, textStatus) {
            let birthLocationHash = self.aggregatePlacesOfBirth(json);
            let tasks = self.createTasks(Object.values(birthLocationHash));

            async.parallel(tasks, (err, data) => {
                return applicationCallback(err, data);
            });
        }
    };

    $.ajax(ajaxConfig);

}

//
// exports
module.exports = WikidataAPI;