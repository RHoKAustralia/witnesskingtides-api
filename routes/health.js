'use strict';

var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var cors = require('../lib/cors');

router.get('/', function (req, res) {

  var db = mongoose.connection;
  db.on('error', function () {
    var status = {
      mongodb_status: "connected"
    };
    res.json(status);
  });

  db.once('open', function () {
    var status = {
      mongodb_status: "connected"
    };
    res.json(status);
  });

});

module.exports = router;