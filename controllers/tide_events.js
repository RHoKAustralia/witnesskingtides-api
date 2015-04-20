'use strict';

var KingTideEvent = require('../models/kingtideevent');
var http = require('http');
var SERVICE_URL = 'http://www.bom.gov.au/australia/tides/scripts/getNextTides.php?aac={bom_id}&offset=false&tz={timezone}';

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
      var getUpdate = true;
      var now = new Date;
      if(event.lastUpdated){
        var then = new Date(event.lastUpdated);
        if(now.getTime() - then.getTime() < (1000 * 60 * 60)){
          console.log("Data not stale, not refreshing");
          getUpdate  = false;
        }
      }
      if(getUpdate){
        var url = SERVICE_URL
          .replace("{bom_id}", event.bom_id)
          .replace("{timezone}", event.timezone)

        console.log("Getting latest info from BOM " + url);
        downloadData(url,
          function(data){
            console.log("Latest data: ", data);
            var d1 = new Date(data.results.next_high.time*1000);
            var d2 = new Date(data.results.next_low.time*1000);
            KingTideEvent.update(
              {_id: tideId },
              {$set: {
                lastUpdated: now,
                highTideOccurs: d1,
                lowTideOccurs: d2
              }},
              function(err,data){
                event.lastUpdated = now;
                event.highTideOccurs = d1;
                event.lowTideOccurs = d2;
                res.status(200).send(event);
              }
            );
          },
          function(err){
            console.error("Error retrieving latest tide info: " + err);
            res.status(200).send(event);
          }
        )
      }
      else{
          res.status(200).send(event);
      }
    }
  });
};

function downloadData(url, callback, callbackError){
  http.get(url, function(res) {
      var body = '';
      res.on('data', function(chunk) {
          body += chunk;
      });
      res.on('end', function() {
        try{
          var json = JSON.parse(body)
          callback(json);
        }
        catch(err){
          callbackError(err);
        }
      });
  }).on('error', function(e) {
      console.error("Got error: ", e);
  });
}
