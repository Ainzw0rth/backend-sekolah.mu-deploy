var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

// available routes
var indexRouter = require('./routes/index');
var kontenRouter = require('./routes/konten');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// explicitly stating the routes
app.use('/', indexRouter);
app.use('/konten', kontenRouter);

module.exports = app;