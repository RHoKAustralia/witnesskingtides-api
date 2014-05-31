'use strict';

var express = require('express');
var Uploader = require('./../lib/uploader');
var router = express.Router();
var kingTideEvent = require('./../models/kingtideevent');

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
  kingTideEvent.find({}, function (err, events) {
    var eventMap = [];
    events.forEach(function(event) {
        eventMap.push({ "id" : event._id, "event" : event});
    });
    res.send(200, eventMap);  
  });
});

router.get('/tides/future/:date?', function (req, res) {
  var when = req.params['date'] || new Date;
  kingTideEvent.find({ eventStart: { $gte: when }}, function (err, events) {
    var eventMap = [];
    events.forEach(function(event) {
        eventMap.push({ "id" : event._id, "event" : event});
    });
    res.send(200, eventMap);  
  });
});

router.get('/tides/current', function (req, res) {
  var now = new Date;
  kingTideEvent.find({ eventStart: { $lte: now }, eventEnd : { $gte: now }}, function (err, events) {
    var eventMap = [];
    events.forEach(function(event) {
        eventMap.push({ "id" : event._id, "event" : event});
    });
    res.send(200, eventMap);  
  });
});

router.get('/tides/:id', function (req, res) {
  kingTideEvent.findOne({ '_id': req.params['id'] }, function(err, event){
    if (event == null)
      res.send(404);
    else 
      res.send(200, event);  
  });
});


router.get('/submissions', function (req, res) {

});

router.post('/upload', function (req, res) {
  var uploader = new Uploader();
  if (req.get('Content-Type') === 'application/json') {
    uploader.handleJson(req, res);
  } else {
    uploader.handleMultipart(req, res);
  }
});

module.exports = router;