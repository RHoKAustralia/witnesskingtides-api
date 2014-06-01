'use strict';

var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var kingTideEventSchema = new Schema({
  location: {
    type: String
  },
  state: {
    type: String
  },
  description: {
    type: String
  },
  highTideOccurs: {
    type: Date
  },
  eventStart: {
    type: Date
  },
  eventEnd: {
    type: Date
  },
  latitude: {
    type: Number
  },
  longitude: {
    type: Number
  }
});

// kingTideEventSchema.methods.toJSON = function () {
//   obj = this.toObject();
//   delete obj._id;
//   delete obj.__v;
//   return obj;
// };

//registered on mongoose models
module.exports = mongoose.model('kingtideevent', kingTideEventSchema);