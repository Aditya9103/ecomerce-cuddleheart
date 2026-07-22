import { useParams, Link } from 'react-router-dom';
import { useGetProductsQuery, useGetCategoriesQuery } from '../store/slices/productApiSlice';
import ProductCard from '../components/product/ProductCard';

const CategoryPage = () => {
  const { categorySlug } = useParams();

  // Find category ID from slug (since our API expects ID, not slug currently, 
  // or we need to update the backend to accept slug. Let's do client-side lookup for now).
  const { data: categoriesData } = useGetCategoriesQuery();
  const category = categoriesData?.find(c => c.slug === categorySlug);

  const { data, isLoading } = useGetProductsQuery(
    { category: category?._id },
    { skip: !category } // Don't fetch products until we know the category ID
  );

  const products = data?.products || [];

  if (categoriesData && !category) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-heading text-heading mb-4">Category Not Found</h2>
        <Link to="/shop" className="text-primary hover:underline">Return to Shop</Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Category Header */}
      <div
        className="rounded-3xl p-10 mb-10 text-center flex flex-col items-center justify-center min-h-[250px] relative overflow-hidden shadow-sm border border-white"
        style={{ background: `linear-gradient(135deg, ${category?.bgColor || '#FCE7F3'} 0%, white 100%)` }}
      >
        <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_center,_white_0%,_transparent_100%)]"></div>
        <h1 className="text-5xl font-heading font-extrabold text-gray-900 mb-4 relative z-10 drop-shadow-sm">{category?.name}</h1>
        <p className="text-gray-600 max-w-2xl mx-auto text-lg relative z-10">
          Explore our premium collection of cuddly {category?.name?.toLowerCase()}.
        </p>
      </div>

      {/* Product Grid Header */}
      <div className="flex justify-between items-center mb-8 px-2">
        <span className="text-gray-900 font-extrabold text-lg tracking-tight">Collection</span>
        <span className="text-primary bg-primary/10 px-4 py-1.5 rounded-full font-bold text-sm shadow-sm">{products.length} Items</span>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="animate-pulse bg-white rounded-3xl p-4 h-[350px] border border-gray-100 flex flex-col">
              <div className="w-full h-40 bg-gray-100 rounded-2xl mb-4"></div>
              <div className="h-4 bg-gray-100 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-100 rounded w-1/2 mb-4"></div>
              <div className="mt-auto h-10 bg-gray-100 rounded-full w-full"></div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 bg-white border border-gray-100 shadow-sm rounded-3xl">
          <div className="text-6xl mb-4">🧸</div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">No products found</h3>
          <p className="text-gray-500 mb-6">We couldn't find any soft toys in this category.</p>
          <Link to="/shop" className="inline-block bg-primary hover:bg-primary-dark text-white px-8 py-3 rounded-full font-bold transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5">
            Browse All Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {products.map(product => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoryPage;
