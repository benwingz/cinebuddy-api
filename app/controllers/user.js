var mongoose = require('mongoose');
var config = require('../../config');
var jwt = require('jsonwebtoken');

var User = require('../models/user');

exports.authenticate = function(req, res) {
  User.findOne({
    email: req.body.email
  }, function(err, user) {

    if (err) throw err;

    if (!user) {

      res.json({ success: false, message: 'Authentication failed. User not found.'});

    } else if (user) {

      if (user.password != req.body.password) {
        res.json({ success: false, message: 'Authentication failed. Wrong password'});
      } else {
        user.token = '';
        var token = jwt.sign(user, config.secret, {
          expiresIn : 60*60*24*15 //expires in 90days
        });

        user.token = token;

        user.save(function(err) {
          if (err) throw err;
        });

        res.json({
          success: true,
          message: 'loggin success',
          token: token
        });
      }

    }

  });
};

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
  var token = req.body.token || req.query.token || req.headers['x-access-token'] || req.headers['authorization'];

  if( token && token.indexOf('Bearer ') !== -1) {
    token = token.replace('Bearer ', '');
  }
  if(token) {
    var decoded = jwt.decode(token);
    User.findOne({_id: decoded._doc._id}, function(err, user) {
      if (err) throw err;
      if (!user) {
        res.json({ success: false, message: 'No user relative to this token'});
      } else {
        var userResponse = user;
        delete userResponse.token;
        delete userResponse.password;
        res.json(userResponse);
      }
    });
  }
};
