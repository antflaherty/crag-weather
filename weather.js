const http = require('http');
const fs = require('fs');
const path = require('path');


const WEATHER_URL = 'http://api.weatherapi.com/v1/'
const FORECAST_URI = 'forecast.json';
const HISTORY_URI = 'history.json'


function getWeatherApiKey() {
    const secretsFile = fs.readFileSync(path.resolve('secrets.json'));
    return JSON.parse(secretsFile).WEATHER_API_KEY;
}

function buildWeatherUrl({ lat, long }, uri) {
    const apiKey = getWeatherApiKey();

    return `${WEATHER_URL}${uri}?key=${apiKey}&q=${lat},${long}`;

}

function performForecastRequest(url) {
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

function getForecast(location) {
    let url = buildWeatherUrl(location, FORECAST_URI);

    url += '&days=3';

    return performForecastRequest(url);
}

function getYesterdayWeather(location) {
    let url = buildWeatherUrl(location, HISTORY_URI);

    const now = Date.now();
    const yesterday = new Date(now - 24 * 60 * 60 * 1000);
    const yesterdayFormatted = `${yesterday.getFullYear()}-${yesterday.getMonth() + 1}-${yesterday.getDate()}`;
    url += `&dt=${yesterdayFormatted}`;

    return performForecastRequest(url);
}

module.exports = { getForecast, getYesterdayWeather };