'use strict';

var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var photoSchema = new Schema({
  description: {
    type: String
  },
  submitted: {
    type: Date
  },
  flickrId: {
    type: String
  },
  flickrUrl: {
    type: String
  },
  latitude: {
    type: String
  },
  longitude: {
    type: String
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'users'
  }
});

//registered on mongoose models
module.exports = mongoose.model('photos', photoSchema);