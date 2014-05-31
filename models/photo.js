var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var photoSchema = new Schema({
  idUser: {
    type: String
  },
  username: {
    type: String
  }
});

//registered on mongoose models
module.exports = mongoose.model('photo', photoSchema);