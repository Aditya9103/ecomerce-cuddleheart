import { useGetAllReviewsAdminQuery, useDeleteReviewAdminMutation } from '../../store/slices/productApiSlice';
import { Star, Trash2, Loader2, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminReviews = () => {
  const { data: reviews, isLoading, isError } = useGetAllReviewsAdminQuery();
  const [deleteReview, { isLoading: isDeleting }] = useDeleteReviewAdminMutation();

  const handleDelete = async (productId, reviewId) => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      try {
        await deleteReview({ productId, reviewId }).unwrap();
        toast.success('Review deleted successfully');
      } catch (error) {
        toast.error(error.data?.message || 'Failed to delete review');
      }
    }
  };

  if (isLoading) return <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin text-primary" size={32} /></div>;
  if (isError) return <div className="text-red-500 text-center mt-10">Error loading reviews</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold font-heading text-gray-900">Manage Reviews</h1>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        {reviews?.length === 0 ? (
          <div className="p-12 text-center text-gray-500 flex flex-col items-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <MessageSquare className="text-gray-300" size={32} />
            </div>
            <p>No reviews found across any products.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 text-gray-500 text-xs uppercase tracking-widest border-b border-gray-100">
                  <th className="p-6 font-bold">Reviewer</th>
                  <th className="p-6 font-bold">Product</th>
                  <th className="p-6 font-bold">Rating</th>
                  <th className="p-6 font-bold">Comment</th>
                  <th className="p-6 font-bold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {reviews?.map((review) => (
                  <tr key={review._id} className="hover:bg-primary/5 transition-colors group">
                    <td className="p-6">
                      <p className="font-bold text-gray-900">{review.name}</p>
                      <p className="text-xs text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</p>
                    </td>
                    <td className="p-6">
                      <span className="text-sm font-medium text-gray-800">{review.productName}</span>
                    </td>
                    <td className="p-6">
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={14} className={i < review.rating ? "text-yellow-400 fill-current" : "text-gray-200"} />
                        ))}
                      </div>
                    </td>
                    <td className="p-6 max-w-xs">
                      <p className="text-sm text-gray-600 truncate" title={review.comment}>{review.comment}</p>
                    </td>
                    <td className="p-6 text-right">
                      <button
                        onClick={() => handleDelete(review.productId, review._id)}
                        disabled={isDeleting}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Review"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminReviews;
