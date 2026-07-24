import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Search,
  User,
  Heart,
  ShoppingCart,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
  LogOut,
  Package,
  Tag,
  Zap,
  Headphones,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useGetCartQuery } from '../../store/slices/cartApiSlice';
import { logout } from '../../store/slices/authSlice';
import { useGetCategoriesQuery, useGetProductsQuery } from '../../store/slices/productApiSlice';
import { baseApi } from '../../store/baseApi';

const NAV_LINKS = [
  { label: 'Home', to: '/', icon: Package },
  { label: 'Shop', to: '/shop', icon: Zap },
  { label: 'New Arrivals', to: '/shop?tag=new-arrival', icon: Sparkles },
  { label: 'Best Sellers', to: '/shop?tag=bestseller', icon: TrendingUp },
  { label: 'Offers', to: '/offers', icon: Tag },
];

// Mobile drawer mirrors NAV_LINKS exactly, with the Categories accordion
// inserted after "Shop" (index 2) to match the desktop nav's position,
// plus a Help Center link that only appears in the drawer.
const MOBILE_LINKS_BEFORE_CATEGORIES = NAV_LINKS.slice(0, 2); // Home, Shop
const MOBILE_LINKS_AFTER_CATEGORIES = [
  ...NAV_LINKS.slice(2), // New Arrivals, Best Sellers, Offers
  { label: 'Help Center', to: '/help', icon: Headphones },
];

