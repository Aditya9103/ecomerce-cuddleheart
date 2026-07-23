import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Upload, X } from 'lucide-react';
import { useCreateOfferMutation, useUpdateOfferMutation, useGetOffersQuery } from '../../store/slices/offerApiSlice';
import { useGetProductsQuery } from '../../store/slices/productApiSlice';

const OfferForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [type, setType] = useState('coupon');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState('percentage');
  const [discountValue, setDiscountValue] = useState('');
  const [minPurchaseAmount, setMinPurchaseAmount] = useState('0');
  const [isActive, setIsActive] = useState(true);
  
  const [existingImage, setExistingImage] = useState(null); 
  const [newImage, setNewImage] = useState(null); 
  
  const [applicableProducts, setApplicableProducts] = useState([]);

  const { data: offers, isLoading: isFetching } = useGetOffersQuery();
  const { data: productsData } = useGetProductsQuery({ limit: 100 }); // fetch up to 100 products for selection
  
  const offerToEdit = offers?.find(o => o._id === id);

  const [createOffer, { isLoading: isCreating }] = useCreateOfferMutation();
  const [updateOffer, { isLoading: isUpdating }] = useUpdateOfferMutation();

  useEffect(() => {
    if (isEditMode && offerToEdit) {
      setType(offerToEdit.type);
      setTitle(offerToEdit.title);
      setDescription(offerToEdit.description || '');
      setCode(offerToEdit.code || '');
      setDiscountType(offerToEdit.discountType);
      setDiscountValue(offerToEdit.discountValue);
      setMinPurchaseAmount(offerToEdit.minPurchaseAmount);
      setIsActive(offerToEdit.isActive);
      setExistingImage(offerToEdit.image || null);
      if (offerToEdit.type === 'sale') {
        setApplicableProducts(offerToEdit.applicableProducts || []);
      }
    }
  }, [offerToEdit, isEditMode]);

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setNewImage(e.target.files[0]);
    }
  };

  const removeNewImage = () => {
    setNewImage(null);
  };

  const handleProductToggle = (productId) => {
    setApplicableProducts(prev => 
      prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('type', type);
    formData.append('title', title);
    formData.append('description', description);
    formData.append('code', code);
    formData.append('discountType', discountType);
    formData.append('discountValue', discountValue);
    formData.append('minPurchaseAmount', minPurchaseAmount);
    formData.append('isActive', isActive);
    
    if (type === 'combo' && newImage) {
      formData.append('image', newImage);
    }
    
    if (type === 'sale') {
      formData.append('applicableProducts', JSON.stringify(applicableProducts));
    }

    try {
      if (isEditMode) {
        await updateOffer({ id: offerToEdit._id, formData }).unwrap();
      } else {
        await createOffer(formData).unwrap();
      }
      navigate('/admin/offers');
    } catch (error) {
      toast.error(error?.data?.message || 'Something went wrong');
    }
  };

  if (isEditMode && isFetching) return <div>Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6 flex items-center gap-4">
        <Link to="/admin/offers" className="p-2 hover:bg-gray-200 rounded-full transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold">{isEditMode ? 'Edit Offer' : 'Add New Offer'}</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-6">
        
        {/* Type Selection */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-gray-700">Offer Type</label>
          <div className="flex gap-4">
            <label className={`flex-1 border p-4 rounded-xl cursor-pointer flex items-center justify-center gap-2 transition-colors ${type === 'coupon' ? 'border-primary bg-primary-light/10 text-primary font-bold' : 'border-gray-200 text-gray-600 hover:border-primary-light'}`}>
              <input type="radio" name="type" value="coupon" checked={type === 'coupon'} onChange={() => setType('coupon')} className="hidden" />
              Coupon Code
            </label>
            <label className={`flex-1 border p-4 rounded-xl cursor-pointer flex items-center justify-center gap-2 transition-colors text-center ${type === 'combo' ? 'border-primary bg-primary-light/10 text-primary font-bold' : 'border-gray-200 text-gray-600 hover:border-primary-light'}`}>
              <input type="radio" name="type" value="combo" checked={type === 'combo'} onChange={() => setType('combo')} className="hidden" />
              Combo Deal (Banner)
            </label>
            <label className={`flex-1 border p-4 rounded-xl cursor-pointer flex items-center justify-center gap-2 transition-colors text-center ${type === 'sale' ? 'border-primary bg-primary-light/10 text-primary font-bold' : 'border-gray-200 text-gray-600 hover:border-primary-light'}`}>
              <input type="radio" name="type" value="sale" checked={type === 'sale'} onChange={() => setType('sale')} className="hidden" />
              Sale (Product Discount)
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-gray-700">Internal Title</label>
            <input 
              type="text" 
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="p-3 border border-gray-200 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              placeholder="e.g. Summer Sale 20%"
            />
          </div>

          {type === 'coupon' && (
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-gray-700">Coupon Code</label>
              <input 
                type="text" 
                required={type === 'coupon'}
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                className="p-3 border border-gray-200 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none uppercase font-mono tracking-widest"
                placeholder="e.g. SUMMER20"
              />
            </div>
          )}

          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-gray-700">Discount Type</label>
            <select 
              value={discountType}
              onChange={(e) => setDiscountType(e.target.value)}
              className="p-3 border border-gray-200 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none"
            >
              <option value="percentage">Percentage (%)</option>
              <option value="fixed">Fixed Amount (₹)</option>
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-gray-700">Discount Value</label>
            <input 
              type="number" 
              required
              min="0"
              value={discountValue}
              onWheel={(e) => e.target.blur()}
              onChange={(e) => setDiscountValue(e.target.value)}
              className="p-3 border border-gray-200 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              placeholder={discountType === 'percentage' ? 'e.g. 20' : 'e.g. 500'}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-gray-700">Min Purchase Amount (₹)</label>
            <input 
              type="number" 
              required
              min="0"
              value={minPurchaseAmount}
              onWheel={(e) => e.target.blur()}
              onChange={(e) => setMinPurchaseAmount(e.target.value)}
              className="p-3 border border-gray-200 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none"
            />
          </div>

          <div className="flex items-center gap-2 md:mt-8">
             <input 
               type="checkbox" 
               id="isActive"
               checked={isActive}
               onChange={(e) => setIsActive(e.target.checked)}
               className="w-5 h-5 accent-primary"
             />
             <label htmlFor="isActive" className="text-sm font-bold text-gray-700 cursor-pointer">Active</label>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-gray-700">Description / T&C</label>
          <textarea 
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="p-3 border border-gray-200 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none"
          />
        </div>

        {/* Combo Deal Image */}
        {type === 'combo' && (
          <div className="flex flex-col gap-2 p-4 bg-orange-50 border border-orange-100 rounded-xl">
            <label className="text-sm font-bold text-orange-800">Combo Deal Image</label>
            
            <div className="flex flex-wrap gap-4 mt-2">
              {/* Show existing image if no new image */}
              {existingImage && !newImage && (
                <div className="relative w-full md:w-64 h-32 border rounded-xl overflow-hidden bg-white flex items-center justify-center">
                  <img src={existingImage} alt="Combo Deal" className="max-w-full max-h-full object-cover" />
                </div>
              )}
              
              {/* Show new selected image */}
              {newImage && (
                <div className="relative w-full md:w-64 h-32 border border-primary rounded-xl overflow-hidden bg-white">
                  <img src={URL.createObjectURL(newImage)} alt="New Combo" className="max-w-full max-h-full object-cover" />
                  <button 
                    type="button" 
                    onClick={removeNewImage}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
              
              {/* Upload Button */}
              {!newImage && (
                <label className="w-full md:w-64 h-32 border-2 border-dashed border-orange-300 hover:border-orange-500 rounded-xl flex flex-col items-center justify-center cursor-pointer transition-colors text-orange-600 bg-white">
                  <Upload size={24} className="mb-2" />
                  <span className="text-sm font-bold">Upload Combo Image</span>
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>
              )}
            </div>
            <p className="text-xs text-orange-700 mt-2">This image will be displayed in the Combo Deals section on the homepage.</p>
          </div>
        )}

        {/* Sale Product Selection */}
        {type === 'sale' && (
          <div className="flex flex-col gap-2 p-4 bg-gray-50 border border-gray-200 rounded-xl">
            <label className="text-sm font-bold text-gray-700">Select Products for Sale</label>
            <p className="text-xs text-gray-500 mb-2">These products will receive the discount and display a sale badge on the frontend.</p>
            <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-xl bg-white p-2">
              {productsData?.products?.length > 0 ? (
                <div className="flex flex-col gap-1">
                  {productsData.products.map(product => (
                    <label key={product._id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors">
                      <input 
                        type="checkbox" 
                        checked={applicableProducts.includes(product._id)}
                        onChange={() => handleProductToggle(product._id)}
                        className="w-4 h-4 accent-primary"
                      />
                      <div className="flex items-center gap-2 flex-1">
                        <img src={product.images?.[0] || 'https://via.placeholder.com/40'} alt={product.name} className="w-10 h-10 object-cover rounded-md" />
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-gray-900">{product.name}</span>
                          <span className="text-xs text-gray-500">₹{product.price}</span>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 p-4 text-center">No products found.</p>
              )}
            </div>
          </div>
        )}

        <div className="border-t border-gray-100 pt-6 flex justify-end">
          <button 
            type="submit" 
            disabled={isCreating || isUpdating}
            className="btn-primary px-8 py-3"
          >
            {isCreating || isUpdating ? 'Saving...' : 'Save Offer'}
          </button>
        </div>

      </form>
    </div>
  );
};

export default OfferForm;
