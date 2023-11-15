const express = require('express');
const router = express.Router({ mergeParams: true });

const {
  createReview,
  getReviews,
  deleteReview,
  updateReview,
  setTourUserId,
  getOneUser,
} = require('../controllers/reviewController');
const { protect, ristrictedTo } = require('../controllers/authController');

router.use(protect);

router
  .route('/')
  .get(getReviews)
  .post(ristrictedTo('user'), setTourUserId, createReview);
router
  .route('/:id')
  .patch(ristrictedTo('user', 'admin'), updateReview)
  .delete(ristrictedTo('user', 'admin'), deleteReview)
  .get(getOneUser);
module.exports = router;
