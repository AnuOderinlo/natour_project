const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const ApiFeatures = require('./../utils/apiFeatures');

exports.deleteOne = (Model) => {
  return catchAsync(async (req, res, next) => {
    console.log(Model);
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) {
      return next(new AppError(`No document with such ID`, 404));
    }

    res.status(204).json({
      status: 'success',
      message: null,
    });
  });
};

exports.updateOne = (Model) => {
  return catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!doc) {
      return next(new AppError(`No document with such ID`, 404));
    }

    res.status(200).json({
      status: 'success',
      message: 'Updated doc...',
      data: doc,
    });
  });
};

exports.createOne = (Model) => {
  return catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);

    console.log(doc._id);

    res.status(201).json({
      status: 'success',
      message: 'Successfully created a document',
      data: doc,
    });
  });
};

exports.getOne = (Model, populateOpt) => {
  return catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (populateOpt) {
      query = query.populate(populateOpt);
    }
    const doc = await query;
    if (!doc) {
      return next(new AppError(`No document with such ID`, 404));
    }

    res.status(200).json({
      status: 'Success',
      data: doc,
    });
  });
};

exports.getAll = (Model) => {
  return catchAsync(async (req, res, next) => {
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };

    const features = new ApiFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    //EXECUTE QUERY
    // const docs = await features.query.explain();
    const docs = await features.query;

    res.status(200).json({
      status: 'Success',
      result: docs.length,
      data: docs,
    });
  });
};
