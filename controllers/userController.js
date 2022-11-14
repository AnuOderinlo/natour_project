const User = require('./../models/userModel');
const ApiFeatures = require('./../utils/apiFeatures');
const catchAsync = require('./../utils/catchAsync');

exports.getAllUsers = catchAsync(async (req, res) => {
  const users = await User.find();

  res.status(200).json({
    status: 'Success',
    result: users.length,
    users,
  });
});
exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'failed',
    message: 'Yet to implement this route',
  });
};
exports.getUser = (req, res) => {
  res.status(500).json({
    status: 'failed',
    message: 'Yet to implement this route',
  });
};
exports.updateUser = (req, res) => {
  res.status(500).json({
    status: 'failed',
    message: 'Yet to implement this route',
  });
};
exports.deleteUser = (req, res) => {
  res.status(500).json({
    status: 'failed',
    message: 'Yet to implement this route',
  });
};
