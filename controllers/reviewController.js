const Review = require('./../models/reviewModel');
const ApiFeatures = require('./../utils/apiFeatures');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

exports.createReview = catchAsync(async (req, res, next) => {
  const newReview = await Review.create(req.body);

  // console.log(newTour._id);

  res.status(201).json({
    status: 'success',
    message: 'Successfully created a review',
    data: newReview,
  });
});

exports.getAllReviews = catchAsync(async (req, res, next) => {
  const reviews = await Review.find();

  res.status(200).json({
    status: 'success',
    result: reviews.length,
    reviews,
  });
});
