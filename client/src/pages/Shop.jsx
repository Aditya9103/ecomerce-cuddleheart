import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useGetProductsQuery, useGetCategoriesQuery } from '../store/slices/productApiSlice';
import ProductCard from '../components/product/ProductCard';
import { SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

const AGE_GROUPS = ['0-18 months', '18-36 months', '3-5 years', '9-12 years', '12+ years', 'Kids', 'All Ages'];
const GENDERS = ['Unisex', 'Girls', 'Boys'];
const SIZES = ['Small (0-20 cm)', 'Medium (20-40 cm)', 'Large (40-60 cm)', 'Extra Large (60 cm+)'];
const DISCOUNTS = [
  { label: 'All Discounts', value: '' },
  { label: '10% or more', value: '10' },
  { label: '20% or more', value: '20' },
  { label: '50% or more', value: '50' }
];

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [activeParams, setActiveParams] = useState({
    category: searchParams.get('category') || '',
    tag: searchParams.get('tag') || '',
    search: searchParams.get('search') || '',
    ageGroup: searchParams.get('ageGroup') || '',
    gender: searchParams.get('gender') || '',
    size: searchParams.get('size') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    minDiscount: searchParams.get('minDiscount') || '',
    sort: searchParams.get('sort') || ''
  });

  // Local Form State (Pending filters)
  const [category, setCategory] = useState(activeParams.category);
  const [ageGroup, setAgeGroup] = useState(activeParams.ageGroup ? activeParams.ageGroup.split(',') : []);
  const [gender, setGender] = useState(activeParams.gender ? activeParams.gender.split(',') : []);
  const [size, setSize] = useState(activeParams.size ? activeParams.size.split(',') : []);
  const [minPrice, setMinPrice] = useState(activeParams.minPrice);
  const [maxPrice, setMaxPrice] = useState(activeParams.maxPrice);
  const [minDiscount, setMinDiscount] = useState(activeParams.minDiscount);

  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [openSections, setOpenSections] = useState({
    category: true,
    age: true,
    gender: true,
    size: true,
    price: true,
    discount: true
  });

  const toggleSection = (key) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  useEffect(() => {
    // Sync local state when URL changes
    setCategory(searchParams.get('category') || '');
    setAgeGroup(searchParams.get('ageGroup') ? searchParams.get('ageGroup').split(',') : []);
    setGender(searchParams.get('gender') ? searchParams.get('gender').split(',') : []);
    setSize(searchParams.get('size') ? searchParams.get('size').split(',') : []);
    setMinPrice(searchParams.get('minPrice') || '');
    setMaxPrice(searchParams.get('maxPrice') || '');
    setMinDiscount(searchParams.get('minDiscount') || '');

    setActiveParams({
      category: searchParams.get('category') || '',
      tag: searchParams.get('tag') || '',
      search: searchParams.get('search') || '',
      ageGroup: searchParams.get('ageGroup') || '',
      gender: searchParams.get('gender') || '',
      size: searchParams.get('size') || '',
      minPrice: searchParams.get('minPrice') || '',
      maxPrice: searchParams.get('maxPrice') || '',
      minDiscount: searchParams.get('minDiscount') || '',
      sort: searchParams.get('sort') || ''
    });
  }, [searchParams]);

  // Lock body scroll while the mobile filter drawer is open
  useEffect(() => {
    document.body.style.overflow = isMobileFilterOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileFilterOpen]);

  const handleSortChange = (e) => {
    const params = new URLSearchParams(searchParams);
    if (e.target.value) {
      params.set('sort', e.target.value);
    } else {
      params.delete('sort');
    }
    setSearchParams(params, { replace: true });
  };

  const handleApplyFilters = () => {
    const params = new URLSearchParams(searchParams);

    if (category) params.set('category', category); else params.delete('category');
    if (ageGroup.length > 0) params.set('ageGroup', ageGroup.join(',')); else params.delete('ageGroup');
    if (gender.length > 0) params.set('gender', gender.join(',')); else params.delete('gender');
    if (size.length > 0) params.set('size', size.join(',')); else params.delete('size');
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
    setSize([]);
    setMinPrice('');
    setMaxPrice('');
    setMinDiscount('');
    setSearchParams({}, { replace: true });
    setIsMobileFilterOpen(false);
  };

  const handleCheckboxChange = (setState, value) => {
    setState((prev) =>
      prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]
    );
  };

  const { data, isLoading } = useGetProductsQuery(activeParams);
  const { data: categoriesData } = useGetCategoriesQuery();

  const products = data?.products || [];
  const categories = categoriesData?.categories || [];

  // ---- Active filter chips (reflect the APPLIED query, not pending form state) ----
  const activeAgeGroups = activeParams.ageGroup ? activeParams.ageGroup.split(',').filter(Boolean) : [];
  const activeGenders = activeParams.gender ? activeParams.gender.split(',').filter(Boolean) : [];
  const activeSizes = activeParams.size ? activeParams.size.split(',').filter(Boolean) : [];
  const activeCategoryName = activeParams.category
    ? categories.find((c) => c._id === activeParams.category)?.name
    : null;
  const activeDiscountLabel = activeParams.minDiscount
    ? DISCOUNTS.find((d) => d.value === activeParams.minDiscount)?.label
    : null;
  const hasPriceFilter = activeParams.minPrice || activeParams.maxPrice;

  const hasActiveFilters =
    activeParams.category || activeAgeGroups.length > 0 || activeGenders.length > 0 || activeSizes.length > 0 ||
    hasPriceFilter || activeParams.minDiscount;

  const removeChip = (type, value) => {
    const params = new URLSearchParams(searchParams);
    if (type === 'category') {
      params.delete('category');
    } else if (type === 'ageGroup') {
      const next = activeAgeGroups.filter((v) => v !== value);
      next.length ? params.set('ageGroup', next.join(',')) : params.delete('ageGroup');
    } else if (type === 'gender') {
      const next = activeGenders.filter((v) => v !== value);
      next.length ? params.set('gender', next.join(',')) : params.delete('gender');
    } else if (type === 'size') {
      const next = activeSizes.filter((v) => v !== value);
      next.length ? params.set('size', next.join(',')) : params.delete('size');
    } else if (type === 'price') {
      params.delete('minPrice');
      params.delete('maxPrice');
    } else if (type === 'discount') {
      params.delete('minDiscount');
    }
    setSearchParams(params, { replace: true });
  };

  const Chip = ({ label, onRemove }) => (
    <button
      type="button"
      onClick={onRemove}
      className="inline-flex items-center gap-1.5 pl-3 pr-2 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold hover:bg-primary/20 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
    >
      {label}
      <X size={13} strokeWidth={2.5} />
    </button>
  );

  const FilterSection = ({ title, sectionKey, children }) => (
    <div className="border-b border-gray-100 py-5 first:pt-0 last:border-0 last:pb-0">
      <button
        type="button"
        onClick={() => toggleSection(sectionKey)}
        className="w-full flex items-center justify-between focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded-sm"
        aria-expanded={openSections[sectionKey]}
      >
        <h4 className="text-[13px] font-bold text-gray-900 uppercase tracking-wide">{title}</h4>
        <ChevronDown
          size={16}
          className={`text-gray-400 transition-transform duration-200 ${openSections[sectionKey] ? 'rotate-180' : ''}`}
        />
      </button>
      <div
        className={`grid transition-all duration-200 ease-out ${openSections[sectionKey] ? 'grid-rows-[1fr] opacity-100 mt-4' : 'grid-rows-[0fr] opacity-0'
          }`}
      >
        <div className="overflow-hidden">{children}</div>
      </div>
    </div>
  );

  const pageTitle = activeParams.search
    ? `Search: "${activeParams.search}"`
    : activeParams.tag === 'bestseller'
      ? 'Best Sellers'
      : activeParams.tag === 'new-arrival'
        ? 'New Arrivals'
        : activeParams.category
          ? categories.find((c) => c._id === activeParams.category)?.name
          : 'Shop Collection';

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">

        {/* Mobile Filter Toggle */}
        <div className="md:hidden flex justify-between items-center bg-white px-4 py-3 rounded-xl border border-gray-200">
          <span className="text-sm text-gray-600">
            <span className="font-bold text-gray-900">{products.length}</span> products
          </span>
          <button
            onClick={() => setIsMobileFilterOpen(true)}
            className="flex items-center gap-2 bg-gray-900 text-white text-sm px-4 py-2 rounded-lg font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-900"
          >
            <SlidersHorizontal size={16} /> Filters
            {hasActiveFilters && (
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            )}
          </button>
        </div>

        {/* Filters Sidebar */}
        <div
          className={`fixed md:static inset-0 z-50 md:z-auto bg-black/40 md:bg-transparent transition-opacity duration-300 ${isMobileFilterOpen ? 'opacity-100' : 'opacity-0 pointer-events-none md:opacity-100 md:pointer-events-auto'
            }`}
          onClick={(e) => { if (e.target === e.currentTarget) setIsMobileFilterOpen(false); }}
        >
          <div
            className={`absolute md:static top-0 right-0 h-full md:h-auto w-[85%] sm:w-96 md:w-72 bg-white md:bg-transparent overflow-y-auto md:overflow-visible transition-transform duration-300 ease-out ${isMobileFilterOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'
              }`}
          >
            <div className="md:hidden flex justify-between items-center px-5 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
              <h3 className="font-heading font-bold text-lg text-gray-900">Filters</h3>
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="p-2 -mr-2 text-gray-500 hover:text-gray-900 focus:outline-none"
                aria-label="Close filters"
              >
                <X size={20} />
              </button>
            </div>

            <div className="bg-white md:border md:border-gray-200 p-5 md:p-6 rounded-none md:rounded-2xl md:sticky md:top-24">
              <div className="hidden md:flex justify-between items-center mb-1 pb-5 border-b border-gray-100">
                <h3 className="font-heading font-bold text-lg text-gray-900">Filters</h3>
                {hasActiveFilters && (
                  <button onClick={handleClear} className="text-xs font-semibold text-primary hover:underline">
                    Clear all
                  </button>
                )}
              </div>

              {/* Category */}
              <FilterSection title="Category" sectionKey="category">
                <div className="flex flex-col gap-2.5 max-h-48 overflow-y-auto pr-2">
                  <label className="flex items-center gap-2.5 cursor-pointer group">
                    <input
                      type="radio"
                      name="category"
                      checked={category === ''}
                      onChange={() => setCategory('')}
                      className="w-4 h-4 accent-primary"
                    />
                    <span className={`text-sm ${category === '' ? 'font-semibold text-gray-900' : 'text-gray-600 group-hover:text-gray-900'}`}>
                      All Categories
                    </span>
                  </label>
                  {categories.map((c) => (
                    <label key={c._id} className="flex items-center gap-2.5 cursor-pointer group">
                      <input
                        type="radio"
                        name="category"
                        checked={category === c._id}
                        onChange={() => setCategory(c._id)}
                        className="w-4 h-4 accent-primary"
                      />
                      <span className={`text-sm ${category === c._id ? 'font-semibold text-gray-900' : 'text-gray-600 group-hover:text-gray-900'}`}>
                        {c.name}
                      </span>
                    </label>
                  ))}
                </div>
              </FilterSection>

              {/* Age Group */}
              <FilterSection title="Age Group" sectionKey="age">
                <div className="flex flex-col gap-2.5">
                  {AGE_GROUPS.map((age) => (
                    <label key={age} className="flex items-center gap-2.5 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={ageGroup.includes(age)}
                        onChange={() => handleCheckboxChange(setAgeGroup, age)}
                        className="w-4 h-4 rounded accent-primary"
                      />
                      <span className="text-sm text-gray-600 group-hover:text-gray-900">{age}</span>
                    </label>
                  ))}
                </div>
              </FilterSection>

              {/* Gender */}
              <FilterSection title="Gender" sectionKey="gender">
                <div className="flex flex-col gap-2.5">
                  {GENDERS.map((g) => (
                    <label key={g} className="flex items-center gap-2.5 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={gender.includes(g)}
                        onChange={() => handleCheckboxChange(setGender, g)}
                        className="w-4 h-4 rounded accent-primary"
                      />
                      <span className="text-sm text-gray-600 group-hover:text-gray-900">{g}</span>
                    </label>
                  ))}
                </div>
              </FilterSection>

              {/* Size */}
              <FilterSection title="Size" sectionKey="size">
                <div className="flex flex-col gap-2.5">
                  {SIZES.map((s) => (
                    <label key={s} className="flex items-center gap-2.5 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={size.includes(s)}
                        onChange={() => handleCheckboxChange(setSize, s)}
                        className="w-4 h-4 rounded accent-primary"
                      />
                      <span className="text-sm text-gray-600 group-hover:text-gray-900">{s}</span>
                    </label>
                  ))}
                </div>
              </FilterSection>

              {/* Price */}
              <FilterSection title="Price Range" sectionKey="price">
                <div className="px-2 mb-5">
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
                      track: { backgroundColor: 'var(--color-primary, #FF6B6B)' },
                      handle: { borderColor: 'var(--color-primary, #FF6B6B)', backgroundColor: 'white', opacity: 1 },
                      rail: { backgroundColor: '#e5e7eb' }
                    }}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₹</span>
                    <input
                      type="number"
                      placeholder="Min"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      className="w-full pl-7 pr-2 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:border-primary focus:bg-white outline-none transition-colors"
                    />
                  </div>
                  <span className="text-gray-300 text-sm">–</span>
                  <div className="flex-1 relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₹</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      className="w-full pl-7 pr-2 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:border-primary focus:bg-white outline-none transition-colors"
                    />
                  </div>
                </div>
              </FilterSection>

              {/* Discount */}
              <FilterSection title="Discount" sectionKey="discount">
                <div className="flex flex-col gap-2.5">
                  {DISCOUNTS.map((d) => (
                    <label key={d.value} className="flex items-center gap-2.5 cursor-pointer group">
                      <input
                        type="radio"
                        name="discount"
                        checked={minDiscount === d.value}
                        onChange={() => setMinDiscount(d.value)}
                        className="w-4 h-4 accent-primary"
                      />
                      <span className={`text-sm ${minDiscount === d.value ? 'font-semibold text-gray-900' : 'text-gray-600 group-hover:text-gray-900'}`}>
                        {d.label}
                      </span>
                    </label>
                  ))}
                </div>
              </FilterSection>

              <div className="mt-6 pt-5 border-t border-gray-100 flex gap-3">
                <button
                  onClick={handleClear}
                  className="md:hidden flex-1 border border-gray-300 text-gray-700 font-semibold py-3 rounded-xl text-sm"
                >
                  Clear
                </button>
                <button
                  onClick={handleApplyFilters}
                  className="flex-1 bg-primary hover:bg-primary-dark text-white font-semibold py-3 rounded-xl text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Product Grid */}
        <div className="flex-1 min-w-0">
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-5 border-b border-gray-200">
              <div>
                <h1 className="text-2xl md:text-3xl font-heading font-extrabold text-gray-900">{pageTitle}</h1>
                <p className="text-gray-500 text-sm mt-1">
                  <span className="font-semibold text-gray-700">{products.length}</span> products found
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <label htmlFor="sort" className="text-sm text-gray-500 whitespace-nowrap hidden sm:inline">
                  Sort by
                </label>
                <select
                  id="sort"
                  className="bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-900 pl-3 pr-8 py-2 outline-none cursor-pointer focus:border-primary appearance-none bg-[length:16px] bg-[right_0.6rem_center] bg-no-repeat"
                  style={{
                    backgroundImage:
                      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E\")"
                  }}
                  value={activeParams.sort}
                  onChange={handleSortChange}
                >
                  <option value="">Default</option>
                  <option value="popularity">Popularity</option>
                  <option value="price_high_low">Price: High to Low</option>
                  <option value="price_low_high">Price: Low to High</option>
                  <option value="newest">Newest First</option>
                </select>
              </div>
            </div>

            {/* Active filter chips */}
            {hasActiveFilters && (
              <div className="flex flex-wrap items-center gap-2 pt-4">
                {activeCategoryName && (
                  <Chip label={activeCategoryName} onRemove={() => removeChip('category')} />
                )}
                {activeAgeGroups.map((age) => (
                  <Chip key={age} label={age} onRemove={() => removeChip('ageGroup', age)} />
                ))}
                {activeGenders.map((g) => (
                  <Chip key={g} label={g} onRemove={() => removeChip('gender', g)} />
                ))}
                {activeSizes.map((s) => (
                  <Chip key={s} label={s} onRemove={() => removeChip('size', s)} />
                ))}
                {hasPriceFilter && (
                  <Chip
                    label={`₹${activeParams.minPrice || 0} – ₹${activeParams.maxPrice || '10,000+'}`}
                    onRemove={() => removeChip('price')}
                  />
                )}
                {activeDiscountLabel && (
                  <Chip label={activeDiscountLabel} onRemove={() => removeChip('discount')} />
                )}
                <button
                  onClick={handleClear}
                  className="text-xs font-semibold text-gray-500 hover:text-gray-900 underline underline-offset-2 ml-1"
                >
                  Clear all
                </button>
              </div>
            )}
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="animate-pulse bg-white rounded-xl p-3 h-[340px] border border-gray-100 flex flex-col">
                  <div className="w-full h-40 bg-gray-100 rounded-lg mb-4"></div>
                  <div className="h-3.5 bg-gray-100 rounded w-3/4 mb-2"></div>
                  <div className="h-3.5 bg-gray-100 rounded w-1/2 mb-4"></div>
                  <div className="mt-auto h-9 bg-gray-100 rounded-lg w-full"></div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 bg-white border border-gray-200 rounded-xl">
              <div className="text-5xl mb-4">🧸</div>
              <h3 className="text-xl font-bold text-gray-900 mb-1.5">No products found</h3>
              <p className="text-gray-500 text-sm mb-6">Try adjusting or clearing your filters.</p>
              <button
                onClick={handleClear}
                className="bg-gray-900 hover:bg-gray-800 text-white text-sm px-6 py-2.5 rounded-lg font-semibold transition-colors"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {products.map((product) => (
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