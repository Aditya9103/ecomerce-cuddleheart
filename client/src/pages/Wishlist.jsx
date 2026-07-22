import { Link } from 'react-router-dom';
import { useGetWishlistQuery, useToggleWishlistMutation } from '../store/slices/wishlistApiSlice';
import ProductCard from '../components/product/ProductCard';

const Wishlist = () => {
  const { data: wishlist, isLoading, error } = useGetWishlistQuery();
  const [toggleWishlist] = useToggleWishlistMutation();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <p className="text-red-500">Error loading wishlist: {error?.data?.message || 'Something went wrong'}</p>
      </div>
    );
  }

  const products = (wishlist?.products || []).filter(p => p !== null);

  return (
    <div className="min-h-screen flex flex-col font-body bg-gray-50 text-gray-800">
      <main className="flex-grow container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-heading text-heading">My Wishlist</h1>
        <span className="text-textMuted">{products.length} {products.length === 1 ? 'Item' : 'Items'}</span>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-16 bg-cream rounded-2xl">
          <svg className="w-16 h-16 text-primary/50 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
          </svg>
          <h2 className="text-2xl font-heading text-heading mb-2">Your wishlist is empty</h2>
          <p className="text-textMuted mb-6">Explore our cute friends and add your favorites here!</p>
          <Link
            to="/shop"
            className="inline-block bg-primary text-white font-medium py-3 px-8 rounded-full hover:bg-primary-dark transition"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <div key={product._id} className="relative">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
        )}
      </main>
    </div>
  );
};

export default Wishlist;
