const Tour = require('./../models/tourModel');
const ApiFeatures = require('./../utils/apiFeatures');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

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

exports.getAllTours = catchAsync(async (req, res, next) => {
  const features = new ApiFeatures(Tour.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  // console.log(features);

  //EXECUTE QUERY
  const tours = await features.query;

  res.status(200).json({
    status: 'Success',
    result: tours.length,
    tours,
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.id).populate({
    path: 'guides',
    select: '-__v -passwordChangeAt',
  });
  if (!tour) {
    return next(new AppError(`No tour with such ID`, 404));
  }

  res.status(200).json({
    status: 'Success',
    tour,
  });
});

exports.updateTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!tour) {
    return next(new AppError(`No tour with such ID`, 404));
  }

  res.status(200).json({
    status: 'success',
    message: 'Updated tour...',
    tour,
  });
});

exports.deleteTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndDelete(req.params.id);
  if (!tour) {
    return next(new AppError(`No tour with such ID`, 404));
  }

  res.status(204).json({
    status: 'success',
    message: null,
  });
});

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
