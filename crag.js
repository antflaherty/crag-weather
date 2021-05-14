const https = require('https');
const xml = require('xml-js');

function getCragsList() {
	return new Promise((resolve, reject) => {
		https.get('https://www.thebmc.co.uk/Services/MapService.asmx/LoadCrags', (res) => {
			let data = '';
			res.resume();
			res.on('data', (chunk) => { data += chunk });
			res.on('end', () => {
				resolve(extractNiceCragArray(data));
				if (!res.complete)
					reject(
						'The connection was terminated while the message was still being sent');
			});
		});
	});
}


function parseResponseToJson(data) {
	return JSON.parse(xml.xml2json(data, { compact: true }));
}

function extractNiceCragArray(data) {
	const parsedData = parseResponseToJson(data);
	return parsedData.ArrayOfCragMarker.CragMarker.map(crag => {
        return {
            name: crag.Title._text,
            region: crag.Subtitle._text,
            location: {
                lat: crag.Lat._text,
                long: crag.Lon._text
            }
        };
    });
}

module.exports = {getCragsList};