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
exports.getAllDeletedPhotos = function(res, params, cb) {
  params = params || {};
  var page = params.page || 1;
  var items_per_page = params.items_per_page || 100;

  if(!page || page < 1) page = 1;
  Photo
    .find({deleted: 1})
    .limit(items_per_page)
    .skip((page-1) * items_per_page)
    .sort({submitted: -1})
    .exec(function(err,data){
    if (err) {
      if(cb) cb(err);
      res.json(500, err);
      return;
    }
    if(cb) cb(null, data);
    else res.json(data);
  });
}
exports.getPhotosCount = function(res, params, cb) {
  params = params || {};
  var page = params.page || 1;
  var search = params.search || {};
  var items_per_page = params.count || 100;

  if(!page || page < 1) page = 1;
  Photo
    .count(search, function(err,data){
    if (err) {
      if(cb) cb(err);
      res.json(500, err);
      return;
    }
    if(cb) cb(null, data);
    else res.json(data);
  });
}
exports.getPhotos = function(res, params, cb) {
  params = params || {};
  var page = params.page || 1;
  var search = params.search || {};
  var items_per_page = params.count || 100;

  if(!page || page < 1) page = 1;
  Photo
    .find(search)
    .limit(items_per_page)
    .skip((page-1) * items_per_page)
    .sort({submitted: -1})
    .exec(function(err,data){
    if (err) {
      if(cb) cb(err);
      res.json(500, err);
      return;
    }
    if(cb) cb(null, data);
    else res.json(data);
  });
}
exports.uploadPhoto = function(req, res, contentType) {
  var uploader = new Uploader();
  var uploadTypeSuffix = contentType.indexOf('json') >= 0 ? 'Json' : 'Multipart';
  uploader['handle' + uploadTypeSuffix](req, res);
};

exports.toggleDelete = function(res, search, undelete) {
  console.log((undelete ? 'un' : '') + 'delete via ', search);    
  Photo.update(search, {$set: {deleted: !undelete}}, {multi: true}, function(err, data) {
    if (err) {
      res.json(500, err);
      return;
    }
    res.json(undelete ? "Undeleted" : "Marked as Deleted");

  });
};

exports.getPhoto = function(res, id) {
  Photo.findById(id, function(err, data) {
    if (err) {
      res.json(500, err);
      return;
    }
    res.json(data);
  });
};
exports.getPhotoByFlickrId = function(res, id, cb) {
  Photo.findOne({flickrId: id}, function(err, data) {
    if (err) {
      if(cb) cb(err)
      else res.json(500, err);
      return;
    }
    if(cb) cb(null,data);
    else res.json(data);
  });
};

var getSearchParams = function(params){
  console.log('params', params);
  var search = {
    flickrUrl: {$exists: true}
    ,$or: [ {deleted: {$eq: null}}, {deleted: false}]
  };
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
      search.latitude = {'$gte' : parseFloat(parts[1]), '$lte': parseFloat(parts[3])}
      search.longitude = {'$gte' : parseFloat(parts[0]), '$lte': parseFloat(parts[2])}
    }
  }
  console.log('search', search);
  return search;

}

exports.search = function (res, params) {

  Photo.find(getSearchParams(params), function (err, docs) {
    if(err) {
      res.status(500).json(err);
      return;
    }
    res.json(docs);
  });
};
exports.clusters = function (res, params) {
  Photo.find(getSearchParams(params), function (err, docs) {
    if(err) {
      res.status(500).json(err);
      return;
    }
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
  });
};
