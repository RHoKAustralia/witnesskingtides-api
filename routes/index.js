'use strict';

var express = require('express');
var router = express.Router();
var conf = require('../lib/config');
var cors = require('../lib/cors');

var requireController = function (name) {
  return require('../controllers/' + name);
};

var controllers = {
  tide_events: requireController('tide_events'),
  photos: requireController('photos'),
  flickr: requireController('flickr')
};

router.get('/tide_events', cors, function (req, res) {
  controllers.tide_events.getAllTideEvents(res);
});

router.get('/tide_events/future/:date?', cors, function (req, res) {
  var when = req.params.date || new Date;
  controllers.tide_events.getFutureTideEvents(res, when);
});

router.get('/tide_events/current', cors, function (req, res) {
  controllers.tide_events.getCurrentTideEvents(res);
});

router.get('/tide_events/:id', cors, function (req, res) {
  var tideId = req.params.id;
  controllers.tide_events.getTide(res, tideId);
});

router.get('/photos', cors, function (req, res) {
  var email = req.query.email;
  controllers.photos.getAllPhotos(res, email);
});

router.options('/photos', cors);

router.post('/photos', cors, function (req, res) {
  var contentType = req.get('Content-Type');
  controllers.photos.uploadPhoto(req, res, contentType);
});

router.get('/photos/search', cors, function (req, res) {
  console.log('local search');
  var params = {};
  if (req.query['min_taken_date']) {
    params.min_taken_date = req.query['min_taken_date'];
  }

  if (req.query['max_taken_date']) {
    params.max_taken_date = req.query['max_taken_date'];
  }

  if (req.query['bbox']) {
    params.bbox = req.query['bbox'];
  }
  controllers.photos.photoSearch(res, params);
});
router.get('/flickr/search', cors, function (req, res) {
  console.log('flickr search');
  var params = {
    api_key: conf.get('FLICKR_KEY'),
    user_id: conf.get('FLICKR_USER_ID'),
    extras: 'geo,url_s,url_c,url_o,date_taken,date_upload,owner_name,original_format,o_dims,views',
    per_page: req.query.per_page,
    page: req.query.page
  };
  // change to upload date to make consistent with api search
  if (req.query['min_taken_date']) {
    params.min_upload_date = req.query['min_taken_date']; 
  }

  if (req.query['max_taken_date']) {
    params.max_upload_date = req.query['max_taken_date'];
  }

  if (req.query['bbox']) {
    params.bbox = req.query['bbox'];
  }

  controllers.flickr.flickrSearch(res, params);
});

router.get('/photos/:id', cors, function (req, res) {
  var id = req.params.id;
  controllers.photos.getPhoto(res, id);
});

module.exports = router;
