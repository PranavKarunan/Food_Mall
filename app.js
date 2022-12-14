var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var hbs = require('express-handlebars')
var session = require('express-session')

var userRouter = require('./routes/user');
var adminRouter = require('./routes/admin');
const dotenv = require('dotenv')
dotenv.config()

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.engine('hbs', hbs.engine({helpers:{inc: function(value, option){

    return parseInt(value)+1;
    }},extname: 'hbs',layoutDir:__dirname + '/views/layout',partialsDir:__dirname + '/views/partials'}));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
// app.engine('hbs',hbs.engine({extname:'hbs',layoutDir:__dirname + '/views/layout',partialsDir:__dirname + '/views/partials'}))
app.use(session(

  {secret:"food_mall",
  cookie:{maxAge:6000000},
  resave:false,
  saveUninitialized:true}))

  app.use('/admin', adminRouter);
app.use('/', userRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  // res.locals.message = err.message;
  // res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 404)
  res.render('user/404')
  res.status(err.status || 500);
  res.render('user/500');
});

module.exports = app;
