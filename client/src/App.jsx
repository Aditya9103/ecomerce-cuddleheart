import { Routes, Route, Outlet, useLocation } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { Toaster } from 'react-hot-toast';

import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import AnnouncementBar from './components/layout/AnnouncementBar';
import ProtectedRoute from './routes/ProtectedRoute';
import AdminRoute from './routes/AdminRoute';
import AdminLayout from './components/admin/AdminLayout';

// Pages with Code Splitting
const Home = lazy(() => import('./pages/Home'));
const Shop = lazy(() => import('./pages/Shop'));
const Offers = lazy(() => import('./pages/Offers'));
const CategoryPage = lazy(() => import('./pages/CategoryPage'));
const SearchResults = lazy(() => import('./pages/SearchResults'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Cart = lazy(() => import('./pages/Cart'));
const Wishlist = lazy(() => import('./pages/Wishlist'));
const Account = lazy(() => import('./pages/Account'));
const Checkout = lazy(() => import('./pages/Checkout'));
const OrderSuccess = lazy(() => import('./pages/OrderSuccess'));
const OrderHistory = lazy(() => import('./pages/OrderHistory'));
const OrderDetail = lazy(() => import('./pages/OrderDetail'));
const NotFound = lazy(() => import('./pages/NotFound'));

const InfoAbout = lazy(() => import('./pages/info/About'));
const InfoContact = lazy(() => import('./pages/info/Contact'));
const InfoFaq = lazy(() => import('./pages/info/Faq'));
const InfoTrackOrder = lazy(() => import('./pages/info/TrackOrder'));
const InfoHelpCenter = lazy(() => import('./pages/info/HelpCenter'));
const InfoPolicyPages = lazy(() => import('./pages/info/PolicyPages'));

// Admin Pages with Code Splitting
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'));
const AdminRegister = lazy(() => import('./pages/admin/AdminRegister'));
const Dashboard = lazy(() => import('./pages/admin/Dashboard'));
const AdminProducts = lazy(() => import('./pages/admin/AdminProducts'));
const ProductForm = lazy(() => import('./pages/admin/ProductForm'));
const AdminCategories = lazy(() => import('./pages/admin/AdminCategories'));
const CategoryForm = lazy(() => import('./pages/admin/CategoryForm'));
const AdminBanners = lazy(() => import('./pages/admin/AdminBanners'));
const BannerForm = lazy(() => import('./pages/admin/BannerForm'));
const AdminOffers = lazy(() => import('./pages/admin/AdminOffers'));
const OfferForm = lazy(() => import('./pages/admin/OfferForm'));
const AdminMerchandising = lazy(() => import('./pages/admin/AdminMerchandising'));
const AdminOrders = lazy(() => import('./pages/admin/AdminOrders'));
const AdminOrderDetail = lazy(() => import('./pages/admin/AdminOrderDetail'));
const AdminCustomers = lazy(() => import('./pages/admin/AdminCustomers'));
const AdminContacts = lazy(() => import('./pages/admin/AdminContacts'));
const AdminNewsletter = lazy(() => import('./pages/admin/AdminNewsletter'));
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings'));

const MainLayout = () => {
  const location = useLocation();
  const isHome = location.pathname === '/';
  
  return (
    <div className="min-h-screen flex flex-col font-body bg-gray-50 text-gray-800">
      {isHome && <AnnouncementBar />}
      <Navbar />
      <main className="flex-1 flex flex-col">
        <Suspense fallback={
          <div className="min-h-[60vh] flex flex-col items-center justify-center">
            <div className="w-12 h-12 border-4 border-gray-200 border-t-primary rounded-full animate-spin mb-4" />
            <p className="text-sm font-bold tracking-widest uppercase animate-pulse text-gray-500">Loading...</p>
          </div>
        }>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
};

const AdminSuspenseLayout = () => {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900">
        <div className="w-12 h-12 border-4 border-gray-700 border-t-white rounded-full animate-spin mb-4" />
      </div>
    }>
      <Outlet />
    </Suspense>
  );
}

function App() {
  return (
    <>
      <Toaster position="bottom-right" />
      <Routes>
      {/* Public Pages with Navbar & Footer */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/product/:slug" element={<ProductDetail />} />
        
        <Route path="/shop" element={<Shop />} />
        <Route path="/offers" element={<Offers />} />
        <Route path="/shop/:categorySlug" element={<CategoryPage />} />
        <Route path="/search" element={<SearchResults />} />
        
        <Route path="/cart" element={<Cart />} />
        
        {/* Info Pages */}
        <Route path="/about" element={<InfoAbout />} />
        <Route path="/contact" element={<InfoContact />} />
        <Route path="/faqs" element={<InfoFaq />} />
        <Route path="/track-order" element={<InfoTrackOrder />} />
        <Route path="/returns" element={<InfoPolicyPages />} />
        <Route path="/shipping-policy" element={<InfoPolicyPages />} />
        <Route path="/return-policy" element={<InfoPolicyPages />} />
        <Route path="/terms" element={<InfoPolicyPages />} />
        <Route path="/privacy" element={<InfoPolicyPages />} />
        <Route path="/help" element={<InfoHelpCenter />} />

        {/* Protected Routes */}
        <Route path="/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
        <Route path="/account" element={<ProtectedRoute><Account /></ProtectedRoute>} />
        <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
        <Route path="/order-success/:orderId" element={<ProtectedRoute><OrderSuccess /></ProtectedRoute>} />
        <Route path="/orders" element={<ProtectedRoute><OrderHistory /></ProtectedRoute>} />
        <Route path="/orders/:id" element={<ProtectedRoute><OrderDetail /></ProtectedRoute>} />
        
        {/* Catch-all 404 Route */}
        <Route path="*" element={<NotFound />} />
      </Route>

      {/* Admin Routes without global Navbar/Footer */}
      <Route element={<AdminSuspenseLayout />}>
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/register" element={<AdminRegister />} />
        
        <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="products/new" element={<ProductForm />} />
          <Route path="products/:id/edit" element={<ProductForm />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="categories/new" element={<CategoryForm />} />
          <Route path="categories/:id/edit" element={<CategoryForm />} />
          <Route path="banners" element={<AdminBanners />} />
          <Route path="banners/new" element={<BannerForm />} />
          <Route path="banners/:id/edit" element={<BannerForm />} />
          <Route path="offers" element={<AdminOffers />} />
          <Route path="offers/new" element={<OfferForm />} />
          <Route path="offers/:id/edit" element={<OfferForm />} />
          <Route path="merchandising" element={<AdminMerchandising />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="orders/:id" element={<AdminOrderDetail />} />
          <Route path="customers" element={<AdminCustomers />} />
          <Route path="contacts" element={<AdminContacts />} />
          <Route path="newsletter" element={<AdminNewsletter />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>
      </Route>
      </Routes>
    </>
  );
}

export default App;
