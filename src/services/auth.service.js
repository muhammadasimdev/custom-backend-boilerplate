const User = require('../models/user.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Helper function to generate tokens
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '7d', // Token valid for 7 days
  });
};

const registerUser = async (email, password) => {
  // 1. Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error('User already exists'); // The global error handler catches this
  }

  // 2. Hash the password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // 3. Save to database
  const user = await User.create({
    email,
    password: hashedPassword,
  });

  // 4. Return data (excluding the password)
  return { id: user._id, email: user.email };
};

const loginUser = async (email, password) => {
  // 1. Find the user
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error('Invalid email or password');
  }

  // 2. Compare passwords
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error('Invalid email or password');
  }

  // 3. Generate JWT
  const token = generateToken(user._id);

  return { token, user: { id: user._id, email: user.email } };
};

module.exports = { registerUser, loginUser };