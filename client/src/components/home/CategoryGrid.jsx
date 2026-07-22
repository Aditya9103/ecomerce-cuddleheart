import { Link } from 'react-router-dom';
import { useGetCategoriesQuery } from '../../store/slices/productApiSlice';

const CategoryGrid = () => {
  const { data: categories, isLoading, error } = useGetCategoriesQuery();

  if (isLoading) return <div className="container mx-auto px-4 py-12 text-center">Loading categories...</div>;
  if (error) return null;

  return (
    <section className="container mx-auto px-4 py-12">
      <h3 className="text-2xl font-heading font-bold text-heading mb-6 flex items-center gap-2">
        Shop By Category <span className="text-xl">🌸</span>
      </h3>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {categories?.map((cat) => (
          <Link key={cat._id} to={`/shop/${cat.slug}`} className="group block bg-white rounded-2xl overflow-hidden shadow-[0_2px_10px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_15px_rgba(0,0,0,0.08)] transition-all transform hover:-translate-y-1">
            {/* Image Area with tinted background */}
            <div className={`${cat.bgColor} flex justify-center items-center h-36 pt-4 px-4`}>
              <img src={cat.image} alt={cat.name} className="w-full h-full rounded-md object-cover mix-blend-multiply drop-shadow-sm" />
            </div>

            {/* Text Area (White Background) */}
            <div className="text-center bg-white/90 backdrop-blur-sm py-4">
              <h4 className="font-bold text-gray-800 text-sm group-hover:text-primary transition-colors mb-0.5">{cat.name}</h4>
              <p className="text-xs text-textMuted font-medium">Explore items</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default CategoryGrid;
