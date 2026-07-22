const Product = require('../models/Product');
const Category = require('../models/Category');
const Banner = require('../models/Banner');

// @desc    Fetch all products with filtering, sorting, pagination
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res, next) => {
  try {
    const pageSize = Number(req.query.limit) || 12;
    const page = Number(req.query.page) || 1;

    const keyword = req.query.search ? {
      name: {
        $regex: req.query.search,
        $options: 'i',
      },
    } : {};

    const category = req.query.category ? { category: req.query.category } : {};
    const tag = req.query.tag ? { tags: req.query.tag } : {};
    
    // Multiple comma-separated selections
    const ageGroupFilter = req.query.ageGroup ? { ageGroup: { $in: req.query.ageGroup.split(',') } } : {};
    const genderFilter = req.query.gender ? { gender: { $in: req.query.gender.split(',') } } : {};
    
    // Price filter
    let priceFilter = {};
    if (req.query.minPrice || req.query.maxPrice) {
      const min = req.query.minPrice ? Number(req.query.minPrice) : 0;
      const max = req.query.maxPrice ? Number(req.query.maxPrice) : Number.MAX_SAFE_INTEGER;
      
      priceFilter = {
        $or: [
          { offerPrice: { $gte: min, $lte: max, $ne: null } },
          { offerPrice: null, price: { $gte: min, $lte: max } },
          { offerPrice: { $exists: false }, price: { $gte: min, $lte: max } }
        ]
      };
    }
    
    // Discount filter
    const discountFilter = req.query.minDiscount ? { discountPercent: { $gte: Number(req.query.minDiscount) } } : {};

    const offerFilter = req.query.offer ? { activeOffer: req.query.offer } : {};

    const query = { 
      ...keyword, 
      ...category, 
      ...tag, 
      ...ageGroupFilter,
      ...genderFilter,
      ...priceFilter, 
      ...discountFilter,
      ...offerFilter, 
      isActive: true 
    };

    // Sorting
    let sort = {};
    if (req.query.sort === 'price_asc') sort = { price: 1 };
    else if (req.query.sort === 'price_desc') sort = { price: -1 };
    else if (req.query.sort === 'newest') sort = { createdAt: -1 };
    else if (req.query.tag === 'bestseller') sort = { bestSellerRank: 1, rating: -1 };
    else sort = { createdAt: -1 }; // default

    const count = await Product.countDocuments(query);
    const products = await Product.find(query)
      .populate('category', 'name slug')
      .populate('activeOffer', 'title discountType discountValue type isActive')
      .sort(sort)
      .limit(pageSize)
      .skip(pageSize * (page - 1));

    res.json({ products, page, pages: Math.ceil(count / pageSize), total: count });
  } catch (error) {
    next(error);
  }
};

