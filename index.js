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

function getYesterdayWeather(crag) {
	let url = buildWeatherUrl(crag,HISTORY_URI);

	const now = Date.now();
	const yesterday = new Date(now - 24 * 60 * 60 * 1000);
	const yesterdayFormatted = `${yesterday.getFullYear()}-${yesterday.getMonth() + 1}-${yesterday.getDate()}`;
	url += `&dt=${yesterdayFormatted}`;

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
	const forecast = JSON.parse(await getTodayForecast(crag));
	const yesterday = JSON.parse(await getYesterdayWeather(crag));

	return {...crag, forecast, yesterday};
}

function getWeatherValusAtCrags(crags) {
	return crags.map(addWeatherToCrag);
}

async function run() {
	let crags = await getCragsList();

	crags = await Promise.all(getWeatherValusAtCrags(crags.slice(0,20)));

	crags.forEach((crag) => {
		console.log(
`${crag.Title._text}
Yesterday total precipitation: ${crag.yesterday.forecast.forecastday[0].day.totalprecip_mm}mm
Chance of rain today: ${crag.forecast.forecast.forecastday[0].day.daily_chance_of_rain}%
`);
		});
	}

run();