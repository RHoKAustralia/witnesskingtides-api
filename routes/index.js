'use strict';

var express = require('express');
var Uploader = require('./../lib/uploader');
var router = express.Router();
var KingTideEvent = require('./../models/kingtideevent');
var Photo = require('./../models/photo');

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
  KingTideEvent.find({}, function (err, events) {
    var eventMap = [];
    events.forEach(function (event) {
      eventMap.push({
        "id": event._id,
        "event": event
      });
    });
    res.send(200, eventMap);
  });
});

router.get('/tides/future/:date?', function (req, res) {
  var when = req.params['date'] || new Date;
  kingTideEvent.find({
    eventStart: {
      $gte: when
    }
  }, function (err, events) {
    var eventMap = [];
    events.forEach(function (event) {
      eventMap.push({
        "id": event._id,
        "event": event
      });
    });
    res.send(200, eventMap);
  });
});

router.get('/tides/current', function (req, res) {
  var now = new Date;
  kingTideEvent.find({
    eventStart: {
      $lte: now
    },
    eventEnd: {
      $gte: now
    }
  }, function (err, events) {
    var eventMap = [];
    events.forEach(function (event) {
      eventMap.push({
        "id": event._id,
        "event": event
      });
    });
    res.send(200, eventMap);
  });
});

router.get('/tides/:id', function (req, res) {
  kingTideEvent.findOne({
    '_id': req.params['id']
  }, function (err, event) {
    if (event == null)
      res.send(404);
    else
      res.send(200, event);
  });
});


router.get('/submissions', function (req, res) {
  Photo.find({
    'user': {
      '$ne': null
    }
  })
    .populate('user', null, {
      email: {
        $in: [req.query.email]
      }
    })
  //.populate('user')
  //.where('user.email').in(['tarcio@mail.com'])  //not working
  .exec(function (err, docs) {
    if (!docs) {
      res.json({
        'msg': 'no photos with ' + req.query.email
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

module.exports = router;