var express = require('express');
var router = express.Router();

const fs = require('fs');
const path = require('path');

router.get('/', function(req, res) {
    res.redirect('/html/index.html');
});
router.get('/data', function(req, res) {
    const data = JSON.parse(fs.readFileSync(path.resolve('./bin/data/cragsWithExampleWeather.json')));
    res.send(data);
});

module.exports = router;
