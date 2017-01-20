var config = require('../../config');
var request = require('request');
var mongoose = require('mongoose');

var User = require('./app/models/user');

exports.createUser = function(req, res) {
  if(!req.body.name || !req.body.email || req.body.password) {
    res.json({ success: false, message: "Missing parameters, user can't be created."});
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
    })
  }
};
