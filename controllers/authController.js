const jwt = require('jsonwebtoken');
const User = require('../model/userModel');
const catchAsync = require('../utils/catchAsync');
const AppErr = require('../utils/errorHandle');
const Email = require('../utils/email');
const { promisify } = require('util');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

function webToken(id) {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.EXPIRES_IN,
  });
}

function createTokenAndSendResponse(user, statusCode, res) {
  const token = webToken(user._id);
  const cookieOptions = {
    httpOnly: true,
    expires: new Date(Date.now() + process.env.COOKIE_JWT_EXPIRES_IN),
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
  user.password = undefined;

  res.cookie('jwt', token, cookieOptions);

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
}

exports.signUp = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    role: req.body.role,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
  });
  const url = `${req.protocol}://${req.get('host')}/me`;
  await new Email(newUser, url).sendWelcome();
  createTokenAndSendResponse(newUser, 201, res);
});

exports.logIn = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new AppErr('Please provide email and password', 404));
  }
  const [user] = await User.find({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppErr('Incorrect password or email Id', 401));
  }
  createTokenAndSendResponse(user, 200, res);
});

exports.logout = catchAsync(async (req, res, next) => {
  res.cookie('jwt', 'logged out', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({
    status: 'success',
  });
});

exports.protect = catchAsync(async (req, res, next) => {
  //1.Getting token and check of its there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  if (!token) {
    return next(
      new AppErr('Your are not logged in ! please login to get access ', 401)
    );
  }
  //2.Token verification
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  //3.Verify the user still exits
  const freshUser = await User.findById(decoded.id);
  if (!freshUser) {
    return next(new AppErr('Invalid user !  ', 401));
  }
  //4.Check user password is changed after the token was issued
  if (freshUser.passwordChangedAfter(decoded.iat)) {
    return next(
      new AppErr('Password has changed recently ! Plaese login again', 401)
    );
  }
  req.user = freshUser;
  res.locals.user = freshUser;
  next();
});

exports.isLoggedIn = async (req, res, next) => {
  //1.Getting token and check of its there

  try {
    if (req.cookies.jwt) {
      //2.Token verification
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );
      //3.Verify the user still exits
      const freshUser = await User.findById(decoded.id);
      if (!freshUser) {
        return next();
      }

      //4.Check user password is changed after the token was issued
      if (freshUser.passwordChangedAfter(decoded.iat)) {
        return next();
      }
      res.locals.user = freshUser;
      return next();
    }
  } catch (err) {
    return next();
  }
  next();
};

exports.ristrictedTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppErr('You dont have access. Check your role!', 403));
    }
    next();
  };
};

exports.forgotPassword = catchAsync(async function (req, res, next) {
  //1.Get user based on posted email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppErr('user with this email id doest exsist', 404));
  }
  //2.Generate the random reset token
  const resetToken = await user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });
  //3.Send it to user email
  const resetURL = `${req.protocol}//${req.get('host')}/api/v1/${resetToken}`;
  const message = `Please click on the link:${resetURL} to change the password`;

  try {
    // await sendEmails({
    //   email: user.email,
    //   subject: 'reset your password within 10 minutes',
    //   message,
    // });

    await new Email(user, resetURL).resetPassword();
    res.status(200).json({
      status: 'success',
      message: 'Token is sent to user via mail',
    });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppErr(
        `There was a problem in sending mail! please try again ${error}`,
        500
      )
    );
  }
});

exports.passwordRest = catchAsync(async function (req, res, next) {
  // 1. Get the user based on token
  const hashToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
  const user = await User.findOne({ passwordResetToken: hashToken });
  // 2. If token is not expired and user exists then change the password
  if (user.passwordResetExpires >= Date.now() - 60 * 1000 && !user) {
    return next(
      new AppErr(
        'Token has been expired, try to change the password within 10 minutes OR user doest exists'
      )
    );
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetExpires = undefined;
  user.passwordResetToken = undefined;
  // 3. Upadate ChangePasswordAt
  user.passwordChangedAt = Date();
  await user.save();

  // 4. Send JWT to client
  createTokenAndSendResponse(user, 200, res);
});

exports.passwordUpdate = catchAsync(async (req, res, next) => {
  //1. Get user from collection
  const user = await User.findById(req.user.id).select('+password');
  const currentPassword = req.body.passwordCurrent;
  //2. Check if posted current password is correct
  if (!(await user.correctPassword(currentPassword, user.password))) {
    return next(new AppErr('Please enter correct password', 500));
  }
  //3. If so, update the password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  //console.log(

  await user.save();
  //4. Log user in, send JWT
  createTokenAndSendResponse(user, 200, res);
});
