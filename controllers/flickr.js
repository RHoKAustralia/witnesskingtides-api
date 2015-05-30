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
exports.getPhoto = function (res, id, undelete) {
  var params = {
    photo_id: id
  }
  console.log('getphoto');
  Flickr.authenticate(FlickrOptions, function (error, flickr) {
    flickr.photos.getInfo(params, function (err, result) {
      if (err) {
        // TODO: is there a better way to check this?
        if(err.message && err.message.match(/not found/) && err.message.match(/invalid ID/)) 
        {
          console.log('photo doesn\'t exist. marking as deleted', err);
          if(undelete)
            res.status(500).json('Photo doesn\'t exist on flickr');
          else
            Photo.toggleDelete(res, {flickrId: id});
        }
        else{
          res.status(500).json('Error retrieving photo');
        }
        return;
      }
      if(undelete){
        Photo.toggleDelete(res, {flickrId: id}, true);
        return;
      }
      console.log(result);
      res.json(result);
    });
  });
};
