const https = require('https');
const fs = require('fs');
const path = require('path');

function getGeocodeApiKey() {
    const secretsFile = fs.readFileSync(path.resolve('secrets.json'));
    return JSON.parse(secretsFile).GEOCODE_API_KEY;
}

function getLocation(term) {
    return new Promise((resolve, reject) => {
		https.get(`https://api.opencagedata.com/geocode/v1/json?q=${term}&key=${getGeocodeApiKey()}`, (res) => {
			let data = '';
			res.resume();
			res.on('data', (chunk) => { data += chunk });
			res.on('end', () => {
				resolve(extractLocation(data));
				if (!res.complete)
					reject(
						'The connection was terminated while the message was still being sent');
			});
		});
	});
}

function extractLocation(data) {
    const {lat,  lng} = JSON.parse(data).results[0].geometry;
    return {lat, lon: lng};
}

module.exports = {getLocation};