const express = require('express');
const path = require('path');
const morgan = require('morgan');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const viewRouter = require('./routes/viewRoute');
const rateLimit = require('express-rate-limit');
const userRouter = require('./routes/userRoute');
const tourRouter = require('./routes/tourRoute');
const booking = require('./routes/bookingRoute');
const reviewRouter = require('./routes/reviewRoute');
const globalError = require('./controllers/errorControllers');
const AppErr = require('./utils/errorHandle');
const app = express();
const compression = require('compression');

//set view engine for server side rendering

app.set('view engine', 'pug');

app.set('views', path.join(__dirname, 'views'));
// GLOBEL MIDDLEWARE

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
//1. Set security HTTP Headers
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'", 'https:', 'http:', 'data:', 'ws:'],
      baseUri: ["'self'"],
      fontSrc: ["'self'", 'https:', 'http:', 'data:'],
      scriptSrc: ["'self'", 'https:', 'http:', 'blob:'],
      styleSrc: ["'self'", "'unsafe-inline'", 'https:', 'http:'],
    },
  })
);

// for compressing text files to client

app.use(compression());

//2. Request rate limiter

const limiter = rateLimit({
  max: 100,
  windowMs: 1 * 60 * 60 * 1000,
  message:
    'Number of request limit per hour is excessed! Please try after 1 hour',
});

//Used to limit number of requests to server
app.use('/api', limiter);

app.use(cors());

// Reading data in body into req.body

app.use(express.json({ limit: '10kb' }));

app.use(cookieParser());

app.use((req, res, next) => {
  next();
});

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());
// Data sanitization against XSS (cross scripting site)
app.use(xss());
// Prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'difficulty',
      'ratingsAverage',
      'ratingQuantity',
      'maxGroupSize',
      'price',
      'priceDiscount',
    ],
  })
);
//Serving Static files

app.use(express.static(`${__dirname}/public`));

//3. TourRouter middleware

app.use('/', viewRouter);

app.use('/api/v1/tours', tourRouter);

//4. UserRouter middleware
app.use('/api/v1/users', userRouter);

// Review router

app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', booking);

//5. Catch wrong URLs with middleware

// app.all('*', (req, res, next) => {
//   // const err = new Error(`cant find ${req.url} url `);
//   // err.status = 'fail';
//   // err.statusCode = 404;
//   next(new AppErr(`cant find ${req.url} url`, 404));
// });

//6. Global Error middleware for catching all type of errors
// app.use(function (req, res, next) {
//   res.setHeader(
//     'Content-Security-Policy',
//     "script-src 'self' https://cdnjs.cloudflare.com"
//   );
//   next();
// });

app.use(globalError);

module.exports = app;
