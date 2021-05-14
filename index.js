const https = require('https');
const xml = require('xml-js');
const fs = require('fs');
const path = require('path');

function getWeatherApiKey() {
	const secretsFile = fs.readFileSync(path.resolve('secrets.json'));
	return JSON.parse(secretsFile).WEATHER_API_KEY;
}

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
	return cragArray = parsedData.ArrayOfCragMarker.CragMarker;
}

async function run() {
	const crags = await getCragsList();
	console.log(crags);
}

run();