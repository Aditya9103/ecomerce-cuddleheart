import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useAdminRegisterMutation } from '../../store/slices/authApiSlice';
import { setCredentials } from '../../store/slices/authSlice';
import { ShieldCheck } from 'lucide-react';

const AdminRegister = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secretKey, setSecretKey] = useState('');
  
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [adminRegister, { isLoading, error }] = useAdminRegisterMutation();
  const { userInfo } = useSelector((state) => state.auth);

  useEffect(() => {
    // If logged in but not admin, maybe redirect? 
    // Usually only admins can access this, or it's a hidden route.
    if (userInfo && userInfo.role === 'admin') {
      navigate('/admin');
    }
  }, [navigate, userInfo]);

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      const res = await adminRegister({ name, email, password, secretKey }).unwrap();
      dispatch(setCredentials({ ...res }));
      navigate('/admin');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center font-body bg-gray-900 text-gray-800 p-4">
      <div className="bg-white p-8 md:p-10 rounded-2xl shadow-2xl max-w-md w-full border-t-8 border-green-500">
        <div className="text-center mb-8 flex flex-col items-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <ShieldCheck size={32} className="text-green-600" />
          </div>
          <h1 className="text-3xl font-heading font-extrabold text-gray-900 tracking-tight">Provision Admin</h1>
          <p className="text-gray-500 mt-2 font-medium">Create a new administrator account</p>
        </div>

        {error && <div className="bg-red-50 text-red-600 font-bold p-4 rounded-lg mb-6 text-sm text-center border border-red-200">{error?.data?.message || error.error}</div>}

        <form onSubmit={submitHandler} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Full Name</label>
            <input 
              type="text" 
              className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all font-medium"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jane Doe"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Email Address</label>
            <input 
              type="email" 
              className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all font-medium"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jane@cuddlehearts.com"
              required
            />
          </div>
          
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Password</label>
            <input 
              type="password" 
              className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all font-medium"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-red-500 uppercase tracking-wider mb-2 flex justify-between">
              <span>Secret Provisioning Key</span>
              <span>*Required</span>
            </label>
            <input 
              type="password" 
              className="w-full px-4 py-3 rounded-lg bg-red-50 border border-red-200 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all font-bold text-red-700 placeholder:text-red-300"
              value={secretKey}
              onChange={(e) => setSecretKey(e.target.value)}
              placeholder="Enter server secret key"
              required
            />
          </div>

          <button 
            type="submit" 
            className="bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg py-4 mt-4 transition-colors w-full flex justify-center items-center gap-2"
            disabled={isLoading}
          >
            {isLoading ? 'Provisioning...' : 'Create Admin Account'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6 font-medium">
          Already an admin? <Link to="/admin/login" className="text-green-600 font-bold hover:underline">Login here</Link>
        </p>
      </div>
    </div>
  );
};

export default AdminRegister;
