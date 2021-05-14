const https = require('https');
const http = require('http');
const xml = require('xml-js');
const fs = require('fs');
const path = require('path');

const WEATHER_URL = 'http://api.weatherapi.com/v1/current.json'


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

function buildWeatherUrl(crag) {
	const lat = crag.Lat._text;
	const long = crag.Lon._text;

	const apiKey = getWeatherApiKey();

	return `${WEATHER_URL}?key=${apiKey}&q=${lat},${long}`;

}

function getCurrentWeatherAtCrag(crag) {
	const url = buildWeatherUrl(crag);


	return new Promise((resolve, reject) => {
		http.get(url, (res) => {
			let data = '';
			res.resume();
			res.on('data', (chunk) => { data += chunk });
			res.on('end', () => {
				resolve(data);
				if (!res.complete)
					reject(
						'The connection was terminated while the message was still being sent');
			});
		});
	});
}

async function run() {
	const crags = await getCragsList();

	const weather = await getCurrentWeatherAtCrag(crags[0]);
	console.log(weather);
}

run();