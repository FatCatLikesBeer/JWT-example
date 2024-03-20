const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const jwt = require('jsonwebtoken');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

app.get('/api', (req, res) => {
  res.json({
    message: 'Welcome to the API!',
  });
});

app.post('/api/posts', verifyToken, (req, res) => {
  jwt.verify(req.token, 'secretkey', (error, authData) => {
    if (error) {
      res.sendStatus(403);
    } else {
      res.json({
        message: 'POST created...',
        authData: authData,
        token: req.token,
      });
    }
  });
});

app.post('/api/login', (req, res) => {
  // Mock user
  const user = {
    id: 1,
    username: 'brad',
    email: 'brad@gmail.com',
  };

  jwt.sign({ user: user }, 'secretkey', { expiresIn: '120s' }, (err, token) => {
    res.json({
      token: token,
    });
  });
});

// FORMAT OF TOKEN
// Authorization: Bearer <access_token>

// Verify Token
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
    res.sendStatus(403);
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
