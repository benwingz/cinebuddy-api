var config = require('../../config');
var request = require('request');
var allocine = require('./showtime');
var Movie = require('../models/movie');
var apiKeyMovieDB = config.apiKeyMovieDB;
var movieApiBaseUrl = config.movieApiBaseUrl;
var imagesbaseurl, backdropsize, postersize;

var populateImagesUrl = function(content) {
  var movies = content;
  for (var i = 0; i < movies.length; i++) {
    if(movies[i].backdrop_path){
      movies[i].backdrop_path = imagesbaseurl + backdropsize + movies[i].backdrop_path;
    }
    if(movies[i].poster_path){
      movies[i].poster_path = imagesbaseurl + postersize + movies[i].poster_path;
    }
  }
  return movies;
}

var saveMovieInDb = function(movie) {
  var newMovie = new Movie(movie);
  newMovie.save(function(err) {
    if (err) throw err;
    console.log('new movie added to database');
  });
};

request(movieApiBaseUrl + '/configuration?api_key=' + apiKeyMovieDB, function(error, response, content) {
  if(!error){
    content = JSON.parse(content);
    imagesbaseurl = content.images.base_url;
    backdropsize = 'w780';
    postersize = 'original';
  }
});

exports.findAll = function(req, res) {
  if(!req.query.page) {
    req.query.page = 1;
  }
  request(movieApiBaseUrl + '/movie/now_playing?api_key=' + apiKeyMovieDB + '&language=fr-FR&page=' + req.query.page, function(error, response, content){
    if (!error) {
      res.send(JSON.parse(content));
    }
  });
};
exports.findById = function(req, res) {
  Movie.findOne({id: req.params.id}, function(err, movie){
    if (err) throw err;
    if (movie) {
      res.send(movie);
    } else {
      request(movieApiBaseUrl + '/movie/' + req.params.id + '?api_key=' + apiKeyMovieDB + '&language=fr-FR', function(error, response, content) {
        if (!error) {
          var response = populateImagesUrl(JSON.parse(content));
          var idShowtimeProvider = allocine.getAllocineCodeFromTitle(response.title, response.id).then(
            function(idShowtimeProvider) {
              response.idShowtimeProvider = idShowtimeProvider;
              saveMovieInDb(response);
              res.send(response);
            }
          )
        }
      });
    }
  });
};
