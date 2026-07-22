const User = require('../models/User');

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
const getUsers = async (req, res, next) => {
  try {
    const users = await User.find({ role: { $ne: 'admin' } }).select('-password -otp -otpExpires').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle user block status
// @route   PUT /api/users/:id/block
// @access  Private/Admin
const toggleBlockUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (user && user.role !== 'admin') {
      user.isBlocked = !user.isBlocked;
      const updatedUser = await user.save();
      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        isBlocked: updatedUser.isBlocked
      });
    } else {
      res.status(404);
      throw new Error('User not found or cannot be modified');
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsers,
  toggleBlockUser
};
