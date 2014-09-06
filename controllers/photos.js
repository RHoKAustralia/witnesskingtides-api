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

exports.uploadPhoto = function(res, contentType) {
  var uploader = new Uploader();
  var uploadTypeSuffix = contentType.indexOf('json') >= 0 ? 'Json' : 'Multipart';
  uploader['handle' + uploadTypeSuffix](req, res);
};

exports.getPhoto = function(res, id) {
  Photo.findById(id, function(err, data) {
    res.json(data);
  });
};
