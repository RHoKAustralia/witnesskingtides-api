var Flickr = require('flickrapi');
var Photo = require('./photos');
var conf = require('../lib/config');

var FlickrOptions = {
  api_key: conf.get('FLICKR_KEY'),
  secret: conf.get('FLICKR_SECRET'),
  access_token: conf.get('FLICKR_OAUTH_KEY'),
  access_token_secret: conf.get('FLICKR_OAUTH_SECRET'),
  noAPI: true,
  nobrowser: true
};
exports.flickrSearch = function (res, params) {
  Flickr.authenticate(FlickrOptions, function (error, flickr) {

    flickr.photos.search(params, function (err, result) {
      if (err) {
        res.json(500, err);
        return;
      }
      res.json(result);
    });
  });
};
exports.undeleteIfExistOnFlickr = function (res, id, cb) {
  var params = {
    photo_id: id
  }
  console.log('undeleteIfExistOnFlickr');
  Flickr.authenticate(FlickrOptions, function (error, flickr) {
    flickr.photos.getInfo(params, function (err, result) {
      if (err) {
        // TODO: is there a better way to check this?
        if(err.message && err.message.match(/not found/) && err.message.match(/invalid ID/)) 
        {
          console.log('photo doesn\'t exist. cannot undelete', err);
          if(cb) cb('Photo doesn\'t exist on flickr');
          else res.status(500).json('Photo doesn\'t exist on flickr');
        }
        else{
          if(cb) cb('Error retrieving photo from Flickr. Can\'t Undelete');
          else res.status(500).json('Error retrieving photo from Flickr. Can\'t Undelete');
        }
        return;
      }
      Photo.toggleDelete(res, {flickrId: id}, false, cb);
    });
  });
};
exports.deleteIfDoesntExistOnFlickr = function (res, id, cb) {
  var params = {
    photo_id: id
  }
  console.log('deleteIfDoesntExistOnFlickr');
  Flickr.authenticate(FlickrOptions, function (error, flickr) {
    flickr.photos.getInfo(params, function (err, result) {
      if (err) {
        // TODO: is there a better way to check this?
        console.log(err);
        if(err.message && err.message.match(/not found/) && err.message.match(/invalid ID/)) 
        {
          console.log('photo doesn\'t exist. marking as deleted', err);
          Photo.toggleDelete(res, {flickrId: id}, true, cb);
        }
        else{
          res.status(500).json('Error retrieving photo');
        }
        return;
      }
      if(cb) cb(null, result);
      else res.json(result);
    });
  });
};

exports.getPhoto = function (res, id, cb) {
  var params = {
    photo_id: id
  }
  console.log('getphoto');
  Flickr.authenticate(FlickrOptions, function (error, flickr) {
    flickr.photos.getInfo(params, function (err, result) {
      if (err) {
        var msg = 'Error retrieving photo from Flickr';
        if(cb) cb(msg)
        else res.status(500).json(msg);
        return;
      }
      if(cb) cb(null, result);
      else res.json(result);
    });
  });
};
