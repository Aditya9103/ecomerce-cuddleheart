import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Upload, X } from 'lucide-react';
import { useCreateProductMutation, useUpdateProductMutation, useGetProductBySlugQuery, useGetCategoriesQuery } from '../../store/slices/productApiSlice';

const AVAILABLE_TAGS = ['bestseller', 'new-arrival', 'combo', 'featured', 'limited-edition', 'discounted', 'trending'];

const ProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [mrp, setMrp] = useState('');
  const [category, setCategory] = useState('');
  const [stock, setStock] = useState('');
  const [tags, setTags] = useState([]);
  
  const [highlights, setHighlights] = useState(['']); // Array of strings
  const [specifications, setSpecifications] = useState([{ name: '', value: '' }]); // Array of objects
  
  const [existingImages, setExistingImages] = useState([]); // From server
  const [newImages, setNewImages] = useState([]); // Files to upload

  const { data: categories } = useGetCategoriesQuery();
  
  // To edit, we'd ideally fetch product by ID. The API currently has getProductBySlug. 
  // For admin, fetching by ID is better. I will assume the slug query works if we change it or just use it.
  // Actually, we don't have getProductById exposed. I'll need to update productApiSlice or backend.
  // For now, let's assume we pass slug in URL instead of ID, or just add getProductById.
  
  // Let's assume we have to add useGetProductByIdQuery in productApiSlice.
  const { data: product, isLoading: isFetching } = useGetProductBySlugQuery(id, { skip: !isEditMode }); // We'll assume the route passes slug for edit, or we use a separate query.

  const [createProduct, { isLoading: isCreating }] = useCreateProductMutation();
  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();

  useEffect(() => {
    if (isEditMode && product) {
      setName(product.name);
      setDescription(product.description);
      setPrice(product.price);
      setMrp(product.mrp);
      setCategory(product.category?._id || product.category);
      setStock(product.stock);
      setTags(product.tags || []);
      setHighlights(product.highlights?.length ? product.highlights : ['']);
      setSpecifications(product.specifications?.length ? product.specifications : [{ name: '', value: '' }]);
      setExistingImages(product.images || []);
    }
  }, [product, isEditMode]);

  const handleImageChange = (e) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setNewImages(prev => [...prev, ...filesArray]);
    }
  };

  const removeNewImage = (index) => {
    setNewImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleHighlightChange = (index, value) => {
    const newHighlights = [...highlights];
    newHighlights[index] = value;
    setHighlights(newHighlights);
  };

  const handleSpecChange = (index, field, value) => {
    const newSpecs = [...specifications];
    newSpecs[index][field] = value;
    setSpecifications(newSpecs);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    formData.append('price', price);
    formData.append('mrp', mrp);
    formData.append('category', category);
    formData.append('stock', stock);
    formData.append('tags', tags.join(','));
    
    // Filter empty highlights and specs before sending
    const validHighlights = highlights.filter(h => h.trim() !== '');
    const validSpecs = specifications.filter(s => s.name.trim() !== '' && s.value.trim() !== '');
    
    formData.append('highlights', JSON.stringify(validHighlights));
    formData.append('specifications', JSON.stringify(validSpecs));
    
    // Append files
    newImages.forEach(file => {
      formData.append('images', file);
    });

    try {
      if (isEditMode) {
        // Assume update uses ID. We'll pass product._id
        await updateProduct({ id: product._id, formData }).unwrap();
      } else {
        await createProduct(formData).unwrap();
      }
      navigate('/admin/products');
    } catch (error) {
      toast.error(error?.data?.message || 'Something went wrong');
    }
  };

  if (isEditMode && isFetching) return <div>Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 flex items-center gap-4">
        <Link to="/admin/products" className="p-2 hover:bg-gray-200 rounded-full transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold">{isEditMode ? 'Edit Product' : 'Add New Product'}</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-6">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-gray-700">Product Name</label>
            <input 
              type="text" 
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="p-3 border border-gray-200 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              placeholder="e.g. Giant Teddy Bear"
            />
          </div>
          
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-gray-700">Category</label>
            <select 
              required
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="p-3 border border-gray-200 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none"
            >
              <option value="">Select a category</option>
              {categories?.map(c => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-gray-700">Price (₹)</label>
            <input 
              type="number" 
              required
              min="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="p-3 border border-gray-200 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-gray-700">MRP (₹)</label>
            <input 
              type="number" 
              required
              min="0"
              value={mrp}
              onChange={(e) => setMrp(e.target.value)}
              className="p-3 border border-gray-200 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-gray-700">Stock</label>
            <input 
              type="number" 
              required
              min="0"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              className="p-3 border border-gray-200 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-gray-700">Tags (Check all that apply)</label>
            <div className="flex flex-wrap gap-2 p-3 border border-gray-200 rounded-xl bg-gray-50/50">
              {AVAILABLE_TAGS.map(tag => (
                <label key={tag} className="flex items-center gap-2 cursor-pointer bg-white px-3 py-1.5 rounded-lg border border-gray-200 hover:border-primary transition-colors">
                  <input 
                    type="checkbox" 
                    checked={tags.includes(tag)}
                    onChange={(e) => {
                      if (e.target.checked) setTags(prev => [...prev, tag]);
                      else setTags(prev => prev.filter(t => t !== tag));
                    }}
                    className="text-primary focus:ring-primary rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-700">{tag}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-gray-700">Description</label>
          <textarea 
            required
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="p-3 border border-gray-200 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none"
          />
        </div>

        {/* Highlights */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-gray-700">Product Highlights (Bullet points)</label>
          {highlights.map((highlight, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input 
                type="text" 
                value={highlight}
                onChange={(e) => handleHighlightChange(index, e.target.value)}
                className="flex-1 p-3 border border-gray-200 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                placeholder="e.g. Super soft plush material"
              />
              <button 
                type="button"
                onClick={() => setHighlights(highlights.filter((_, i) => i !== index))}
                className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          ))}
          <button 
            type="button"
            onClick={() => setHighlights([...highlights, ''])}
            className="self-start text-sm font-bold text-primary hover:underline"
          >
            + Add Highlight
          </button>
        </div>

        {/* Specifications */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-gray-700">Specifications (Key-Value pairs)</label>
          {specifications.map((spec, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input 
                type="text" 
                value={spec.name}
                onChange={(e) => handleSpecChange(index, 'name', e.target.value)}
                className="flex-1 p-3 border border-gray-200 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                placeholder="Name (e.g. Dimensions)"
              />
              <input 
                type="text" 
                value={spec.value}
                onChange={(e) => handleSpecChange(index, 'value', e.target.value)}
                className="flex-1 p-3 border border-gray-200 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                placeholder="Value (e.g. 10 x 5 inches)"
              />
              <button 
                type="button"
                onClick={() => setSpecifications(specifications.filter((_, i) => i !== index))}
                className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          ))}
          <button 
            type="button"
            onClick={() => setSpecifications([...specifications, { name: '', value: '' }])}
            className="self-start text-sm font-bold text-primary hover:underline"
          >
            + Add Specification
          </button>
        </div>

        {/* Images */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-gray-700">Images</label>
          
          <div className="flex flex-wrap gap-4 mb-2">
            {/* Show existing images */}
            {existingImages.map((img, i) => (
              <div key={`ext-${i}`} className="relative w-24 h-24 border rounded-xl overflow-hidden bg-gray-50">
                <img src={img} alt="Product" className="w-full h-full object-cover mix-blend-multiply" />
              </div>
            ))}
            
            {/* Show new selected images */}
            {newImages.map((file, i) => (
              <div key={`new-${i}`} className="relative w-24 h-24 border border-primary rounded-xl overflow-hidden">
                <img src={URL.createObjectURL(file)} alt="New Product" className="w-full h-full object-cover" />
                <button 
                  type="button" 
                  onClick={() => removeNewImage(i)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
            
            {/* Upload Button */}
            <label className="w-24 h-24 border-2 border-dashed border-gray-300 hover:border-primary rounded-xl flex flex-col items-center justify-center cursor-pointer transition-colors text-gray-400 hover:text-primary">
              <Upload size={24} className="mb-1" />
              <span className="text-xs font-bold">Upload</span>
              <input type="file" multiple accept="image/*" onChange={handleImageChange} className="hidden" />
            </label>
          </div>
          <p className="text-xs text-gray-500">First image will be the primary image. Max 5 images. (Uploaded directly to S3)</p>
        </div>

        <div className="border-t border-gray-100 pt-6 flex justify-end">
          <button 
            type="submit" 
            disabled={isCreating || isUpdating}
            className="btn-primary px-8 py-3"
          >
            {isCreating || isUpdating ? 'Saving...' : 'Save Product'}
          </button>
        </div>

      </form>
    </div>
  );
};

export default ProductForm;
