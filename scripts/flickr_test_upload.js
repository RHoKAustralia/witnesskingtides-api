'use strict'
var fs = require('fs');
var config = require('./../lib/config');
var flickr = require('flickr-with-uploads');

var TEST_DESC = 'test photo';
var TEST_FILE = './scripts/uploadphoto.jpg';


var api = flickr(
  config.get('FLICKR_KEY'),
  config.get('FLICKR_SECRET'),
  config.get('FLICKR_OAUTH_KEY'),
  config.get('FLICKR_OAUTH_SECRET')
);


var opts = {
  method: 'upload',
  title: TEST_DESC + "_testflicker-with-upload",
  description: TEST_DESC + "_testflicker-with-upload",
  photo: fs.createReadStream(TEST_FILE)
};

api(opts, function(err, data) {
  if (err) {
    console.error('Could not upload photo: ' + err);
    return;
  }
  console.info('Photo', data);
});