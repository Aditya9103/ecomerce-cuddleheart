import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useRegisterMutation, useVerifyOtpMutation } from '../store/slices/authApiSlice';
import { setCredentials } from '../store/slices/authSlice';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  
  const [step, setStep] = useState(1); // 1 = Register form, 2 = OTP form

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const [register, { isLoading: isRegistering, error: registerError }] = useRegisterMutation();
  const [verifyOtp, { isLoading: isVerifying, error: verifyError }] = useVerifyOtpMutation();

  const { userInfo } = useSelector((state) => state.auth);

  useEffect(() => {
    if (userInfo) {
      navigate('/');
    }
    if (location.state?.unverified) {
      setEmail(location.state.email);
      setStep(2); // Jump straight to OTP step
    }
  }, [navigate, userInfo, location]);

  const submitRegisterHandler = async (e) => {
    e.preventDefault();
    try {
      await register({ name, email, password }).unwrap();
      setStep(2);
    } catch (err) {
      console.error(err);
    }
  };

  const submitOtpHandler = async (e) => {
    e.preventDefault();
    try {
      const res = await verifyOtp({ email, otp }).unwrap();
      dispatch(setCredentials({ ...res }));
      navigate('/');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-body bg-gray-50 text-gray-800">
      
      <main className="flex-grow flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm max-w-md w-full">
          
          {step === 1 && (
            <>
              <div className="text-center mb-8">
                <h1 className="text-3xl font-heading font-bold text-heading">Create Account</h1>
                <p className="text-gray-500 mt-2">Join Cuddle Hearts today</p>
              </div>

              {registerError && <div className="bg-red-50 text-red-500 p-3 rounded-lg mb-6 text-sm">{registerError?.data?.message || registerError.error}</div>}

              <form onSubmit={submitRegisterHandler} className="flex flex-col gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Full Name</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

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
                  disabled={isRegistering}
                >
                  {isRegistering ? 'Sending OTP...' : 'Register'}
                </button>
              </form>

              <p className="text-center text-sm text-gray-500 mt-6">
                Already have an account? <Link to="/login" className="text-primary font-bold hover:underline">Log in</Link>
              </p>
            </>
          )}

          {step === 2 && (
            <>
              <div className="text-center mb-8">
                <h1 className="text-3xl font-heading font-bold text-heading">Verify Email</h1>
                <p className="text-gray-500 mt-2 text-sm">We've sent a 6-digit OTP to <strong>{email}</strong></p>
              </div>

              {verifyError && <div className="bg-red-50 text-red-500 p-3 rounded-lg mb-6 text-sm">{verifyError?.data?.message || verifyError.error}</div>}

              <form onSubmit={submitOtpHandler} className="flex flex-col gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1 text-center">Enter OTP</label>
                  <input 
                    type="text" 
                    maxLength="6"
                    className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-center text-2xl tracking-[0.5em] font-bold"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                  />
                </div>

                <button 
                  type="submit" 
                  className="btn-primary w-full mt-4"
                  disabled={isVerifying}
                >
                  {isVerifying ? 'Verifying...' : 'Verify OTP'}
                </button>
              </form>
            </>
          )}

        </div>
      </main>

    </div>
  );
};

export default Register;
