'use strict';

var express = require('express');
var mongoose = require('mongoose');
var winston = require('winston');
var expressWinston = require('express-winston');
var bodyParser = require('body-parser');
var conf = require('./lib/config');
var cors = require('cors');

var routes = require('./routes/index');
var docs = require('./routes/docs');
var privateroutes = require('./routes/private');
var healthcheckroutes = require('./routes/health');

var app = express();

mongoose.connect(conf.get('MONGO_URL'));

app.use(bodyParser.json({
  limit: '10mb'
}));

// var corsWhitelist = conf.get('WKT_CORS_WHITELIST').split(',').map(function(val) {
//   return val.replace(/\\/gi, '');
// });

// winston.info(corsWhitelist);

// var corsOptions = {
//   origin: function (origin, cb) {
//     var originAllowed = corsWhitelist.indexOf(origin) !== -1;
//     var errorMsg = originAllowed ? null : 'You are not allowed to execute this request.';
//     cb(errorMsg, { origin: originAllowed });
//     return origin;
//   }
// };

var corsOptions = { origin: conf.get('WKT_CORS_WHITELIST').replace(/\\/gi, '') };
app.options('*', cors(corsOptions));
app.use(cors(corsOptions));

app.use(bodyParser.urlencoded());
app.use('/', routes);
app.use('/', privateroutes);
app.use('/docs', docs);
app.use('/health', healthcheckroutes);

app.use(expressWinston.logger({
  transports: [
    new winston.transports.Console({
      json: true
    })
  ]
}));

/// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

/// error handlers
// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.json({
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.json({
    message: err.message,
    error: {}
  });
});

module.exports = app;