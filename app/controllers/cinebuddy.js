var config = require('../../config');
var request = require('request');
var mongoose = require('mongoose');

var User = require('../models/user');
var Showing = require('../models/showing');

exports.createUser = function(req, res) {
  if(!req.body.name || !req.body.password || !req.body.email) {
    res.json({ success: false, message: "Missing parameters, user can't be created."});
  } else {
    User.findOne({req.body.email}, function(err, user) {
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

/*exports.createShowing = function(req, res) {
  console.log(req.body);
  var newShowing = new Showing(req.body);

  newShowing.save(function(err) {
    if (err) throw err;

    console.log('New Showing created');
    res.json({ success: true, message: 'Showing have been successfully created'})
  });
};*/
