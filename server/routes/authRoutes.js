const express = require('express');
const router = express.Router();
const { registerUser, verifyOtp, authUser, getProfile, updateProfile, addAddress, updateAddress, deleteAddress, adminRegister, adminLogin } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/verify-otp', verifyOtp);
router.post('/login', authUser);

router.post('/admin/register', adminRegister);
router.post('/admin/login', adminLogin);

router.get('/me', protect, getProfile);
router.put('/me', protect, updateProfile);

router.post('/address', protect, addAddress);
router.put('/address/:id', protect, updateAddress);
router.delete('/address/:id', protect, deleteAddress);

module.exports = router;
