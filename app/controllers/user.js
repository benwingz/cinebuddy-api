var mongoose = require('mongoose');
var config = require('../../config');
var jwt = require('jsonwebtoken');

var User = require('../models/user');

exports.authenticate = function(req, res) {
  if (req.body.token) {
    var token = req.body.token;
    jwt.verify(token, config.secret, function(err, decoded) {
      if (err) {
        console.log('Token invalid');
        return res.json({ success: false, message: 'Failed to authenticate token.'})
      } else {
        var user = jwt.decode(token)._doc;
        var newtoken = jwt.sign(user, config.secret, {
          expiresIn : 60*60*24*15 //expires in 90days
        });

        res.json({
          success: true,
          message: 'loggin success',
          token: newtoken
        });
      }
    })
  } else {
    User.findOne({
      email: req.body.email
    }, function(err, user) {

      if (err) throw err;

      if (!user) {

        createUser(req, res);

      } else if (user) {

        if (user.ionic_cloud_id !== req.body.cloud_id && user.password !== req.body.password) {
          res.json({ success: false, message: 'The password is not matching'});
        } else {
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
  }
};

createUser = function(req, res) {
  if(req.body.email && req.body.username && req.body.password) {

    User.findOne({email: req.body.email}, function(err, user) {
      if (err) throw err;
      if (user) {
        res.json({ success: false, message: 'This email is already used'});
      } else {
        var newUser = new User({
          email: req.body.email,
          fb_full_name: req.body.username,
          password: req.body.password,
          admin: false
        })
        var token = jwt.sign(newUser, config.secret, {
          expiresIn : 60*60*24*15 //expires in 90days
        });

        newUser.save(function(err) {
          if(err) throw err;

          console.log('User created');
          res.json({ success: true, message: 'Account creation and loggin success', token: token});
        });
      }
    });

  } else if(!req.body.email || !req.body.cloud_id || !req.body.fb_full_name || !req.body.fb_id || !req.body.fb_profile_picture) {
    res.json({ success: false, message: "Missing parameters, user can't be created."});
  } else {
    User.findOne({email: req.body.email}, function(err, user) {
      if (err) throw err;
      if (user) {
        res.json({ success: false, message: 'This email is already used'});
      } else {
        var newUser = new User({
          email: req.body.email,
          fb_id: req.body.fb_id,
          ionic_cloud_id:req.body.cloud_id,
          fb_full_name: req.body.fb_full_name,
          fb_profile_picture: req.body.fb_full_name,
          admin: false
        })
        var token = jwt.sign(newUser, config.secret, {
          expiresIn : 60*60*24*15 //expires in 90days
        });

        newUser.save(function(err) {
          if(err) throw err;

          console.log('User created');
          res.json({ success: true, message: 'Account creation and loggin success', token: token});
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
