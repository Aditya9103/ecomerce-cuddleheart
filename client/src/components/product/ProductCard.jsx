import { Heart, ShoppingCart, Star, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useAddToCartMutation } from '../../store/slices/cartApiSlice';
import { addToGuestCart } from '../../store/slices/cartSlice';
import { useToggleWishlistMutation, useGetWishlistQuery } from '../../store/slices/wishlistApiSlice';

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { userInfo } = useSelector(state => state.auth);
  const [addToCart, { isLoading }] = useAddToCartMutation();
  const [toggleWishlist, { isLoading: isToggling }] = useToggleWishlistMutation();
  const { data: wishlist } = useGetWishlistQuery(undefined, { skip: !userInfo });

  const isWishlisted = wishlist?.products?.some(p => p && p._id === product._id);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    if (!userInfo) {
      navigate('/login');
      return;
    }
    await addToCart({ productId: product._id, quantity: 1 });
  };

  const handleToggleWishlist = async (e) => {
    e.preventDefault();
    if (!userInfo) {
      navigate('/login');
      return;
    }
    await toggleWishlist({ productId: product._id });
  };
  return (
    <div className="card-soft relative group flex flex-col h-full overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500 bg-white rounded-3xl">
      {/* Top badges */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1">
        {product.activeOffer && product.offerPrice && (
          <div className="bg-red-500 text-white text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-widest shadow-sm">
            {product.activeOffer.title}
          </div>
        )}
        {product.tags?.includes('bestseller') && !product.activeOffer && (
          <div className="bg-primary text-white text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-widest shadow-sm">
            Best Seller
          </div>
        )}
      </div>

      {/* Wishlist toggle */}
      <button 
        onClick={handleToggleWishlist}
        disabled={isToggling}
        className="absolute top-3 right-3 z-10 p-2 bg-white/60 hover:bg-white/95 backdrop-blur-md rounded-full shadow-sm text-gray-400 hover:text-primary transition-all disabled:opacity-50 border border-white/50"
      >
        <Heart size={18} fill={isWishlisted ? "currentColor" : "none"} className={isWishlisted ? "text-primary" : ""} />
      </button>

      {/* Image */}
      <Link to={`/product/${product.slug}`} className="block flex-grow bg-gradient-to-br from-pink-50/50 via-purple-50/30 to-orange-50/40 flex items-center justify-center p-8 relative overflow-hidden group-hover:bg-opacity-80 transition-colors">
        <img 
          src={product.images?.[0] || 'https://via.placeholder.com/300'} 
          alt={product.name} 
          className="w-full h-40 object-contain drop-shadow-sm group-hover:scale-110 transition-transform duration-500"
        />
      </Link>

      {/* Content */}
      <div className="p-5 flex flex-col flex-grow bg-white">
        <Link to={`/product/${product.slug}`}>
          <h4 className="font-heading font-bold text-gray-900 text-base mb-1 hover:text-primary transition-colors line-clamp-2 leading-tight">
            {product.name}
          </h4>
        </Link>
        
        {/* Rating */}
        <div className="flex items-center gap-1 mb-3 mt-auto">
          <div className="flex text-star">
            <Star size={12} fill="currentColor" />
            <Star size={12} fill="currentColor" />
            <Star size={12} fill="currentColor" />
            <Star size={12} fill="currentColor" />
            <Star size={12} fill="currentColor" className="text-gray-300" />
          </div>
          <span className="text-xs text-textMuted font-medium">({product.rating})</span>
        </div>

        {/* Price & Action */}
        <div className="flex items-end justify-between mt-2">
          <div>
            {product.activeOffer && product.offerPrice ? (
              <>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-extrabold text-lg text-gray-900 tracking-tight">₹{product.offerPrice}</span>
                  <span className="text-xs text-gray-400 line-through font-medium">₹{product.price}</span>
                </div>
                <span className="text-[10px] font-extrabold text-red-600 bg-red-100 px-2 py-1 rounded-md">
                  {product.activeOffer.discountType === 'percentage' ? `${product.activeOffer.discountValue}% OFF` : `₹${product.activeOffer.discountValue} OFF`}
                </span>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-extrabold text-lg text-gray-900 tracking-tight">₹{product.price}</span>
                  <span className="text-xs text-gray-400 line-through font-medium">₹{product.mrp}</span>
                </div>
                <span className="text-[10px] font-extrabold text-primary bg-primary/10 px-2 py-1 rounded-md">{product.discountPercent}% OFF</span>
              </>
            )}
          </div>
          
          <button 
            onClick={handleAddToCart}
            disabled={isLoading}
            className="bg-gray-900 hover:bg-primary text-white p-2.5 rounded-full shadow-md transition-all transform active:scale-95 disabled:opacity-70 flex items-center justify-center hover:shadow-primary/30 group-hover:-translate-y-1"
          >
            {isLoading ? <Loader2 size={18} className="animate-spin" /> : <ShoppingCart size={18} />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
