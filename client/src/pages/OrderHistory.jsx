import { Link } from 'react-router-dom';
import { Package, ChevronRight } from 'lucide-react';
import { useGetMyOrdersQuery } from '../store/slices/orderApiSlice';

const OrderHistory = () => {
  const { data: orders, isLoading } = useGetMyOrdersQuery();

  if (isLoading) return <div className="min-h-screen flex items-center justify-center">Loading orders...</div>;

  return (
    <div className="min-h-screen flex flex-col font-body bg-gray-50 text-gray-800">
      
      <main className="flex-grow container mx-auto px-4 py-8 max-w-5xl">
        <h1 className="text-3xl font-heading font-bold text-heading mb-8">My Orders</h1>
        
        {orders?.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl shadow-sm text-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package size={32} className="text-gray-300" />
            </div>
            <h2 className="text-xl font-bold mb-2">No orders yet</h2>
            <p className="text-gray-500 mb-6">Looks like you haven't placed any orders with us.</p>
            <Link to="/shop" className="btn-primary inline-block">Start Shopping</Link>
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="bg-gray-50/50 text-gray-500 text-xs uppercase tracking-widest border-b border-gray-100">
                    <th className="p-6 font-bold">Order ID</th>
                    <th className="p-6 font-bold">Date Placed</th>
                    <th className="p-6 font-bold">Amount</th>
                    <th className="p-6 font-bold">Status</th>
                    <th className="p-6 font-bold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {orders?.map((order) => (
                    <tr key={order._id} className="hover:bg-primary/5 transition-colors group">
                      <td className="p-6">
                        <span className="text-sm font-bold text-gray-900 group-hover:text-primary transition-colors">#{order._id.substring(0, 8).toUpperCase()}</span>
                      </td>
                      <td className="p-6 text-sm text-gray-500 font-medium">{new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                      <td className="p-6 text-sm font-extrabold text-gray-900">₹{order.totalAmount || order.totalPrice}</td>
                      <td className="p-6">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm border
                          ${(order.orderStatus || order.status) === 'Delivered' || (order.orderStatus || order.status) === 'delivered' ? 'bg-green-50 text-green-700 border-green-200' : 
                            (order.orderStatus || order.status) === 'Processing' ? 'bg-blue-50 text-blue-700 border-blue-200' : 
                            (order.orderStatus || order.status) === 'Cancelled' ? 'bg-red-50 text-red-700 border-red-200' : 
                            'bg-yellow-50 text-yellow-700 border-yellow-200'}`}
                        >
                          {order.orderStatus || order.status}
                        </span>
                      </td>
                      <td className="p-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {((order.orderStatus?.toLowerCase() === 'delivered') || (order.status?.toLowerCase() === 'delivered')) && (
                            <Link to={`/orders/${order._id}`} className="inline-flex items-center gap-1 bg-primary/10 hover:bg-primary/20 text-primary px-4 py-2 rounded-full text-sm font-bold transition-all shadow-sm">
                              Write Review
                            </Link>
                          )}
                          <Link to={`/orders/${order._id}`} className="inline-flex items-center gap-1 bg-white border border-gray-200 hover:border-primary hover:text-primary text-gray-700 px-4 py-2 rounded-full text-sm font-bold transition-all shadow-sm hover:shadow">
                            View Details <ChevronRight size={14} />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

    </div>
  );
};

export default OrderHistory;
