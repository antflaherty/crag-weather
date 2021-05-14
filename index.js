const https = require('https');
const http = require('http');
const xml = require('xml-js');
const fs = require('fs');
const path = require('path');

const WEATHER_URL = 'http://api.weatherapi.com/v1/'
const FORECAST_URI = 'forecast.json';
const HISTORY_URI = 'history.json'


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

function buildWeatherUrl(crag, uri) {
	const lat = crag.Lat._text;
	const long = crag.Lon._text;

	const apiKey = getWeatherApiKey();

	return `${WEATHER_URL}${uri}?key=${apiKey}&q=${lat},${long}`;

}

function getTodayForecast(crag) {
	let url = buildWeatherUrl(crag,FORECAST_URI);

	const today = new Date();
	const formattedTodayDate = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`

	url += `&dt=${formattedTodayDate}`;

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

async function addWeatherToCrag(crag){
	const todayWeather = JSON.parse(await getTodayForecast(crag));

	return {...crag, todayWeather};
}

async function getWeatherValusAtCrags(crags) {
	return  crags.map(addWeatherToCrag);
}

async function run() {
	let crags = await getCragsList();

	crags = getWeatherValusAtCrags(crags.slice(0,10));

	console.log(crags);
}

run();