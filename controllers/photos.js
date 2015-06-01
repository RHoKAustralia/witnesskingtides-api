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

exports.toggleDelete = function(res, search, deleteThis) {
  var deleteThis = (typeof(deleteThis) === "undefined" || deleteThis);
  console.log((deleteThis ? '' : 'un') + 'delete via ', search);
  Photo.update(search, {$set: {deleted: deleteThis}}, {multi: true}, function(err, data) {
    if (err) {
      res.json(500, err);
      return;
    }
    res.json(deleteThis ? "Marked as Deleted" : "Undeleted");

  });
};

exports.getPhoto = function(res, id, cb) {
  Photo.findById(id, function(err, data) {
    if (err) {
      if(cb) cb(err);
      else res.json(500, err);
      return;
    }
    if(cb) cb(null,data);
    else res.json(data);
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
  var search = {
    flickrUrl: {$exists: true}
    ,$or: [ {deleted: {$eq: null}}, {deleted: false}]
  };
  if (params.min_taken_date) {
    search.dateTaken = search.dateTaken || {};
    search.dateTaken['$gte'] = new Date(params.min_taken_date*1000);
  }
  if (params.max_taken_date) {
    search.dateTaken = search.dateTaken || {};
    search.dateTaken['$lte'] = new Date(params.max_taken_date*1000);
  }

  if (params.bbox) {
    var parts = params.bbox.split(',');
    if(parts.length > 3){
      search.latitude = {'$gte' : parseFloat(parts[1]), '$lte': parseFloat(parts[3])}
      search.longitude = {'$gte' : parseFloat(parts[0]), '$lte': parseFloat(parts[2])}
    }
  }
  return search;
}
var getPhotoSearchParams = function(req){
  var params = { };
  if (req.query['min_taken_date']) {
    params.min_taken_date = req.query['min_taken_date'];
  }

  if (req.query['max_taken_date']) {
    params.max_taken_date = req.query['max_taken_date'];
  }

  if (req.query['bbox']) {
    params.bbox = req.query['bbox'];
  }
  return params;
};
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
exports.paginatedSearch = function (res, req) {
  var params = {
    search: getSearchParams(getPhotoSearchParams(req)),
    count: 100,
    page: req.query['page'] || 1
  };
  params.page = parseInt(params.page);
  if(isNaN(params.page) || params.page < 1) params.page = 1;
  var that = this;
  this.getPhotosCount(res, params, function (err, count) {
    if(err) {
      res.status(500).json(err);
      return;
    }
    that.getPhotos(res, params, function (err, docs) {
      if(err) {
        res.status(500).json(err);
        return;
      }
      var data = {
        photos : {
          page: params.page,
          pages: Math.floor(count * 1.0 / params.count) + 1,
          perpage: params.count,
          photo: docs,
          total: count
        }
      }
      res.json(data);
    });
  });

};
exports.search = function (res, req) {
  var params = {
    search: getSearchParams(getPhotoSearchParams(req)),
    count: 100
  };

  this.getPhotos(res, params, function (err, docs) {
    if(err) {
      res.status(500).json(err);
      return;
    }
    res.json(docs);
  });
};
exports.clusters = function (res, req) {
  Photo.find(getSearchParams(getPhotoSearchParams(req)), function (err, docs) {
    if(err) {
      res.status(500).json(err);
      return;
    }
    var cache = {};
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
