//Get an instance of mongoose and mongoose.Schema
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Set up a mongoose model and pass it using module.exports
module.exports = mongoose.model('User', new Schema({
  email: String,
  fb_id: Number,
  ionic_cloud_id: String,
  fb_full_name: String,
  admin: Boolean
}));
