import { Link } from 'react-router-dom';
import { Eye, Download } from 'lucide-react';
import { useGetAllOrdersQuery } from '../../store/slices/orderApiSlice';

const AdminOrders = () => {
  const { data: orders, isLoading } = useGetAllOrdersQuery();

  const exportToCSV = () => {
    if (!orders || orders.length === 0) return;
    
    // Simple CSV generator
    const headers = ['Order ID', 'Date', 'Customer', 'Amount', 'Payment Method', 'Payment Status', 'Order Status'];
    const rows = orders.map(order => [
      order._id,
      new Date(order.createdAt).toLocaleDateString(),
      order.user?.name || 'Guest',
      order.totalPrice,
      order.paymentMethod,
      order.isPaid ? 'Paid' : 'Unpaid',
      order.orderStatus
    ]);
    
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += headers.join(",") + "\r\n";
    rows.forEach(rowArray => {
      let row = rowArray.join(",");
      csvContent += row + "\r\n";
    });
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "cuddle-hearts-orders.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) return <div>Loading orders...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Orders</h1>
        <button onClick={exportToCSV} className="bg-white border border-gray-200 text-gray-700 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold hover:bg-gray-50 transition-colors">
          <Download size={16} /> Export CSV
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-sm">
                <th className="p-4 font-bold border-b border-gray-100">Order ID</th>
                <th className="p-4 font-bold border-b border-gray-100">Date</th>
                <th className="p-4 font-bold border-b border-gray-100">Customer</th>
                <th className="p-4 font-bold border-b border-gray-100">Amount</th>
                <th className="p-4 font-bold border-b border-gray-100">Payment</th>
                <th className="p-4 font-bold border-b border-gray-100">Status</th>
                <th className="p-4 font-bold border-b border-gray-100 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders?.map((order) => (
                <tr key={order._id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="p-4 text-sm font-mono text-gray-500">#{order._id.substring(0, 8)}</td>
                  <td className="p-4 text-sm text-gray-900">{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td className="p-4 text-sm font-medium text-gray-900">{order.user?.name || 'Guest'}</td>
                  <td className="p-4 text-sm font-bold text-gray-900">₹{order.totalPrice}</td>
                  <td className="p-4 text-sm">
                    <div className="flex flex-col">
                      <span className="font-bold text-gray-700">{order.paymentMethod}</span>
                      <span className={`text-xs ${order.isPaid ? 'text-green-600' : 'text-red-500'}`}>
                        {order.isPaid ? 'Paid' : 'Unpaid'}
                      </span>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-gray-600">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                      order.orderStatus === 'Delivered' ? 'bg-green-100 text-green-700' : 
                      order.orderStatus === 'Shipped' ? 'bg-blue-100 text-blue-700' :
                      order.orderStatus === 'Cancelled' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {order.orderStatus}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <Link to={`/admin/orders/${order._id}`} className="inline-block p-2 text-primary hover:bg-primary-light/10 rounded-lg transition-colors">
                      <Eye size={18} />
                    </Link>
                  </td>
                </tr>
              ))}
              {orders?.length === 0 && (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-gray-500">No orders found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminOrders;
