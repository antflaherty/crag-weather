var express = require('express');
var router = express.Router();

var localRouter = require('./weather/local');
var fakeRouter = require('./weather/fake');

router.use('/local', localRouter);
router.use('/fake', fakeRouter);

module.exports = router;
