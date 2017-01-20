module.exports = function(app) {
  var express = require('express');
  var mongoose = require('mongoose');
  var bodyParser = require('body-parser');
  var jwt = require('jsonwebtoken');
  var config = require('./config');
  var User = require('./app/models/user');

  mongoose.connect(config.database);
  app.set('superSecret', config.secret);

  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());

  var apiRoutes = express.Router();

  var movies = require('./app/controllers/movies');
  var allocine = require('./app/controllers/allocine');
  var cinebuddy = require('./app/controllers/cinebuddy');

  //unauthenticate routes
  apiRoutes.use(function(req,res,next){
    res.contentType('application/json');

    next();
  });

  apiRoutes.post('/user', cinebuddy.createUser);

  apiRoutes.post('/authenticate', function(req, res) {
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

          var token = jwt.sign(user, app.get('superSecret'), {
            expiresIn : 60*60*24*90 //expires in 90days
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
  });

  apiRoutes.use(function(req,res,next){

    var token = req.body.token || req.query.token || req.headers['x-access-token'];

    if (token) {
      jwt.verify(token, app.get('superSecret'), function(err, decoded) {
        if (err) {
          console.log('Token invalid');
          return res.json({ success: false, message: 'Failed to authenticate token.'})
        } else {
          console.log('Token valid');
          req.decode = decoded;
          next();
        }
      })
    } else {
      return res.status(403).send({
        success: false,
        message: 'No token provided.'
      });
    }

  });

  //authenticate routes
  apiRoutes.get('/', function(req, res) {
    res.json('welcome to the coolest API on earth!!!');
  });
  apiRoutes.get('/movies', movies.findAll);
  apiRoutes.get('/movie/:id', movies.findById);
  apiRoutes.get('/showtime/', allocine.findShowTime);
  apiRoutes.get('/searchmovie/:id', allocine.findMovieById);
  apiRoutes.get('/theatercloseby/', allocine.theaterCloseBy);

  app.use('/api', apiRoutes);
}
