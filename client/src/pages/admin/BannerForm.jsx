import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Upload, X } from 'lucide-react';
import { useCreateBannerMutation, useUpdateBannerMutation, useGetBannersQuery } from '../../store/slices/productApiSlice';

const BannerForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [eyebrow, setEyebrow] = useState('');
  const [heading, setHeading] = useState('');
  const [highlightWord, setHighlightWord] = useState('');
  const [subtext, setSubtext] = useState('');
  const [discountBadgeText, setDiscountBadgeText] = useState('');
  const [ctaPrimaryText, setCtaPrimaryText] = useState('');
  const [ctaPrimaryLink, setCtaPrimaryLink] = useState('');
  const [ctaSecondaryText, setCtaSecondaryText] = useState('');
  const [ctaSecondaryLink, setCtaSecondaryLink] = useState('');
  const [order, setOrder] = useState('0');
  const [isActive, setIsActive] = useState(true);
  
  const [existingImage, setExistingImage] = useState(null); 
  const [newImage, setNewImage] = useState(null); 

  const { data: banners, isLoading: isFetching } = useGetBannersQuery();
  
  const bannerToEdit = banners?.find(b => b._id === id);

  const [createBanner, { isLoading: isCreating }] = useCreateBannerMutation();
  const [updateBanner, { isLoading: isUpdating }] = useUpdateBannerMutation();

  useEffect(() => {
    if (isEditMode && bannerToEdit) {
      setEyebrow(bannerToEdit.eyebrow || '');
      setHeading(bannerToEdit.heading || '');
      setHighlightWord(bannerToEdit.highlightWord || '');
      setSubtext(bannerToEdit.subtext || '');
      setDiscountBadgeText(bannerToEdit.discountBadgeText || '');
      setCtaPrimaryText(bannerToEdit.ctaPrimaryText || '');
      setCtaPrimaryLink(bannerToEdit.ctaPrimaryLink || '');
      setCtaSecondaryText(bannerToEdit.ctaSecondaryText || '');
      setCtaSecondaryLink(bannerToEdit.ctaSecondaryLink || '');
      setOrder(bannerToEdit.order || '0');
      setIsActive(bannerToEdit.isActive);
      setExistingImage(bannerToEdit.image || null);
    }
  }, [bannerToEdit, isEditMode]);

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setNewImage(e.target.files[0]);
    }
  };

  const removeNewImage = () => {
    setNewImage(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('eyebrow', eyebrow);
    formData.append('heading', heading);
    formData.append('highlightWord', highlightWord);
    formData.append('subtext', subtext);
    formData.append('discountBadgeText', discountBadgeText);
    formData.append('ctaPrimaryText', ctaPrimaryText);
    formData.append('ctaPrimaryLink', ctaPrimaryLink);
    formData.append('ctaSecondaryText', ctaSecondaryText);
    formData.append('ctaSecondaryLink', ctaSecondaryLink);
    formData.append('order', order);
    formData.append('isActive', isActive);
    
    if (newImage) {
      formData.append('image', newImage);
    }

    try {
      if (isEditMode) {
        await updateBanner({ id: bannerToEdit._id, formData }).unwrap();
      } else {
        await createBanner(formData).unwrap();
      }
      navigate('/admin/banners');
    } catch (error) {
      toast.error(error?.data?.message || 'Something went wrong');
    }
  };

  if (isEditMode && isFetching) return <div>Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 flex items-center gap-4">
        <Link to="/admin/banners" className="p-2 hover:bg-gray-200 rounded-full transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold">{isEditMode ? 'Edit Banner' : 'Add New Banner'}</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-6">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-gray-700">Eyebrow (Small text above heading)</label>
            <input 
              type="text" 
              value={eyebrow}
              onChange={(e) => setEyebrow(e.target.value)}
              className="p-3 border border-gray-200 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              placeholder="e.g. SOFTNESS YOU CAN HUG"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-gray-700">Heading (Main text)</label>
            <input 
              type="text" 
              required
              value={heading}
              onChange={(e) => setHeading(e.target.value)}
              className="p-3 border border-gray-200 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              placeholder="e.g. Cute Friends"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-gray-700">Highlight Word (Colored part of heading)</label>
            <input 
              type="text" 
              value={highlightWord}
              onChange={(e) => setHighlightWord(e.target.value)}
              className="p-3 border border-gray-200 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              placeholder="e.g. Every Mood!"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-gray-700">Subtext</label>
            <input 
              type="text" 
              value={subtext}
              onChange={(e) => setSubtext(e.target.value)}
              className="p-3 border border-gray-200 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              placeholder="e.g. Find the perfect cuddly companion..."
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-gray-700">Discount Badge Text</label>
            <input 
              type="text" 
              value={discountBadgeText}
              onChange={(e) => setDiscountBadgeText(e.target.value)}
              className="p-3 border border-gray-200 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              placeholder="e.g. UP TO 40% OFF"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-gray-700">Display Order</label>
            <input 
              type="number" 
              required
              value={order}
              onChange={(e) => setOrder(e.target.value)}
              className="p-3 border border-gray-200 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-gray-700">Primary CTA Text</label>
            <input 
              type="text" 
              value={ctaPrimaryText}
              onChange={(e) => setCtaPrimaryText(e.target.value)}
              className="p-3 border border-gray-200 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              placeholder="e.g. Shop Now"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-gray-700">Primary CTA Link</label>
            <input 
              type="text" 
              value={ctaPrimaryLink}
              onChange={(e) => setCtaPrimaryLink(e.target.value)}
              className="p-3 border border-gray-200 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              placeholder="e.g. /shop"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-gray-700">Secondary CTA Text (Optional)</label>
            <input 
              type="text" 
              value={ctaSecondaryText}
              onChange={(e) => setCtaSecondaryText(e.target.value)}
              className="p-3 border border-gray-200 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              placeholder="e.g. View Categories"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-gray-700">Secondary CTA Link</label>
            <input 
              type="text" 
              value={ctaSecondaryLink}
              onChange={(e) => setCtaSecondaryLink(e.target.value)}
              className="p-3 border border-gray-200 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              placeholder="e.g. /categories"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 mt-4 mb-4">
            <input 
              type="checkbox" 
              id="isActive"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-5 h-5 accent-primary"
            />
            <label htmlFor="isActive" className="text-sm font-bold text-gray-700 cursor-pointer">Active / Visible on Homepage</label>
        </div>

        {/* Image */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-gray-700">Banner Image</label>
          
          <div className="flex flex-col gap-4 mb-2">
            {/* Show existing image if no new image */}
            {existingImage && !newImage && (
              <div className="relative w-full h-40 border rounded-xl overflow-hidden bg-gray-50 flex items-center justify-center p-2">
                <img src={existingImage} alt="Banner" className="max-w-full max-h-full object-contain" />
              </div>
            )}
            
            {/* Show new selected image */}
            {newImage && (
              <div className="relative w-full h-40 border border-primary rounded-xl overflow-hidden p-2">
                <img src={URL.createObjectURL(newImage)} alt="New Banner" className="max-w-full max-h-full object-contain" />
                <button 
                  type="button" 
                  onClick={removeNewImage}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            )}
            
            {/* Upload Button */}
            {!newImage && (
              <label className="w-full h-32 border-2 border-dashed border-gray-300 hover:border-primary rounded-xl flex flex-col items-center justify-center cursor-pointer transition-colors text-gray-400 hover:text-primary">
                <Upload size={24} className="mb-2" />
                <span className="text-sm font-bold">Upload Banner Image</span>
                <span className="text-xs font-medium mt-1">Recommended size: 1920x600px</span>
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </label>
            )}
          </div>
          <p className="text-xs text-gray-500">Image will be uploaded directly to S3.</p>
        </div>

        <div className="border-t border-gray-100 pt-6 flex justify-end">
          <button 
            type="submit" 
            disabled={isCreating || isUpdating}
            className="btn-primary px-8 py-3"
          >
            {isCreating || isUpdating ? 'Saving...' : 'Save Banner'}
          </button>
        </div>

      </form>
    </div>
  );
};

export default BannerForm;
