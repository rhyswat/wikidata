// simple view-model taking the wikidata Q reference for a geographical location

const BirthLocation = function(q) {
    this.q = q;
    this.wikidata = []; // [ {url:an url, name: their personal name} ]
    this.lat = '0';
    this.lon = '0';
}

BirthLocation.prototype.addPerson = function(url, personalName) {
    this.wikidata.push( {url: url, name: personalName});
}

// render this to a DOM node
BirthLocation.prototype.render = function() {
    let list = $('<ul>');
    list.addClass('am-list')
    this.wikidata.forEach(person => {
        let li = $('<li>');
        li.addClass('am-list-item');
        li.appendTo(list);

        let a = $('<a>');
        a.prop('href', person.url);
        a.prop('target', '_blank');
        a.text(person.name);
        a.appendTo(li);
    });

    // list is a jquery object, list[0] is its DOM node
    return list[0];
}

// 
// exports
module.exports = BirthLocation;