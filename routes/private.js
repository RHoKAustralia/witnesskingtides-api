'use strict';

var express = require('express');
var router = express.Router();
var kingTideEvent = require('./../models/kingtideevent');

router.put('/tides/:id', function (req, res) {
  kingTideEvent.findOne({
    '_id': req.params['id']
  }, function (err, event) {
    if (event == null)
      res.send(404);
    else {
      event.location = req.body['location'] || event.location;
      event.state = req.body['state'] || event.state;
      event.description = req.body['description'] || event.description;
      event.highTideOccurs = req.body['highTideOccurs'] || event.highTideOccurs;
      event.eventStart = req.body['eventStart'] || event.eventStart;
      event.eventEnd = req.body['eventEnd'] || event.eventEnd;
      event.latitude = req.body['latitude'] || event.latitude;
      event.longitude = req.body['longitude'] || event.longitude;

      event.save(function () {
        if (err)
          res.send(400, err)
        else
          res.send(200);
      });
    }
  });
});

router.post('/tides', function (req, res) {
  var event = new kingTideEvent({
    location: req.body['location'] || 'Undefined',
    state: req.body['state'] || 'Undefined',
    description: req.body['description'] || 'Undefined',
    highTideOccurs: req.body['highTideOccurs'] || new Date,
    eventStart: req.body['eventStart'] || new Date,
    eventEnd: req.body['eventEnd'] || new Date,
    latitude: req.body['latitude'] || 0,
    longitude: req.body['longitude'] || 0,
  });

  event.save(function (err) {
    if (err)
      res.send(400, err)
    else
      res.send(201);
  });
});

router.delete('/tides/:id', function (req, res) {
  kingTideEvent.findOne({
    '_id': req.params['id']
  }, function (err, event) {
    if (event == null)
      res.send(404);
    else {
      event.remove(function () {
        if (err)
          res.send(400, err)
        else
          res.send(204);
      });
    }
  });
});

module.exports = router;