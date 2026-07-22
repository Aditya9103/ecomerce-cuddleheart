import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { useGetBannersQuery, useDeleteBannerMutation } from '../../store/slices/productApiSlice';

const AdminBanners = () => {
  const { data: banners, isLoading, refetch } = useGetBannersQuery();
  const [deleteBanner, { isLoading: isDeleting }] = useDeleteBannerMutation();

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this banner?')) {
      try {
        await deleteBanner(id).unwrap();
        refetch();
      } catch (err) {
        toast.error(err?.data?.message || 'Failed to delete banner');
      }
    }
  };

  if (isLoading) return <div>Loading banners...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Banners</h1>
        <Link to="/admin/banners/new" className="btn-primary flex items-center gap-2 px-4 py-2 text-sm">
          <Plus size={16} /> Add Banner
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-sm">
                <th className="p-4 font-bold border-b border-gray-100">Image</th>
                <th className="p-4 font-bold border-b border-gray-100">Heading</th>
                <th className="p-4 font-bold border-b border-gray-100">Order</th>
                <th className="p-4 font-bold border-b border-gray-100">Status</th>
                <th className="p-4 font-bold border-b border-gray-100 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {banners?.map((banner) => (
                <tr key={banner._id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="p-4">
                    <img src={banner.image} alt={banner.heading} className="h-16 w-32 object-cover rounded bg-gray-100" />
                  </td>
                  <td className="p-4 text-sm font-medium text-gray-900">{banner.heading}</td>
                  <td className="p-4 text-sm text-gray-600">{banner.order}</td>
                  <td className="p-4 text-sm text-gray-600">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${banner.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {banner.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="p-4 text-right flex justify-end gap-2">
                    <Link to={`/admin/banners/${banner._id}/edit`} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
                      <Edit size={18} />
                    </Link>
                    <button 
                      onClick={() => handleDelete(banner._id)}
                      disabled={isDeleting}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {banners?.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-500">No banners found. Add some!</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminBanners;
