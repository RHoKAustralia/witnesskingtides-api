'use strict';

var nconf = require('nconf');

// configure nconf
nconf.env().file({
  file: 'config.json',
  dir: process.env[(process.platform === 'win32') ? 'USERPROFILE' : 'HOME'],
  search: true
});

module.exports = nconf;
