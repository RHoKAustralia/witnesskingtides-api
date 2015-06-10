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
  if(photoData.dateTaken && !isNaN(Date.parse(photoData.dateTaken)))
    photo.dateTaken = new Date(photoData.dateTaken);
  photo.save();
  return photo._id;
}
function getFlickrAPI(){
  return flickr(
    config.get('FLICKR_KEY'),
    config.get('FLICKR_SECRET'),
    config.get('FLICKR_OAUTH_KEY'),
    config.get('FLICKR_OAUTH_SECRET')
  );
}
function streamListToFlickr(photoIdList, payloadDataList, index, callback) {
  streamToFlickr(photoIdList[index], payloadDataList[index], function(err, data){
    if(err) {
      callback (err);
      return;
    }
    if(index < photoIdList.length - 1) {
      streamListToFlickr(photoIdList, payloadDataList, index+1, function(err,data2){
        if(err) {
          callback(err);
          return;
        }
        if(Array.isArray(data2)) data2.push(data)
        else data2 = [data2,data];
        callback(null, data2);
      });
    }
    else{
      callback(null, data);
    }
  });
}
function streamToFlickr(photoId, payloadData, callback) {
  // save the photo data
  var api = getFlickrAPI();
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
    //console.log('uploaded to flickr', data);
    var new_photo_id = data.photoid[0];
    console.info('Photo ID:' + new_photo_id);

    // api call to save photo info
    // onto the mongo datastore
    api({
      method: 'flickr.photos.getInfo',
      photo_id: new_photo_id
    }, function(err, data) {
      console.log('photo info', JSON.stringify(data));
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
        photo.flickrUrl =  "https://farm{farm-id}.staticflickr.com/{server-id}/{id}_{secret}.jpg"
          .replace("{farm-id}", data.photo[0]['$'].farm)
          .replace("{server-id}", data.photo[0]['$'].server)
          .replace("{id}", data.photo[0]['$'].id)
          .replace("{secret}", data.photo[0]['$'].secret);

        photo.uploadStatus = 'COMPLETED';
        photo.save();

        console.info('Photo metadata successfully saved');
        checkSetGeoLocation(photo, payloadData, function(err,data){
          if(data) console.log(data);
          checkSetDate(photo, function(err, data){
              if (err) {
                console.error('Could not set Date Taken.');
                if(callback) callback(err);
                return;
              }
              if(callback) callback(null, photo);
          })
        })
      });
    });
  });
}

function checkSetGeoLocation(photo, payloadData, callback)
{
  if(payloadData.lat && payloadData.lon)
  {
    var api = getFlickrAPI();
    api({
      method: 'flickr.photos.geo.setLocation',
      photo_id: photo.flickrId,
      lat: payloadData.lat,
      lon: payloadData.lon,
      context: 2
    }, function(err, res) {
      if (err) {
        console.error('Could not set geolocation');
        if(callback) callback(err);
        return;
      }
      if(callback) callback(null, "Geolocation saved")
    });
  }
  else if(callback) callback(null, "No Geolocation info");
}
function checkSetDate(photo, callback)
{
  var api = getFlickrAPI();
  if(photo.dateTaken && !(isNaN(Date.parse(photo.dateTaken))))
  {
    console.log(photo.dateTaken);
    var d = new Date(photo.dateTaken);
    var dateTaken = d.getFullYear() + "-" +  (d.getMonth()+1 < 10 ? "0" :"") +(d.getMonth()+1) +  "-" + (d.getDate() < 10 ? "0" :"") + d.getDate() +
    " " + (d.getHours() < 10 ? "0" : "") + d.getHours() + ":" +  (d.getMinutes() < 10 ? "0" :"") +(d.getMinutes() + ":00");
    console.log("Set date taken to " + dateTaken);

    api({
      method: 'flickr.photos.setDates',
      photo_id: photo.flickrId,
      date_taken: dateTaken
    }, function(err, res) {
      if (err) {
        console.error('Could not set Date Taken.');
        callback(err);
        return;
      }
      callback(null, photo);
    });

  }
  else{
    callback(null, photo);
  }

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
  if(payload.CreationDate && !(isNaN(Date.parse(payload.CreationDate))))
    photoData.dateTaken = payload.CreationDate;

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

    var photoDataList = [];
    var photoIdList = [];

    for(var i = 0; i < files.Photofile.length; i++){
      var photoData = {
        fileName: files.Photofile[i].path,
        descr: fields.Description[0] || '',
        lat: geoLocation[1],
        lon: geoLocation[0],
        user: user
      }
      if(fields.CreationDate && !(isNaN(Date.parse(fields.CreationDate[0]))))
        photoData.dateTaken = fields.CreationDate[0];

      var photoId = savePhoto(photoData);
      photoDataList.push(photoData);
      photoIdList.push(photoId);
    }


    streamListToFlickr(photoIdList, photoDataList, 0, function(err, photos){
      if (err) {
        res.json(500, err);
        return;
      }
      res.json({
        'photos': photos
      });
    });
  });
}

module.exports = Uploader;
