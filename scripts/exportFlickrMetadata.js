// Export Existing Flickr MetaData
"use strict"

var config = require('../lib/config');

console.error("Key: " + config.get('FLICKR_KEY'));
console.error("Secret: " + config.get('FLICKR_SECRET'));

var Flickr = require("flickrapi"),
    flickrOptions = {
      api_key: config.get('FLICKR_KEY'),
      secret: config.get('FLICKR_SECRET')
    },
    flickrApi = undefined;


// Get a token and kick off the recursion
Flickr.tokenOnly(flickrOptions, function(error, flickr) {
	if (error) { throw new Error(error) }
	flickrApi = flickr;
	console.log("[");
	getPageOfFlickrPhotosFromUser(1, config.get("FLICKR_USER_ID"));
});

// get one page and when you are done, get another
function getPageOfFlickrPhotosFromUser(page, user) {
	flickrApi.people.getPhotos(
		{
			user_id: user,
			page: page,
			per_page: 10
	  	},
	  	function(err, result) {
	  		if(err) { console.error("Error on page " + page) ; throw new Error(err); }
	  				
	  		console.error("Processing page " + result.photos.page + "/" + result.photos.pages + " of " + result.photos.total);
	  		var total_pages = result.photos.pages;

	  		var photos = result.photos.photo;
			if (page <= total_pages) {
	  				for (var photo in photos) {						
						getFlickrPhotoInfo(photos[photo].id);
					}

	  				getPageOfFlickrPhotosFromUser(++page, user);
	  		} else {
				console.log("{\"photo\":\"\"}]");

	  			console.error("Done!");
	  		}
	  	}
	)
}

function getFlickrPhotoInfo(id) {
	console.error("getting info for photo id: " + id);
	flickrApi.photos.getInfo( {photo_id: id}, function (err, result) {
		console.log(JSON.stringify(result) + ",");
	});
}
