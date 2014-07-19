'use strict';

var express = require('express');
var Uploader = require('./../lib/uploader');
var router = express.Router();
var Photo = require('./../models/photo');

var requireController = function(name) {
  return require('../controllers/' + name);
};
var controllers = {
  tide_events: requireController('tide_events'),
  //photos:      requireController('photos')
};

router.get('/', function (req, res) {
  var endpoints = {
    GET: {
      '/tides': {
        description: 'Get all king wave tide locations'
      },
      '/submissions': {
        params: ['email'],
        description: 'Get all king wave tide locations'
      }
    },
    POST: {
      '/upload': {
        description: 'Upload a photos'
      }
    }
  }
  res.json(endpoints);
});

router.get('/tides', function (req, res) {
  controllers.tide_events.getAllTideEvents(res);
});

router.get('/tides/future/:date?', function (req, res) {
  var when = req.params.date || new Date;
  controllers.tide_events.getFutureTideEvents(res, when);
});

router.get('/tides/current', function (req, res) {
  controllers.tide_events.getCurrentTideEvents(res);
});

router.get('/tides/:id', function (req, res) {
  var tideId = req.params.id;
  controllers.tide_events.getTide(res, tideId);
});


router.get('/photos', function (req, res) {
  Photo.find({
    user: {
      '$ne': null
    }
  })
  .populate('user', null, {
    email: {
      '$in': [req.query.email]
    }
  })
  //.populate('user')
  //.where('user.email').in(['tarcio@mail.com'])  //not working
  .exec(function (err, docs) {
    if (!docs) {
      res.json({
        msg: 'no photos with ' + req.query.email
      });
      return;
    }
    var photos = [];
    //TODO: remove this manual check and do it in the query
    docs.forEach(function (photo) {
      if (photo.user && photo.user.email == req.query.email) {
        photos.push(photo)
      }
    });
    res.json(photos);
    // docs is an array
  });
});

router.post('/upload', function (req, res) {
  var uploader = new Uploader();
  if (req.get('Content-Type').indexOf('json') >= 0) {
    uploader.handleJson(req, res);
  } else {
    uploader.handleMultipart(req, res);
  }

});

router.get('/upload/:id', function (req, res) {
  console.log(req.params);
  Photo.findById(req.params['id'], function (err, data) {
  res.json(data);
  });
});


module.exports = router;
