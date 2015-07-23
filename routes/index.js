'use strict';

var express = require('express');
var router = express.Router();
var conf = require('../lib/config');
var cors = require('../lib/cors');
var base58 = require('../lib/base58');

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
router.get('/admin/photos/:page', cors, function (req, res) {
  var pageNo = req.params.page ? parseInt(req.params.page) : 1;
  if(isNaN(pageNo) || pageNo < 1) pageNo = 1;
  var params = {};
  params = req.query;
  params.page = pageNo || 1;
  var currPage = params.page;
  var perPage = params.count || 100;
  params.search = {'$or': [{deleted: {$eq: null}}, {deleted: false}]};
  var queryString = '';
  if(params.deleted){
    params.search = {deleted: true};
  }
  console.log(params);
  controllers.photos.getPhotosCount(res, params, function(err, count){
    if (err) {
      if(cb) cb(err);
      res.json(500, err);
      return;
    }
    controllers.photos.getPhotos(res, params, function(err, data){
      if (err) {
        if(cb) cb(err);
        res.json(500, err);
        return;
      }

      res.json({
        page: currPage,
        pages: Math.ceil(count / perPage),
        perpage: perPage,
        photo: data,
        total: count
      });
    });
  });
});
router.get('/admin', function (req, res) {
  var params = {};
  params = req.query;

  var currPage = params.page || 1;
  var perPage = params.count || 100;
  params.search = {'$or': [{deleted: {$eq: null}}, {deleted: false}]};
  var queryString = '';
  if(params.deleted){
    queryString = "&deleted=1";
    params.search = {deleted: true};
  }

  var printNav = function(count,perPage,page,queryString,res){
    res.write("<p class='nav'>Page: ");
    for(var i = 1; i <= Math.ceil(count*1.0/perPage); i++)
    {      
      if(i == currPage)
        res.write("<a class='curr' href='/admin?page=" + i + "&count="+ perPage +"&" + queryString +"'>["+i+"]</a> ");
      else
        res.write("<a href='/admin?page=" + i + "&count="+ perPage +"&" + queryString +"'>"+i+"</a> ");
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
        " .row img { float: left; padding-top: 10px; } " + 
        " .row > div { margin-left: 90px; } " + 
        " .row { padding-top: 5px; border-bottom: 1px solid black; } " + 
        " .deleted { background-color: #fcc; } " +
        " .warning { background-color: #fcc; } " +
        " .uploading { background-color: #cfc; } " +
        "</style>");
        if(params.deleted)
          res.write("<a href='/admin?'>Show approved</a>");
        else
          res.write("<a href='/admin?deleted=1'>Show deleted</a>");
        printNav(count,perPage,currPage,queryString,res);
        for(var i = 0; i < data.length; i++){

          var photo = data[i];
          res.write("<div class='row' style='" + (photo.deleted ? "background-color: #fcc" : "") + "'>");
          res.write("<img src='" + (photo.flickrUrl ? photo.flickrUrl.replace(".jpg", "_s.jpg") : '') + "'>");
          res.write("<div>");
          if(photo.description)
            res.write("<b>" + photo.description + "</b>");
          res.write(" (" + (photo.submitted) + ")");
          if(photo.dateTaken)
            res.write("<div>Taken at : " + photo.dateTaken + "</div>");
          if(photo.latitude && photo.longitude){
            var latlng = photo.latitude + "," + photo.longitude;
            res.write("<div>Location: <a target='_blank' href='http://maps.google.com/maps?q="+latlng+"'>"+ latlng.replace(",", ", ") +"</a></div>");
          }
          res.write("<ul>");
          var url_id = '';
          var id = photo.id;
          var suffix = '';
          if(photo.flickrId){
            id = photo.flickrId;
            suffix = 'Fid';
          }

          try{
            url_id = base58.encode(parseInt(photo.flickrId));
          }
          catch(err){
          }
          if(photo.flickrId){
            res.write("<li><a href='https://flic.kr/p/" + url_id + "' target='_blank'>View on Flickr</a></li>");
            res.write("<li><a href='/photos/update" + suffix +'/' + id + "' target='_blank'>Update</a></li>");
          }
          else
            res.write("<li class='warning'>No flickr photo associated. Still uploading?</li>");
          if(photo.deleted){
            if(photo.flickrId)
              res.write("<li><a href='/photos/undelete" + suffix + "/" + id + "' target='_blank'>Undelete</a></li>");
            else
              res.write("<li>No Flickr Image associated. Cannot undelete</li>");
          }
          else
            res.write("<li><a href='/photos/delete"+ suffix + "/" + id + "' target='_blank'>Delete</a></li>");
          res.write("</ul>");
          res.write("</div>");
          res.write("</div>");
        }
        printNav(count,perPage,currPage,queryString,res);        
        res.end();
      }

    });
  });
});

// removed cors for 'admin' function
router.get('/photos/delete/:id', function (req, res) {
  var id = req.params.id;
  controllers.photos.getPhoto(res, id, function(err,data){
    if(err){
      res.status(500).json('Photo doesn\'t exist in database');
      return;
    }
    if(data.flickrId){
      res.status(500).json('Photo hasn\'t uploaded to flickr');
      return;
    }
    controllers.photos.toggleDelete(res, {flickrId: data.flickrId});
  });
});

// removed cors for 'admin' function
router.get('/photos/deleteFid/:flickrId', function (req, res) {
  var id = req.params.flickrId;
  controllers.flickr.deleteIfDoesntExistOnFlickr(res, id);
});
router.get('/photos/updateFid/:flickrId', function (req, res) {
  var id = req.params.flickrId;
  controllers.flickr.updatePhoto(res, id);
});

// removed cors for 'admin' function
router.get('/photos/undeleteFid/:flickrId', function (req, res) {
  var id = req.params.flickrId;
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
  controllers.photos.search(res, req);
});
router.get('/photos/paginatedSearch', cors, function (req, res) {
  controllers.photos.paginatedSearch(res, req);
});

router.get('/photos/clusters', cors, function (req, res) {
  controllers.photos.clusters(res, req);
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
