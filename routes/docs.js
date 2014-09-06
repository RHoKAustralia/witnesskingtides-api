var express = require('express');
var router = express.Router();

router.get('/', function (req, res) {
  var endpoints = {
    '/tide_events': {
      actions: [{
        method: 'GET',
        description: 'Get all king tide locations'
      }],
      children: {
        '/:id': {
          actions: [{
            method: 'GET',
            description: 'Get details for one king tide event'
          }]
        },
        '/future': {
          actions: [{
            method: 'GET',
            description: 'Get king tide locations in the future'
          }]
        },
        '/current': {
          actions: [{
            method: 'GET',
            description: 'Get current king tide locations'
          }]
        },
      }
    },

    '/photos': {
      actions: [{
        method: 'GET',
        description: 'Get all photos'
      }, {
        method: 'POST',
        description: 'Upload a photo'
      }],
      children: {
        '/search': {
          actions: [{
            method: 'GET',
            description: 'Search for photos in FlickR.'
          }]
        },
        '/:id': {
          actions: [{
            method: 'GET',
            description: 'Get status of a photo upload'
          }]
        }
      }
    }
  };
  res.json(endpoints);
});

module.exports = router;