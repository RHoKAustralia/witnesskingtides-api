'use strict'
var config = require('./../lib/config');
var Flickr = require("flickrapi"),
    FlickrOptions = {
      permissions: "write",
      api_key: config.get('FLICKR_KEY'),
      secret: config.get('FLICKR_SECRET'),
      user_id: config.get('FLICKR_USER_ID'),
      access_token: config.get('FLICKR_OAUTH_KEY'),
      access_token_secret: config.get('FLICKR_OAUTH_SECRET')      
    };

var TEST_DESC = 'test photo';
var TEST_FILE = './scripts/uploadphoto.jpg';

Flickr.authenticate(FlickrOptions, function(error, flickr) {
  var uploadOptions = {
    photos: [{
      title: TEST_DESC + "_flickrapi",
      photo: TEST_FILE
    }]
  };
 
  Flickr.upload(uploadOptions, FlickrOptions, function(err, result) {
    if(err) {
      return console.error(error);
    }
    console.log("photos uploaded", result);
  });
}); 