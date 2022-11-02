const Tour = require('./../models/tourModel');
const ApiFeatures = require('./../utils/apiFeatures');

exports.topTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage, price';
  req.query.fields = 'ratingsAverage, name, difficult, summary, price';

  next();
};

exports.createTour = async (req, res) => {
  try {
    const newTour = await Tour.create(req.body);

    console.log(newTour._id);

    res.status(201).json({
      status: 'success',
      message: 'Successfully created a tour',
      data: newTour,
    });
  } catch (err) {
    // console.log(err);
    res.status(400).json({
      status: 'Failed',
      message: `Unable to create a Tour, ${err}`,
    });
  }
};

exports.getAllTours = async (req, res) => {
  try {
    // console.log(req.query);
    // //BUILD THE QUERY
    // let queryObj = { ...req.query };

    // const excludedFields = ['page', 'sort', 'limit', 'fields'];
    // excludedFields.forEach((el) => delete queryObj[el]);

    // // ADVANCE FILTERING
    // queryObj = JSON.stringify(queryObj);
    // queryObj = JSON.parse(
    //   queryObj.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`)
    // );
    // let query = Tour.find(queryObj);

    // // SORTING
    // if (req.query.sort) {
    //   query = query.sort(req.query.sort.replaceAll(',', ' '));
    //   // console.log(req.query, queryObj);
    // } else {
    //   // query = query.sort('-createdAt');
    // }

    // // FIELD Limiting
    // if (req.query.fields) {
    //   query = query.select(req.query.fields.replaceAll(',', ' '));
    //   console.log(req.query.fields.replaceAll(',', ' '));
    // }

    // //PAGINATION
    // const page = req.query.page * 1 || 1;
    // const limit = req.query.limit * 1 || 10;
    // const skip = (page - 1) * limit;

    // query = query.skip(skip).limit(limit);

    // if (req.query.page) {
    //   const numTours = await Tour.countDocument();
    //   if (skip > numTours) throw new Error('This page does not exist');
    // }

    // const query = await Tour.find()
    //   .where('duration')
    //   .equals(5)
    //   .where('difficulty')
    //   .equals('easy');

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
      data: {
        tours,
      },
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({
      status: 'Failed',
      message: err,
    });
  }
};

exports.getTour = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);

    res.status(200).json({
      status: 'Success',
      data: {
        tour,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'Failed',
      message: err,
    });
  }
};

exports.updateTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      status: 'success',
      message: 'Updated tour...',
      data: {
        tour,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'Failed',
      message: err,
    });
  }
};

exports.deleteTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndDelete(req.params.id);

    res.status(203).json({
      status: 'success',
      message: null,
    });
  } catch (err) {
    res.status(400).json({
      status: 'Failed',
      message: err,
    });
  }
};

exports.getTourStats = async (req, res) => {
  try {
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
  } catch (err) {
    res.status(400).json({
      status: 'Failed',
      message: err,
    });
  }
};

exports.getMontlyPlan = async (req, res) => {
  try {
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
  } catch (err) {
    // console.log(err);
    res.status(400).json({
      status: 'Failed',
      message: err,
    });
  }
};
