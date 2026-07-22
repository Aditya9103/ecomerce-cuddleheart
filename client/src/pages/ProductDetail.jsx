import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useGetProductBySlugQuery } from '../store/slices/productApiSlice';
import { useAddToCartMutation } from '../store/slices/cartApiSlice';
import { useToggleWishlistMutation, useGetWishlistQuery } from '../store/slices/wishlistApiSlice';
import toast from 'react-hot-toast';
import { ShoppingCart, Star, Heart, Loader2, MapPin, ShieldCheck, RefreshCw, Truck } from 'lucide-react';

const ProductDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { userInfo } = useSelector(state => state.auth);
  
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [pincode, setPincode] = useState('');
  const [pincodeMessage, setPincodeMessage] = useState({ type: '', text: '' });
  
  const { data: product, isLoading, error } = useGetProductBySlugQuery(slug);
  const [addToCart, { isLoading: isAdding }] = useAddToCartMutation();
  const [toggleWishlist, { isLoading: isToggling }] = useToggleWishlistMutation();
  const { data: wishlist } = useGetWishlistQuery(undefined, { skip: !userInfo });

  const isWishlisted = wishlist?.products?.some(p => p && p._id === product?._id);

  const handleAddToCart = async () => {
    if (!userInfo) {
      navigate('/login');
      return;
    }
    try {
      await addToCart({ productId: product._id, quantity: 1 }).unwrap();
      toast.success('Added to cart successfully');
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

  const handlePincodeCheck = (e) => {
    e.preventDefault();
    if (pincode.length === 6) {
      setPincodeMessage({ 
        type: 'success', 
        text: `Delivery is available to ${pincode}. Estimated delivery by ${new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString()}` 
      });
    } else {
      setPincodeMessage({ type: 'error', text: 'Please enter a valid 6-digit pincode.' });
    }
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center">Loading product...</div>;
  if (error || !product) return <div className="min-h-screen flex items-center justify-center">Product not found.</div>;

  const images = product.images?.length ? product.images : ['https://via.placeholder.com/600'];

  return (
    <div className="min-h-screen flex flex-col font-body bg-gray-50 text-gray-800 pb-20">
      
      {/* Breadcrumbs */}
      <div className="bg-white border-b border-gray-100 py-3 text-sm">
        <div className="container mx-auto px-4 flex gap-2 text-gray-500 font-medium">
          <span className="hover:text-primary cursor-pointer" onClick={() => navigate('/')}>Home</span>
          <span>/</span>
          <span className="hover:text-primary cursor-pointer" onClick={() => navigate('/shop')}>Shop</span>
          <span>/</span>
          <span className="hover:text-primary cursor-pointer" onClick={() => navigate(`/shop/${product.category?.slug}`)}>{product.category?.name}</span>
          <span>/</span>
          <span className="text-gray-900 truncate max-w-[200px]">{product.name}</span>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8">
        
        {/* Top Section: Gallery and Info */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-10 mb-8 flex flex-col lg:flex-row gap-12">
          
          {/* Image Gallery (Left Column) */}
          <div className="w-full lg:w-1/2 flex flex-col gap-4 sticky top-24 self-start">
            {/* Main Image */}
            <div className="w-full aspect-square bg-gray-50 rounded-2xl flex items-center justify-center overflow-hidden border border-gray-100 relative group cursor-zoom-in">
              <img 
                src={images[activeImageIndex]} 
                alt={product.name} 
                className="w-full h-full object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-110"
              />
              {product.activeOffer && (
                <div className="absolute top-4 left-4 bg-red-500 text-white text-xs font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-md">
                  {product.activeOffer.discountType === 'percentage' ? `${product.activeOffer.discountValue}% OFF` : `₹${product.activeOffer.discountValue} OFF`}
                </div>
              )}
            </div>
            
            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                {images.map((img, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${activeImageIndex === idx ? 'border-primary shadow-sm' : 'border-transparent hover:border-gray-200'}`}
                  >
                    <img src={img} alt={`${product.name} thumbnail`} className="w-full h-full object-cover bg-gray-50 mix-blend-multiply" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info (Right Column) */}
          <div className="w-full lg:w-1/2 flex flex-col">
            
            <h1 className="text-3xl md:text-4xl font-heading font-extrabold text-heading mb-2 leading-tight">
              {product.name}
            </h1>
            
            {/* Rating */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center bg-green-600 text-white px-2 py-0.5 rounded text-sm font-bold gap-1">
                {product.rating} <Star size={14} fill="currentColor" />
              </div>
              <span className="text-gray-500 font-medium text-sm">{product.reviewCount} Ratings & Reviews</span>
            </div>

            {/* Price */}
            <div className="flex items-end gap-4 mb-6">
              {product.activeOffer && product.offerPrice ? (
                <>
                  <span className="text-4xl font-extrabold text-gray-900">₹{product.offerPrice}</span>
                  <div className="flex flex-col mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-lg text-gray-400 line-through font-medium">₹{product.price}</span>
                      <span className="text-sm font-black text-green-600">
                        {product.activeOffer.discountType === 'percentage' ? `${product.activeOffer.discountValue}% off` : `₹${product.activeOffer.discountValue} off`}
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <span className="text-4xl font-extrabold text-gray-900">₹{product.price}</span>
                  <div className="flex flex-col mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-lg text-gray-400 line-through font-medium">₹{product.mrp}</span>
                      <span className="text-sm font-black text-green-600">{product.discountPercent}% off</span>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Highlights */}
            {product.highlights && product.highlights.length > 0 && (
              <div className="mb-8">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3">Highlights</h3>
                <ul className="flex flex-col gap-2">
                  {product.highlights.map((highlight, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-gray-700 font-medium">
                      <div className="mt-2 w-1.5 h-1.5 bg-gray-400 rounded-full shrink-0"></div>
                      <span>{highlight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Delivery / Pincode */}
            <div className="mb-8 border border-gray-200 rounded-2xl p-5 bg-white shadow-sm">
              <h3 className="flex items-center gap-2 font-bold text-gray-900 mb-4">
                <MapPin size={20} className="text-primary" /> Delivery Options
              </h3>
              <form onSubmit={handlePincodeCheck} className="flex gap-2">
                <input 
                  type="text" 
                  maxLength={6}
                  placeholder="Enter Pincode" 
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  className="flex-1 border-b-2 border-gray-200 focus:border-primary px-2 py-2 outline-none font-bold text-gray-700"
                />
                <button type="submit" className="font-bold text-primary hover:text-primary-dark uppercase text-sm tracking-wider px-4">
                  Check
                </button>
              </form>
              
              {pincodeMessage.text && (
                <div className={`mt-3 text-sm font-bold ${pincodeMessage.type === 'success' ? 'text-green-600' : 'text-red-500'}`}>
                  {pincodeMessage.text}
                </div>
              )}

              <div className="flex flex-col gap-3 mt-4 text-sm text-gray-600 font-medium">
                <div className="flex items-center gap-2"><Truck size={16} /> Get it by {new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString()}</div>
                <div className="flex items-center gap-2"><RefreshCw size={16} /> 7 Days Replacement Policy</div>
                <div className="flex items-center gap-2"><ShieldCheck size={16} /> Cash on Delivery available</div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4 mt-auto">
              <button 
                onClick={handleAddToCart}
                disabled={isAdding}
                className="flex-grow bg-primary text-white font-bold rounded-2xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 py-4 text-lg disabled:opacity-70 disabled:hover:translate-y-0"
              >
                {isAdding ? <Loader2 size={20} className="animate-spin" /> : <ShoppingCart size={20} />} 
                {isAdding ? 'Adding...' : 'Add to Cart'}
              </button>
              <button 
                onClick={handleToggleWishlist}
                disabled={isToggling}
                className="p-4 bg-gray-50 border border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-200 rounded-2xl transition-colors disabled:opacity-50"
              >
                <Heart size={24} fill={isWishlisted ? "currentColor" : "none"} className={isWishlisted ? "text-red-500" : ""} />
              </button>
            </div>
            
          </div>
        </div>

        {/* Bottom Section: Details & Specs */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          
          <div className="border-b border-gray-100 flex items-center p-6 bg-gray-50/50">
            <h2 className="text-xl font-heading font-extrabold text-gray-900">Product Details</h2>
          </div>
          
          <div className="p-6 md:p-10 flex flex-col lg:flex-row gap-12">
            
            {/* Description */}
            <div className="w-full lg:w-1/2">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Description</h3>
              <div className="text-gray-600 leading-relaxed font-medium space-y-4 whitespace-pre-line">
                {product.description || "The softest cuddly friend you'll ever have. Made with premium ultra-soft fabrics, perfect for kids and adults alike."}
              </div>
            </div>

            {/* Specifications */}
            <div className="w-full lg:w-1/2">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Specifications</h3>
              
              {product.specifications && product.specifications.length > 0 ? (
                <div className="border border-gray-100 rounded-xl overflow-hidden">
                  <table className="w-full text-sm font-medium text-left">
                    <tbody>
                      {product.specifications.map((spec, idx) => (
                        <tr key={idx} className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                          <th className="py-3 px-4 text-gray-500 font-medium border-r border-gray-100 w-1/3">{spec.name}</th>
                          <td className="py-3 px-4 text-gray-900 font-bold">{spec.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-gray-500 italic font-medium p-6 bg-gray-50 rounded-xl text-center">
                  No specifications provided.
                </div>
              )}
            </div>

          </div>
        </div>

      </main>

    </div>
  );
};

export default ProductDetail;
