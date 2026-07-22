import ProductCard from '../product/ProductCard';
import { Link } from 'react-router-dom';
import { useGetProductsQuery } from '../../store/slices/productApiSlice';

const BestSellers = () => {
  const { data, isLoading, error } = useGetProductsQuery({ tag: 'bestseller', limit: 5 });

  if (isLoading) return <div className="container mx-auto px-4 py-12 text-center">Loading best sellers...</div>;
  if (error) return null;

  const products = data?.products || [];

  if (products.length === 0) return null;
  return (
    <section className="container mx-auto px-4 py-12">
      <div className="flex justify-between items-end mb-6">
        <h3 className="text-2xl font-heading font-bold text-heading">Best Sellers</h3>
        <Link to="/shop?tag=bestseller" className="text-primary text-sm font-bold hover:underline">
          View All
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {products.map(product => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </section>
  );
};

export default BestSellers;
