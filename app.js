const express = require('express');
const morgan = require('morgan');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

const rateLimiter = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const app = express();
//Development logging
console.log(process.env.NODE_ENV);
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

//Set security HTTP headers
app.use(helmet());

// Limit request from same API
const limiter = rateLimiter({
  windowMs: 60 * 60 * 1000, // 60mins or 1 hour
  max: 100,
  message: 'Too many request from this IP, please try again in an hour',
});

//Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(express.static(`${__dirname}/public`));

//Data sanitization against NOSQL injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

//Prevent Parameter population
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsAverage',
      'ratingQuantity',
      'maxGroupSize',
      'price',
    ],
  })
);

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.headers);

  next();
});

app.use('/api', limiter);

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

//Error Handling unhandled Routes
app.all('*', (req, res, next) => {
  next(
    new AppError(`Can't find this ${req.originalUrl} route on this server`, 404)
  );
});

// Handling global Error

app.use(globalErrorHandler);

module.exports = app;
