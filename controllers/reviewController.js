const Review = require('./../models/reviewModel');
const ApiFeatures = require('./../utils/apiFeatures');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const HandleFactory = require('./handlerFactory');

exports.setTourUserIds = (req, res, next) => {
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;

  next();
};

exports.createReview = HandleFactory.createOne(Review);

// exports.getAllReviews = catchAsync(async (req, res, next) => {
//   let filter = {};
//   if (req.params.tourId) filter = { tour: req.params.tourId };
//   const reviews = await Review.find(filter);

//   res.status(200).json({
//     status: 'success',
//     result: reviews.length,
//     reviews,
//   });
// });

exports.getAllReviews = HandleFactory.getAll(Review);
exports.getReview = HandleFactory.getOne(Review);
exports.updateReview = HandleFactory.updateOne(Review);
exports.deleteReview = HandleFactory.deleteOne(Review);
