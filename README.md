[![Build Status](https://travis-ci.org/rhok-melbourne/kingtides-api.svg?branch=master)](https://travis-ci.org/rhok-melbourne/kingtides-api)
[![Code Climate](https://codeclimate.com/github/rhok-melbourne/kingtides-api.png)](https://codeclimate.com/github/rhok-melbourne/kingtides-api)

kingtides-api
=============

API for Wave Witness King Tides

[![NPM](https://nodei.co/npm/kingtides-api.png)](https://nodei.co/npm/kingtides-api/)

Setup
-----

1. Create a file named `config.json` and add the following content (FLICKR_OAUTH_KEY and FLICKR_OAUTH_SECRET intentionally left blank for initial creation):

        {
            "MONGO_URL": "mongodb://user:pwd@localhost:27017/db",
            "FLICKR_KEY": "flickr_api_key",
            "FLICKR_SECRET": "flickr_shared_secret",
            "FLICKR_USER_ID":"witnesskingtides",
            "FLICKR_OAUTH_KEY":"",
            "FLICKR_OAUTH_SECRET":"",
            "WKT_CORS_WHITELIST": "http://localhost,https://localhost:5000"
        }

2. Install dependencies

        npm install

3. Fill in FLICKR_USER_ID with your Flickr web address (this is used for the photo search)

        https://www.flickr.com/photos/FLICKR_USER_ID

   Create / Find your Flickr web address via
    
        https://www.flickr.com/account

   Alternatively you can use the unique ID in Step 5 below when authorizing Flickr

4. Fill in FLICKR_KEY and FLICKR_SECRET

   Find/Create existing keys at
   
       https://www.flickr.com/services/apps/


5. Authorize Flickr to get FLICKR_OAUTH_KEY and FLICKR_OAUTH_SECRET (this is used for the photo upload)

       node scripts/flickr_auth.js

    Follow instructions and update config.json based on output.
    
    Note: this will create a private photo in your Flickr Camera Roll. Delete it if necessary.

6. Configure WKT_CORS_WHITELIST with the URL where you front end is coming from. Comma separate URLs. Specify ports if necesasry. 
   
   Sample code for front end:

       https://github.com/rhok-melbourne/witnesskingtides-web/

7. Run server

       npm start

    or

       nodejs bin/www


Test Flickr Upload
------------------
After updating Flickr config run this to ensure upload process works

    node scripts/flickr_test_upload.js


Seed Tide data
--------------
If there is no data at all, use this to get started

    cd other
    ruby seed_tides.rb