import { useGetOffersQuery } from '../store/slices/offerApiSlice';
import { useGetProductsQuery } from '../store/slices/productApiSlice';
import { Tag, Copy, CheckCircle2, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/product/ProductCard';

const SaleSection = ({ offer }) => {
  const { data, isLoading } = useGetProductsQuery({ offer: offer._id, limit: 12 });
  
  if (isLoading) return <div className="animate-pulse h-64 bg-gray-100 rounded-3xl mb-12"></div>;
  if (!data?.products || data.products.length === 0) return null;

  return (
    <section className="mb-16">
      <div className="flex justify-between items-end mb-6 border-b border-gray-200 pb-4">
        <div>
          <div className="inline-block bg-red-100 text-red-600 text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider mb-2">
            Live Sale
          </div>
          <h2 className="text-3xl font-heading font-extrabold text-gray-900">{offer.title}</h2>
          {offer.description && <p className="text-gray-500 mt-1">{offer.description}</p>}
        </div>
        <Link to={`/shop?offer=${offer._id}`} className="text-primary font-bold hover:text-primary-dark flex items-center gap-1 group">
          View All <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {data.products.map(product => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </section>
  );
};

const Offers = () => {
  const { data: offers, isLoading } = useGetOffersQuery();
  const [copiedCode, setCopiedCode] = useState(null);

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const activeOffers = offers?.filter(offer => offer.isActive && offer.type === 'coupon') || [];
  const comboDeals = offers?.filter(offer => offer.isActive && offer.type === 'combo') || [];
  const saleOffers = offers?.filter(offer => offer.isActive && offer.type === 'sale') || [];

  return (
    <div className="min-h-screen flex flex-col font-body bg-gray-50 text-gray-800">
      
      <main className="flex-grow container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-heading font-extrabold text-heading mb-4 flex items-center justify-center gap-3">
            <Tag className="text-primary" size={32} />
            Exclusive Offers & Deals
          </h1>
          <p className="text-gray-500 max-w-2xl mx-auto text-lg">
            Save big on your favorite cuddly friends with our latest coupon codes and combo deals!
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="flex flex-col gap-12">
            
            {/* Coupon Codes Section */}
            {activeOffers.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold mb-6 border-b border-gray-200 pb-2">Active Coupon Codes</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {activeOffers.map(offer => (
                    <div key={offer._id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center relative overflow-hidden group hover:shadow-md transition-shadow">
                      <div className="absolute top-0 left-0 w-full h-2 bg-primary"></div>
                      <h3 className="font-bold text-xl mb-2 mt-2 text-gray-900">{offer.title}</h3>
                      <p className="text-gray-500 text-sm mb-6 flex-grow">{offer.description}</p>
                      
                      <div className="bg-primary-light/10 border border-primary-light rounded-xl p-4 w-full flex items-center justify-between mb-4">
                        <span className="font-mono font-bold text-lg text-primary tracking-widest">{offer.code}</span>
                        <button 
                          onClick={() => handleCopy(offer.code)}
                          className="text-gray-500 hover:text-primary transition-colors flex items-center gap-1 text-sm font-bold bg-white px-3 py-1.5 rounded-lg shadow-sm border border-gray-100"
                        >
                          {copiedCode === offer.code ? (
                            <><CheckCircle2 size={16} className="text-green-500"/> Copied</>
                          ) : (
                            <><Copy size={16} /> Copy</>
                          )}
                        </button>
                      </div>

                      <div className="w-full flex justify-between items-center text-xs text-gray-400 font-medium">
                        <span>Min. Purchase: ₹{offer.minPurchaseAmount}</span>
                        <span>{offer.discountType === 'percentage' ? `${offer.discountValue}% OFF` : `₹${offer.discountValue} OFF`}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Combo Deals Section */}
            {comboDeals.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold mb-6 border-b border-gray-200 pb-2">Combo Deals</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {comboDeals.map(deal => (
                    <div key={deal._id} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col md:flex-row group hover:shadow-md transition-shadow">
                      {deal.image && (
                        <div className="md:w-1/2 h-48 md:h-auto bg-gray-50 relative overflow-hidden">
                          <img src={deal.image} alt={deal.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        </div>
                      )}
                      <div className={`p-8 flex flex-col justify-center ${deal.image ? 'md:w-1/2' : 'w-full'}`}>
                        <div className="inline-block bg-orange-100 text-orange-600 text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider mb-4 w-max">
                          Combo Deal
                        </div>
                        <h3 className="font-heading font-bold text-2xl text-gray-900 mb-3 leading-tight">{deal.title}</h3>
                        <p className="text-gray-500 mb-6 line-clamp-3">{deal.description}</p>
                        
                        <div className="flex items-end gap-3 mb-6">
                          <span className="text-4xl font-extrabold text-primary">
                            {deal.discountType === 'percentage' ? `${deal.discountValue}%` : `₹${deal.discountValue}`} OFF
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Sale Offers Section */}
            {saleOffers.map(offer => (
              <SaleSection key={offer._id} offer={offer} />
            ))}

            {activeOffers.length === 0 && comboDeals.length === 0 && saleOffers.length === 0 && (
              <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Tag size={32} className="text-gray-300" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No Active Offers</h3>
                <p className="text-gray-500">Check back later for exciting deals and discounts!</p>
              </div>
            )}
          </div>
        )}
      </main>

    </div>
  );
};

export default Offers;
