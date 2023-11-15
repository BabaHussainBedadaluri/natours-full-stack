const Review = require('../model/reviewModel');
const catchAsync = require('../utils/catchAsync');
const {
  deleteOne,
  updateOne,
  createOne,
  getOne,
  getAll,
} = require('../controllers/factoryFunctions');

exports.setTourUserId = (req, res, next) => {
  if (!req.body.tour) req.body.tour = req.params.tour;
  if (!req.body.user) req.body.user = req.user.id;
  next();
};

// exports.getOneReview = catchAsync(async (req, res, next) => {
//   const review = await Review.findById(req.params.id);
//   res.status(200).json({
//     status: 'success',
//     data: {
//       review,
//     },
//   });
// });
// exports.getReviews = catchAsync(async (req, res, next) => {
//   let filter = {};
//   if (req.params.tourId) filter = { tourId: req.params.tourId };
//   const review = await Review.find(filter);
//   res.status(200).json({
//     status: 'success',
//     data: {
//       review,
//     },
//   });
// });

exports.getReviews = getAll(Review);
exports.getOneUser = getOne(Review);
exports.deleteReview = deleteOne(Review);
exports.updateReview = updateOne(Review);
exports.createReview = createOne(Review);
