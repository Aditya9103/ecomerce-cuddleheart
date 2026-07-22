import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useGetProductsQuery, useGetCategoriesQuery } from '../store/slices/productApiSlice';
import ProductCard from '../components/product/ProductCard';
import { Filter, X } from 'lucide-react';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

const AGE_GROUPS = ['0-18 months', '18-36 months', '3-5 years', '9-12 years', '12+ years', 'Kids', 'All Ages'];
const GENDERS = ['Unisex', 'Girls', 'Boys'];
const DISCOUNTS = [
  { label: 'All Discounts', value: '' },
  { label: '10% or more', value: '10' },
  { label: '20% or more', value: '20' },
  { label: '50% or more', value: '50' }
];

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // URL Params State (Active filters)
  const [activeParams, setActiveParams] = useState({
    category: searchParams.get('category') || '',
    tag: searchParams.get('tag') || '',
    search: searchParams.get('search') || '',
    ageGroup: searchParams.get('ageGroup') || '',
    gender: searchParams.get('gender') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    minDiscount: searchParams.get('minDiscount') || ''
  });

  // Local Form State (Pending filters)
  const [category, setCategory] = useState(activeParams.category);
  const [ageGroup, setAgeGroup] = useState(activeParams.ageGroup ? activeParams.ageGroup.split(',') : []);
  const [gender, setGender] = useState(activeParams.gender ? activeParams.gender.split(',') : []);
  const [minPrice, setMinPrice] = useState(activeParams.minPrice);
  const [maxPrice, setMaxPrice] = useState(activeParams.maxPrice);
  const [minDiscount, setMinDiscount] = useState(activeParams.minDiscount);
  
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  useEffect(() => {
    // Sync local state when URL changes
    setCategory(searchParams.get('category') || '');
    setAgeGroup(searchParams.get('ageGroup') ? searchParams.get('ageGroup').split(',') : []);
    setGender(searchParams.get('gender') ? searchParams.get('gender').split(',') : []);
    setMinPrice(searchParams.get('minPrice') || '');
    setMaxPrice(searchParams.get('maxPrice') || '');
    setMinDiscount(searchParams.get('minDiscount') || '');
    
    setActiveParams({
      category: searchParams.get('category') || '',
      tag: searchParams.get('tag') || '',
      search: searchParams.get('search') || '',
      ageGroup: searchParams.get('ageGroup') || '',
      gender: searchParams.get('gender') || '',
      minPrice: searchParams.get('minPrice') || '',
      maxPrice: searchParams.get('maxPrice') || '',
      minDiscount: searchParams.get('minDiscount') || ''
    });
  }, [searchParams]);

  const handleApplyFilters = () => {
    const params = new URLSearchParams(searchParams);
    
    if (category) params.set('category', category); else params.delete('category');
    if (ageGroup.length > 0) params.set('ageGroup', ageGroup.join(',')); else params.delete('ageGroup');
    if (gender.length > 0) params.set('gender', gender.join(',')); else params.delete('gender');
    if (minPrice) params.set('minPrice', minPrice); else params.delete('minPrice');
    if (maxPrice) params.set('maxPrice', maxPrice); else params.delete('maxPrice');
    if (minDiscount) params.set('minDiscount', minDiscount); else params.delete('minDiscount');

    setSearchParams(params, { replace: true });
    setIsMobileFilterOpen(false);
  };

  const handleClear = () => {
    setCategory('');
    setAgeGroup([]);
    setGender([]);
    setMinPrice('');
    setMaxPrice('');
    setMinDiscount('');
    setSearchParams({}, { replace: true });
    setIsMobileFilterOpen(false);
  };

  const handleCheckboxChange = (setState, value) => {
    setState(prev => 
      prev.includes(value) ? prev.filter(item => item !== value) : [...prev, value]
    );
  };

  const { data, isLoading } = useGetProductsQuery(activeParams);
  const { data: categoriesData } = useGetCategoriesQuery();

  const products = data?.products || [];
  const categories = categoriesData?.categories || [];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">

        {/* Mobile Filter Toggle */}
        <div className="md:hidden flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
          <span className="font-bold text-gray-800">Products: {products.length}</span>
          <button 
            onClick={() => setIsMobileFilterOpen(true)}
            className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg font-bold"
          >
            <Filter size={18} /> Filters
          </button>
        </div>

        {/* Filters Sidebar */}
        <div className={`fixed md:static inset-0 z-50 md:z-auto bg-black/50 md:bg-transparent transition-opacity ${isMobileFilterOpen ? 'opacity-100' : 'opacity-0 pointer-events-none md:opacity-100 md:pointer-events-auto'}`}>
          <div className={`absolute md:static top-0 right-0 h-full md:h-auto w-4/5 md:w-64 max-w-sm bg-white md:bg-transparent p-6 md:p-0 overflow-y-auto md:overflow-visible transition-transform duration-300 ${isMobileFilterOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}`}>
            
            <div className="md:hidden flex justify-between items-center mb-6">
              <h3 className="font-heading font-bold text-2xl text-gray-900">Filters</h3>
              <button onClick={() => setIsMobileFilterOpen(false)} className="p-2 bg-gray-100 rounded-full text-gray-500">
                <X size={20} />
              </button>
            </div>

            <div className="bg-white border border-gray-100 shadow-sm p-6 rounded-3xl sticky top-24">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-heading font-bold text-2xl text-gray-900 hidden md:block">Filters</h3>
                <button onClick={handleClear} className="text-sm font-bold text-primary hover:underline">Clear All</button>
              </div>

              {/* Category */}
              <div className="mb-6 pb-6 border-b border-gray-100">
                <h4 className="text-sm font-extrabold text-gray-800 uppercase mb-4">Category</h4>
                <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input type="radio" name="category" checked={category === ''} onChange={() => setCategory('')} className="w-4 h-4 text-primary bg-gray-100 border-gray-300 focus:ring-primary" />
                    <span className={`text-sm ${category === '' ? 'font-bold text-primary' : 'text-gray-600 group-hover:text-gray-900'}`}>All Categories</span>
                  </label>
                  {categories.map(c => (
                    <label key={c._id} className="flex items-center gap-3 cursor-pointer group">
                      <input type="radio" name="category" checked={category === c._id} onChange={() => setCategory(c._id)} className="w-4 h-4 text-primary bg-gray-100 border-gray-300 focus:ring-primary" />
                      <span className={`text-sm ${category === c._id ? 'font-bold text-primary' : 'text-gray-600 group-hover:text-gray-900'}`}>{c.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Age Group */}
              <div className="mb-6 pb-6 border-b border-gray-100">
                <h4 className="text-sm font-extrabold text-gray-800 uppercase mb-4">Age Group</h4>
                <div className="flex flex-col gap-2">
                  {AGE_GROUPS.map(age => (
                    <label key={age} className="flex items-center gap-3 cursor-pointer group">
                      <input 
                        type="checkbox" 
                        checked={ageGroup.includes(age)} 
                        onChange={() => handleCheckboxChange(setAgeGroup, age)}
                        className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary" 
                      />
                      <span className="text-sm text-gray-600 group-hover:text-gray-900">{age}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Gender */}
              <div className="mb-6 pb-6 border-b border-gray-100">
                <h4 className="text-sm font-extrabold text-gray-800 uppercase mb-4">Gender</h4>
                <div className="flex flex-col gap-2">
                  {GENDERS.map(g => (
                    <label key={g} className="flex items-center gap-3 cursor-pointer group">
                      <input 
                        type="checkbox" 
                        checked={gender.includes(g)} 
                        onChange={() => handleCheckboxChange(setGender, g)}
                        className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary" 
                      />
                      <span className="text-sm text-gray-600 group-hover:text-gray-900">{g}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price */}
              <div className="mb-6 pb-6 border-b border-gray-100">
                <h4 className="text-sm font-extrabold text-gray-800 uppercase mb-4">Price Range</h4>
                <div className="px-2 mb-6">
                  <Slider 
                    range
                    min={0}
                    max={10000}
                    step={100}
                    value={[minPrice ? Number(minPrice) : 0, maxPrice ? Number(maxPrice) : 10000]}
                    onChange={(val) => {
                      setMinPrice(val[0].toString());
                      setMaxPrice(val[1].toString());
                    }}
                    styles={{
                      track: { backgroundColor: '#FF6B6B' }, // primary color
                      handle: { borderColor: '#FF6B6B', backgroundColor: 'white', opacity: 1 },
                      rail: { backgroundColor: '#f3f4f6' }
                    }}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium text-sm">₹</span>
                    <input 
                      type="number" 
                      placeholder="Min"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      className="w-full pl-7 pr-2 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:border-primary outline-none"
                    />
                  </div>
                  <span className="text-gray-400">-</span>
                  <div className="flex-1 relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium text-sm">₹</span>
                    <input 
                      type="number" 
                      placeholder="Max"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      className="w-full pl-7 pr-2 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:border-primary outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Discount */}
              <div className="mb-6 pb-6 border-b border-gray-100">
                <h4 className="text-sm font-extrabold text-gray-800 uppercase mb-4">Discount</h4>
                <div className="flex flex-col gap-2">
                  {DISCOUNTS.map(d => (
                    <label key={d.value} className="flex items-center gap-3 cursor-pointer group">
                      <input 
                        type="radio" 
                        name="discount" 
                        checked={minDiscount === d.value} 
                        onChange={() => setMinDiscount(d.value)}
                        className="w-4 h-4 text-primary bg-gray-100 border-gray-300 focus:ring-primary" 
                      />
                      <span className={`text-sm ${minDiscount === d.value ? 'font-bold text-primary' : 'text-gray-600 group-hover:text-gray-900'}`}>{d.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button 
                onClick={handleApplyFilters}
                className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 rounded-xl transition-all shadow-md hover:-translate-y-0.5"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>

        {/* Product Grid */}
        <div className="flex-1">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 bg-gradient-to-r from-pink-50/80 via-purple-50/50 to-orange-50/80 p-8 rounded-3xl border border-white shadow-sm">
            <div>
              <h1 className="text-4xl font-heading font-extrabold text-gray-900 mb-2">
                {activeParams.search ? `Search: "${activeParams.search}"` : activeParams.tag === 'bestseller' ? 'Best Sellers' : activeParams.tag === 'new-arrival' ? 'New Arrivals' : activeParams.category ? categories.find(c => c._id === activeParams.category)?.name : 'Shop Collection'}
              </h1>
              <p className="text-gray-500 text-sm">Discover our handpicked cuddly companions</p>
            </div>
            <div className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm border border-white">
              <span className="text-sm font-bold text-primary">{products.length} Products Found</span>
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
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
              <p className="text-gray-500 mb-6">We couldn't find any soft toys matching your criteria.</p>
              <button onClick={handleClear} className="bg-primary hover:bg-primary-dark text-white px-8 py-3 rounded-full font-bold transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5">
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map(product => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Shop;
