const AppError = require('./../utils/appError');

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path.replace('_', '')}: ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateField = (err) => {
  const value = err.keyValue.name;

  const message = `Duplicate field value: ${value}, please use another value`;
  return new AppError(message, 400);
};

const sendErrorDev = (err, res) => {
  console.log(err.message);
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
    // Programming error or unknown error
  } else {
    // console.log('Error', err);
    res.status(err.statusCode).json({
      status: 'error',
      message: 'Something went wrong',
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'Error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };

    // console.log(err.message);
    if (err.name === 'CastError') error = handleCastErrorDB(error);
    if (err.code === 11000) error = handleDuplicateField(err);
    sendErrorProd(error, res);
  }
};
