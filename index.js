const http = require('http');
const fs = require('fs');
const path = require('path');

const crag = require('./crag');

const WEATHER_URL = 'http://api.weatherapi.com/v1/'
const FORECAST_URI = 'forecast.json';
const HISTORY_URI = 'history.json'


function getWeatherApiKey() {
	const secretsFile = fs.readFileSync(path.resolve('secrets.json'));
	return JSON.parse(secretsFile).WEATHER_API_KEY;
}

function buildWeatherUrl({lat, long}, uri) {
	const apiKey = getWeatherApiKey();

	return `${WEATHER_URL}${uri}?key=${apiKey}&q=${lat},${long}`;

}

function getTodayForecast(location) {
	let url = buildWeatherUrl(location,FORECAST_URI);

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

function getYesterdayWeather(location) {
	let url = buildWeatherUrl(location,HISTORY_URI);

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
	const forecast = JSON.parse(await getTodayForecast(crag.location));
	const yesterday = JSON.parse(await getYesterdayWeather(crag.location));

	return {...crag, forecast, yesterday};
}

function getWeatherValusAtCrags(crags) {
	return crags.map(addWeatherToCrag);
}

async function run() {
	let crags = await crag.getCragsList();

	crags = await Promise.all(getWeatherValusAtCrags(crags.slice(0,2)));

	crags.forEach((crag) => {
		console.log(
`${crag.name}
Yesterday total precipitation: ${crag.yesterday.forecast.forecastday[0].day.totalprecip_mm}mm
Chance of rain today: ${crag.forecast.forecast.forecastday[0].day.daily_chance_of_rain}%
`);
		});
	}

run();