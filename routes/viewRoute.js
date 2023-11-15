const express = require('express');
const router = express.Router();
const viewController = require('../controllers/viewController');
const authController = require('../controllers/authController');
const bookingController = require('../controllers/bookingController');
const AppErr = require('../utils/errorHandle');

const app = express();

router
  .route('/')
  .get(
    bookingController.createBookingCheckout,
    authController.isLoggedIn,
    viewController.overview
  );
router.route('/tour/:slug').get(authController.isLoggedIn, viewController.tour);
router.route('/login').get(authController.isLoggedIn, viewController.login);
router.route('/signin').get(viewController.signin);
router.route('/me').get(authController.protect, viewController.getAccount);
router
  .route('/my-tours')
  .get(authController.protect, viewController.getMyTours);

module.exports = router;
