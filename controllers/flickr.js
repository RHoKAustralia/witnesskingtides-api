var Flickr = require('flickrapi');
var conf = require('../lib/config');

exports.flickrSearch = function (res, params) {
  // setup flickr proxy
  var FlickrOptions = {
    api_key: conf.get('FLICKR_KEY'),
    secret: conf.get('FLICKR_SECRET'),
    access_token: conf.get('FLICKR_OAUTH_KEY'),
    access_token_secret: conf.get('FLICKR_OAUTH_SECRET'),
    noAPI: true,
    nobrowser: true
  };

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
