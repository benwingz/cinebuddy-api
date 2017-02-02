var mongoose = require('mongoose');

var Showing = require('../models/showing');

exports.createShowing = function(req, res) {
  if (!req.body.movieid || !req.body.userid || !req.body.availability) {
    res.json({ success: false, message: "Missing parameters, showing can't be created."});
  } else {
    var newShowing = new Showing({
      movie: req.body.movieid,
      showtimes: []
    });

    var availability = req.body.availability.split(',');
    for (var i = 0; i < availability.length; i ++) {
      newShowing.showtimes.push({
        date: availability[i],
        users: [req.body.userid]
      })
    };

    console.log('newShowing:', newShowing);

    newShowing.save(function(err) {
      if (err) throw err;

      console.log('New Showing created');
      res.json({ success: true, message: 'Showing have been successfully created'})
    });
  }
};

exports.getShowing = function(req, res) {
  if (!req.params.id) {
    res.json({ success: false, message: "Missing parameters, showing can't be retrived."});
  } else {
    Showing.findOne({_id: req.params.id}).populate('movie').populate('showtimes.users').exec(function(err, showing) {
      if (err) throw err;
      if (!showing) {
        res.json({ success: false, message: "No result for this id."});
      } else {
        res.json(showing);
      }
    });
  }
}
