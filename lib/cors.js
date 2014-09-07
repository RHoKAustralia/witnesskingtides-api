'use strict';

var cors = require('cors');
var conf = require('./config');

var corsWhitelist = conf.get('WKT_CORS_WHITELIST').split(',').map(function(val) {
  return val.replace(/\\/gi, '');
});

var corsOptions = {
  origin: function (origin, cb) {
    var originAllowed = corsWhitelist.indexOf(origin) !== -1;
    var errorMsg = originAllowed ? null : 'You are not allowed to execute this request.';
    cb(errorMsg, origin);
  }
};

module.exports = cors(corsOptions);
