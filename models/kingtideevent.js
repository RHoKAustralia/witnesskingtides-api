var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var kingTideEventSchema = new Schema({
  location: {
    type: String
  },
  state: {
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
  },
});

//registered on mongoose models
module.exports = mongoose.model('kingtideevent', kingTideEventSchema);