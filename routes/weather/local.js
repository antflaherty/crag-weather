var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
    const {location} = req.query; 
    console.log(`about to tell to render weather with ${location}`)
    res.render('weather', { location });
});

module.exports = router;
