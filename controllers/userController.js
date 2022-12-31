const User = require('./../models/userModel');
const ApiFeatures = require('./../utils/apiFeatures');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const HandleFactory = require('./handlerFactory');

const filterObj = (obj, ...fields) => {
  const newObj = {};

  Object.keys(obj).forEach((el) => {
    if (fields.includes(el)) {
      newObj[el] = obj[el];
    }
  });

  return newObj;
};

exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'failed',
    message: 'Yet to implement this route. please use the /signup',
  });
};

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;

  next();
};

//This API is for the user to update
exports.updateMe = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        "You can't update the password with this route, please use /updatePassword"
      ),
      400
    );
  }

  //Filter fields that should not be updated
  const filteredBody = filterObj(req.body, 'name', 'email');

  const updateUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    runValidators: true,
    new: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      updateUser,
    },
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

// exports.updateUser = (req, res) => {
//   res.status(500).json({
//     status: 'failed',
//     message: 'Yet to implement this route',
//   });
// };
// exports.deleteUser = (req, res) => {
//   res.status(500).json({
//     status: 'failed',
//     message: 'Yet to implement this route',
//   });
// };

exports.getUser = HandleFactory.getOne(User);
exports.getAllUsers = HandleFactory.getAll(User);

//This API is for the administrator to update and do Not update the password with this
exports.updateUser = HandleFactory.updateOne(User);
exports.deleteUser = HandleFactory.deleteOne(User);
