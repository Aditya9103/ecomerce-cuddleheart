import { Link, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, Tags, ShoppingCart, Users, Settings, Mail, LogOut, Image, Zap, Tag } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { logout } from '../../store/slices/authSlice';

const AdminLayout = () => {
  const location = useLocation();
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logout());
  };

  const menuItems = [
    { path: '/admin', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { path: '/admin/products', icon: <Package size={20} />, label: 'Products' },
    { path: '/admin/categories', icon: <Tags size={20} />, label: 'Categories' },
    { path: '/admin/merchandising', icon: <Zap size={20} />, label: 'Merchandising' },
    { path: '/admin/banners', icon: <Image size={20} />, label: 'Banners' },
    { path: '/admin/offers', icon: <Tag size={20} />, label: 'Offers' },
    { path: '/admin/orders', icon: <ShoppingCart size={20} />, label: 'Orders' },
    { path: '/admin/customers', icon: <Users size={20} />, label: 'Customers' },
    { path: '/admin/newsletter', icon: <Mail size={20} />, label: 'Newsletter' },
    { path: '/admin/contacts', icon: <Mail size={20} />, label: 'Messages' },
    { path: '/admin/settings', icon: <Settings size={20} />, label: 'Settings' },
  ];

  return (
    <div className="flex h-screen bg-gray-50 font-body">

      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col hidden md:flex">
        <div className="h-20 flex items-center px-6 border-b border-gray-100">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-orange-200 rounded-full flex items-center justify-center text-lg">🐻</div>
            <span className="font-heading font-bold text-lg text-heading leading-none">Cuddle Admin</span>
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto py-6 flex flex-col gap-1 px-4">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-sm font-medium
                ${location.pathname === item.path || (location.pathname.startsWith(item.path) && item.path !== '/admin')
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100'}`}
            >
              {item.icon} {item.label}
            </Link>
          ))}
        </div>

        <div className="p-4 border-t border-gray-100 flex flex-col gap-2">
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 w-full transition-colors text-sm font-medium"
          >
            <LogOut size={20} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">

        {/* Top Header */}
        <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-8 flex-shrink-0">
          <h2 className="text-xl font-bold text-gray-800">Admin Portal</h2>
          <div className="flex items-center gap-4">
            <Link to="/" className="text-sm font-medium text-primary hover:underline">View Storefront</Link>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-8 bg-gray-50">
          <Outlet />
        </div>

      </main>
    </div>
  );
};

export default AdminLayout;
