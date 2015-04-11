[![Build Status](https://travis-ci.org/rhok-melbourne/kingtides-api.svg?branch=master)](https://travis-ci.org/rhok-melbourne/kingtides-api)
[![Code Climate](https://codeclimate.com/github/rhok-melbourne/kingtides-api.png)](https://codeclimate.com/github/rhok-melbourne/kingtides-api)

kingtides-api
=============

API for Wave Witness King Tides

[![NPM](https://nodei.co/npm/kingtides-api.png)](https://nodei.co/npm/kingtides-api/)

Setup
----
Create a file named `config.json` and add the following content:

    {
	  "MONGO_URL": "mongodb://user:pwd@localhost:27017/db",
	  "FLICKR_KEY": "flickr_api_key",
	  "FLICKR_SECRET": "flickr_shared_secret",
	  "FLICKR_USER_ID":"",
	  "FLICKR_OAUTH_KEY":"",
	  "FLICKR_OAUTH_SECRET":"",
	  "WKT_CORS_WHITELIST": "http://localhost"
    }

Install dependencies

    npm install

Authorize Flickr
----
To get values FLICKR_USER_ID / FLICKR_OAUTH_KEY / FLICKR_OAUTH_SECRET

	node scripts/flickr_auth.js

Follow instructions and update config.json based on output

Test Flickr Upload
-----
After updating FLICKR_USER_ID / FLICKR_OAUTH_KEY / FLICKR_OAUTH_SECRET, run this to ensure upload process works

	node scripts/flickr_test_upload.js


Seed Tide data
-----

	cd other
	ruby seed_tides.rb


