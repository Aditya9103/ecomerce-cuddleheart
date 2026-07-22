import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { useGetProductsQuery, useDeleteProductMutation } from '../../store/slices/productApiSlice';

const AdminProducts = () => {
  const { data, isLoading, refetch } = useGetProductsQuery({ limit: 100 }); // Getting more for admin view
  const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation();

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProduct(id).unwrap();
        refetch();
      } catch (err) {
        toast.error(err?.data?.message || 'Failed to delete product');
      }
    }
  };

  if (isLoading) return <div>Loading products...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Products</h1>
        <Link to="/admin/products/new" className="btn-primary flex items-center gap-2 px-4 py-2 text-sm">
          <Plus size={16} /> Add Product
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-sm">
                <th className="p-4 font-bold border-b border-gray-100">Image</th>
                <th className="p-4 font-bold border-b border-gray-100">Name</th>
                <th className="p-4 font-bold border-b border-gray-100">Category</th>
                <th className="p-4 font-bold border-b border-gray-100">Price</th>
                <th className="p-4 font-bold border-b border-gray-100">Stock</th>
                <th className="p-4 font-bold border-b border-gray-100 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data?.products?.map((product) => (
                <tr key={product._id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="p-4">
                    <img src={product.images[0]} alt={product.name} className="w-12 h-12 object-cover rounded bg-gray-50 mix-blend-multiply" />
                  </td>
                  <td className="p-4 text-sm font-medium text-gray-900">{product.name}</td>
                  <td className="p-4 text-sm text-gray-600">{product.category?.name}</td>
                  <td className="p-4 text-sm font-bold text-primary">₹{product.price}</td>
                  <td className="p-4 text-sm text-gray-600">{product.stock}</td>
                  <td className="p-4 text-right flex justify-end gap-2">
                    <Link to={`/admin/products/${product._id}/edit`} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
                      <Edit size={18} />
                    </Link>
                    <button 
                      onClick={() => handleDelete(product._id)}
                      disabled={isDeleting}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {data?.products?.length === 0 && (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-500">No products found. Add some!</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminProducts;
