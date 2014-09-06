'use strict';

var express = require('express');
var router = express.Router();
var cors = require('cors');
var conf = require('../lib/config');

var requireController = function(name) {
  return require('../controllers/' + name);
};
var controllers = {
  tide_events: requireController('tide_events'),
  //photos:      requireController('photos')
};

// TODO: invert this for REST
router.get('/', function(req, res) {
  var endpoints = {
    GET: {
      '/tides': {
        description: 'Get all king wave tide locations'
      },
      '/photos': {
        params: ['email'],
        description: 'Get all king wave tide locations'
      }
    },
    POST: {
      '/upload': {
        description: 'Upload a photos'
      }
    }
  };
  res.json(endpoints);
});

router.get('/tides', function(req, res) {
  controllers.tide_events.getAllTideEvents(res);
});

router.get('/tides/future/:date?', function(req, res) {
  var when = req.params.date || new Date;
  controllers.tide_events.getFutureTideEvents(res, when);
});

router.get('/tides/current', function(req, res) {
  controllers.tide_events.getCurrentTideEvents(res);
});

router.get('/tides/:id', function(req, res) {
  var tideId = req.params.id;
  controllers.tide_events.getTide(res, tideId);
});


router.get('/photos', function(req, res) {
  var email = req.query.email;
  controllers.photos.getAllPhotos(res, email);
});

var corsWhitelist = conf.get('WKT_CORS_WHITELIST');
var corsOptions = {
  origin: function(origin, cb) {
    var originAllowed = corsWhitelist.indexOf(origin) >= 0;
    var errorMsg = originAllowed ? null : 'You are not allowed to execute this request.';
    cb(errorMsg, { origin: originAllowed });
  }
};

router.post('/photos', cors(corsOptions), function(req, res) {
  var contentType = req.get('Content-Type');
  controllers.photos.uploadPhoto(res, contentType);
});

router.get('/upload/:id', function(req, res) {
  console.log(req.params);

  var id = req.params.id;
  controllers.photos.getPhoto(res, id);
});

module.exports = router;
