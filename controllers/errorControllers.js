const AppErr = require('../utils/errorHandle');

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  console.log('----------global error', err);
  if (err.name === 'CastError') {
    forCastErr(err, res);
  }
  if (err.name === 'JsonWebTokenError') {
    handleJwtErr(err, res);
  }
  if (err.name === 'TokenExpiredError') {
    handleJwtTokenExpiredErr(err, res);
  }
  if (process.env.NODE_ENV == 'development') {
    sendErrDevlopment(err, req, res);
  }
  if (process.env.NODE_ENV == 'production') {
    let error = { ...err };
    error.message = err.message;
    if (err.code == 11000) {
      error = handlerDuplicateName(err);
    }
    sendErrProduction(error, req, res);
  }
};
const forCastErr = (err, res) => {
  res.status(400).json({
    status: 'CastError due to findById function',
    message: err.message,
  });
};

const handleJwtErr = (err, res) => {
  err.message = `Invalid token. Please login again?`;
  err.status = 'failed';
  return new AppErr(err, 401);
};
const handleJwtTokenExpiredErr = (err, res) => {
  err.message = `Token is expired. Please login again?`;
  err.status = 'failed';
  return new AppErr(err, 401);
};
const handlerDuplicateName = (err) => {
  err.message = `Duplicate tour name`;
  err.status = 'failed to post the tour data';
  return new AppErr(err, 400);
};
const sendErrDevlopment = (err, req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      errorStack: err,
    });
  } else {
    res.status(err.statusCode).render('error', {
      title: 'error',
      err,
    });
  }
};
const sendErrProduction = (err, req, res) => {
  // //console.log(err);
  if (err.isOperational) {
    if (req.originalUrl.startsWith('/api')) {
      res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
        error: err,
        stack: err.stack,
      });
    } else {
      res.status(err.statusCode).render('error', {
        title: 'error',
        err,
      });
    }
  } else {
    if (req.originalUrl.startsWith('/api')) {
      res.status(500).json({
        status: 'error',
        message: 'something went wrong',
      });
    } else {
      res.status(err.statusCode).render('error', {
        title: 'error',
        err,
      });
    }
  }
};
