var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var kingTideEventSchema = new Schema({
  idUser: {
    type: String
  },
  username: {
    type: String
  }
});

//registered on mongoose models
module.exports = mongoose.model('kingtideevent', kingTideEventSchema);