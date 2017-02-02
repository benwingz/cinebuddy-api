var config = require('../../config');
var request = require('request');
var mongoose = require('mongoose');

var User = require('../models/user');
var Showing = require('../models/showing');

exports.createUser = function(req, res) {
  if(!req.body.name || !req.body.password || !req.body.email) {
    res.json({ success: false, message: "Missing parameters, user can't be created."});
  } else {
    User.findOne({email: req.body.email}, function(err, user) {
      if (err) throw err;
      if (user) {
        res.json({ success: false, message: 'This email is already used'});
      } else {
        var newUser = new User({
          name: req.body.name,
          password: req.body.password,
          email: req.body.email,
        })

        newUser.save(function(err) {
          if(err) throw err;

          console.log('User created');
          res.json({ success: true, message: 'User have been successfully created'});
        });
      }
    });
  }
};

exports.findUser = function(req, res) {
  var token = req.body.token || req.query.token || req.headers['x-access-token'];

  if(token) {
    User.findOne({token: token}, function(err, user) {
      if (err) throw err;
      if (!user) {
        res.json({ success: false, message: 'No user relative to this token'});
      } else {
        res.json(user);
      }
    });
  }
};

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
