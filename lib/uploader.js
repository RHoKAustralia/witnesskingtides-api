'use strict';

var fs = require('fs');
var os = require('os');
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

function streamToFlickr(payloadData, user, res) {
  // save the photo data
  var api = flickr(
    config.get('FLICKR_KEY'),
    config.get('FLICKR_SECRET'),
    config.get('FLICKR_OAUTH_KEY'),
    config.get('FLICKR_OAUTH_SECRET')
  );

  var opts = {
    method: 'upload',
    title: payloadData.descr,
    description: '',
    is_public: 1,
    is_friend: 1,
    is_family: 1,
    hidden: 2,
    photo: fs.createReadStream(payloadData.fileName)
  };

  api(opts, function (err, data) {
    if (err) {
      res.json(500, 'Could not upload photo');
      return;
    }

    var new_photo_id = data.photoid[0];

    // todo work the photoset
    // api({
    //   method: 'flickr.photosets.addPhoto', // asdas
    //   photoset_id: '72157639784065264',
    //   photo_id: new_photo_id
    // }, function (err, data) {
    api({
      method: 'flickr.photos.getInfo',
      photo_id: new_photo_id
    }, function (err, data) {

      var photo = new Photo();
      photo.description = payloadData.descr;
      photo.submitted = new Date();
      photo.flickrId = new_photo_id;
      photo.latitude = payloadData.lat;
      photo.longitude = payloadData.lon;
      photo.flickrUrl = data.photo[0].urls[0].url[0]._;
      photo.user = user;
      photo.save();

      res.send(photo);
    });

    // });
    // }
  });
}

Uploader.prototype.handleJson = function (req, res) {
  var payload = req.body;
  var pathSeparator = '';
  if (os.tmpdir()[os.tmpdir().length - 1] !== '/') {
    pathSeparator = '/';
  }
  var tmpFilename = os.tmpdir() + pathSeparator + payload.fileId;
  var bitmap = new Buffer(payload.Photo, 'base64');
  fs.writeFileSync(tmpFilename, bitmap, 'utf8');

  var user = saveUser(payload.FirstName,
    payload.LastName,
    payload.Email);

  var photoData = {
    fileName: tmpFilename,
    descr: payload.Description,
    lat: payload.Latitude,
    lon: payload.Longitude
  }

  streamToFlickr(photoData, user, res);
}

Uploader.prototype.handleMultipart = function (req, res) {
  var form = new multiparty.Form();
  form.parse(req, function (err, fields, files) {
    if (err) {
      res.json(500, err);
      return;
    }

    // save the user
    var user = saveUser(fields.Email[0],
      fields.FirstName[0],
      fields.LastName[0]);

    var geoLocation = fields.PhotoLocation[0].split(' ');

    var photoData = {
      fileName: files.Photofile[0].path,
      descr: fields.Description[0],
      lat: geoLocation[1],
      lon: geoLocation[0]
    }

    streamToFlickr(photoData, user, res);
  });
}

module.exports = Uploader;