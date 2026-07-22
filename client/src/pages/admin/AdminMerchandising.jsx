import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useGetProductsQuery, useUpdateProductMutation } from '../../store/slices/productApiSlice';
import { Star, Zap } from 'lucide-react';

const AdminMerchandising = () => {
  const [activeTab, setActiveTab] = useState('bestseller');
  
  // We fetch all products, or we can fetch by tag. 
  // Let's fetch products based on the active tab for display, and maybe provide a search to add others.
  const { data, isLoading, refetch } = useGetProductsQuery({ limit: 50, tag: activeTab });
  
  // Also fetch some without tag so admin can search and add? 
  // For a simple version: list products that have the tag. Provide an input to search for a product by slug/name and add the tag to it.
  const [searchQuery, setSearchQuery] = useState('');
  const { data: searchResults } = useGetProductsQuery({ limit: 10, search: searchQuery }, { skip: searchQuery.length < 3 });
  
  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();

  const toggleTag = async (product, tagToAddOrRemove, isAdding) => {
    try {
      const currentTags = product.tags || [];
      let newTags;
      if (isAdding) {
        if (!currentTags.includes(tagToAddOrRemove)) {
          newTags = [...currentTags, tagToAddOrRemove];
        } else {
          return; // Already has tag
        }
      } else {
        newTags = currentTags.filter(t => t !== tagToAddOrRemove);
      }
      
      const formData = new FormData();
      formData.append('tags', newTags.join(','));
      
      await updateProduct({ id: product._id, formData }).unwrap();
      refetch();
    } catch (err) {
      toast.error('Failed to update product tags');
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Merchandising</h1>
      
      <div className="flex gap-4 mb-6">
        <button 
          onClick={() => setActiveTab('bestseller')}
          className={`px-6 py-2 rounded-full font-bold text-sm transition-colors flex items-center gap-2 ${activeTab === 'bestseller' ? 'bg-primary text-white' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}`}
        >
          <Star size={16} /> Best Sellers
        </button>
        <button 
          onClick={() => setActiveTab('new-arrival')}
          className={`px-6 py-2 rounded-full font-bold text-sm transition-colors flex items-center gap-2 ${activeTab === 'new-arrival' ? 'bg-primary text-white' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}`}
        >
          <Zap size={16} /> New Arrivals
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Col: Current List */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold mb-4 capitalize">Current {activeTab.replace('-', ' ')}s</h2>
          
          {isLoading ? (
            <p>Loading...</p>
          ) : (
            <div className="flex flex-col gap-4">
              {data?.products?.map(product => (
                <div key={product._id} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:border-primary-light transition-colors">
                  <div className="flex items-center gap-4">
                    <img src={product.images[0]} alt={product.name} className="w-12 h-12 rounded object-cover bg-gray-50 mix-blend-multiply" />
                    <div>
                      <p className="font-bold text-gray-900">{product.name}</p>
                      <p className="text-sm text-gray-500">₹{product.price}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => toggleTag(product, activeTab, false)}
                    disabled={isUpdating}
                    className="text-red-500 text-sm font-bold hover:underline px-2 py-1"
                  >
                    Remove
                  </button>
                </div>
              ))}
              {data?.products?.length === 0 && (
                <p className="text-gray-500 p-4 text-center">No products have this tag.</p>
              )}
            </div>
          )}
        </div>

        {/* Right Col: Add new */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold mb-4">Add to {activeTab.replace('-', ' ')}s</h2>
          <input 
            type="text" 
            placeholder="Search products by name..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-3 border border-gray-200 rounded-xl focus:border-primary outline-none mb-4"
          />
          
          <div className="flex flex-col gap-3">
            {searchResults?.products?.map(product => (
              <div key={product._id} className="flex items-center justify-between p-3 border border-gray-50 bg-gray-50 rounded-xl">
                <div className="flex flex-col text-sm truncate pr-2">
                  <span className="font-medium text-gray-900 truncate">{product.name}</span>
                </div>
                <button 
                  onClick={() => toggleTag(product, activeTab, true)}
                  disabled={isUpdating || (product.tags || []).includes(activeTab)}
                  className="bg-gray-900 text-white text-xs px-3 py-1.5 rounded-lg font-medium hover:bg-black disabled:opacity-50 flex-shrink-0"
                >
                  {(product.tags || []).includes(activeTab) ? 'Added' : 'Add'}
                </button>
              </div>
            ))}
            {searchQuery.length >= 3 && searchResults?.products?.length === 0 && (
              <p className="text-xs text-gray-500">No products found matching "{searchQuery}"</p>
            )}
            {searchQuery.length < 3 && (
              <p className="text-xs text-gray-500">Type at least 3 characters to search.</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminMerchandising;
