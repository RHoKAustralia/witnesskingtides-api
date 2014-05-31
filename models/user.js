var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var userSchema = new Schema({
  idUser: {
    type: String
  },
  username: {
    type: String
  }
});

//registered on mongoose models
module.exports = mongoose.model('user', userSchema);