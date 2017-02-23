module.exports = function(app) {
  var express = require('express');
  var mongoose = require('mongoose');
  var bodyParser = require('body-parser');
  var config = require('./config');
  var User = require('./app/models/user');
  var jwt = require('jsonwebtoken');

  mongoose.connect(config.database);
  app.set('superSecret', config.secret);

  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());

  var apiRoutes = express.Router();

  var movies = require('./app/controllers/movies');
  var allocine = require('./app/controllers/showtime');
  var cinebuddy = require('./app/controllers/cinebuddy');
  var user = require('./app/controllers/user');

  //unauthenticate routes
  apiRoutes.use(function(req,res,next){
    res.contentType('application/json');

    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Access-Control-Allow-Origin');

    console.log(req.method);
    // intercept OPTIONS method
    if ('OPTIONS' == req.method) {
      res.send(200);
    }
    else {
      next();
    }
  });
  apiRoutes.get('/', function(req, res) {
    res.json('welcome to the coolest cinema API on earth!!!');
  });
  apiRoutes.post('/user', user.createUser);

  apiRoutes.post('/authenticate', user.authenticate);

  apiRoutes.use(function(req,res,next){

    var token = req.body.token || req.query.token || req.headers['x-access-token'] || req.headers['authorization'];

    if( token.indexOf('Bearer ') !== -1) {
      token = token.replace('Bearer ', '');
    }
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
  apiRoutes.get('/me', user.findUser);
  apiRoutes.get('/movies', movies.findAll);
  apiRoutes.get('/movie/:id', movies.findById);
  apiRoutes.get('/showtime/', allocine.findShowTime);
  apiRoutes.get('/searchmovie/:id', allocine.findMovieById);
  apiRoutes.get('/theatercloseby/', allocine.theaterCloseBy);
  apiRoutes.post('/showing/', cinebuddy.createShowing);
  apiRoutes.get('/showing/:id', cinebuddy.getShowing);

  app.use('/api', apiRoutes);
}