// @desc    Fetch single product by slug
// @route   GET /api/products/:slug
// @access  Public
const getProductBySlug = async (req, res, next) => {
  try {
    const param = req.params.slug;
    let query = { isActive: true };
    
    // Check if it's a valid MongoDB ObjectId
    if (param.match(/^[0-9a-fA-F]{24}$/)) {
      query._id = param;
    } else {
      query.slug = param;
    }

    const product = await Product.findOne(query)
      .populate('category', 'name slug')
      .populate('activeOffer', 'title discountType discountValue type isActive');
      
    if (product) {
      res.json(product);
    } else {
      res.status(404);
      throw new Error('Product not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Fetch all active categories
// @route   GET /api/categories
// @access  Public
const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({ displayOrder: 1 });
    // In a real app we might aggregate item counts here, but for now we just return categories
    res.json(categories);
  } catch (error) {
    next(error);
  }
};

// @desc    Fetch active banners
// @route   GET /api/banners
// @access  Public
const getBanners = async (req, res, next) => {
  try {
    const banners = await Banner.find({ isActive: true }).sort({ order: 1 });
    res.json(banners);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = async (req, res, next) => {
  try {
    const { name, description, price, mrp, category, stock, tags } = req.body;
    let highlights = [];
    let specifications = [];
    
    if (req.body.highlights) {
      try { highlights = JSON.parse(req.body.highlights); } catch (e) { highlights = []; }
    }
    if (req.body.specifications) {
      try { specifications = JSON.parse(req.body.specifications); } catch (e) { specifications = []; }
    }
    let images = [];

    if (req.files && req.files.length > 0) {
      images = req.files.map(file => file.location);
    }

    const product = new Product({
      name,
      slug: name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''),
      description,
      price,
      mrp,
      category,
      stock,
      highlights,
      specifications,
      images,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    next(error);
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      const { name, description, price, mrp, category, stock, tags } = req.body;
      
      product.name = name || product.name;
      if (name) {
        product.slug = name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
      }
      product.description = description || product.description;
      product.price = price || product.price;
      product.mrp = mrp || product.mrp;
      product.category = category || product.category;
      product.stock = stock !== undefined ? stock : product.stock;
      if (tags !== undefined) {
        product.tags = tags ? tags.split(',').map(tag => tag.trim()).filter(Boolean) : [];
      }
      
      if (req.body.highlights !== undefined) {
        try { product.highlights = JSON.parse(req.body.highlights); } catch (e) { /* ignore */ }
      }
      if (req.body.specifications !== undefined) {
        try { product.specifications = JSON.parse(req.body.specifications); } catch (e) { /* ignore */ }
      }

      if (req.files && req.files.length > 0) {
        const newImages = req.files.map(file => file.location);
        product.images = [...product.images, ...newImages];
      }

      const updatedProduct = await product.save();
      res.json(updatedProduct);
    } else {
      res.status(404);
      throw new Error('Product not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      await Product.deleteOne({ _id: product._id });
      res.json({ message: 'Product removed' });
    } else {
      res.status(404);
      throw new Error('Product not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Create a banner
// @route   POST /api/banners
// @access  Private/Admin
const createBanner = async (req, res, next) => {
  try {
    const { 
      eyebrow, heading, highlightWord, subtext, discountBadgeText, 
      ctaPrimaryText, ctaPrimaryLink, ctaSecondaryText, ctaSecondaryLink, 
      order, isActive 
    } = req.body;
    let image = null;
    
    if (req.file) {
      image = req.file.location;
    }

    const banner = new Banner({
      eyebrow, 
      heading, 
      highlightWord, 
      subtext, 
      discountBadgeText, 
      ctaPrimaryText, 
      ctaPrimaryLink, 
      ctaSecondaryText, 
      ctaSecondaryLink,
      image,
      order: order || 0,
      isActive: isActive !== undefined ? isActive : true,
    });

    const createdBanner = await banner.save();
    res.status(201).json(createdBanner);
  } catch (error) {
    next(error);
  }
};

// @desc    Update a banner
// @route   PUT /api/banners/:id
// @access  Private/Admin
const updateBanner = async (req, res, next) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (banner) {
      const { 
        eyebrow, heading, highlightWord, subtext, discountBadgeText, 
        ctaPrimaryText, ctaPrimaryLink, ctaSecondaryText, ctaSecondaryLink, 
        order, isActive 
      } = req.body;
      
      if (eyebrow !== undefined) banner.eyebrow = eyebrow;
      if (heading !== undefined) banner.heading = heading;
      if (highlightWord !== undefined) banner.highlightWord = highlightWord;
      if (subtext !== undefined) banner.subtext = subtext;
      if (discountBadgeText !== undefined) banner.discountBadgeText = discountBadgeText;
      if (ctaPrimaryText !== undefined) banner.ctaPrimaryText = ctaPrimaryText;
      if (ctaPrimaryLink !== undefined) banner.ctaPrimaryLink = ctaPrimaryLink;
      if (ctaSecondaryText !== undefined) banner.ctaSecondaryText = ctaSecondaryText;
      if (ctaSecondaryLink !== undefined) banner.ctaSecondaryLink = ctaSecondaryLink;
      
      banner.order = order !== undefined ? order : banner.order;
      banner.isActive = isActive !== undefined ? isActive : banner.isActive;

      if (req.file) {
        banner.image = req.file.location;
      }

      const updatedBanner = await banner.save();
      res.json(updatedBanner);
    } else {
      res.status(404);
      throw new Error('Banner not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a banner
// @route   DELETE /api/banners/:id
// @access  Private/Admin
const deleteBanner = async (req, res, next) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (banner) {
      await Banner.deleteOne({ _id: banner._id });
      res.json({ message: 'Banner removed' });
    } else {
      res.status(404);
      throw new Error('Banner not found');
    }
  } catch (error) {
    next(error);
  }
};

module.exports = { 
  getProducts, 
  getProductBySlug, 
  getCategories, 
  getBanners,
  createProduct,
  updateProduct,
  deleteProduct,
  createBanner,
  updateBanner,
  deleteBanner
};
