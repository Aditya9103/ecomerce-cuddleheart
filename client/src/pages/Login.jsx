import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useLoginMutation } from '../store/slices/authApiSlice';
import { useAddToCartMutation } from '../store/slices/cartApiSlice';
import { setCredentials } from '../store/slices/authSlice';
import { clearGuestCart } from '../store/slices/cartSlice';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [login, { isLoading, error }] = useLoginMutation();
  const [addToCart] = useAddToCartMutation();
  const { userInfo } = useSelector((state) => state.auth);
  const { guestCartItems } = useSelector((state) => state.cart);

  useEffect(() => {
    if (userInfo) {
      navigate('/');
    }
  }, [navigate, userInfo]);

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      const res = await login({ email, password }).unwrap();
      dispatch(setCredentials({ ...res }));
      
      // Guest Cart Sync
      if (guestCartItems.length > 0) {
        for (const item of guestCartItems) {
          try {
            await addToCart({ productId: item.product._id, quantity: item.quantity }).unwrap();
          } catch (e) {
            console.error('Error syncing cart item', e);
          }
        }
        dispatch(clearGuestCart());
      }

      navigate('/');
    } catch (err) {
      if (err?.data?.unverified) {
        // Redirect to register/OTP verification flow if unverified
        navigate('/register', { state: { email, unverified: true } });
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-body bg-gray-50 text-gray-800">
      
      <main className="flex-grow flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm max-w-md w-full">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-heading font-bold text-heading">Welcome Back</h1>
            <p className="text-gray-500 mt-2">Log in to your account</p>
          </div>

          {error && <div className="bg-red-50 text-red-500 p-3 rounded-lg mb-6 text-sm">{error?.data?.message || error.error}</div>}

          <form onSubmit={submitHandler} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Email</label>
              <input 
                type="email" 
                className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Password</label>
              <input 
                type="password" 
                className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button 
              type="submit" 
              className="btn-primary w-full mt-4"
              disabled={isLoading}
            >
              {isLoading ? 'Logging in...' : 'Log In'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Don't have an account? <Link to="/register" className="text-primary font-bold hover:underline">Register</Link>
          </p>
        </div>
      </main>

    </div>
  );
};

export default Login;
