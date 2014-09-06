'use strict';

var express = require('express');
var router = express.Router();
var cors = require('cors');
var winston = require('winston');
var conf = require('../lib/config');

var requireController = function (name) {
  return require('../controllers/' + name);
};

var controllers = {
  tide_events: requireController('tide_events'),
  photos: requireController('photos'),
  flickr: requireController('flickr')
};

router.get('/tide_events', function (req, res) {
  controllers.tide_events.getAllTideEvents(res);
});

router.get('/tide_events/future/:date?', function (req, res) {
  var when = req.params.date || new Date;
  controllers.tide_events.getFutureTideEvents(res, when);
});

router.get('/tide_events/current', function (req, res) {
  controllers.tide_events.getCurrentTideEvents(res);
});

router.get('/tide_events/:id', function (req, res) {
  var tideId = req.params.id;
  controllers.tide_events.getTide(res, tideId);
});

router.get('/photos', function (req, res) {
  var email = req.query.email;
  controllers.photos.getAllPhotos(res, email);
});

var corsWhitelist = conf.get('WKT_CORS_WHITELIST').split(',').map(function(val) {
  return val.replace(/\\/gi, '');
});

winston.info('Whitelist: ' + corsWhitelist);

var corsOptions = {
  origin: function (origin, cb) {
    var originAllowed = corsWhitelist.indexOf(origin) !== -1;
    var errorMsg = originAllowed ? null : 'You are not allowed to execute this request.';
    winston.info('Allowing? ' + originAllowed);
    cb(errorMsg, {
      origin: originAllowed
    });
  }
};

router.post('/photos', cors(corsOptions), function (req, res) {
  var contentType = req.get('Content-Type');
  controllers.photos.uploadPhoto(res, contentType);
});

router.get('/photos/search', function (req, res) {
  var params = {
    api_key: conf.get('FLICKR_KEY'),
    user_id: conf.get('FLICKR_USER_ID'),
    extras: 'geo,url_s,url_c,url_o,date_taken,date_upload,owner_name,original_format,o_dims,views',
    per_page: req.query.per_page,
    page: req.query.page
  };

  if (req.params['min_taken_date']) {
    params.min_taken_date = req.params['min_taken_date'];
  }

  if (req.params['max_taken_date']) {
    params.max_taken_date = req.params['max_taken_date'];
  }

  controllers.flickr.flickrSearch(res, params);
});

router.get('/photos/:id', function (req, res) {
  var id = req.params.id;
  controllers.photos.getPhoto(res, id);
});

module.exports = router;
