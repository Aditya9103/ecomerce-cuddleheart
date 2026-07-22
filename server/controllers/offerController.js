const Offer = require('../models/Offer');
const Product = require('../models/Product');

// Helper to compute and apply offer price to products
const applyOfferToProducts = async (offer, productIds) => {
  // First, remove this offer from any products that have it currently
  await Product.updateMany(
    { activeOffer: offer._id },
    { $unset: { activeOffer: 1, offerPrice: 1 } }
  );

  // If offer is inactive or not a 'sale', we stop here (offer is removed from all)
  if (!offer.isActive || offer.type !== 'sale') return;

  if (!productIds || productIds.length === 0) return;

  // Fetch the new products to calculate their discounted prices
  const products = await Product.find({ _id: { $in: productIds } });
  
  for (const product of products) {
    let newPrice = product.price; // Use base price, wait, if it was already discounted, maybe use mrp? 
    // Usually, discount is applied to `price`.
    if (offer.discountType === 'percentage') {
      newPrice = product.price - (product.price * (offer.discountValue / 100));
    } else if (offer.discountType === 'fixed') {
      newPrice = product.price - offer.discountValue;
    }
    
    if (newPrice < 0) newPrice = 0;
    
    product.offerPrice = Math.round(newPrice);
    product.activeOffer = offer._id;
    await product.save(); // using .save() triggers any pre-save hooks, though we just need to update it
  }
};

// @desc    Validate a coupon code
// @route   POST /api/offers/validate
// @access  Private
const validateCoupon = async (req, res) => {
  try {
    const { code, cartTotal } = req.body;
    
    if (!code) {
      return res.status(400).json({ message: 'Coupon code is required' });
    }

    const offer = await Offer.findOne({ code: code.toUpperCase(), isActive: true, type: 'coupon' });

    if (!offer) {
      return res.status(404).json({ message: 'Invalid or inactive coupon code' });
    }

    if (new Date() > new Date(offer.endDate)) {
      return res.status(400).json({ message: 'Coupon has expired' });
    }

    if (cartTotal < offer.minPurchaseAmount) {
      return res.status(400).json({ message: `Minimum purchase amount of ₹${offer.minPurchaseAmount} required` });
    }

    // Return the discount info
    res.json({
      _id: offer._id,
      code: offer.code,
      discountType: offer.discountType,
      discountValue: offer.discountValue,
      title: offer.title,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all offers
// @route   GET /api/offers
// @access  Private/Admin
const getOffers = async (req, res, next) => {
  try {
    const offers = await Offer.find({}).sort({ createdAt: -1 });
    res.json(offers);
  } catch (error) {
    next(error);
  }
};

// @desc    Create an offer
// @route   POST /api/offers
// @access  Private/Admin
const createOffer = async (req, res, next) => {
  try {
    const { title, description, code, type, discountType, discountValue, minPurchaseAmount, isActive, startDate, endDate, applicableProducts } = req.body;
    let image = null;

    if (req.file) {
      image = req.file.location;
    }

    const offer = new Offer({
      title,
      description,
      code: code ? code.toUpperCase() : undefined,
      type,
      discountType,
      discountValue,
      minPurchaseAmount,
      image,
      isActive: isActive !== undefined ? isActive : true,
      startDate: startDate || Date.now(),
      endDate: endDate || Date.now() + 30*24*60*60*1000, // default +30 days
      applicableProducts: type === 'sale' && applicableProducts ? JSON.parse(applicableProducts) : []
    });

    const createdOffer = await offer.save();
    
    // Apply to products if it's a sale
    if (createdOffer.type === 'sale') {
      await applyOfferToProducts(createdOffer, createdOffer.applicableProducts);
    }
    
    res.status(201).json(createdOffer);
  } catch (error) {
    next(error);
  }
};

// @desc    Update an offer
// @route   PUT /api/offers/:id
// @access  Private/Admin
const updateOffer = async (req, res, next) => {
  try {
    const offer = await Offer.findById(req.params.id);
    if (offer) {
      const { title, description, code, type, discountType, discountValue, minPurchaseAmount, isActive, startDate, endDate, applicableProducts } = req.body;
      
      offer.title = title || offer.title;
      offer.description = description !== undefined ? description : offer.description;
      offer.code = code ? code.toUpperCase() : offer.code;
      offer.type = type || offer.type;
      offer.discountType = discountType || offer.discountType;
      offer.discountValue = discountValue || offer.discountValue;
      offer.minPurchaseAmount = minPurchaseAmount !== undefined ? minPurchaseAmount : offer.minPurchaseAmount;
      offer.isActive = isActive !== undefined ? isActive : offer.isActive;
      offer.startDate = startDate || offer.startDate;
      offer.endDate = endDate || offer.endDate;
      
      if (type === 'sale' && applicableProducts) {
        offer.applicableProducts = JSON.parse(applicableProducts);
      }

      if (req.file) {
        offer.image = req.file.location;
      }

      const updatedOffer = await offer.save();
      
      // Update products
      await applyOfferToProducts(updatedOffer, updatedOffer.applicableProducts);
      
      res.json(updatedOffer);
    } else {
      res.status(404);
      throw new Error('Offer not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Delete an offer
// @route   DELETE /api/offers/:id
// @access  Private/Admin
const deleteOffer = async (req, res, next) => {
  try {
    const offer = await Offer.findById(req.params.id);
    if (offer) {
      await Product.updateMany(
        { activeOffer: offer._id },
        { $unset: { activeOffer: 1, offerPrice: 1 } }
      );
      await Offer.deleteOne({ _id: offer._id });
      res.json({ message: 'Offer removed' });
    } else {
      res.status(404);
      throw new Error('Offer not found');
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  validateCoupon,
  getOffers,
  createOffer,
  updateOffer,
  deleteOffer
};
