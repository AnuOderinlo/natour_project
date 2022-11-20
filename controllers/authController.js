const { promisify } = require('util');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const jwt = require('jsonwebtoken');
const AppError = require('./../utils/appError');

const signToken = (id) => {
  return jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create(req.body);

  const token = signToken(newUser._id);

  res.status(201).json({
    status: 'success',
    token,
    data: {
      user: newUser,
    },
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // Check if email and password exist
  if (!email || !password) {
    return next(new AppError('Provide email or password', 400));
  }
  //check if password is correct and user exist
  const user = await User.findOne({ email }).select('+password');

  const correct = await user.correctPassword(password, user.password);

  if (!user || !correct) {
    return next(new AppError('Incorrect email or password', 401));
  }

  //Send token if all is correct
  const token = signToken(user._id);
  res.status(200).json({
    status: 'success',
    token,
  });
});

exports.protect = catchAsync(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('Please login to get access', 401));
  }

  // Verify the token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET); //this is not needed
  // const decoded = jwt.verify(token, process.env.JWT_SECRET);// this is better

  // Check if user still exist
  const freshUser = await User.findOne({ _id: decoded.id });
  if (!freshUser)
    return next(
      new AppError('The user with the token doesnt exist again', 401)
    );

  // Check if user changed password after the token was issued
  if (freshUser.changePasswordAfter(decoded.iat)) {
    return next(
      new AppError(
        'User recently change their password, please log in again',
        401
      )
    );
  }

  req.user = freshUser;
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to carry out this action', 403)
      );
    }

    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  //1. Get user with the posted email
  const user = await User.findOne({ email: req.body.email });
  if (!user) next(new AppError("User doesn't exist", 404));

  //2. Generate random token
  const token = user.createResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  //3. Send it to user's email
});

exports.resetPassword = (req, res, next) => {};
