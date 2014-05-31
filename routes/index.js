var express = require('express');
var router = express.Router();
var KingTideEvent = require('./../models/kingtideevent');

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
    var eventMap = {};
    events.forEach(function(event) {
        eventMap[event._id] = event;
    });
    res.send(200, eventMap);  
  });
});

router.get('/submissions', function (req, res) {

});

router.post('/submit', function (req, res) {

});

module.exports = router;