const userService = require('../services/user.service');
const User = require('../models/user.model');

// GET /api/v1/users/profile (Read)
const getProfile = async (req, res) => {
  const user = await User.findById(req.user.id).select('-password');
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }
  res.status(200).json({ success: true, data: user });
};

// PUT /api/v1/users/profile (Update)
const updateProfile = async (req, res) => {
  const updatedUser = await userService.updateUserProfile(req.user.id, req.body);
  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    data: updatedUser,
  });
};

// DELETE /api/v1/users/profile (Delete)
const deleteProfile = async (req, res) => {
  await userService.deleteUserAccount(req.user.id);
  res.status(200).json({
    success: true,
    message: 'Account deleted successfully',
  });
};

module.exports = {
  getProfile,
  updateProfile,
  deleteProfile,
};