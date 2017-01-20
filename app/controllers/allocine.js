var config = require('../../config');
var request = require('request');
var rp = require('request-promise');
var partnerCode = config.showtimeProviderAPIkey;
var allocineApiUrl = config.showtimeProviderUrl;

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
      res.json(JSON.parse(content));
    } else {
      console.log(error);
    }
  });
}

exports.getAllocineCodeFromTitle = function(title) {
  options.url = allocineApiUrl + 'search?partner=' + partnerCode + '&q=' + title + '&filter=movie&count=1&format=json';
  return rp(options);
}
