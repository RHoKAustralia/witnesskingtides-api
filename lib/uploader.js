'use strict';

var fs = require('fs');
var config = require('./../lib/config');
var flickr = require('flickr-with-uploads');
var multiparty = require('multiparty');
var User = require('./../models/user');
var Photo = require('./../models/photo');

function Uploader() {}

Uploader.prototype.go = function (req, res) {
  var form = new multiparty.Form();
  form.parse(req, function (err, fields, files) {
    if (err) {
      res.json(500, err);
    }

    // save the user
    var user = new User();
    user.email = fields.Email[0];
    user.firstName = fields.FirstName[0];
    user.lastName = fields.LastName[0];
    user.save();

    // save the photo data
    var api = flickr(
      config.get('FLICKR_KEY'),
      config.get('FLICKR_SECRET'),
      config.get('FLICKR_OAUTH_KEY'),
      config.get('FLICKR_OAUTH_SECRET')
    );

    api({
      method: 'upload',
      title: 'My new pet: baby orca',
      description: fields.Description[0],
      is_public: 1,
      is_friend: 1,
      is_family: 1,
      hidden: 2,
      photo: fs.createReadStream(files.Photofile[0].path)
    }, function (err, response) {
      if (err) {
        console.error('Could not upload photo:', err);
      } else {
        var new_photo_id = response.photoid[0];

        // todo work the photoset
        api({
          method: 'flickr.photosets.addPhoto', // asdas
          photoset_id: '72157639784065264',
          photo_id: new_photo_id
        }, function (err, response) {
          api({
            method: 'flickr.photos.getInfo',
            photo_id: new_photo_id
          }, function (err, response) {

            var photo = new Photo();
            photo.email = fields.Description[0];
            photo.submitted = new Date();
            photo.flickrId = new_photo_id;
            photo.flickrUrl = response.photo[0].urls[0].url[0]._;
            photo.user = user;
            photo.save();

            res.json();
          });

        });
      }
    });
  });

}

module.exports = Uploader;