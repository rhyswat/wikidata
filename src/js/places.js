const util = require('util');

const async = require('async');
const wdk = require('wikidata-sdk');
const _ = require('underscore');

const assembly = 'Member_of_the_5th_National_Assembly_for_Wales';
const wdq = 'Q42310659';

// let dither = function (value) {
//     let r = 0.005 * (-0.5 + Math.random());
//     return value + r;
// }

let getPoints = function (applicationCallback) {

    const query = `
SELECT ?${assembly} ?${assembly}Label ?place_of_birth ?place_of_birthLabel WHERE {
    SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }

    ?${assembly} wdt:P39 wd:${wdq}.
    OPTIONAL { ?${assembly} wdt:P19 ?place_of_birth. }
  }
  `

    const url = wdk.sparqlQuery(query);

    let placeAjaxConfig = function (url, entity, cb) {
        return {
            url: url,
            type: 'GET',
            dataType: 'json',
            timeout: 30000,
            crossOrigin: true,
            error: function () {
                cb(null, {});
            },
            success: function (json, status) {
                let lat = '0';
                let lon = '0';
                if (json) {
                    let p625 = json.entities[entity.q].claims['P625'];
                    if (p625 && p625.length > 0) {
                        let thing = p625[0].mainsnak.datavalue.value;
                        lat = thing.latitude;
                        lon = thing.longitude;
                    }
                }

                let result = {
                    wikidata: entity.wikidata,
                    label: entity.label,
                    lat: lat,
                    lon: lon
                };
                console.log(util.inspect(result, {
                    depth: 10
                }));

                return cb(null, result);
            }
        }
    };

    var ajaxConfig = {
        url: url,
        type: 'GET',
        dataType: 'json',
        timeout: 30000,
        crossOrigin: true,
        error: function (jqXHR, textStatus) {
            return applicationCallback(null, {});
        },
        success: function (json, textStatus) {
            let entities = {};
            json.results.bindings.forEach(element => {
                let wikidataUrl = element[assembly].value;
                let name = element[assembly + 'Label'].value;

                if (element.place_of_birth && element.place_of_birth.value) {
                    let elts = element.place_of_birth.value.split('/');
                    let q = elts[elts.length - 1];
                    let bin = entities[q] || { q: q, wikidata:[], label:[]};
                    entities[q] = bin;
                    bin.wikidata.push(wikidataUrl);
                    bin.label.push(name);
                }
            });

            let tasks = _.map(Object.values(entities), entity => {
                return function (callback) {
                    let u = 'https://www.wikidata.org/wiki/Special:EntityData/' + entity.q + '.json';
                    $.ajax(placeAjaxConfig(u, entity, (err, data) => {
                        return callback(err, data);
                    }));
                }
            });

            async.parallel(tasks, (err, data) => {
                return applicationCallback(err, data);
            });
        }
    };

    $.ajax(ajaxConfig);

}

module.exports = getPoints;