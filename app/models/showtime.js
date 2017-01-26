//Get an instance of mongoose and mongoose.Schema
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var UserSchema = require("user_schema");

// Set up a mongoose model and pass it using module.exports
module.exports = mongoose.model('Showtime', new Schema({
  movie_title: String,
  movie_poster: String,
  movie_backdrop: String,
  movie_trailer: String,
  movie_synopsis: String,
  movie_realisator: String,
  movie_actors: [String],
  showtime_schedule: [Date],
  showtime_users: [{
    user: Schema.Type.ObjectId,
    ref: 'User',
    availability_showtime: Date
  }],
}))
