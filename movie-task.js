var config = require('./config');
var mongoose = require('mongoose');
var request = require('request-promise');
var allocine = require('./app/controllers/showtime');
var Movie = require('./app/models/movie');
var Promise = require('bluebird');

var apiKeyMovieDB = config.apiKeyMovieDB;
var movieApiBaseUrl = config.movieApiBaseUrl;
var imagesbaseurl, backdropsize, postersize;

mongoose.connect(config.database);

var movieList = [];
var arrayOfRequest = [];

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

var returnListOfMovies = function(feed) {
  return feed.results;
}

var retrieveBunchOfMovies = function(page, total) {
  arrayOfRequest.push(request(movieApiBaseUrl + '/movie/now_playing?api_key=' + apiKeyMovieDB + '&language=fr-FR&page=' + page + '&region=FR'));
  if(page == total) {
    Promise.all(arrayOfRequest).then(function(res) {
      //console.log('res:', JSON.parse(res[0]).page);
      res.forEach(function(result) {
        console.log('page:', JSON.parse(result).page);
        movieList = movieList.concat(populateImagesUrl(JSON.parse(result)));
      });
      console.log(movieList.length);
      Movie.remove({}, function(err){
        if (!err) {
          movieList.forEach(function(movie){
            allocine.getAllocineCodeFromTitle(movie.title, movie.id).then(
              function(idShowtimeProvider) {
                var newMovie = new Movie(movie);
                newMovie.idShowtimeProvider = idShowtimeProvider;
                newMovie.save();
              },
              function(error) {
                console.log('error retriving id showtime', error);
              }
            );
          });
        } else {
          console.log('Error remove movie base', err);
        }
      });
    })
  }
}

request(movieApiBaseUrl + '/movie/now_playing?api_key=' + apiKeyMovieDB + '&language=fr-FR&page=1&region=FR', function(error, response, content){
  var total_pages = JSON.parse(content).total_pages;
  for(var i = 1; i <= total_pages; i++) {
    retrieveBunchOfMovies(i, total_pages);
  }
});
