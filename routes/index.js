'use strict';

var express = require('express');
var router = express.Router();
var cors = require('cors');
var conf = require('../lib/config');

var requireController = function(name) {
  return require('../controllers/' + name);
};
var controllers = {
  tide_events: requireController('tide_events'),
  //photos:      requireController('photos')
};


router.get('/tide_events', function(req, res) {
  controllers.tide_events.getAllTideEvents(res);
});

router.get('/tide_events/future/:date?', function(req, res) {
  var when = req.params.date || new Date;
  controllers.tide_events.getFutureTideEvents(res, when);
});

router.get('/tide_events/current', function(req, res) {
  controllers.tide_events.getCurrentTideEvents(res);
});

router.get('/tide_events/:id', function(req, res) {
  var tideId = req.params.id;
  controllers.tide_events.getTide(res, tideId);
});


router.get('/photos', function(req, res) {
  var email = req.query.email;
  controllers.photos.getAllPhotos(res, email);
});

var corsWhitelist = conf.get('WKT_CORS_WHITELIST');
var corsOptions = {
  origin: function(origin, cb) {
    var originAllowed = corsWhitelist.indexOf(origin) >= 0;
    var errorMsg = originAllowed ? null : 'You are not allowed to execute this request.';
    cb(errorMsg, { origin: originAllowed });
  }
};

router.post('/photos', cors(corsOptions), function(req, res) {
  var contentType = req.get('Content-Type');
  controllers.photos.uploadPhoto(res, contentType);
});

router.get('/photos/:id', function(req, res) {
  console.log(req.params);

  var id = req.params.id;
  controllers.photos.getPhoto(res, id);
});

// docs
router.get('/', function(req, res) {
  var endpoints = {
    '/tide_events': {
      actions: [
        {
          method: 'GET',
          description: 'Get all king tide locations'
        }
      ],
      children: {
        '/:id': {
          actions: [
            {
              method: 'GET',
              description: 'Get details for one king tide event'
            }
          ]
        },
        '/future': {
          actions: [
            {
              method: 'GET',
              description: 'Get king tide locations in the future'
            }
          ]
        },
        '/current': {
          actions: [
            {
              method: 'GET',
              description: 'Get current king tide locations'
            }
          ]
        },
      }
    },

    '/photos': {
      actions: [
        {
          method: 'GET',
          description: 'Get all photos'
        }, {
          method: 'POST',
          description: 'Upload a photo'
        }
      ],
      children: {
        '/:id': {
          actions: [
            {
              method: 'GET',
              description: 'Get status of a photo upload'
            }
          ]
        }
      }
    }
  };
  res.json(endpoints);
});

module.exports = router;
