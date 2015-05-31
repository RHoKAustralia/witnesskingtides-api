'use strict';

var express = require('express');
var router = express.Router();
var conf = require('../lib/config');
var cors = require('../lib/cors');

var requireController = function (name) {
  return require('../controllers/' + name);
};

var controllers = {
  tide_events: requireController('tide_events'),
  photos: requireController('photos'),
  flickr: requireController('flickr')
};

router.get('/tide_events', cors, function (req, res) {
  controllers.tide_events.getAllTideEvents(res);
});

router.get('/tide_events/future/:date?', cors, function (req, res) {
  var when = req.params.date || new Date;
  controllers.tide_events.getFutureTideEvents(res, when);
});

router.get('/tide_events/current', cors, function (req, res) {
  controllers.tide_events.getCurrentTideEvents(res);
});

router.get('/tide_events/:id', cors, function (req, res) {
  var tideId = req.params.id;
  controllers.tide_events.getTide(res, tideId);
});

router.get('/photos', cors, function (req, res) {
  var email = req.query.email;
  controllers.photos.getAllPhotos(res, email);
});

router.options('/photos', cors);

router.post('/photos', cors, function (req, res) {
  var contentType = req.get('Content-Type');
  controllers.photos.uploadPhoto(req, res, contentType);
});
router.get('/photos/deleted', cors, function (req, res) {
  var params = {};
  params = req.query;
  var cb = null;
  if(params.format && params.format == 'html'){
    cb = function(err, data){
      res.writeHead(200, { 'Content-Type': 'text/html' });   
      if(err)
        res.write("<h3>Error: "  + err.message + "</h3>");
      else
      {
        for(var i = 0; i < data.length; i++){
          var photo = data[i];
          if(photo.description)
            res.write("<b>" + photo.description + "</b>");
          res.write(" (" + (photo.submitted) + ")");
          res.write("<ul>");
          res.write("<li><a href='" + photo.flickrUrl + "' target='_blank'>View on Flickr</a></li>");
          res.write("<li><a href='/photos/undelete/" + photo.flickrId + "' target='_blank'>Undelete</a></li>");
          res.write("</ul>");
          res.write("<hr>");
        }
        res.end();
      }

    }
  }
  controllers.photos.getAllDeletedPhotos(res, params, cb);
});
router.get('/admin', function (req, res) {
  var params = {};
  params = req.query;

  var currPage = params.page || 1;
  var perPage = params.count || 100;
  var printNav = function(count,perPage, page, res){
    res.write("<p class='nav'>Page: ");
    for(var i = 1; i <= Math.ceil(count*1.0/perPage); i++)
    {      
      if(i == currPage)
        res.write("<a class='curr' href='/admin?page=" + i + "&count="+ perPage +"'>["+i+"]</a> ");
      else
        res.write("<a href='/admin?page=" + i + "&count="+ perPage +"'>"+i+"</a> ");
    }
    res.write("</p>");
  }
  controllers.photos.getPhotosCount(res, params, function(err, count){
    if(err){
      res.write("<h3>Error: "  + err.message + "</h3>");
      return;
    }
    controllers.photos.getPhotos(res, params, function(err, data){
      res.writeHead(200, { 'Content-Type': 'text/html' });   
      if(err)
        res.write("<h3>Error: "  + err.message + "</h3>");
      else
      {
        res.write("<H2>Admin</H2>");
        res.write("<style>" +
        " .nav { line-height: 2em; }" +
        " .nav a { padding: 5px; background-color: #ccc;}" + 
        " .nav a.curr { background-color: #eee;}" + 
        "</style>");
        printNav(count,perPage, currPage,res);
        for(var i = 0; i < data.length; i++){
          var photo = data[i];
          res.write("<div style='" + (photo.deleted ? "background-color: #fcc" : "") + "'>");
          if(photo.description)
            res.write("<b>" + photo.description + "</b>");
          res.write(" (" + (photo.submitted) + ")");
          if(photo.dateTaken)
            res.write("<div>Taken at : " + photo.dateTaken + "</div>");
          if(photo.latitude && photo.longitude){
            var latlng = photo.latitude + "," + photo.longitude;
            res.write("<div>Location: <a target='_blank' href='http://maps.google.com/maps?q="+latlng+"'>"+ latlng +"</a></div>");
          }
          res.write("<ul>");
          res.write("<li><a href='" + photo.flickrUrl + "' target='_blank'>View on Flickr</a></li>");
          if(photo.deleted)
            res.write("<li><a href='/photos/undelete/" + photo.flickrId + "' target='_blank'>Undelete</a></li>");
          else
            res.write("<li><a href='/photos/delete/" + photo.flickrId + "' target='_blank'>Delete</a></li>");
          res.write("</ul>");
          res.write("<hr>");
          res.write("</div>");
        }
        printNav(count,perPage, currPage,res);        
        res.end();
      }

    });
  });
});

// removed cors for 'admin' function
router.get('/photos/delete/:id', function (req, res) {
  var id = req.params.id;
  controllers.flickr.deleteIfDoesntExistOnFlickr(res, id);
});


// removed cors for 'admin' function
router.get('/photos/undelete/:id', function (req, res) {
  var id = req.params.id;
  controllers.photos.getPhotoByFlickrId(res, id, function(err,data){
    if(err){
      res.status(500).json('Photo doesn\'t exit in database');
      return;
    }
    console.log(data);
    if(!data.deleted){
      res.status(500).json('Photo already undeleted');
      return;
    }
    controllers.flickr.undeleteIfExistOnFlickr(res, id);  
  });  
});

router.get('/photos/search', cors, function (req, res) {
  console.log('local search');
  var params = {};
  if (req.query['min_taken_date']) {
    params.min_taken_date = req.query['min_taken_date'];
  }

  if (req.query['max_taken_date']) {
    params.max_taken_date = req.query['max_taken_date'];
  }

  if (req.query['bbox']) {
    params.bbox = req.query['bbox'];
  }
  controllers.photos.photoSearch(res, params);
});
router.get('/flickr/search', cors, function (req, res) {
  console.log('flickr search');
  var params = {
    api_key: conf.get('FLICKR_KEY'),
    user_id: conf.get('FLICKR_USER_ID'),
    extras: 'geo,url_s,url_c,url_o,date_taken,date_upload,owner_name,original_format,o_dims,views',
    per_page: req.query.per_page,
    page: req.query.page
  };
  // change to upload date to make consistent with api search
  if (req.query['min_taken_date']) {
    params.min_upload_date = req.query['min_taken_date']; 
  }

  if (req.query['max_taken_date']) {
    params.max_upload_date = req.query['max_taken_date'];
  }

  if (req.query['bbox']) {
    params.bbox = req.query['bbox'];
  }

  controllers.flickr.flickrSearch(res, params);
});
router.get('/flickr/:id', cors, function (req, res) {
  var id = req.params.id;
  controllers.flickr.getPhoto(res, id);
});

router.get('/photos/:id', cors, function (req, res) {
  var id = req.params.id;
  controllers.photos.getPhoto(res, id);
});

module.exports = router;
