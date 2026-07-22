import { useState, useEffect } from 'react';
import { Search, User, Heart, ShoppingCart, ChevronDown, ChevronRight, Menu, X, LogOut, Package, Tag, Zap, Headphones } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useGetCartQuery } from '../../store/slices/cartApiSlice';
import { logout } from '../../store/slices/authSlice';
import { useGetCategoriesQuery } from '../../store/slices/productApiSlice';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileCategoriesOpen, setIsMobileCategoriesOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Prevent scrolling when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isMobileMenuOpen]);
  
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { userInfo } = useSelector((state) => state.auth);
  const { guestCartItems } = useSelector((state) => state.cart);
  const { data: cartData } = useGetCartQuery(undefined, { skip: !userInfo });
  const { data: categories } = useGetCategoriesQuery();
  
  const cartCount = userInfo 
    ? cartData?.items?.reduce((acc, item) => acc + item.quantity, 0) || 0
    : guestCartItems?.reduce((acc, item) => acc + item.quantity, 0) || 0;

  const logoutHandler = () => {
    dispatch(logout());
    navigate('/login');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${searchQuery}`);
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <header className="w-full bg-white sticky top-0 z-50 border-b border-border shadow-sm">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        
        {/* Mobile Menu Toggle & Logo */}
        <div className="flex items-center gap-3">
          <button 
            className="lg:hidden p-1 text-gray-700" 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-orange-200 rounded-full flex items-center justify-center text-lg md:text-xl shrink-0">🐻</div>
            <div className="flex flex-col hidden sm:flex shrink-0">
              <span className="font-heading font-bold text-lg md:text-xl text-heading leading-none whitespace-nowrap">Cuddle Hearts</span>
              <span className="hidden xl:block text-[9px] md:text-[10px] text-textMuted uppercase font-semibold tracking-wider whitespace-nowrap">Bringing Smiles, Everytime!</span>
            </div>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-3 xl:gap-6 font-medium text-gray-700 text-sm xl:text-base whitespace-nowrap">
          <Link to="/" className="text-primary hover:text-primary-dark transition-colors">Home</Link>
          <Link to="/shop" className="hover:text-primary transition-colors">Shop</Link>
          
          <div className="relative group cursor-pointer hover:text-primary transition-colors">
            <div className="flex items-center gap-1 py-4">Categories <ChevronDown size={14} /></div>
            <div className="absolute top-[80%] left-0 pt-2 hidden group-hover:block z-50">
              <div className="bg-white border border-gray-100 shadow-lg rounded-xl py-2 w-48">
                {categories?.map(category => (
                  <Link key={category._id} to={`/shop/${category.slug}`} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors">
                    {category.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
          
          <Link to="/shop?tag=new-arrival" className="hover:text-primary transition-colors">New Arrivals</Link>
          <Link to="/shop?tag=bestseller" className="hover:text-primary transition-colors">Best Sellers</Link>
          <Link to="/offers" className="hover:text-primary transition-colors">Offers</Link>
        </nav>

        {/* Search & Actions */}
        <div className="flex items-center gap-2 md:gap-4">
          <form onSubmit={handleSearch} className="hidden md:flex relative">
            <input 
              type="text" 
              placeholder="Search..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-gray-100 rounded-full py-2 pl-4 pr-10 text-sm focus:outline-none focus:ring-1 focus:ring-primary w-40 md:w-48 lg:w-40 xl:w-64 transition-all"
            />
            <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition-colors">
              <Search size={18} />
            </button>
          </form>
          
          <div className="flex items-center gap-1 md:gap-3">
            <button className="md:hidden p-2 hover:bg-gray-100 rounded-full transition-colors"><Search size={20} className="text-gray-700" /></button>
            
            {userInfo ? (
              <div className="hidden sm:flex items-center gap-2 relative group">
                <button className="p-2 hover:bg-gray-100 rounded-full transition-colors flex items-center gap-1 text-sm font-bold">
                  <User size={20} className="text-primary" />
                  <span className="truncate max-w-[80px]">{userInfo.name.split(' ')[0]}</span>
                </button>
                <div className="absolute top-full right-0 pt-2 hidden group-hover:block z-50">
                  <div className="bg-white border border-gray-100 shadow-lg rounded-lg py-2 w-40">
                     <Link to="/account" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">My Profile</Link>
                     <Link to="/orders" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">My Orders</Link>
                     <div className="border-t border-gray-100 my-1"></div>
                     <button onClick={logoutHandler} className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-50 flex items-center gap-2">
                       <LogOut size={16} /> Logout
                     </button>
                  </div>
                </div>
              </div>
            ) : (
              <Link to="/login" className="hidden sm:block p-2 hover:bg-gray-100 rounded-full transition-colors"><User size={20} className="text-gray-700" /></Link>
            )}

            <Link to="/wishlist" className="p-2 hover:bg-gray-100 rounded-full transition-colors"><Heart size={20} className="text-gray-700" /></Link>
            <Link to="/cart" className="relative p-2 hover:bg-gray-100 rounded-full transition-colors">
              <ShoppingCart size={20} className="text-gray-700" />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 bg-primary text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">{cartCount}</span>
              )}
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {/* Backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-[60] lg:hidden transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Drawer */}
      <div className={`fixed inset-y-0 left-0 w-4/5 max-w-sm bg-white z-[70] shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col lg:hidden ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        
        {/* Drawer Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 shrink-0">
          <Link to="/" className="flex items-center gap-2" onClick={() => setIsMobileMenuOpen(false)}>
            <div className="w-8 h-8 bg-orange-200 rounded-full flex items-center justify-center text-lg">🐻</div>
            <span className="font-heading font-bold text-lg text-heading">Cuddle Hearts</span>
          </Link>
          <button 
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-2 bg-gray-50 text-gray-500 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Drawer Content */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          {/* Mobile Search */}
          <div className="p-4 border-b border-gray-100">
            <form onSubmit={handleSearch} className="relative">
              <input 
                type="text" 
                placeholder="Search products..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-50 rounded-xl py-3 pl-4 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 border border-gray-100 font-medium text-gray-900"
              />
              <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition-colors">
                <Search size={18} />
              </button>
            </form>
          </div>

          {/* Links */}
          <div className="p-4 flex flex-col gap-2 font-medium text-gray-700">
            <Link to="/" className="flex items-center gap-3 p-3 rounded-xl hover:bg-primary/5 hover:text-primary transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
              <Package size={18} /> Home
            </Link>
            <Link to="/shop" className="flex items-center gap-3 p-3 rounded-xl hover:bg-primary/5 hover:text-primary transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
              <Zap size={18} /> Shop All
            </Link>
            
            {/* Mobile Categories Accordion */}
            <div className="rounded-xl overflow-hidden">
              <button 
                onClick={() => setIsMobileCategoriesOpen(!isMobileCategoriesOpen)}
                className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-primary/5 hover:text-primary transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Tag size={18} /> Categories
                </div>
                <ChevronDown size={18} className={`transition-transform ${isMobileCategoriesOpen ? 'rotate-180 text-primary' : ''}`} />
              </button>
              
              <div className={`transition-all duration-200 ease-in-out ${isMobileCategoriesOpen ? 'max-h-96 opacity-100 ml-4 border-l-2 border-gray-100' : 'max-h-0 opacity-0 pointer-events-none'}`}>
                {categories?.map(category => (
                  <Link 
                    key={category._id} 
                    to={`/shop/${category.slug}`} 
                    className="flex items-center gap-2 py-2 px-4 text-sm text-gray-500 hover:text-primary transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <ChevronRight size={14} /> {category.name}
                  </Link>
                ))}
              </div>
            </div>

            <Link to="/offers" className="flex items-center gap-3 p-3 rounded-xl hover:bg-primary/5 hover:text-primary transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
              <Tag size={18} /> Offers
            </Link>
            <Link to="/help" className="flex items-center gap-3 p-3 rounded-xl hover:bg-primary/5 hover:text-primary transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
              <Headphones size={18} /> Help Center
            </Link>
          </div>
        </div>

        {/* Drawer Footer (Auth) */}
        <div className="p-4 border-t border-gray-100 bg-gray-50 shrink-0">
          {userInfo ? (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3 p-2 mb-2 bg-white rounded-xl border border-gray-200">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <User size={20} className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 truncate">{userInfo.name}</p>
                  <p className="text-xs text-gray-500 truncate">{userInfo.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Link to="/account" className="text-center py-2 bg-white rounded-lg border border-gray-200 text-sm font-bold text-gray-700 hover:border-primary/30" onClick={() => setIsMobileMenuOpen(false)}>
                  My Account
                </Link>
                <Link to="/orders" className="text-center py-2 bg-white rounded-lg border border-gray-200 text-sm font-bold text-gray-700 hover:border-primary/30" onClick={() => setIsMobileMenuOpen(false)}>
                  My Orders
                </Link>
              </div>
              <button 
                onClick={() => { logoutHandler(); setIsMobileMenuOpen(false); }} 
                className="w-full flex items-center justify-center gap-2 py-3 mt-2 rounded-xl text-red-600 bg-red-50 font-bold hover:bg-red-100 transition-colors"
              >
                <LogOut size={18} /> Logout
              </button>
            </div>
          ) : (
            <Link 
              to="/login" 
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-white font-bold hover:bg-primary-dark transition-colors shadow-sm"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <User size={18} /> Login / Register
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
