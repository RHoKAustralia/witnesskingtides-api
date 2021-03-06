'use strict';

var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var conf = require('./lib/config');
var cors = require('./lib/cors');

var routes = require('./routes/index');
var docs = require('./routes/docs');
var privateroutes = require('./routes/private');
var healthcheckroutes = require('./routes/health');

var app = express();

mongoose.connect(conf.get('MONGO_URL'));

app.use(bodyParser.json({
  limit: '10mb'
}));

app.use(bodyParser.urlencoded({
  extended: false
}));
app.use('/', routes);
app.use('/', privateroutes);
app.use('/health', healthcheckroutes);
app.use('/docs', docs);

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
