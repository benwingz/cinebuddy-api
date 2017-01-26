//Get an instance of mongoose and mongoose.Schema
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Set up a mongoose model and pass it using module.exports
module.exports = mongoose.model('Movie', new Schema({
  adult: Boolean,
  backdrop_path: String,
  budget: Number,
  genres: [{id: Number, name: String}],
  id: Number,
  imdb_id: String,
  original_language: String,
  original_title: String,
  overview: String,
  popularity: Number,
  poster_path: String,
  production_companies: [{name: String, id: Number}],
  production_countries: [{iso_3166_1: String, name: String}],
  release_date: Date,
  revenue: Number,
  runtime: Number,
  status: String,
  tagline: String,
  title: String,
  vote_average: Number,
  vote_count: Number,
  idShowtimeProvider: Number
}));
