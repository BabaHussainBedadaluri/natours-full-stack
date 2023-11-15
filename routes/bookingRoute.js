const express = require('express');
const { getCheckoutSession } = require('../controllers/bookingController');
const { protect, ristrictedTo } = require('../controllers/authController');
const router = express.Router();
const {
  readAllBooking,
  readBooking,
  updateBooking,
  deleteBooking,
} = require('../controllers/bookingController');

router.use(protect);

router.get('/checkout-session/:tourId', getCheckoutSession);
router.use(ristrictedTo('admin', 'lead-guide'));
router
  .route('/:id')
  .get(readBooking)
  .patch(updateBooking)
  .delete(deleteBooking);
router.get('/', readAllBooking);

module.exports = router;
