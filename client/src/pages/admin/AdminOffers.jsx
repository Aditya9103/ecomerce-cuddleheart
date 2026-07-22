import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { useGetOffersQuery, useDeleteOfferMutation } from '../../store/slices/offerApiSlice';

const AdminOffers = () => {
  const { data: offers, isLoading, refetch } = useGetOffersQuery();
  const [deleteOffer, { isLoading: isDeleting }] = useDeleteOfferMutation();
  const [activeTab, setActiveTab] = useState('coupon');

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this offer?')) {
      try {
        await deleteOffer(id).unwrap();
        refetch();
      } catch (err) {
        toast.error(err?.data?.message || 'Failed to delete offer');
      }
    }
  };

  if (isLoading) return <div>Loading offers...</div>;

  const filteredOffers = offers?.filter(offer => offer.type === activeTab);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Offers & Promotions</h1>
        <Link to="/admin/offers/new" className="btn-primary flex items-center gap-2 px-4 py-2 text-sm">
          <Plus size={16} /> Add Offer
        </Link>
      </div>

      <div className="flex gap-4 mb-6">
        <button 
          onClick={() => setActiveTab('coupon')}
          className={`px-6 py-2 rounded-full font-bold text-sm transition-colors ${activeTab === 'coupon' ? 'bg-primary text-white' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}`}
        >
          Coupons
        </button>
        <button 
          onClick={() => setActiveTab('combo')}
          className={`px-6 py-2 rounded-full font-bold text-sm transition-colors ${activeTab === 'combo' ? 'bg-primary text-white' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}`}
        >
          Combo Deals
        </button>
        <button 
          onClick={() => setActiveTab('sale')}
          className={`px-6 py-2 rounded-full font-bold text-sm transition-colors ${activeTab === 'sale' ? 'bg-primary text-white' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}`}
        >
          Sale (Product Discount)
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-sm">
                <th className="p-4 font-bold border-b border-gray-100">{activeTab === 'combo' || activeTab === 'sale' ? 'Image / Title' : 'Code'}</th>
                <th className="p-4 font-bold border-b border-gray-100">Discount</th>
                <th className="p-4 font-bold border-b border-gray-100">Min Purchase</th>
                <th className="p-4 font-bold border-b border-gray-100">Status</th>
                <th className="p-4 font-bold border-b border-gray-100 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredOffers?.map((offer) => (
                <tr key={offer._id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="p-4 font-medium text-gray-900 flex items-center gap-3">
                    {activeTab === 'combo' && (
                      offer.image ? <img src={offer.image} alt={offer.title} className="w-12 h-12 object-cover rounded bg-gray-100" /> : <div className="w-12 h-12 rounded bg-gray-100"></div>
                    )}
                    {activeTab === 'combo' ? offer.title : <span className="px-3 py-1 bg-gray-100 font-mono text-primary rounded-lg border border-gray-200">{offer.code}</span>}
                  </td>
                  <td className="p-4 text-sm font-bold text-gray-900">
                    {offer.discountType === 'percentage' ? `${offer.discountValue}% OFF` : `₹${offer.discountValue} OFF`}
                  </td>
                  <td className="p-4 text-sm text-gray-600">
                    {offer.minPurchaseAmount > 0 ? `₹${offer.minPurchaseAmount}` : 'None'}
                  </td>
                  <td className="p-4 text-sm text-gray-600">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${offer.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {offer.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Link to={`/admin/offers/${offer._id}/edit`} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
                        <Edit size={18} />
                      </Link>
                      <button 
                        onClick={() => handleDelete(offer._id)}
                        disabled={isDeleting}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredOffers?.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-500">
                    No {activeTab}s found. Add one!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminOffers;
