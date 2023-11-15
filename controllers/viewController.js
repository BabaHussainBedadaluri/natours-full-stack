const Booking = require('../model/bookingModel');
const Tour = require('../model/tourModel');
const catchAsync = require('../utils/catchAsync');
const AppErr = require('../utils/errorHandle');

exports.overview = catchAsync(async (req, res) => {
  const tours = await Tour.find();
  res
    .status(200)
    // .set(
    //   'Content-Security-Policy',
    //   "connect-src 'self' https://cdnjs.cloudflare.com"
    // )
    .render('overview', {
      title: 'All tours',
      tours,
    });
});

exports.tour = async (req, res, next) => {
  //1. get data for requested tour which includes guides and reviews
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'rating userId review',
  });

  if (!tour) {
    return next(new AppErr('Entered url is wrong', 404));
  }
  //2.
  res.status(200).render('tour', {
    title: tour.name,
    tour,
  });
};

exports.login = catchAsync(async (req, res) => {
  res
    .status(200)
    // .set(
    //   'Content-Security-Policy',
    //   "connect-src 'self' https://cdnjs.cloudflare.com"
    // )
    .render('login', {
      title: 'Log into your account',
    });
});

exports.signin = catchAsync(async (req, res) => {
  res.status(200).render('signin', {
    title: 'create account',
  });
});
exports.getAccount = catchAsync(async (req, res) => {
  res
    .status(200)
    .set(
      'Content-Security-Policy',
      "connect-src 'self' https://cdnjs.cloudflare.com"
    )
    .render('account', {
      title: 'Your Profile',
    });
});

exports.getMyTours = catchAsync(async (req, res, next) => {
  //1.Find all bookings
  const Bookings = await Booking.find({ user: req.user.id });
  //2.Find tours with the returned IDs
  const myTourIds = Bookings.map((ele) => {
    return ele.tour._id;
  });

  const tours = await Tour.find({ _id: { $in: myTourIds } });

  res.status(200).render('overview', {
    title: 'My Tours',
    tours,
  });
});
