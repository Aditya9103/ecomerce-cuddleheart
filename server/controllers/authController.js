const User = require('../models/User');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/sendEmail');
const env = require('../config/env');

const generateToken = (id) => {
  return jwt.sign({ id }, env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6 digit OTP
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      if (userExists.isVerified) {
        return res.status(400).json({ message: 'User already exists and is verified' });
      }
      // If user exists but is not verified, we can resend OTP
      const otp = generateOTP();
      userExists.otp = otp;
      userExists.otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
      if (password) {
         userExists.password = password; // updating password if they are registering again
      }
      await userExists.save();

      // Send Email
      await sendEmail({
        email: userExists.email,
        subject: 'Cuddle Hearts - Your OTP Code',
        message: `Your OTP for registration is ${otp}. It is valid for 10 minutes.`,
        html: `<h2>Welcome to Cuddle Hearts!</h2><p>Your OTP for registration is <strong>${otp}</strong>.</p><p>It is valid for 10 minutes.</p>`
      });

      return res.status(200).json({ message: 'OTP sent to email', userId: userExists._id, email: userExists.email });
    }

    const otp = generateOTP();
    
    const user = await User.create({
      name,
      email,
      password,
      otp,
      otpExpires: Date.now() + 10 * 60 * 1000,
      isVerified: false
    });

    if (user) {
      await sendEmail({
        email: user.email,
        subject: 'Cuddle Hearts - Your OTP Code',
        message: `Your OTP for registration is ${otp}. It is valid for 10 minutes.`,
        html: `<h2>Welcome to Cuddle Hearts!</h2><p>Your OTP for registration is <strong>${otp}</strong>.</p><p>It is valid for 10 minutes.</p>`
      });

      res.status(201).json({ message: 'OTP sent to email', userId: user._id, email: user.email });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
// @access  Public
const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'User is already verified' });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    if (user.otpExpires < Date.now()) {
      return res.status(400).json({ message: 'OTP expired' });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Auth user & get token (Login)
// @route   POST /api/auth/login
// @access  Public
const authUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      if (!user.isVerified) {
        // Resend OTP
        const otp = generateOTP();
        user.otp = otp;
        user.otpExpires = Date.now() + 10 * 60 * 1000;
        await user.save();

        await sendEmail({
          email: user.email,
          subject: 'Cuddle Hearts - Your OTP Code',
          message: `Your OTP for verification is ${otp}. It is valid for 10 minutes.`,
          html: `<h2>Welcome back to Cuddle Hearts!</h2><p>Please verify your account. Your OTP is <strong>${otp}</strong>.</p><p>It is valid for 10 minutes.</p>`
        });

        return res.status(403).json({ message: 'Account not verified. A new OTP has been sent to your email.', unverified: true });
      }

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Admin Register
// @route   POST /api/auth/admin/register
// @access  Public (protected by secret key)
const adminRegister = async (req, res) => {
  const { name, email, password, secretKey } = req.body;

  try {
    if (secretKey !== env.ADMIN_SECRET_KEY) {
      return res.status(403).json({ message: 'Invalid Admin Secret Key' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: 'admin',
      isVerified: true // Admins bypass OTP
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Admin Login
// @route   POST /api/auth/admin/login
// @access  Public
const adminLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      if (user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied. Admins only.' });
      }

      if (!user.isVerified) {
         // Failsafe, admins should be verified
         user.isVerified = true;
         await user.save();
      }

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/me
// @access  Private
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        addresses: user.addresses,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/me
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.phone = req.body.phone || user.phone;

      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        role: updatedUser.role,
        token: generateToken(updatedUser._id),
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add address
// @route   POST /api/auth/address
// @access  Private
const addAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      const { fullName, phone, pincode, flatHouse, areaStreet, landmark, city, state, label, isDefault } = req.body;
      
      const newAddress = { fullName, phone, pincode, flatHouse, areaStreet, landmark, city, state, label: label || 'Home', isDefault };
      
      if (isDefault) {
        user.addresses.forEach(addr => addr.isDefault = false);
      }
      
      user.addresses.push(newAddress);
      await user.save();
      
      res.status(201).json(user.addresses);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update address
// @route   PUT /api/auth/address/:id
// @access  Private
const updateAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      const addressId = req.params.id;
      const addressIndex = user.addresses.findIndex(addr => addr._id.toString() === addressId);
      
      if (addressIndex !== -1) {
        const { fullName, phone, pincode, flatHouse, areaStreet, landmark, city, state, label, isDefault } = req.body;
        
        if (isDefault) {
          user.addresses.forEach(addr => addr.isDefault = false);
        }
        
        user.addresses[addressIndex] = {
          ...user.addresses[addressIndex].toObject(),
          fullName: fullName || user.addresses[addressIndex].fullName,
          phone: phone || user.addresses[addressIndex].phone,
          pincode: pincode || user.addresses[addressIndex].pincode,
          flatHouse: flatHouse || user.addresses[addressIndex].flatHouse,
          areaStreet: areaStreet || user.addresses[addressIndex].areaStreet,
          landmark: landmark !== undefined ? landmark : user.addresses[addressIndex].landmark,
          city: city || user.addresses[addressIndex].city,
          state: state || user.addresses[addressIndex].state,
          label: label || user.addresses[addressIndex].label,
          isDefault: isDefault !== undefined ? isDefault : user.addresses[addressIndex].isDefault
        };
        
        await user.save();
        res.json(user.addresses);
      } else {
        res.status(404).json({ message: 'Address not found' });
      }
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete address
// @route   DELETE /api/auth/address/:id
// @access  Private
const deleteAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      const addressId = req.params.id;
      user.addresses = user.addresses.filter(addr => addr._id.toString() !== addressId);
      await user.save();
      res.json(user.addresses);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  registerUser,
  verifyOtp,
  authUser,
  getProfile,
  updateProfile,
  addAddress,
  updateAddress,
  deleteAddress,
  adminRegister,
  adminLogin,
};
