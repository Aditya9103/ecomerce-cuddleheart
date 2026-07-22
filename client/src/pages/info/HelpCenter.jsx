import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Search, ShoppingBag, Truck, RotateCcw, CreditCard, User, HelpCircle, ArrowRight } from 'lucide-react';
import PageHeader from '../../components/layout/PageHeader';

const categories = [
  { icon: <ShoppingBag size={24} />, title: "Orders", desc: "Placing and modifying orders", link: "/faqs" },
  { icon: <Truck size={24} />, title: "Delivery", desc: "Shipping times and tracking", link: "/shipping-policy" },
  { icon: <RotateCcw size={24} />, title: "Returns", desc: "Return policies and process", link: "/return-policy" },
  { icon: <CreditCard size={24} />, title: "Payments", desc: "Accepted methods and billing", link: "/faqs" },
  { icon: <User size={24} />, title: "Account", desc: "Managing your profile", link: "/account" },
  { icon: <HelpCircle size={24} />, title: "Products", desc: "Sizing, materials, and care", link: "/faqs" }
];

const articles = [
  "How do I track my order?",
  "What is your return policy?",
  "Can I change my delivery address?",
  "How do I wash my plushie?",
  "Do you ship internationally?",
  "My payment failed, what do I do?"
];

const HelpCenter = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);

  const handleCategoryClick = (e, link) => {
    if (link === '/account' && !userInfo) {
      e.preventDefault();
      navigate('/login?redirect=/account');
    }
  };

  const filteredArticles = articles.filter(article => 
    article.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="font-body bg-gray-50 min-h-screen pb-20">
      
      {/* Custom Hero for Help Center */}
      <div className="bg-gradient-to-r from-primary/10 to-primary/20 py-20 px-4 text-center text-gray-900 mb-16 relative overflow-hidden border-b border-primary/20">
        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        <div className="relative z-10 max-w-2xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-heading font-extrabold mb-6">How can we help?</h1>
          <div className="relative">
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for answers..." 
              className="w-full p-5 pl-14 rounded-full text-gray-900 font-medium focus:outline-none focus:ring-4 focus:ring-primary/20 shadow-md border border-gray-200 text-lg"
            />
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={24} />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-6xl">
        
        {/* Categories */}
        <div className="mb-16">
          <h2 className="text-2xl font-heading font-bold text-center text-gray-900 mb-10">Browse by Category</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((cat, i) => (
              <Link 
                key={i} 
                to={cat.link} 
                onClick={(e) => handleCategoryClick(e, cat.link)}
                className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md hover:border-primary/50 transition-all flex items-start gap-4 group"
              >
                <div className="w-12 h-12 bg-gray-50 text-gray-600 rounded-2xl flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                  {cat.icon}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg mb-1">{cat.title}</h3>
                  <p className="text-sm text-gray-500">{cat.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Popular Articles & Contact */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
            <h2 className="text-xl font-heading font-bold text-gray-900 mb-6">Popular Articles</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredArticles.length > 0 ? (
                filteredArticles.map((article, i) => (
                  <Link key={i} to="/faqs" className="flex items-center gap-3 p-4 rounded-xl border border-gray-50 hover:bg-gray-50 text-gray-700 font-medium transition-colors">
                    <HelpCircle size={18} className="text-primary flex-shrink-0" />
                    <span className="flex-1 truncate">{article}</span>
                    <ArrowRight size={16} className="text-gray-400" />
                  </Link>
                ))
              ) : (
                <p className="text-gray-500 col-span-2">No articles found matching your search.</p>
              )}
            </div>
          </div>
          
          <div className="bg-primary/10 rounded-3xl p-8 border border-primary/20 flex flex-col justify-center text-center">
            <h2 className="text-xl font-heading font-bold text-gray-900 mb-2">Need more help?</h2>
            <p className="text-gray-600 mb-6">Our support team is always ready to assist you.</p>
            <Link to="/contact" className="bg-primary hover:bg-primary-dark text-white font-bold py-3 px-6 rounded-full transition-all shadow-md">
              Contact Us
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default HelpCenter;
