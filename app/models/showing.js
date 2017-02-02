//Get an instance of mongoose and mongoose.Schema
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Set up a mongoose model and pass it using module.exports
module.exports = mongoose.model('Showing', new Schema({
  movie:{
    type: Schema.Types.ObjectId,
    ref:'Movie'
  },
  showtimes: [
    {
      date: Date,
      users: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
      }]
    }
  ]
}))
