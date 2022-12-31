const Tour = require('./../models/tourModel');
const ApiFeatures = require('./../utils/apiFeatures');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const HandleFactory = require('./handlerFactory');

exports.topTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage, price';
  req.query.fields = 'ratingsAverage, name, difficult, summary, price';

  next();
};

exports.createTour = catchAsync(async (req, res, next) => {
  const newTour = await Tour.create(req.body);

  console.log(newTour._id);

  res.status(201).json({
    status: 'success',
    message: 'Successfully created a tour',
    data: newTour,
  });
});

exports.getAllTours = HandleFactory.getAll(Tour);
exports.getTour = HandleFactory.getOne(Tour, { path: 'reviews' });
exports.createTour = HandleFactory.createOne(Tour);
exports.updateTour = HandleFactory.updateOne(Tour);
exports.deleteTour = HandleFactory.deleteOne(Tour);

exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.8 } },
    },
    {
      $group: {
        _id: '$difficulty',
        numOfTours: { $sum: 1 },
        numRatings: { $sum: '$ratingQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      $sort: { avgRating: 1 },
    },
  ]);

  res.status(200).json({
    status: 'success',
    message: 'Get getting all stats',
    data: {
      stats,
    },
  });
});

exports.getMontlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1;
  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTourStarts: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },
    {
      $addFields: { month: '$_id' },
    },
    {
      //$project is use to remove a field (0 means remove while 1 means add)
      $project: {
        _id: 0,
      },
    },
    {
      $sort: { numTourStarts: -1 },
    },
  ]);
  res.status(200).json({
    status: 'success',
    message: 'Get monthly Plan',
    data: {
      plan,
    },
  });
});
