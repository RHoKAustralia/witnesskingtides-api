'use strict';

var fs = require('fs');
var os = require('os');
var path = require('path');
var config = require('./../lib/config');
var flickr = require('flickr-with-uploads');
var multiparty = require('multiparty');
var User = require('./../models/user');
var Photo = require('./../models/photo');

function Uploader() {}

function saveUser(email, firstName, lastName) {
  var user = new User();
  user.email = email;
  user.firstName = firstName;
  user.lastName = lastName;
  user.save();
  return user;
}

function savePhoto(photoData) {
  var photo = new Photo();
  photo.description = photoData.descr;
  photo.submitted = new Date();
  photo.latitude = photoData.lat;
  photo.longitude = photoData.lon;
  photo.user = photoData.user;
  photo.uploadStatus = 'UPLOADING';
  photo.save();
  return photo._id;
}

function streamToFlickr(photoId, payloadData, callback) {
  // save the photo data
  var api = flickr(
    config.get('FLICKR_KEY'),
    config.get('FLICKR_SECRET'),
    config.get('FLICKR_OAUTH_KEY'),
    config.get('FLICKR_OAUTH_SECRET')
  );

  console.info('Processing photo upload:' + JSON.stringify(payloadData));

  var opts = {
    method: 'upload',
    title: payloadData.descr,
    description: payloadData.descr,
    is_public: 1,
    is_friend: 1,
    is_family: 0,
    content_type: 1,
    hidden: 1,
    photo: fs.createReadStream(payloadData.fileName)
  };

  api(opts, function(err, data) {
    if (err) {
      console.error('Could not upload photo: ' + err);
      callback(err);
      return;
    }

    var new_photo_id = data.photoid[0];
    console.info('Photo ID:' + new_photo_id);

    // api call to save photo info
    // onto the mongo datastore
    api({
      method: 'flickr.photos.getInfo',
      photo_id: new_photo_id
    }, function(err, data) {

      Photo.findOne({
        '_id': photoId
      }, function(err, photo) {
        if (err) {
          console.error('Could not find uploaded photo in FlickR.');
          callback(err);
          return;
        }

        photo.flickrId = new_photo_id;
        photo.flickrUrl = data.photo[0].urls[0].url[0]._;
        photo.uploadStatus = 'COMPLETED';
        photo.save();

        console.info('Photo metadata successfully saved');

        api({
          method: 'flickr.photos.geo.setLocation',
          photo_id: new_photo_id,
          lat: payloadData.lat,
          lon: payloadData.lon,
          context: 2
        }, function(err, res) {
          if (err) {
            console.error('Could not set GeoLocation for photo.');
            callback(err);
            return;
          }

          console.info('Photo geotagged successfully!');
          callback(null, photo);
        });
      });
    });

  });
}

Uploader.prototype.handleJson = function(req, res) {
  var payload = req.body;
  var pathSeparator = '';
  if (os.tmpdir()[os.tmpdir().length - 1] !== '/') {
    pathSeparator = '/';
  }
  var tmpFilename = os.tmpdir() + pathSeparator + payload.fileId;
  var bitmap = new Buffer(payload.Photo, 'base64');
  fs.writeFileSync(tmpFilename, bitmap, 'utf8');

  var user = saveUser(payload.FirstName,
    payload.LastName || '',
    payload.Email);

  var photoData = {
    fileName: tmpFilename,
    descr: payload.Description || '',
    lat: payload.Latitude,
    lon: payload.Longitude,
    user: user
  }

  var photoId = savePhoto(photoData);
  streamToFlickr(photoId, photoData, function(err, photo){
    if (err) {
      res.json(500, err);
      return;
    }
    res.json({
      'photoId': photoId
    });
  });
}

Uploader.prototype.handleMultipart = function(req, res) {
  var form = new multiparty.Form();
  form.parse(req, function(err, fields, files) {
    if (err) {
      res.json(500, err);
      return;
    }

    // save the user
    var user = saveUser(fields.Email[0],
      fields.FirstName[0],
      fields.LastName[0] || '');

    var geoLocation = fields.PhotoLocation[0].split(' ');

    var photoData = {
      fileName: files.Photofile[0].path,
      descr: fields.Description[0] || '',
      lat: geoLocation[1],
      lon: geoLocation[0],
      user: user
    }

    var photoId = savePhoto(photoData);
    streamToFlickr(photoId, photoData, function(err, photo){
      if (err) {
        res.json(500, err);
        return;
      }
      res.json({
        'photoId': photoId
      });
    });
  });
}

module.exports = Uploader;
