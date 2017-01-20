var express = require('express');
var app = express();
var morgan = require('morgan');

var port = process.env.PORT || 8080;

app.use(morgan('dev'));

require('./routes')(app);

app.listen(port);
console.log('Cinebuddy API is up at http://localhost/8080/api/');
