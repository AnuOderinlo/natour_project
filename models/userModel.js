const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const slugify = require('slugify');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Your name is requiured'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email'],
  },
  phone: {
    type: String,
    unique: true,
    // required: true,
  },
  password: {
    type: String,
    required: [true, 'A password is required'],
    maxlength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      // THIS ONLY WORKS ON SAVE OR CREATE
      validator: function (el) {
        return el === this.password;
      },
      message: 'Passwords are not the same',
    },
  },
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);

  // this delete the passwordConfirm field
  this.passwordConfirm = undefined;

  next();
});

// Instantiate the user and create a function with the methods property
userSchema.methods.correctPassword = async function (
  bodyPassword,
  userPassword
) {
  return await bcrypt.compare(bodyPassword, userPassword);
};
//create a model from the schema
const User = mongoose.model('User', userSchema);

module.exports = User;
