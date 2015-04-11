// transform output of exportFlickrMetadata into usable data to be imported into Mongo DB
//
// Usage:
// 	node transform_flickr_to_mongo.js > import.js
// 	mongoimport --db db --collection photos --file import.js
//
////////////////////////////
// To-do: check 
"use strict"

var fs = require('fs');

var photos = JSON.parse(fs.readFileSync('flickr_import.json', 'utf8'));
for(var i = 0; i < photos.length; i++){
	var photo = photos[i].photo;	
	if(!photo.dateuploaded) continue;
	photo.location = photo.location || {};
	photo.location.longitude = photo.location.longitude || "";
	photo.location.latitude = photo.location.latitude || "";
	var desc = (photo.description && photo.description._content ? photo.description._content 
		: (photo.title && photo.title._content ? photo.title._content : ""));

	// https://www.flickr.com/services/api/misc.dates.html
	// taken date is always passed around in MySQL 'datetime' format 
	// The date taken should always be displayed in the timezone of the photo owner
	// posted date is always passed around as a unix timestamp, which is an unsigned integer specifying the number of seconds since Jan 1st 1970 GMT.
	// All posted dates are passed around in GMT 
	var date = {"$date" : new Date(parseInt(photo.dateuploaded)*1000).toISOString()};

	var url = (photo.urls && photo.urls.url && photo.urls.url[0] ? photo.urls.url[0]._content : "");
	var data = { 
	"uploadStatus" : "COMPLETED"
	, "user" : {"$oid" : "000000000000000000000001"}
	, "longitude" : photo.location.longitude
	, "latitude" : photo.location.latitude
	, "submitted" : date
	, "description" : desc
	, "__v" : 0
	, "flickrId" : photo.id
	, "flickrUrl" : url
	};
	console.log(JSON.stringify(data));
}
/*

Mongo DB collection structure
=============================
{ 
	"_id" : ObjectId("5529360fe6723e9a10f1c499")
	, "uploadStatus" : "COMPLETED"
	, "user" : ObjectId("5529360fe6723e9a10f1c498")
	, "longitude" : "139.20049490101823"
	, "latitude" : "-25.131107273378703"
	, "submitted" : ISODate("2015-04-11T14:56:15.383Z")
	, "description" : ""
	, "__v" : 0
	, "flickrId" : "16487262944"
	, "flickrUrl" : "https://www.flickr.com/photos/88684009@N00/16487262944/" 
}

Mapping
=======
{ 
	"uploadStatus" : "COMPLETED"
	, "user" : id of RHoK account // ObjectId("00000000001")
	, "longitude" : photo.location.longitude
	, "latitude" : photo.location.latitude
	, "submitted" : photo.dates.taken // ISODate("2015-04-11T14:56:15.383Z")
	, "description" : photo.description._content
	, "__v" : 0
	, "flickrId" : photo.id
	, "flickrUrl" : photo.urls.url[0]._content 
}

Other Fields
------------
Title vs Description
	photo.title._content
	photo.description._content
Uploaded vs Taken
	photo.dateuploaded
	photo.dates.taken


Flicker Output
==============
{
  "photo": {
    "id": "14644234613",
    "secret": "6c48e87f25",
    "server": "3837",
    "farm": 4,
    "dateuploaded": "1405042856",
    "isfavorite": 0,
    "license": "1",
    "safety_level": "0",
    "rotation": 0,
    "originalsecret": "283037c53c",
    "originalformat": "jpg",
    "owner": {
      "nsid": "69841693@N07",
      "username": "Witness King Tides",
      "realname": "Witness King Tides",
      "location": "",
      "iconserver": "2929",
      "iconfarm": 3,
      "path_alias": "witnesskingtides"
    },
    "title": {
      "_content": "Henley Beach Storm Damage done on the 27, 28, 29 June 2014"
    },
    "description": {
      "_content": "Fernando M. Gonçalves photo 5, 30/06/2014 04:50 PM"
    },
    "visibility": {
      "ispublic": 1,
      "isfriend": 0,
      "isfamily": 0
    },
    "dates": {
      "posted": "1405042856",
      "taken": "2014-06-30 16:47:57",
      "takengranularity": "0",
      "takenunknown": 0,
      "lastupdate": "1405312190"
    },
    "views": "795",
    "editability": {
      "cancomment": 0,
      "canaddmeta": 0
    },
    "publiceditability": {
      "cancomment": 0,
      "canaddmeta": 0
    },
    "usage": {
      "candownload": 1,
      "canblog": 0,
      "canprint": 0,
      "canshare": 1
    },
    "comments": {
      "_content": "0"
    },
    "notes": {
      "note": []
    },
    "people": {
      "haspeople": 0
    },
    "tags": {
      "tag": [
        {
          "id": "69820363-14644234613-141192",
          "author": "69841693@N07",
          "authorname": "Witness King Tides",
          "raw": "Henley Beach",
          "_content": "henleybeach",
          "machine_tag": 0
        },
        {
          "id": "69820363-14644234613-210027333",
          "author": "69841693@N07",
          "authorname": "Witness King Tides",
          "raw": "Fernando M. Gonçalves",
          "_content": "fernandomgonçalves",
          "machine_tag": 0
        },
        {
          "id": "69820363-14644234613-80613993",
          "author": "69841693@N07",
          "authorname": "Witness King Tides",
          "raw": "Witness King Tides",
          "_content": "witnesskingtides",
          "machine_tag": false
        },
        {
          "id": "69820363-14644234613-57150389",
          "author": "69841693@N07",
          "authorname": "Witness King Tides",
          "raw": "king tides",
          "_content": "kingtides",
          "machine_tag": false
        }
      ]
    },
    "location": {
      "latitude": "-34.920830",
      "longitude": "138.494768",
      "accuracy": "16",
      "context": "0",
      "neighbourhood": {
        "_content": "Henley Beach",
        "place_id": "MUNxvh5TUL1344u_2g",
        "woeid": "22721696"
      },
      "locality": {
        "_content": "Adelaide",
        "place_id": "xTgz9S9QUrMLZbpQ",
        "woeid": "1099805"
      },
      "region": {
        "_content": "South Australia",
        "place_id": "LhgspDxTUb5OpVLW",
        "woeid": "2344703"
      },
      "country": {
        "_content": "Australia",
        "place_id": "3fHNxEZTUb4mc08chA",
        "woeid": "23424748"
      },
      "place_id": "MUNxvh5TUL1344u_2g",
      "woeid": "22721696"
    },
    "geoperms": {
      "ispublic": 1,
      "iscontact": 0,
      "isfriend": 0,
      "isfamily": 0
    },
    "urls": {
      "url": [
        {
          "type": "photopage",
          "_content": "https://www.flickr.com/photos/witnesskingtides/14644234613/"
        }
      ]
    },
    "media": "photo"
  },
  "stat": "ok"
}

*/