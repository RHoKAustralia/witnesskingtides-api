var express = require('express');
var router = express.Router();
var cors = require('cors');

var buildEndpoint = function (actions, children) {
  var endpoint = {
    'actions': actions
  };
  if (children) {
    endpoint.children = children
  }
  return endpoint;
};

var buildAction = function (method, description, params) {
  var action = {
    'method': method,
    'description': description
  };
  if (params) {
    action.params = params;
  }
  return action;
};

router.get('/', cors({
  origin: '*',
  methods: ['GET']
}), function (req, res) {
  var endpoints = {
    '/tide_events': buildEndpoint([
      buildAction('GET', 'Get all king tide locations')
    ], {
      '/:id': buildEndpoint([
        buildAction('GET', 'Get details for one king tide event')
      ]),
      '/future': buildEndpoint([
        buildAction('GET', 'Get king tide locations in the future')
      ]),
      '/current': buildEndpoint([
        buildAction('GET', 'Get current king tide locations')
      ])
    }),

    '/photos': buildEndpoint([
      buildAction('GET', 'Get all photos'),
      buildAction('POST', 'Upload a photo')
    ], {
      '/search': buildEndpoint([
        buildAction('GET', 'Search for photos in FlickR.')
      ]),
      '/:id': buildEndpoint([
        buildAction('GET', 'Get status of a photo upload')
      ])
    })
  };
  res.json(endpoints);
});

module.exports = router;