'use strict';

var KingTideEvent = require('../models/kingtideevent');

var findCb = function(res) {
  return function (err, events) {
    var eventMap = events.map(function(event) {
      return {
        'id':    event._id,
        'event': event
      };
    });
    res.status(200).send(eventMap);
  };
};

exports.getAllTideEvents = function(res) {
  KingTideEvent.find({}, findCb(res));
};

exports.getFutureTideEvents = function(res, when) {
  KingTideEvent.find({
    eventStart: {
      $gte: when
    }
  }, findCb(res));
};

exports.getCurrentTideEvents = function(res) {
  var now = new Date;
  KingTideEvent.find({
    eventStart: {
      $lte: now
    },
    eventEnd: {
      $gte: now
    }
  }, findCb(res));
};

exports.getTide = function(res, tideId) {
  KingTideEvent.findOne({
    _id: tideId
  }, function (err, event) {
    if (event == null) {
      res.send(404);
    } else {
      res.status(200).send(event);
    }
  });
};
