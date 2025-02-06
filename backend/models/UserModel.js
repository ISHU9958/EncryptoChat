const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true, // Email should be unique for each user
    lowercase: true,
    trim: true,
  },
  phone: {
    type: String,
    required: true,
    match: /^[0-9]{10}$/, // Validates that phone number is a 10-digit string
  },
  username: {
    type: String,
    required: true,
    unique: true, // Ensure unique usernames
    minlength: 4,
    maxlength: 20,
    match: /^[a-zA-Z0-9_]+$/, // Alphanumeric characters and underscores only
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  image: {
    type: String,
    default: '',
  },
  groups: {
    type: [String], // Array of strings
    default: [],    // Default value is an empty array
  },
  publicKey: { type: String ,required:true},
  privateKey: { type: String,default:'' },
  salt: { type: String,default:''},
  iv: { type: String,default:''},
}, {
  timestamps: true, // Adds createdAt and updatedAt fields automatically
});

const User = mongoose.model('users', userSchema);

module.exports = User;
