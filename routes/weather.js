var express = require('express');
var router = express.Router();

var localRouter = require('./weather/local');

router.use('/local', localRouter);

module.exports = router;
