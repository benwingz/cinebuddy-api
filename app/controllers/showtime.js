var config = require('../../config');
var request = require('request');
var Matchid = require('../models/matchid');
var rp = require('request-promise');
var partnerCode = config.showtimeProviderAPIkey;
var allocineApiUrl = config.showtimeProviderUrl;
var googlePlacesUrl = config.googlePlacesUrl;
var googlePlacesApiKey = config.googlePlacesApiKey;

var options = {
  url: '',
  headers: {
    'User-Agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2883.95 Mobile Safari/537.36'
  }
};

exports.findShowTime = function(req, res) {
  if (req.query.lat && req.query.lng) {
    if (!req.query.radius) {
      req.query.radius = 1;
    }
    if (req.query.theaters && !req.query.movie) {
      options.url = allocineApiUrl + 'showtimelist?partner=' + partnerCode + '&lat=' + req.query.lat + '&long=' + req.query.lng + '&radius=' + req.query.radius + '&theaters=' + req.query.theaters + '&format=json';
    } else if (req.query.movie && !req.query.theaters) {
      options.url = allocineApiUrl + 'showtimelist?partner=' + partnerCode + '&lat=' + req.query.lat + '&long=' + req.query.lng + '&radius=' + req.query.radius + '&movie=' + req.query.movie + '&format=json';
    } else if (req.query.movie && req.query.theaters) {
      options.url = allocineApiUrl + 'showtimelist?partner=' + partnerCode + '&lat=' + req.query.lat + '&long=' + req.query.lng + '&radius=' + req.query.radius + '&theaters=' + req.query.theaters + '&movie=' + req.query.movie + '&format=json';
    }
  }

  request(options, function(error, response, content){
    if (!error) {
      res.json(JSON.parse(content));
    } else {
      console.log(error);
    }
  });
};

exports.findMovieById = function(req, res) {
  options.url = allocineApiUrl + 'movie?partner=' + partnerCode + '&code=' + req.params.id + '&format=json';
  request(options, function(error, response, content) {
    if (!error) {
      res.json(JSON.parse(content));
    } else {
      console.log(error);
    }
  });
};

exports.theaterCloseBy = function(req, res) {
  if(req.query.lat && req.query.lng) {
    if (!req.query.radius) {
      req.query.radius = 1;
    }
    options.url = allocineApiUrl + 'theaterlist?partner=' + partnerCode + '&lat=' + req.query.lat + '&long=' + req.query.lng + '&radius=' + req.query.radius + '&format=json';
  }

  request(options, function(error, response, content) {
    if (!error) {
      res.json(populateTheater(JSON.parse(content)));
    } else {
      console.log(error);
    }
  });
};

var populateTheater = function(theatersStream) {
  if(theatersStream.feed.theater) {
    return theatersStream.feed.theater;
  }
}

exports.getAllocineCodeFromTitle = function(title, id) {
  return new Promise(function(fulfill, reject) {
    Matchid.findOne({
      idMovieDb: id
    }, function(err, matchid) {
      if (err) reject(err);

      if (!matchid) {
        options.url = allocineApiUrl + 'search?partner=' + partnerCode + '&q=' + encodeURIComponent(title) + '&filter=movie&count=1&format=json';
        request(options, function(error, response, content) {
          if (!error) {
            var idShowtimeProvider = JSON.parse(content).feed.movie[0].code;
            var newMatchid = new Matchid({
              idMovieDb: id,
              idShowtimeProvider: idShowtimeProvider
            });
            newMatchid.save(function(err) {
              if(err) reject(err);
            });
            fulfill(idShowtimeProvider);
          } else {
            reject(error);
          }
        });
      } else {
        fulfill(matchid.idShowtimeProvider);
      }
    });
  });
};

exports.theaterNearby = function(req, res) {
  console.log('params:', req.params)
  options.url = googlePlacesUrl + '/nearbysearch/json?key=' + googlePlacesApiKey + '&type=movie_theater&radius=2000&location=' + req.query.lat.toString() + ',' + req.query.lng.toString();
  request(options, function(error, response, content) {
    if (!error) {
      res.json(returnResultsGoogle(JSON.parse(content)));
    } else {
      console.log(error);
    }
  });
};

var returnResultsGoogle = function(stream) {
  return stream.results;
}
