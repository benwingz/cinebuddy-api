var config = require('../../config');
var request = require('request');
var allocine = require('./allocine');
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
  request(movieApiBaseUrl + '/movie/' + req.params.id + '?api_key=' + apiKeyMovieDB + '&language=fr-FR', function(error, response, content) {
    if (!error) {
      var response = populateImagesUrl([JSON.parse(content)]);
      allocine.getAllocineCodeFromTitle(response[0].title).then(
        function(contentAllocine) {
          if(JSON.parse(contentAllocine).feed.totalResults !== 0) {
            var response = JSON.parse(content);
            response.idAllocine = JSON.parse(contentAllocine).feed.movie[0].code;
            res.send(response);
          }
        }
      )
      //response[0].idAllocine = allocine.getAllocineCodeFromTitle(response[0].original_title);
      //res.send(response);
    }
  })
};
