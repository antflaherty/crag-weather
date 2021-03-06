var express = require('express');
var router = express.Router();

const cragWeather = require('../../server/index');

router.get('/', async function(req, res) {
    const {location, radius} = req.query;
    const crags = await cragWeather.getCragsWithinRadius(location, radius);
    console.log(crags);
    res.render('weather',   { location, radius,  crags });
});

router.get('/weather', async function(req, res) {
    const {location, radius} = req.query;
    const crags = await cragWeather.getWeatherForFirstFiveCragsWithinRadius(location, radius);
    console.log(crags);
    res.render('weather',   { location, radius,  crags });
});

module.exports = router;
