import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Package } from 'lucide-react';
import PageHeader from '../../components/layout/PageHeader';

const TrackOrder = () => {
  const [orderId, setOrderId] = useState('');
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  const handleTrack = (e) => {
    e.preventDefault();
    if (orderId) {
      // In a real app, this would query an unauthenticated track order endpoint
      // For now, we will redirect to the order details page assuming they are logged in,
      // or the backend handles guest tracking.
      navigate(`/orders/${orderId}`);
    }
  };

  return (
    <div className="font-body bg-gray-50 min-h-screen pb-20">
      <PageHeader 
        title="Track Your Order" 
        breadcrumbs={<><Link to="/" className="hover:text-primary">Home</Link> <span className="mx-2">/</span> <span>Track Order</span></>}
      />
      
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100 text-center">
          
          <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
            <Package size={40} />
          </div>
          
          <h2 className="text-2xl font-heading font-extrabold text-gray-900 mb-2">Where is my order?</h2>
          <p className="text-gray-500 mb-8">Enter your Order ID and Email Address below to track the current status of your delivery.</p>

          <form onSubmit={handleTrack} className="space-y-6 text-left">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Order ID</label>
              <input 
                required 
                type="text" 
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="e.g. 64b2c9f..." 
                className="w-full p-4 rounded-xl border border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none font-medium text-gray-900" 
              />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Email Address</label>
              <input 
                required 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="used during checkout" 
                className="w-full p-4 rounded-xl border border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none font-medium text-gray-900" 
              />
            </div>

            <button 
              type="submit" 
              className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-4 rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 flex items-center justify-center gap-2"
            >
              <Search size={20} /> Track Now
            </button>
          </form>

        </div>
      </div>
    </div>
  );
};

export default TrackOrder;
