// src/services/user.service.js
const User = require('../models/user.model');

const updateUserProfile = async (userId, updateData) => {
  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { $set: updateData },
    { new: true, runValidators: true }
  ).select('-password');

  if (!updatedUser) {
    throw new Error('User not found');
  }

  return updatedUser;
};

const deleteUserAccount = async (userId) => {
  const deletedUser = await User.findByIdAndDelete(userId);
  if (!deletedUser) {
    throw new Error('User not found');
  }
  return { message: 'Account deleted successfully' };
};

module.exports = {
  updateUserProfile,
  deleteUserAccount,
};