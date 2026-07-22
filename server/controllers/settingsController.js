const StoreSettings = require('../models/StoreSettings');

// @desc    Get public store settings
// @route   GET /api/settings
// @access  Public
const getStoreSettings = async (req, res, next) => {
  try {
    let settings = await StoreSettings.findOne();
    if (!settings) {
      // Return defaults if none exist
      settings = {
        storeName: 'Cuddle Hearts',
        tagline: 'Bringing Smiles, Everytime!',
        freeShippingThreshold: 999,
        announcementMessages: ['FREE SHIPPING on orders above ₹999', 'COD Available', 'Easy 7-Day Returns']
      };
    }
    res.json(settings);
  } catch (error) {
    next(error);
  }
};

// @desc    Update store settings (Admin)
// @route   PUT /api/settings
// @access  Private/Admin
const updateStoreSettings = async (req, res, next) => {
  try {
    let settings = await StoreSettings.findOne();
    
    if (!settings) {
      settings = new StoreSettings(req.body);
    } else {
      Object.assign(settings, req.body);
    }

    const updatedSettings = await settings.save();
    res.json(updatedSettings);
  } catch (error) {
    next(error);
  }
};

module.exports = { getStoreSettings, updateStoreSettings };
