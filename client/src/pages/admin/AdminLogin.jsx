import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useAdminLoginMutation } from '../../store/slices/authApiSlice';
import { setCredentials } from '../../store/slices/authSlice';
import { ShieldAlert } from 'lucide-react';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [adminLogin, { isLoading, error }] = useAdminLoginMutation();
  const { userInfo } = useSelector((state) => state.auth);

  useEffect(() => {
    if (userInfo && userInfo.role === 'admin') {
      navigate('/admin');
    }
  }, [navigate, userInfo]);

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      const res = await adminLogin({ email, password }).unwrap();
      dispatch(setCredentials({ ...res }));
      navigate('/admin');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center font-body bg-gray-900 text-gray-800 p-4">
      <div className="bg-white p-8 md:p-10 rounded-2xl shadow-2xl max-w-md w-full border-t-8 border-primary">
        <div className="text-center mb-8 flex flex-col items-center">
          <div className="w-16 h-16 bg-primary-light rounded-full flex items-center justify-center mb-4">
            <ShieldAlert size={32} className="text-primary" />
          </div>
          <h1 className="text-3xl font-heading font-extrabold text-gray-900 tracking-tight">Admin Portal</h1>
          <p className="text-gray-500 mt-2 font-medium">Authorized Personnel Only</p>
        </div>

        {error && <div className="bg-red-50 text-red-600 font-bold p-4 rounded-lg mb-6 text-sm text-center border border-red-200">{error?.data?.message || error.error}</div>}

        <form onSubmit={submitHandler} className="flex flex-col gap-5">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Email Address</label>
            <input 
              type="email" 
              className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@cuddlehearts.com"
              required
            />
          </div>
          
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Password</label>
            <input 
              type="password" 
              className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <button 
            type="submit" 
            className="bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-lg py-4 mt-4 transition-colors w-full flex justify-center items-center gap-2"
            disabled={isLoading}
          >
            {isLoading ? 'Authenticating...' : 'Secure Login'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6 font-medium">
          Need an account? <Link to="/admin/register" className="text-primary font-bold hover:underline">Provision Admin</Link>
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
