const Distance = require('geo-distance');

const crag = require('./crag');
const weather = require('./weather');

const MY_HOUSE = {lat: 54.001490, lon: -1.574530};

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
Chance of rain today: ${crag.forecast.forecast.forecastday[0].day.daily_chance_of_rain}%
Chance of rain tomorrow: ${crag.forecast.forecast.forecastday[1].day.daily_chance_of_rain}%
`);
}

function getDistance(a,b) {
	return Distance.between(a,b);
}

function getDistanceFromMyHouse(crags) {
	return crags.map(crag => {
		return {...crag, distance: getDistance(MY_HOUSE, crag.location)};
	})
}

async function run() {
	let crags = await crag.getCragsList();

	crags = getDistanceFromMyHouse(crags);
	crags = crags.filter(crag => crag.distance.radians < Distance('7 km').radians);

	crags = await Promise.all(getWeatherValusAtCrags(crags));

	crags.forEach(displayCragDetails);
}

run();