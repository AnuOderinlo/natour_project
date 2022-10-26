const Tour = require('./../models/tourModel');

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
    res.status(400).json({
      status: 'Failed',
      message: `Unable to create a Tour, ${err}`,
    });
  }
};

exports.getAllTours = async (req, res) => {
  try {
    console.log(req.query);
    //BUILD THE QUERY
    let queryObj = { ...req.query };

    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((el) => delete queryObj[el]);

    // ADVANCE FILTERING
    queryObj = JSON.stringify(queryObj);
    queryObj = JSON.parse(
      queryObj.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`)
    );
    let query = Tour.find(queryObj);

    // SORTING
    if (req.query.sort) {
      query = query.sort(req.query.sort.replaceAll(',', ' '));
      // console.log(req.query, queryObj);
    } else {
      query = query.sort('-createdAt');
    }

    // FIELD Limiting
    if (req.query.fields) {
      query = query.select(req.query.fields.replaceAll(',', ' '));
      console.log(req.query.fields.replaceAll(',', ' '));
    }

    // const query = await Tour.find()
    //   .where('duration')
    //   .equals(5)
    //   .where('difficulty')
    //   .equals('easy');

    const tours = await query;

    res.status(200).json({
      status: 'Success',
      result: tours.length,
      data: {
        tours,
      },
    });
  } catch (err) {
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
