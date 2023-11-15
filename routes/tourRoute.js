const express = require('express');
const { protect, ristrictedTo } = require('../controllers/authController');
const reviewRouter = require('../routes/reviewRoute');
const {
  createTour,
  readAllTours,
  readOneTours,
  updateTour,
  deleteTour,
  aliasTour,
  tourStats,
  getMonthlyPlan,
  toursWithin,
  getDistances,
  resizeTourPhoto,
  uploadTourPhoto,
} = require('./../controllers/tourController');
const app = express();
app.use(express.json());

const router = express.Router();
router.use('/:tourId/reviews', reviewRouter);
router.route('/top-five-cheap').get(aliasTour, readAllTours);
router.route('/stats').get(tourStats);
router
  .route('/tours-distance/:distance/center/:latlog/unit/:unit')
  .get(toursWithin);

router.route('/distances/:latlog/unit/:unit').get(getDistances);
router
  .route('/monthly-plan/:year')
  .get(protect, ristrictedTo('admin', 'lead-guide'), getMonthlyPlan);
router
  .route('/')
  .post(protect, ristrictedTo('admin', 'lead-guide'), createTour)
  .get(readAllTours);
router
  .route('/:id')
  .get(readOneTours)
  .patch(
    protect,
    ristrictedTo('admin', 'lead-guide'),
    uploadTourPhoto,
    resizeTourPhoto,
    updateTour
  )
  .delete(protect, ristrictedTo('admin', 'lead-guide'), deleteTour);

// router
//   .route('/:tourId/reviews')
//   .post(protect, ristrictedTo('user'), createReview);

const castErrorDB = (err) => {
  return err;
};

module.exports = router;
