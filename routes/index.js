var express = require('express');
var router = express.Router();

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
  
});

router.post('/tides', function (req, res) {
  event = new KingTideEventSchema ({
          location: req.params['location'],
          state: req.params['state'],
          highTideOccurs: req.params['highTideOccurs'],
          eventStart: req.params['eventStart'],
          eventEnd: req.params['eventEnd'],
          latitude: req.params['latitude'],
          longitude: req.params['longitude'],
        });
        
  event.save(function(){
    res.send(201, value);
  });
});

router.get('/submissions', function (req, res) {

});

router.post('/submit', function (req, res) {

});

module.exports = router;