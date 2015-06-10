var Flickr = require('flickrapi');
var Photo = require('./photos');
var conf = require('../lib/config');
var base58 = require('../lib/base58');

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
exports.updatePhoto = function(res, id, cb){
  var msg = '';

  Photo.getPhotoByFlickrId(res, id, function(err, photo){
    if(err) {
      msg = 'Error retrieving photo data from database';
      if(!cb) res.status(500).json(msg);
      else cb(msg);
      return;
    }
    // console.log('db photo', photo);
    if(photo == null){
      msg = 'No photo in database associated with this flickr photo id. Nothing to update';
      if(!cb) res.status(500).json(msg);
      else cb(msg);
      return;
    }
    Flickr.authenticate(FlickrOptions, function (error, flickr) {
      var params = {
        photo_id: id
      }
      flickr.photos.getInfo(params, function (err, fPhoto) {
        if (err) {
          msg = 'Error retrieving photo data from flickr. Photo may be deleted. Check http://flickr.com/p/' + base58.encode(parseInt(id));
          if(!cb) res.status(500).json(msg);
          else cb(msg);
          return;
        }
        //console.log('flickr photo', fPhoto);
        if(fPhoto.photo.title && fPhoto.photo.title._content)
          photo.description = fPhoto.photo.title._content;
        if(fPhoto.photo.dates && fPhoto.photo.dates.taken && !isNaN(Date.parse(fPhoto.photo.dates.taken)))
          photo.dateTaken = new Date(fPhoto.photo.dates.taken);
        if(fPhoto.photo.location && fPhoto.photo.location.latitude && fPhoto.photo.location.longitude){
          photo.latitude = fPhoto.photo.location.latitude;
          photo.longitude = fPhoto.photo.location.longitude;
        }
        photo.save(function(err){
          if (err) {
            msg = 'Error saving photo data from flickr';
            if(!cb) res.status(500).json(msg);
            else cb(msg);
            return;
          }
          var msg = 'Photo updated';
          if(cb) cb(null, msg)
          else res.json(msg);
        });
      });
    });
  });
}
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
        var msg = 'Error retrieving photo from Flickr. Photo may be deleted';
        if(cb) cb(msg)
        else res.status(500).json(msg);
        return;
      }
      if(cb) cb(null, result);
      else res.json(result);
    });
  });
};
