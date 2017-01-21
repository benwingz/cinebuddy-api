//Get an instance of mongoose and mongoose.Schema
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Set up a mongoose model and pass it using module.exports
module.exports = mongoose.model('Matchid', new Schema({
  idMovieDb: Number,
  idShowtimeProvider: Number
}))
