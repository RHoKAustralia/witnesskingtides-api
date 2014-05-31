'use strict';

var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var userSchema = new Schema({
  email: {
    type: String
  },
  firstName: {
    type: String
  },
  lastName: {
    type: String
  }
});

//registered on mongoose models
module.exports = mongoose.model('users', userSchema);