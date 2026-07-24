import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useGetProductBySlugQuery, useCreateProductReviewMutation } from '../store/slices/productApiSlice';
import { useAddToCartMutation } from '../store/slices/cartApiSlice';
import { useToggleWishlistMutation, useGetWishlistQuery } from '../store/slices/wishlistApiSlice';
import { useGetMyOrdersQuery } from '../store/slices/orderApiSlice';
import toast from 'react-hot-toast';
import { ShoppingCart, Star, Heart, Loader2, MapPin, ShieldCheck, RefreshCw, Truck, Minus, Plus, CheckCircle2, XCircle } from 'lucide-react';
import { fetchPincodeDetails } from '../utils/pincode';

const ProductDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { userInfo } = useSelector(state => state.auth);

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [pincode, setPincode] = useState('');
  const [pincodeMessage, setPincodeMessage] = useState({ type: '', text: '' });
  const [quantity, setQuantity] = useState(1);

  const { data: product, isLoading, error } = useGetProductBySlugQuery(slug);
  const [addToCart, { isLoading: isAdding }] = useAddToCartMutation();
  const [toggleWishlist, { isLoading: isToggling }] = useToggleWishlistMutation();
  const [createReview, { isLoading: isReviewing }] = useCreateProductReviewMutation();
  const { data: wishlist } = useGetWishlistQuery(undefined, { skip: !userInfo });
  const { data: orders } = useGetMyOrdersQuery(undefined, { skip: !userInfo });

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');

  const isWishlisted = wishlist?.products?.some(p => p && p._id === product?._id);
  const location = useLocation();

  const hasPurchasedAndDelivered = orders?.some(order =>
    (order.orderStatus?.toLowerCase() === 'delivered' || order.status?.toLowerCase() === 'delivered') &&
    order.items?.some(item => item.product === product?._id)
  );

  useEffect(() => {
    if (!isLoading && product && location.hash === '#reviews') {
      const element = document.getElementById('reviews');
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }
  }, [isLoading, product, location]);

  // Reset quantity when the product changes
  useEffect(() => {
    setQuantity(1);
  }, [product?._id]);

  // Stock (gracefully handles products without stock tracking)
  const stockCount = product?.stock ?? product?.countInStock;
  const isTrackingStock = stockCount !== undefined && stockCount !== null;
  const inStock = isTrackingStock ? stockCount > 0 : true;
  const isLowStock = isTrackingStock && stockCount > 0 && stockCount <= 5;
  const maxQty = isTrackingStock ? Math.min(stockCount, 10) : 10;

  // Rating breakdown, computed from actual reviews when available
  const ratingBreakdown = useMemo(() => {
    const reviews = product?.reviews || [];
    const total = reviews.length;
    return [5, 4, 3, 2, 1].map((star) => {
      const count = reviews.filter((r) => Math.round(r.rating) === star).length;
      return { star, count, pct: total ? Math.round((count / total) * 100) : 0 };
    });
  }, [product?.reviews]);

  const handleAddToCart = async () => {
    if (!userInfo) {
      navigate('/login');
      return;
    }
    try {
      await addToCart({ productId: product._id, quantity }).unwrap();
      toast.success(`Added ${quantity > 1 ? `${quantity} items` : 'item'} to cart`);
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to add to cart');
    }
  };

  const handleToggleWishlist = async () => {
    if (!userInfo) {
      navigate('/login');
      return;
    }
    await toggleWishlist({ productId: product._id });
  };

  const handlePincodeCheck = async (e) => {
    e.preventDefault();
    if (pincode.length === 6 && /^\d+$/.test(pincode)) {
      setPincodeMessage({ type: 'info', text: 'Checking delivery availability...' });
      
      const details = await fetchPincodeDetails(pincode);
      
      if (details.success) {
        setPincodeMessage({
          type: 'success',
          text: `Delivery available to ${details.city}, ${details.state}. Estimated by ${new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`
        });
      } else {
        setPincodeMessage({ type: 'error', text: 'Sorry, we do not deliver to this pincode.' });
      }
    } else {
      setPincodeMessage({ type: 'error', text: 'Please enter a valid 6-digit pincode.' });
    }
  };

  const submitReviewHandler = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error('Please select a star rating');
      return;
    }
    if (!comment.trim()) {
      toast.error('Please enter a comment');
      return;
    }
    try {
      await createReview({
        productId: product._id,
        rating,
        comment
      }).unwrap();
      toast.success('Review submitted successfully!');
      setRating(0);
      setComment('');
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to submit review');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center gap-2 text-gray-500">
        <Loader2 size={20} className="animate-spin" /> Loading product...
      </div>
    );
  }
  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 text-center px-4">
        <p className="text-lg font-semibold text-gray-900">Product not found</p>
        <button onClick={() => navigate('/shop')} className="text-primary font-semibold text-sm hover:underline">
          Back to shop
        </button>
      </div>
    );
  }

  const images = product.images?.length ? product.images : ['https://via.placeholder.com/600'];
  const displayPrice = product.activeOffer && product.offerPrice ? product.offerPrice : product.price;
  const strikePrice = product.activeOffer && product.offerPrice ? product.price : product.mrp;
  const discountLabel = product.activeOffer
    ? (product.activeOffer.discountType === 'percentage' ? `${product.activeOffer.discountValue}% off` : `₹${product.activeOffer.discountValue} off`)
    : (product.discountPercent ? `${product.discountPercent}% off` : null);

  return (
    <div className="min-h-screen flex flex-col font-body bg-gray-50 text-gray-800 pb-24 lg:pb-16">

      {/* Breadcrumbs */}
      <div className="bg-white border-b border-gray-100 py-3 text-sm">
        <div className="container mx-auto px-4 flex flex-wrap items-center gap-2 text-gray-500">
          <span className="hover:text-primary cursor-pointer shrink-0" onClick={() => navigate('/')}>Home</span>
          <span className="shrink-0 text-gray-300">/</span>
          <span className="hover:text-primary cursor-pointer shrink-0" onClick={() => navigate('/shop')}>Shop</span>
          <span className="shrink-0 text-gray-300">/</span>
          <span className="hover:text-primary cursor-pointer shrink-0" onClick={() => navigate(`/shop/${product.category?.slug}`)}>{product.category?.name}</span>
          <span className="shrink-0 text-gray-300">/</span>
          <span className="text-gray-900 font-medium truncate max-w-[150px] sm:max-w-[280px]">{product.name}</span>
        </div>
      </div>

      <main className="container mx-auto px-4 py-6 lg:py-8">

        {/* Top Section: Gallery and Info */}
        <div className="bg-white rounded-2xl border border-gray-200 p-4 md:p-6 lg:p-8 mb-6 flex flex-col lg:flex-row gap-8 lg:gap-10">

          {/* Image Gallery (Left Column) */}
          <div className="w-full lg:w-2/5 flex flex-col gap-3 lg:sticky lg:top-24 self-start">
            <div className="w-full aspect-square bg-white rounded-xl flex items-center justify-center overflow-hidden border border-gray-100 relative group cursor-zoom-in">
              <img
                src={images[activeImageIndex]}
                alt={product.name}
                className="w-full h-full object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-110"
              />
              {discountLabel && (
                <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-md">
                  {discountLabel}
                </div>
              )}
              {images.length > 1 && (
                <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs font-medium px-2 py-0.5 rounded-full">
                  {activeImageIndex + 1}/{images.length}
                </div>
              )}
            </div>

            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    aria-label={`View image ${idx + 1}`}
                    className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${activeImageIndex === idx ? 'border-primary' : 'border-gray-200 hover:border-gray-300'}`}
                  >
                    <img src={img} alt={`${product.name} thumbnail ${idx + 1}`} className="w-full h-full object-cover bg-gray-50 mix-blend-multiply" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info (Right Column) */}
          <div className="w-full lg:w-3/5 flex flex-col">

            {product.category?.name && (
              <span className="text-xs font-semibold text-primary uppercase tracking-wide mb-2">{product.category.name}</span>
            )}

            <h1 className="text-2xl md:text-3xl font-heading font-extrabold text-gray-900 mb-3 leading-snug">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-3 mb-5">
              <div className="flex items-center bg-green-600 text-white px-2 py-0.5 rounded text-sm font-bold gap-1">
                {product.rating?.toFixed ? product.rating.toFixed(1) : product.rating} <Star size={13} fill="currentColor" />
              </div>
              <a href="#reviews" className="text-gray-500 text-sm hover:text-primary hover:underline">
                {product.reviewCount || 0} Ratings &amp; Reviews
              </a>
            </div>

            {/* Price */}
            <div className="flex flex-wrap items-end gap-3 mb-1">
              <span className="text-3xl md:text-4xl font-extrabold text-gray-900">₹{displayPrice}</span>
              {strikePrice && strikePrice !== displayPrice && (
                <span className="text-base text-gray-400 line-through mb-1">₹{strikePrice}</span>
              )}
              {discountLabel && (
                <span className="text-sm font-bold text-green-600 mb-1">{discountLabel}</span>
              )}
            </div>
            <p className="text-xs text-gray-400 mb-5">Inclusive of all taxes</p>

            {/* Stock status */}
            {isTrackingStock && (
              <div className="mb-5">
                {inStock ? (
                  <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-green-700">
                    <CheckCircle2 size={16} /> In Stock{isLowStock ? ` — only ${stockCount} left` : ''}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-red-600">
                    <XCircle size={16} /> Out of Stock
                  </span>
                )}
              </div>
            )}

            {/* Highlights */}
            {product.highlights && product.highlights.length > 0 && (
              <div className="mb-6">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Highlights</h3>
                <ul className="flex flex-col gap-2">
                  {product.highlights.map((highlight, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                      <div className="mt-1.5 w-1.5 h-1.5 bg-primary rounded-full shrink-0"></div>
                      <span>{highlight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Quantity selector */}
            {inStock && (
              <div className="flex items-center gap-4 mb-6">
                <span className="text-sm font-semibold text-gray-700">Quantity</span>
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    className="p-2.5 text-gray-500 hover:text-gray-900 disabled:opacity-30 disabled:hover:text-gray-500"
                    aria-label="Decrease quantity"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-8 text-center text-sm font-bold text-gray-900">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.min(maxQty, q + 1))}
                    disabled={quantity >= maxQty}
                    className="p-2.5 text-gray-500 hover:text-gray-900 disabled:opacity-30 disabled:hover:text-gray-500"
                    aria-label="Increase quantity"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            )}

            {/* Delivery / Pincode */}
            <div className="mb-6 border border-gray-200 rounded-xl p-5 bg-gray-50/60">
              <h3 className="flex items-center gap-2 text-sm font-bold text-gray-900 mb-3">
                <MapPin size={17} className="text-primary" /> Check Delivery
              </h3>
              <form onSubmit={handlePincodeCheck} className="flex gap-2">
                <input
                  type="text"
                  maxLength={6}
                  placeholder="Enter pincode"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                  className="flex-1 bg-white border border-gray-300 rounded-lg px-3 py-2.5 text-sm font-medium outline-none focus:border-primary transition-colors"
                />
                <button type="submit" className="font-semibold text-primary hover:text-primary-dark text-sm px-4 rounded-lg border border-primary/30 hover:bg-primary/5 transition-colors">
                  Check
                </button>
              </form>

              {pincodeMessage.text && (
                <div className={`mt-3 text-xs font-semibold ${pincodeMessage.type === 'success' ? 'text-green-600' : pincodeMessage.type === 'info' ? 'text-blue-500' : 'text-red-500'}`}>
                  {pincodeMessage.text}
                </div>
              )}

              <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-gray-200">
                <div className="flex flex-col items-center text-center gap-1.5">
                  <Truck size={18} className="text-gray-500" />
                  <span className="text-[11px] leading-tight text-gray-600">
                    By {new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </span>
                </div>
                <div className="flex flex-col items-center text-center gap-1.5">
                  <RefreshCw size={18} className="text-gray-500" />
                  <span className="text-[11px] leading-tight text-gray-600">7 Day Replacement</span>
                </div>
                <div className="flex flex-col items-center text-center gap-1.5">
                  <ShieldCheck size={18} className="text-gray-500" />
                  <span className="text-[11px] leading-tight text-gray-600">Cash on Delivery</span>
                </div>
              </div>
            </div>

            {/* Actions (desktop / tablet) */}
            <div className="hidden lg:flex items-center gap-3 mt-auto">
              <button
                onClick={handleAddToCart}
                disabled={isAdding || !inStock}
                className="flex-grow bg-primary text-white font-bold rounded-xl shadow-sm hover:bg-primary-dark transition-colors flex items-center justify-center gap-2 py-3.5 text-base disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAdding ? <Loader2 size={18} className="animate-spin" /> : <ShoppingCart size={18} />}
                {isAdding ? 'Adding...' : !inStock ? 'Out of Stock' : 'Add to Cart'}
              </button>
              <button
                onClick={handleToggleWishlist}
                disabled={isToggling}
                className="p-3.5 bg-white border border-gray-300 text-gray-400 hover:text-red-500 hover:border-red-200 rounded-xl transition-colors disabled:opacity-50"
                aria-label="Toggle wishlist"
              >
                <Heart size={20} fill={isWishlisted ? 'currentColor' : 'none'} className={isWishlisted ? 'text-red-500' : ''} />
              </button>
            </div>

          </div>
        </div>

        {/* Bottom Section: Details & Specs */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden mb-6">

          <div className="border-b border-gray-100 flex items-center px-6 py-4">
            <h2 className="text-lg font-heading font-bold text-gray-900">Product Details</h2>
          </div>

          <div className="p-5 md:p-8 flex flex-col lg:flex-row gap-8 lg:gap-12">

            {/* Description */}
            <div className="w-full lg:w-1/2">
              <h3 className="text-sm font-bold text-gray-900 mb-3">Description</h3>
              <div className="text-sm text-gray-600 leading-relaxed space-y-4 whitespace-pre-line">
                {product.description || "The softest cuddly friend you'll ever have. Made with premium ultra-soft fabrics, perfect for kids and adults alike."}
              </div>
            </div>

            {/* Specifications */}
            <div className="w-full lg:w-1/2">
              <h3 className="text-sm font-bold text-gray-900 mb-3">Specifications</h3>

              {(() => {
                const allSpecs = [];
                if (product.size) allSpecs.push({ name: 'Size', value: product.size });
                if (product.ageGroup) allSpecs.push({ name: 'Age Group', value: product.ageGroup });
                if (product.gender) allSpecs.push({ name: 'Gender', value: product.gender });

                if (product.specifications && product.specifications.length > 0) {
                  allSpecs.push(...product.specifications);
                }

                if (allSpecs.length > 0) {
                  return (
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <table className="w-full text-sm text-left">
                        <tbody>
                          {allSpecs.map((spec, idx) => (
                            <tr key={idx} className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                              <th className="py-2.5 px-4 text-gray-500 font-medium border-r border-gray-100 w-1/3">{spec.name}</th>
                              <td className="py-2.5 px-4 text-gray-900 font-semibold">{spec.value}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  );
                }

                return (
                  <div className="text-gray-500 text-sm p-5 bg-gray-50 rounded-lg text-center">
                    No specifications provided.
                  </div>
                );
              })()}
            </div>

          </div>
        </div>

        {/* Reviews Section */}
        <div id="reviews" className="bg-white rounded-2xl border border-gray-200 overflow-hidden scroll-mt-24">
          <div className="border-b border-gray-100 flex items-center px-6 py-4">
            <h2 className="text-lg font-heading font-bold text-gray-900">Customer Reviews</h2>
          </div>

          <div className="p-5 md:p-8 flex flex-col lg:flex-row gap-8 lg:gap-12">
            {/* Reviews List */}
            <div className="w-full lg:w-1/2 flex flex-col gap-5">

              {/* Rating summary */}
              {product.reviews && product.reviews.length > 0 && (
                <div className="flex items-center gap-6 pb-5 border-b border-gray-100">
                  <div className="text-center shrink-0">
                    <p className="text-4xl font-extrabold text-gray-900">
                      {product.rating?.toFixed ? product.rating.toFixed(1) : product.rating}
                    </p>
                    <div className="flex items-center gap-0.5 justify-center mt-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} size={13} className={s <= Math.round(product.rating) ? 'text-yellow-400' : 'text-gray-200'} fill="currentColor" />
                      ))}
                    </div>
                    <p className="text-xs text-gray-400 mt-1">{product.reviewCount || product.reviews.length} reviews</p>
                  </div>
                  <div className="flex-1 flex flex-col gap-1.5">
                    {ratingBreakdown.map(({ star, count, pct }) => (
                      <div key={star} className="flex items-center gap-2 text-xs text-gray-500">
                        <span className="w-3 shrink-0">{star}</span>
                        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="w-6 text-right shrink-0">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {product.reviews && product.reviews.length === 0 ? (
                <div className="p-8 bg-gray-50 rounded-xl text-center border border-dashed border-gray-200">
                  <Star size={32} className="mx-auto text-gray-300 mb-3" />
                  <h3 className="text-base font-bold text-gray-900 mb-1">No Reviews Yet</h3>
                  <p className="text-gray-500 text-sm">Be the first to share your thoughts about this product!</p>
                </div>
              ) : (
                <div className="flex flex-col gap-4 max-h-[600px] overflow-y-auto pr-2">
                  {product.reviews && product.reviews.map((review) => (
                    <div key={review._id} className="p-4 bg-white border border-gray-100 rounded-xl">
                      <div className="flex items-center justify-between mb-2.5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center font-bold text-primary text-sm">
                            {review.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 text-sm">{review.name}</p>
                            <p className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 bg-green-50 text-green-700 px-2 py-0.5 rounded text-xs font-bold">
                          {review.rating} <Star size={12} fill="currentColor" />
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm leading-relaxed">{review.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Write a Review Form */}
            <div className="w-full lg:w-1/2">
              {hasPurchasedAndDelivered ? (
                <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
                  <h3 className="text-base font-bold text-gray-900 mb-4">Write a Review</h3>

                  {userInfo ? (
                    product.reviews?.some(r => r.user === userInfo._id) ? (
                      <div className="p-4 bg-green-50 text-green-700 text-sm rounded-lg border border-green-100">
                        You have already submitted a review for this product. Thank you for your feedback!
                      </div>
                    ) : (
                      <form onSubmit={submitReviewHandler} className="flex flex-col gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Your Rating</label>
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                className="p-1 transition-transform hover:scale-110 focus:outline-none"
                                onClick={() => setRating(star)}
                                onMouseEnter={() => setHoverRating(star)}
                                onMouseLeave={() => setHoverRating(0)}
                              >
                                <Star
                                  size={28}
                                  className={`transition-colors ${(hoverRating || rating) >= star ? 'text-yellow-400' : 'text-gray-300'}`}
                                  fill={(hoverRating || rating) >= star ? 'currentColor' : 'none'}
                                />
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Your Comment</label>
                          <textarea
                            rows="4"
                            className="w-full bg-white border border-gray-200 rounded-lg p-3 outline-none focus:border-primary transition-colors text-sm"
                            placeholder="What did you like or dislike about this product?"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                          ></textarea>
                        </div>

                        <button
                          type="submit"
                          disabled={isReviewing}
                          className="w-full bg-primary text-white font-semibold py-3 rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-70 flex justify-center items-center gap-2 mt-1 text-sm"
                        >
                          {isReviewing ? <Loader2 size={16} className="animate-spin" /> : null}
                          {isReviewing ? 'Submitting...' : 'Submit Review'}
                        </button>
                      </form>
                    )
                  ) : (
                    <div className="p-5 bg-white border border-gray-200 rounded-lg text-center">
                      <p className="text-gray-600 text-sm mb-4">You must be logged in to leave a review.</p>
                      <button
                        onClick={() => navigate('/login')}
                        className="px-5 py-2 bg-primary/10 text-primary font-semibold text-sm rounded-lg hover:bg-primary hover:text-white transition-colors"
                      >
                        Log in to Review
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-5 bg-gray-50 border border-gray-100 rounded-xl text-center">
                  <p className="text-gray-500 text-sm">Reviews can only be submitted by verified customers who have received their order.</p>
                </div>
              )}
            </div>
          </div>
        </div>

      </main>

      {/* Sticky mobile buy bar */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-gray-200 px-4 py-3 flex items-center gap-3 shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
        <div className="shrink-0">
          <p className="text-lg font-extrabold text-gray-900 leading-none">₹{displayPrice}</p>
          {strikePrice && strikePrice !== displayPrice && (
            <p className="text-xs text-gray-400 line-through leading-none mt-1">₹{strikePrice}</p>
          )}
        </div>
        <button
          onClick={handleToggleWishlist}
          disabled={isToggling}
          className="p-3 bg-gray-50 border border-gray-200 text-gray-400 rounded-xl shrink-0 disabled:opacity-50"
          aria-label="Toggle wishlist"
        >
          <Heart size={20} fill={isWishlisted ? 'currentColor' : 'none'} className={isWishlisted ? 'text-red-500' : ''} />
        </button>
        <button
          onClick={handleAddToCart}
          disabled={isAdding || !inStock}
          className="flex-1 bg-primary text-white font-bold rounded-xl py-3 text-sm flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isAdding ? <Loader2 size={16} className="animate-spin" /> : <ShoppingCart size={16} />}
          {isAdding ? 'Adding...' : !inStock ? 'Out of Stock' : 'Add to Cart'}
        </button>
      </div>

    </div>
  );
};

export default ProductDetail;