var config = require('../../config');
var request = require('request');
var allocine = require('./showtime');
var Movie = require('../models/movie');
var apiKeyMovieDB = config.apiKeyMovieDB;
var movieApiBaseUrl = config.movieApiBaseUrl;
var imagesbaseurl, backdropsize, postersize;

var populateImagesUrl = function(content) {
  if(content.results) {
    var movies = content.results;
  } else {
    var movies = content;
  }
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

  var promise = newMovie.save()
  return promise;
};

request(movieApiBaseUrl + '/configuration?api_key=' + apiKeyMovieDB, function(error, response, content) {
  if(!error){
    content = JSON.parse(content);
    imagesbaseurl = content.images.base_url;
    backdropsize = 'w780';
    postersize = 'original';
  } else {
    console.log(error);
  }
});

exports.findAll = function(req, res) {
  Movie.find({poster_path:{'$ne': null}, overview: {'$ne': null}, idShowtimeProvider:{'$ne': null} }).sort('-popularity').then(
    function(movies){
      if(movies.length > 0) {
        res.json(movies);
      } else {
        res.json({success: false, message:"No movies"});
      }
    },
    function(error) {
      console.log('Get all movie error:', error);
    }
  );
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
              saveMovieInDb(response).then(function(movie) {
                res.send(movie);
              });
            }
          )
        }
      });
    }
  });
};
