var express = require('express');
var mongoose = require('mongoose');
var cors = require('cors');
var logger = require('morgan');
var bodyParser = require('body-parser');
var conf = require('./lib/config');

var routes = require('./routes/index');
var privateroutes = require('./routes/private');

var app = express();

mongoose.connect(conf.get('mongo:url'));

// app.use(cors());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());

app.use('/', routes);
app.use('/', privateroutes);

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