'use strict';

var express = require('express');
var Uploader = require('./../lib/uploader');
var router = express.Router();
var KingTideEvent = require('./../models/kingtideevent');
var Photo = require('./../models/photo');

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
	Photo.find({'user':{'$ne': null }})
	.populate('user',null,{email:{$in:[req.query.email]}})
	//.populate('user')
	//.where('user.email').in(['tarcio@mail.com'])  //not working
	.exec(function (err, docs) {		
		if(!docs){
			res.json({'msg':'no photos with '+req.query.email});
			return;
		}
		var photos = [];
		//TODO: remove this manual check and do it in the query
		docs.forEach(function(photo){			
			if(photo.user && photo.user.email == req.query.email){				
				photos.push(photo)
			}
		});				
		res.json(photos);
		// docs is an array
	});
});

router.post('/upload', function (req, res) {
  new Uploader().go(req, res);
});

module.exports = router;