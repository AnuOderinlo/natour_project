const Tour = require('./../models/tourModel');

/**
 * This is param middleware
 * To check a valid ID
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @param {*} id
 * @returns
 */
// exports.checkId = (req, res, next, id) => {
//   if (id * 1 > tours.length) {
//     return res.status(404).json({
//       status: 'failed',
//       message: 'Invalid Id',
//     });
//   }

//   next();
// };

// exports.checkBody = (req, res, next) => {
//   if (!req.body.name || !req.body.price) {
//     return res.status(400).json({
//       status: 'failed',
//       message: 'Name or Price is required',
//     });
//   }
//   next();
// };

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
    const tours = await Tour.find({});
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
