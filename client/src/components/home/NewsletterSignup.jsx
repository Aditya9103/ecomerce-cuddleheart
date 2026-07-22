import { useState } from 'react';
import { Mail } from 'lucide-react';
import { useSubscribeNewsletterMutation } from '../../store/slices/newsletterApiSlice';

const NewsletterSignup = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [subscribe, { isLoading }] = useSubscribeNewsletterMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await subscribe({ email }).unwrap();
      setMessage(res.message || 'Subscribed successfully!');
      setEmail('');
    } catch (err) {
      setMessage(err?.data?.message || 'Failed to subscribe');
    }
  };

  return (
    <section className="container mx-auto px-4 py-8 mb-8">
      <div className="bg-primary-light rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Left Side: Text */}
        <div className="flex items-center gap-4 text-center md:text-left">
          <div className="text-primary hidden sm:block">
            <Mail size={40} strokeWidth={1.5} />
          </div>
          <div>
            <h3 className="font-heading font-bold text-heading text-xl md:text-2xl mb-1 flex items-center justify-center md:justify-start gap-2">
              Join Our Cuddle Club! 🐻
            </h3>
            <p className="text-gray-600 text-sm">
              Get exclusive offers, new arrival alerts & more.
            </p>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="w-full md:w-auto flex-grow max-w-md flex flex-col relative">
          <form className="w-full flex relative" onSubmit={handleSubmit}>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email" 
              className="w-full bg-white rounded-full py-3 pl-6 pr-32 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 shadow-sm"
              required
            />
            <button type="submit" disabled={isLoading} className="absolute right-1 top-1 bottom-1 bg-primary hover:bg-primary-dark text-white font-medium text-sm px-6 rounded-full transition-colors disabled:opacity-70">
              {isLoading ? 'Subscribing...' : 'Subscribe'}
            </button>
          </form>
          {message && <p className="text-xs text-primary-dark font-bold mt-2 text-center md:text-left">{message}</p>}
        </div>

      </div>
    </section>
  );
};

export default NewsletterSignup;
