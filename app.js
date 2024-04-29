const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const jwt = require('jsonwebtoken');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');

const app = express();

require('dotenv').config();

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Log Stuff to Console
app.use(logger('dev'));

// Use JSON to interpret request body & stuff
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Use cookie parser
app.use(cookieParser());

// Not EXACTLY sure what this is for
app.use(express.static(path.join(__dirname, 'public')));

// Tell app to use the following routers for said routes
// These routes are not used for our purposes
app.use('/', indexRouter);
app.use('/users', usersRouter);


/* BEGIN LOGIC */

// Deadend GET request
app.get('/api', (req, res) => {
  res.json({
    message: 'Welcome to the API!',
  });
});

// POST Login API
app.post('/api/login', (req, res) => {
  // Mock User
  const user = {
    id: 1,
    username: 'brad',
    email: 'brad@gmail.com',
  };

  // Return a JWT for the above user
  jwt.sign({ user: user }, process.env.secretKey, { expiresIn: '600s' }, (err, token) => {
    res.json({
      token: token,
    });
  });
});

// POST: If token is valid, post something, else reject with 403
app.post('/api/posts', verifyToken, (req, res) => {
  console.log(req.token);
  jwt.verify(req.token, process.env.secretKey, (error, authData) => {
    if (error) {
      res.status(403).json({
        success: false,
        message: "Forbidden",
      })
    } else {
      res.json({
        message: 'POST created...',
        authData: authData,
        token: req.token,
      });
    }
  });
});

// Same as the method above but using a GET request instead of POST request
app.get('/api/posts', verifyToken, (req, res, next) => {
  jwt.verify(req.token, process.env.secretKey, (error, authData) => {
    if (error) {
      res.status(403).json({
        success: false,
        message: "Forbidden",
      })
    } else {
      res.json({
        message: 'POST created...',
        authData: authData,
        token: req.token,
      });
    }
  });
});

// FORMAT OF TOKEN
// Authorization: Bearer <access_token>

// Token Verification Function
function verifyToken(req, res, next) {
  // Get auth header value
  const barerHeader = req.headers['authorization'];

  // Check if barerHeader is undefined
  if (typeof barerHeader !== 'undefined') {
    // Split at the space
    const barer = barerHeader.split(' ');

    // Get token from array
    const barerToken = barer[1];

    // Set the token
    req.token = barerToken;
    next();
  } else {
    // Forbidden
    res.status(403).json({
      success: false,
      message: "Forbidden",
    });
  }
};


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
