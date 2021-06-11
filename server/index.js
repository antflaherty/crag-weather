const Distance = require('geo-distance');

const crag = require('./crag');
const weather = require('./weather');
const geocode = require('./geocode');

async function addWeatherToCrag(crag) {
	const forecast = JSON.parse(await weather.getForecast(crag.location));
	const yesterday = JSON.parse(await weather.getYesterdayWeather(crag.location));

	return { ...crag, forecast, yesterday };
}

function getWeatherValusAtCrags(crags) {
	return crags.map(addWeatherToCrag);
}

function displayCragDetails(crag) {
	console.log(
		`${crag.name}
${crag.region}
Distance from HG3: ${Distance(crag.distance).human_readable()}
Yesterday total precipitation: ${crag.yesterday.forecast.forecastday[0].day.totalprecip_mm}mm
Today total precipitation: ${crag.forecast.forecast.forecastday[0].day.totalprecip_mm}mm
Tomorrow total precipitation: ${crag.forecast.forecast.forecastday[1].day.totalprecip_mm}mm
rank: ${crag.rank}
`);
}

function getDistance(a, b) {
	return Distance.between(a, b);
}

function addDistanceToCrags(crags, userLocation) {
	return crags.map(crag => {
		return { ...crag, distance: getDistance(userLocation, crag.location) };
	})
}

function rank(crag) {
	crag.rank = Math.sqrt(crag.yesterday.forecast.forecastday[0].day.totalprecip_mm + 1) *
		(crag.forecast.forecast.forecastday[0].day.totalprecip_mm + 1) *
		(crag.forecast.forecast.forecastday[1].day.totalprecip_mm + 1) *
		Math.pow(10000 * crag.distance.radians,0.3);
}

async function run() {
	let crags = await crag.getCragsList();

	const userLocation = await geocode.getLocation('petty whin close');

	
	crags = addDistanceToCrags(crags, userLocation);
	crags = crags.filter(crag => crag.distance.radians < Distance('10 km').radians);
	
	crags = await Promise.all(getWeatherValusAtCrags(crags));

	crags.forEach(rank);
	crags.sort((a, b) => a.rank - b.rank);

	crags.forEach(displayCragDetails);

	return crags;
}


async function getCragsWithinRadius(location, radius) {
	let crags = await crag.getCragsList();

	const userLocation = await geocode.getLocation(location);
	
	crags = addDistanceToCrags(crags, userLocation);
	crags = crags.filter(crag => crag.distance.radians < Distance(`${radius} km`).radians);

	crags.sort((a, b) => a.distance.radians - b.distance.radians);

	return crags;
}

module.exports = {getCragsWithinRadius};