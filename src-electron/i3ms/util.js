const { GeoPoint } = require('firebase-admin').firestore;

const kGoogleApiKey = "AIzaSyAhQH1QN8gi3pret4EdzxQx9AZ0O4FZ3n4";

const placesApi = require('@google/maps').createClient({
    key: kGoogleApiKey,
    Promise: Promise
});

function convertAddrComponents(components) {
    const result = {};
    for (let comp of components) {
        const types = comp.types;
        for (let type of types) {
            if (type != 'political') {
                result[type] = comp.long_name;
            }
        }
    }

    return result;
}

function _formatResult(result) {
    const location = result.geometry.location;
    const placeCoordinates = new GeoPoint(location.lat, location.lng);

    const ret = {};

    ret.place = placeCoordinates;
    ret.place_long = convertAddrComponents(result.address_components);
    ret.place_long.place = result.address_components[0].long_name;
    ret.formatted_address = result.formatted_address;

    delete result.address_components;
    delete result.geometry;
    delete result.types;

    //ret.google_address = result;
    return ret;
}

async function geocode(address) {
    const results = await placesApi.geocode(address).asPromise();
    const result = results.json.results[0];
    return _formatResult(result);
}

async function reverseGeocode(place) {
    const results = await placesApi.reverseGeocode(place).asPromise();
    const result = results.json.results[0];
    return _formatResult(result);
}

function companyName(str) {
    return str.substr(0, str.lastIndexOf('(') != -1 ? str.lastIndexOf('(') : str.length).toUpperCase();
}

module.exports = {
    geocode,
    reverseGeocode,
    companyName
}

if (require.main == module) {
    (async function () {
        try {
            const r1 = await reverseGeocode({ place_id: process.argv[2] || 'ChIJ7cI8Exq4GDoR0EIX-xThtdg' });
            console.log(r1);

            // const r2 = await geocode({ address: 'TATA STEEL BSL LTD.,AT-NARENDRAPUR,PO-KUSUPANGA,VIA-MERAMANDALI,DHENKANAL,ORISSA,,DHENKANAL,759121,21,ODISHA' });
            // console.log(r2);
        } catch (ex) {
            console.error(ex);
        }
    })();
}