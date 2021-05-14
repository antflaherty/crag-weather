const crag = require('./crag');
const weather = require('./weather');

async function addWeatherToCrag(crag){
	const forecast = JSON.parse(await weather.getTodayForecast(crag.location));
	const yesterday = JSON.parse(await weather.getYesterdayWeather(crag.location));

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