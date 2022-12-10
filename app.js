const express = require('express');
const morgan = require('morgan');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

const rateLimiter = require('express-rate-limit');
const limiter = rateLimiter({
  windowMs: 60 * 60 * 1000, // 60mins or 1 hour
  max: 100,
  message: 'Too many request from this IP, please try again in an hour',
});

const app = express();

app.use(express.json());

console.log(process.env.NODE_ENV);
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
app.use(express.static(`${__dirname}/public`));

// app.use((req, res, next) => {
//   console.log('Hello from a middleware');

//   next();
// });

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.headers);

  next();
});

app.use('/api', limiter);

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

//Error Handling unhandled Routes
app.all('*', (req, res, next) => {
  next(
    new AppError(`Can't find this ${req.originalUrl} route on this server`, 404)
  );
});

// Handling global Error

app.use(globalErrorHandler);

module.exports = app;
