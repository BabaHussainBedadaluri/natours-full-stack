const {
  signUp,
  logIn,
  logout,
  ristrictedTo,
  passwordRest,
  forgotPassword,
  passwordUpdate,
} = require('../controllers/authController');
const userController = require('../controllers/userController');
const express = require('express');
const router = express.Router();
const { protect } = require('../controllers/authController');
// const app = express();

router.post('/signup', signUp);
router.post('/login', logIn);
router.get('/logout', logout);
router.post('/forgotPassword', forgotPassword);
router.patch('/resetPassword/:token', passwordRest);

//All below routes are protected(user must be logged in to access these routes)
router.use(protect);

router.patch('/passwordUpdate', passwordUpdate);
router.patch(
  '/updateMe',
  userController.uploadUserPhoto,
  userController.resizeUserPhoto,
  userController.updateMe
);
router.delete('/deleteMe', userController.deleteMe);
router.get('/me', userController.getMe, userController.getUser);

//All below routes are protected and only accessible by admin
router.use(ristrictedTo('admin'));

router.route('/').get(userController.getAllUsers);
router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
