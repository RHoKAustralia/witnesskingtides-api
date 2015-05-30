'use strict'

var Photo = require('../models/photo');
var Uploader = require('../lib/uploader');

exports.getAllPhotos = function(res, email) {
  Photo.find({
    user: {
      '$ne': null
    }
  }).populate('user', null, {
    email: {
      '$in': [email]
    }
  }).exec(function (err, docs) {
    if (!docs) {
      res.json({
        msg: 'no photos with ' + email
      });
      return;
    }
    res.json(docs.filter(function(photo) {
      //TODO: remove this manual check and do it in the query
      return photo.user && photo.user.email == email;
    }));
  });
};

exports.uploadPhoto = function(req, res, contentType) {
  var uploader = new Uploader();
  var uploadTypeSuffix = contentType.indexOf('json') >= 0 ? 'Json' : 'Multipart';
  uploader['handle' + uploadTypeSuffix](req, res);
};

exports.getPhotoByPosition = function(res, id) {
  Photo.findById(id, function(err, data) {
    res.json(data);
  });
};

exports.getPhoto = function(res, id) {
  Photo.findById(id, function(err, data) {
    res.json(data);
  });
};

exports.photoSearch = function (res, params) {
  console.log('params', params);
  var search = {};
  if (params.min_taken_date) {
    search.submitted = search.submitted || {};
    search.submitted['$gte'] = new Date(params.min_taken_date*1000);
  }
  if (params.max_taken_date) {
    search.submitted = search.submitted || {};
    search.submitted['$lte'] = new Date(params.max_taken_date*1000);
  }

  if (params.bbox) {
    var parts = params.bbox.split(',');
    if(parts.length > 3){
      search.latitude = {'$lte' : parts[1], '$gte': parts[3]}
      search.longitude = {'$gte' : parts[0], '$lte': parts[2]}
    }
  }
console.log('search', search);
  Photo.find(search, function (err, docs) {
    if(docs){
      console.log('doc length', docs.length);
      var cache = {};
      console.log("Restart grids");

      for(var i = 0; i< docs.length;i++){
        if(cache[docs[i].latitude + "_" + docs[i].longitude]) {
          cache[docs[i].latitude + "_" + docs[i].longitude].cnt++;
          continue;
        }
        cache[docs[i].latitude + "_" + docs[i].longitude] = {
          pos: [docs[i].latitude, docs[i].longitude],
          cnt: 1
        };
      }

      res.json(cache);
    }
  });
};
