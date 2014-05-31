'use strict';

var nconf = require('nconf');

// configure nconf
nconf.env().file({
  file: 'config.json'
});

module.exports = nconf;