/** Shared dropdown used by both the desktop and mobile search bars. */
const SearchSuggestions = ({ isFetching, products, onSelect, onViewAll, className = '' }) => (
  <div
    className={`absolute top-full mt-2 bg-white border border-gray-100 shadow-xl rounded-xl overflow-hidden flex flex-col max-h-80 sm:max-h-96 z-50 ${className}`}
  >
    {isFetching ? (
      <div className="p-4 text-center text-sm text-gray-500">Searching...</div>
    ) : products?.length > 0 ? (
      <>
        <div className="overflow-y-auto">
          {products.map((product) => (
            <div
              key={product._id}
              onClick={() => onSelect(product.slug)}
              className="flex items-center gap-3 p-3 hover:bg-gray-50 active:bg-gray-100 cursor-pointer border-b border-gray-50 last:border-0 transition-colors"
            >
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-10 h-10 object-cover rounded-md bg-gray-100 shrink-0"
              />
              <div className="flex flex-col flex-1 min-w-0">
                <span className="text-sm font-bold text-gray-800 truncate">{product.name}</span>
                <span className="text-xs text-primary font-medium">
                  ₹{product.activeOffer ? product.offerPrice : product.price}
                </span>
              </div>
            </div>
          ))}
        </div>
        <button
          onClick={onViewAll}
          className="p-3 text-sm font-bold text-center text-primary bg-primary-light/10 hover:bg-primary-light/20 transition-colors shrink-0"
        >
          View all results
        </button>
      </>
    ) : (
      <div className="p-4 text-center text-sm text-gray-500">No products found</div>
    )}
  </div>
);

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileCategoriesOpen, setIsMobileCategoriesOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [showDesktopSuggestions, setShowDesktopSuggestions] = useState(false);
  const [showMobileSuggestions, setShowMobileSuggestions] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const drawerRef = useRef(null);
  const mobileSearchInputRef = useRef(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { userInfo } = useSelector((state) => state.auth);
  const { guestCartItems } = useSelector((state) => state.cart);
  const { data: cartData } = useGetCartQuery(undefined, { skip: !userInfo });
  const { data: categories } = useGetCategoriesQuery();

  const { data: searchResults, isFetching: isSearchFetching } = useGetProductsQuery(
    { search: debouncedSearchQuery, limit: 4 },
    { skip: !debouncedSearchQuery.trim() }
  );

  const cartCount = userInfo
    ? cartData?.items?.reduce((acc, item) => acc + item.quantity, 0) || 0
    : guestCartItems?.reduce((acc, item) => acc + item.quantity, 0) || 0;

  // Lock body scroll while the mobile drawer is open
  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : 'auto';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isMobileMenuOpen]);

  // Close the drawer on Escape, and on viewport resize past the lg breakpoint
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsMobileMenuOpen(false);
        setIsMobileSearchOpen(false);
      }
    };
    const onResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileMenuOpen(false);
        setIsMobileSearchOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  // Debounce the search query
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearchQuery(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Focus the input when the mobile search flyout opens
  useEffect(() => {
    if (isMobileSearchOpen) mobileSearchInputRef.current?.focus();
  }, [isMobileSearchOpen]);

  const logoutHandler = () => {
    dispatch(logout());
    dispatch(baseApi.util.resetApiState()); // Completely clears RTK Query cache
    navigate('/login');
    setIsUserMenuOpen(false);
    closeDrawer();
  };

  const runSearch = useCallback(
    (query) => {
      if (query.trim()) {
        navigate(`/shop?search=${encodeURIComponent(query.trim())}`);
        setShowDesktopSuggestions(false);
        setShowMobileSuggestions(false);
        setIsMobileMenuOpen(false);
        setIsMobileSearchOpen(false);
      }
    },
    [navigate]
  );

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    runSearch(searchQuery);
  };

  const handleSuggestionClick = (slug) => {
    setShowDesktopSuggestions(false);
    setShowMobileSuggestions(false);
    setSearchQuery('');
    setDebouncedSearchQuery('');
    setIsMobileSearchOpen(false);
    setIsMobileMenuOpen(false);
    navigate(`/product/${slug}`);
  };

  const closeDrawer = () => {
    setIsMobileMenuOpen(false);
    setIsMobileCategoriesOpen(false);
  };

  return (
    <>
      <header className="w-full bg-white/90 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100 shadow-sm transition-all duration-300">
        <div className="container mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 h-16 sm:h-20 flex items-center gap-2 sm:gap-3">
          {/* Hamburger — visible below lg */}
          <button
            className="lg:hidden shrink-0 w-11 h-11 flex items-center justify-center -ml-1 text-gray-700 rounded-full hover:bg-primary/10 hover:text-primary transition-colors"
            onClick={() => setIsMobileMenuOpen(true)}
            aria-label="Open menu"
            aria-expanded={isMobileMenuOpen}
          >
            <Menu size={22} />
          </button>

          {/* Logo — always visible, scales with viewport */}
          <Link to="/" className="flex items-center gap-2 shrink-0 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 bg-orange-200 rounded-full flex items-center justify-center text-base sm:text-lg md:text-xl shrink-0">
              🐻
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-heading font-bold text-sm sm:text-base md:text-lg lg:text-xl text-heading leading-none truncate">
                Cuddle Hearts
              </span>
              <span className="hidden xl:block text-[10px] text-textMuted uppercase font-semibold tracking-wider whitespace-nowrap">
                Bringing Smiles, Everytime!
              </span>
            </div>
          </Link>

          {/* Desktop nav links — lg and up only */}
          <nav className="hidden lg:flex items-center gap-3 xl:gap-6 font-bold text-gray-700 text-sm xl:text-base whitespace-nowrap ml-4 xl:ml-8">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="relative py-2 hover:text-primary transition-colors after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-primary after:transition-all hover:after:w-full"
              >
                {link.label}
              </Link>
            ))}

            <div className="relative group cursor-pointer hover:text-primary transition-colors py-2">
              <div className="flex items-center gap-1">
                Categories <ChevronDown size={14} className="transition-transform group-hover:rotate-180" />
              </div>
              <div className="absolute top-full left-0 pt-4 hidden group-hover:block z-50">
                <div className="bg-white/95 backdrop-blur-sm border border-gray-100 shadow-xl rounded-2xl py-3 w-56 overflow-hidden max-h-[70vh] overflow-y-auto">
                  {categories?.map((category) => (
                    <Link
                      key={category._id}
                      to={`/shop/${category.slug}`}
                      className="block px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-primary/5 hover:text-primary hover:pl-6 transition-all"
                    >
                      {category.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </nav>

          {/* Right-hand cluster: search + icons */}
          <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 flex-1 justify-end min-w-0">
            {/* Inline search — md and up (fluid width on tablet, capped on desktop) */}
            <div className="hidden md:block relative flex-1 lg:flex-initial lg:w-56 xl:w-72 max-w-xs xl:max-w-sm ml-2">
              <form onSubmit={handleSearchSubmit} className="relative">
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowDesktopSuggestions(true);
                  }}
                  onFocus={() => setShowDesktopSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowDesktopSuggestions(false), 200)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-full py-2.5 pl-4 pr-10 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 font-medium text-gray-800 shadow-inner"
                  aria-label="Search products"
                />
                <button
                  type="submit"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition-colors"
                  aria-label="Submit search"
                >
                  <Search size={18} />
                </button>
              </form>
              {showDesktopSuggestions && debouncedSearchQuery.trim() !== '' && (
                <SearchSuggestions
                  isFetching={isSearchFetching}
                  products={searchResults?.products}
                  onSelect={handleSuggestionClick}
                  onViewAll={() => runSearch(searchQuery)}
                  className="right-0 w-80 md:w-96 max-w-[90vw]"
                />
              )}
            </div>

            {/* Search icon — below md only */}
            <button
              className="md:hidden w-11 h-11 flex items-center justify-center hover:bg-primary/10 hover:text-primary rounded-full transition-colors text-gray-700"
              onClick={() => setIsMobileSearchOpen((v) => !v)}
              aria-label="Toggle search"
              aria-expanded={isMobileSearchOpen}
            >
              <Search size={20} />
            </button>

            {/* User menu — sm and up; folded into drawer below sm */}
            {userInfo ? (
              <div className="hidden sm:flex items-center relative group">
                <button
                  className="w-11 h-11 sm:w-auto sm:px-2.5 sm:h-11 flex items-center justify-center gap-1 hover:bg-primary/10 hover:text-primary rounded-full transition-colors text-sm font-bold text-gray-700"
                  aria-haspopup="true"
                >
                  <User size={20} />
                  <span className="hidden lg:inline truncate max-w-[80px]">{userInfo.name.split(' ')[0]}</span>
                </button>
                <div className="absolute top-full right-0 pt-3 hidden group-hover:block z-50">
                  <div className="bg-white/95 backdrop-blur-sm border border-gray-100 shadow-xl rounded-2xl py-2 w-48 overflow-hidden">
                    <Link to="/account" className="block px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-primary/5 hover:text-primary transition-colors">
                      My Profile
                    </Link>
                    <Link to="/orders" className="block px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-primary/5 hover:text-primary transition-colors">
                      My Orders
                    </Link>
                    <div className="border-t border-gray-100 my-1" />
                    <button
                      onClick={logoutHandler}
                      className="w-full text-left px-5 py-2.5 text-sm font-bold text-red-500 hover:bg-red-50 flex items-center gap-2 transition-colors"
                    >
                      <LogOut size={16} /> Logout
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <Link
                to="/login"
                className="hidden sm:flex w-11 h-11 items-center justify-center hover:bg-primary/10 hover:text-primary text-gray-700 rounded-full transition-colors"
                aria-label="Login"
              >
                <User size={20} />
              </Link>
            )}

            <Link
              to="/wishlist"
              className="hidden min-[420px]:flex w-11 h-11 items-center justify-center hover:bg-primary/10 hover:text-primary text-gray-700 rounded-full transition-colors"
              aria-label="Wishlist"
            >
              <Heart size={20} />
            </Link>

            <Link
              to="/cart"
              className="relative w-11 h-11 flex items-center justify-center hover:bg-primary/10 hover:text-primary text-gray-700 rounded-full transition-colors"
              aria-label={`Cart, ${cartCount} items`}
            >
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 bg-primary text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold ring-2 ring-white shadow-sm">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Mobile search flyout — appears below md when the search icon is tapped */}
        {isMobileSearchOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white px-3 sm:px-4 py-3">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                ref={mobileSearchInputRef}
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowMobileSuggestions(true);
                }}
                onFocus={() => setShowMobileSuggestions(true)}
                onBlur={() => setTimeout(() => setShowMobileSuggestions(false), 200)}
                className="w-full bg-gray-50 rounded-xl py-3 pl-4 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 border border-gray-100 font-medium text-gray-900"
                aria-label="Search products"
              />
              <button
                type="submit"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition-colors"
                aria-label="Submit search"
              >
                <Search size={18} />
              </button>
              {showMobileSuggestions && debouncedSearchQuery.trim() !== '' && (
                <SearchSuggestions
                  isFetching={isSearchFetching}
                  products={searchResults?.products}
                  onSelect={handleSuggestionClick}
                  onViewAll={() => runSearch(searchQuery)}
                  className="left-0 right-0"
                />
              )}
            </form>
          </div>
        )}

      </header>

      {/* Mobile drawer backdrop (moved outside header to escape backdrop-filter stacking context) */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-[60] lg:hidden"
          onClick={closeDrawer}
          aria-hidden="true"
        />
      )}

      {/* Mobile drawer (moved outside header) */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Site menu"
        className={`fixed inset-y-0 left-0 w-[85vw] max-w-sm bg-white z-[70] shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col lg:hidden ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 shrink-0">
          <Link to="/" className="flex items-center gap-2 min-w-0" onClick={closeDrawer}>
            <div className="w-8 h-8 bg-orange-200 rounded-full flex items-center justify-center text-lg shrink-0">
              🐻
            </div>
            <span className="font-heading font-bold text-lg text-heading truncate">Cuddle Hearts</span>
          </Link>
          <button
            onClick={closeDrawer}
            className="w-10 h-10 flex items-center justify-center bg-gray-50 text-gray-500 rounded-full hover:bg-gray-100 transition-colors shrink-0"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Drawer content */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          {/* Search inside drawer */}
          <div className="p-4 border-b border-gray-100">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowMobileSuggestions(true);
                }}
                onFocus={() => setShowMobileSuggestions(true)}
                onBlur={() => setTimeout(() => setShowMobileSuggestions(false), 200)}
                className="w-full bg-gray-50 rounded-xl py-3 pl-4 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 border border-gray-100 font-medium text-gray-900"
                aria-label="Search products"
              />
              <button
                type="submit"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition-colors"
                aria-label="Submit search"
              >
                <Search size={18} />
              </button>
              {showMobileSuggestions && debouncedSearchQuery.trim() !== '' && (
                <SearchSuggestions
                  isFetching={isSearchFetching}
                  products={searchResults?.products}
                  onSelect={handleSuggestionClick}
                  onViewAll={() => runSearch(searchQuery)}
                  className="left-0 right-0"
                />
              )}
            </form>
          </div>

          {/* Links */}
          <div className="p-4 flex flex-col gap-1 font-medium text-gray-700">
            {MOBILE_LINKS_BEFORE_CATEGORIES.map(({ label, to, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-primary/5 hover:text-primary transition-colors min-h-[44px]"
                onClick={closeDrawer}
              >
                <Icon size={18} /> {label}
              </Link>
            ))}

            {/* Categories accordion */}
            <div className="rounded-xl overflow-hidden">
              <button
                onClick={() => setIsMobileCategoriesOpen((v) => !v)}
                className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-primary/5 hover:text-primary transition-colors min-h-[44px]"
                aria-expanded={isMobileCategoriesOpen}
              >
                <div className="flex items-center gap-3">
                  <Tag size={18} /> Categories
                </div>
                <ChevronDown
                  size={18}
                  className={`transition-transform ${isMobileCategoriesOpen ? 'rotate-180 text-primary' : ''}`}
                />
              </button>
              <div
                className={`transition-all duration-200 ease-in-out ${isMobileCategoriesOpen ? 'max-h-96 opacity-100 ml-4 border-l-2 border-gray-100' : 'max-h-0 opacity-0 pointer-events-none'
                  }`}
              >
                {categories?.map((category) => (
                  <Link
                    key={category._id}
                    to={`/shop/${category.slug}`}
                    className="flex items-center gap-2 py-2.5 px-4 text-sm text-gray-500 hover:text-primary transition-colors"
                    onClick={closeDrawer}
                  >
                    <ChevronRight size={14} /> {category.name}
                  </Link>
                ))}
              </div>
            </div>

            {MOBILE_LINKS_AFTER_CATEGORIES.map(({ label, to, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-primary/5 hover:text-primary transition-colors min-h-[44px]"
                onClick={closeDrawer}
              >
                <Icon size={18} /> {label}
              </Link>
            ))}

            {/* Wishlist */}
            <Link
              to="/wishlist"
              className="min-[420px]:hidden flex items-center gap-3 p-3 rounded-xl hover:bg-primary/5 hover:text-primary transition-colors min-h-[44px]"
              onClick={closeDrawer}
            >
              <Heart size={18} /> Wishlist
            </Link>
          </div>
        </div>

        {/* Drawer footer (auth) */}
        <div className="p-4 border-t border-gray-100 bg-gray-50 shrink-0">
          {userInfo ? (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3 p-2 mb-2 bg-white rounded-xl border border-gray-200">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                  <User size={20} className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 truncate">{userInfo.name}</p>
                  <p className="text-xs text-gray-500 truncate">{userInfo.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/account"
                  className="text-center py-2.5 bg-white rounded-lg border border-gray-200 text-sm font-bold text-gray-700 hover:border-primary/30 min-h-[44px] flex items-center justify-center"
                  onClick={closeDrawer}
                >
                  My Account
                </Link>
                <Link
                  to="/orders"
                  className="text-center py-2.5 bg-white rounded-lg border border-gray-200 text-sm font-bold text-gray-700 hover:border-primary/30 min-h-[44px] flex items-center justify-center"
                  onClick={closeDrawer}
                >
                  My Orders
                </Link>
              </div>
              <button
                onClick={logoutHandler}
                className="w-full flex items-center justify-center gap-2 py-3 mt-2 rounded-xl text-red-600 bg-red-50 font-bold hover:bg-red-100 transition-colors min-h-[44px]"
              >
                <LogOut size={18} /> Logout
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-white font-bold hover:bg-primary-dark transition-colors shadow-sm min-h-[44px]"
              onClick={closeDrawer}
            >
              <User size={18} /> Login / Register
            </Link>
          )}
        </div>
      </div>
    </>
  );
};

export default Navbar;