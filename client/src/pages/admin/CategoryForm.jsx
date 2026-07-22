import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Upload, X } from 'lucide-react';
import { useCreateCategoryMutation, useUpdateCategoryMutation, useGetCategoriesQuery } from '../../store/slices/productApiSlice';

const CategoryForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [bgColor, setBgColor] = useState('#FDF8F3'); // default
  const [displayOrder, setDisplayOrder] = useState('0');
  const [isActive, setIsActive] = useState(true);
  
  const [existingImage, setExistingImage] = useState(null); 
  const [newImage, setNewImage] = useState(null); 

  const { data: categories, isLoading: isFetching } = useGetCategoriesQuery();
  
  // Since we fetch all categories, we can just find it here instead of making a new query by ID.
  const categoryToEdit = categories?.find(c => c._id === id);

  const [createCategory, { isLoading: isCreating }] = useCreateCategoryMutation();
  const [updateCategory, { isLoading: isUpdating }] = useUpdateCategoryMutation();

  useEffect(() => {
    if (isEditMode && categoryToEdit) {
      setName(categoryToEdit.name);
      setDescription(categoryToEdit.description || '');
      setBgColor(categoryToEdit.bgColor || '#FDF8F3');
      setDisplayOrder(categoryToEdit.displayOrder || '0');
      setIsActive(categoryToEdit.isActive);
      setExistingImage(categoryToEdit.image || null);
    }
  }, [categoryToEdit, isEditMode]);

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
    formData.append('name', name);
    formData.append('description', description);
    formData.append('bgColor', bgColor);
    formData.append('displayOrder', displayOrder);
    formData.append('isActive', isActive);
    
    if (newImage) {
      formData.append('image', newImage);
    }

    try {
      if (isEditMode) {
        await updateCategory({ id: categoryToEdit._id, formData }).unwrap();
      } else {
        await createCategory(formData).unwrap();
      }
      navigate('/admin/categories');
    } catch (error) {
      toast.error(error?.data?.message || 'Something went wrong');
    }
  };

  if (isEditMode && isFetching) return <div>Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6 flex items-center gap-4">
        <Link to="/admin/categories" className="p-2 hover:bg-gray-200 rounded-full transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold">{isEditMode ? 'Edit Category' : 'Add New Category'}</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-6">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-gray-700">Category Name</label>
            <input 
              type="text" 
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="p-3 border border-gray-200 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              placeholder="e.g. Teddy Bears"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-gray-700">Display Order</label>
            <input 
              type="number" 
              required
              value={displayOrder}
              onChange={(e) => setDisplayOrder(e.target.value)}
              className="p-3 border border-gray-200 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-gray-700">Background Color (Hex)</label>
            <div className="flex gap-2">
              <input 
                type="color" 
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                className="w-12 h-12 rounded-xl cursor-pointer"
              />
              <input 
                type="text" 
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                className="flex-1 p-3 border border-gray-200 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none uppercase"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2 mt-8">
             <input 
               type="checkbox" 
               id="isActive"
               checked={isActive}
               onChange={(e) => setIsActive(e.target.checked)}
               className="w-5 h-5 accent-primary"
             />
             <label htmlFor="isActive" className="text-sm font-bold text-gray-700 cursor-pointer">Active / Visible on Storefront</label>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-gray-700">Description</label>
          <textarea 
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="p-3 border border-gray-200 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none"
          />
        </div>

        {/* Image */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-gray-700">Category Icon/Image</label>
          
          <div className="flex flex-wrap gap-4 mb-2">
            {/* Show existing image if no new image */}
            {existingImage && !newImage && (
              <div className="relative w-24 h-24 border rounded-xl overflow-hidden bg-gray-50 flex items-center justify-center p-2" style={{ backgroundColor: bgColor }}>
                <img src={existingImage} alt="Category" className="max-w-full max-h-full object-contain" />
              </div>
            )}
            
            {/* Show new selected image */}
            {newImage && (
              <div className="relative w-24 h-24 border border-primary rounded-xl overflow-hidden p-2" style={{ backgroundColor: bgColor }}>
                <img src={URL.createObjectURL(newImage)} alt="New Category" className="max-w-full max-h-full object-contain" />
                <button 
                  type="button" 
                  onClick={removeNewImage}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                >
                  <X size={12} />
                </button>
              </div>
            )}
            
            {/* Upload Button */}
            {!newImage && (
              <label className="w-24 h-24 border-2 border-dashed border-gray-300 hover:border-primary rounded-xl flex flex-col items-center justify-center cursor-pointer transition-colors text-gray-400 hover:text-primary">
                <Upload size={24} className="mb-1" />
                <span className="text-xs font-bold">Upload</span>
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </label>
            )}
          </div>
          <p className="text-xs text-gray-500">Transparent PNG recommended. (Uploaded directly to S3)</p>
        </div>

        <div className="border-t border-gray-100 pt-6 flex justify-end">
          <button 
            type="submit" 
            disabled={isCreating || isUpdating}
            className="btn-primary px-8 py-3"
          >
            {isCreating || isUpdating ? 'Saving...' : 'Save Category'}
          </button>
        </div>

      </form>
    </div>
  );
};

export default CategoryForm;
