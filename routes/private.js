var express = require('express');
var router = express.Router();
var KingTideEvent = require('./../models/kingtideevent');

router.post('/tides', function (req, res) {

  var event = new KingTideEvent ({
    location: req.body['location'] || 'Undefined',
    state: req.body['state'] || 'Undefined',
    highTideOccurs: req.body['highTideOccurs'] || new Date,
    eventStart: req.body['eventStart'] || new Date,
    eventEnd: req.body['eventEnd'] || new Date,
    latitude: req.body['latitude'] || 0,
    longitude: req.body['longitude'] || 0,
  });

  event.save(function(){
    res.send(201);
  });
});

router.delete('/tides/:id', function (req, res) {
  KingTideEvent.findOne({ '_id': req.params['id'] }, function(err, event){
    if (event == null)
        res.send(404);
    else {
      event.remove(function () {
        res.send(204);
      });
    }    
  });
});

module.exports = router;
