import { useParams, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { ArrowLeft, Package, Truck, CheckCircle } from 'lucide-react';
import { useGetOrderByIdQuery, useUpdateOrderStatusMutation } from '../../store/slices/orderApiSlice';

const AdminOrderDetail = () => {
  const { id } = useParams();
  const { data: order, isLoading, refetch } = useGetOrderByIdQuery(id);
  const [updateStatus, { isLoading: isUpdating }] = useUpdateOrderStatusMutation();

  const handleStatusChange = async (e) => {
    try {
      await updateStatus({ id, orderStatus: e.target.value }).unwrap();
      refetch();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  if (isLoading) return <div>Loading order details...</div>;
  if (!order) return <div>Order not found</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/admin/orders" className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-bold">Order #{order._id.substring(0, 8)}</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <label className="text-sm font-bold text-gray-700">Update Status:</label>
          <select 
            value={order.orderStatus}
            onChange={handleStatusChange}
            disabled={isUpdating || order.orderStatus === 'Delivered'}
            className="p-2 border border-gray-200 rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none font-medium"
          >
            <option value="Processing">Processing</option>
            <option value="Shipped">Shipped</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Col: Order Items & Pricing */}
        <div className="md:col-span-2 flex flex-col gap-8">
          
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><Package size={20} /> Items ({order.orderItems?.length})</h2>
            <div className="flex flex-col gap-4">
              {order.orderItems?.map((item, i) => (
                <div key={i} className="flex gap-4 p-4 border border-gray-50 rounded-xl bg-gray-50/50">
                  <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded bg-white mix-blend-multiply border border-gray-100" />
                  <div className="flex-1">
                    <p className="font-bold text-gray-900 text-sm">{item.name}</p>
                    <p className="text-xs text-gray-500 mt-1">Qty: {item.qty}</p>
                  </div>
                  <div className="font-bold text-gray-900">₹{item.price * item.qty}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold mb-4">Payment Summary</h2>
            <div className="flex flex-col gap-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">₹{order.itemsPrice}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tax</span>
                <span className="font-medium">₹{order.taxPrice}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span className="font-medium">₹{order.shippingPrice}</span>
              </div>
              {order.couponApplied && (
                <div className="flex justify-between text-green-600 font-medium">
                  <span>Coupon Applied</span>
                  <span>-₹{(order.itemsPrice + order.taxPrice + order.shippingPrice) - order.totalPrice}</span>
                </div>
              )}
              <hr className="my-2 border-gray-100" />
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-primary">₹{order.totalPrice}</span>
              </div>
              
              <div className="mt-4 p-4 bg-gray-50 rounded-xl flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Payment Method</p>
                  <p className="font-bold text-gray-900">{order.paymentMethod}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 mb-1">Status</p>
                  <p className={`font-bold ${order.isPaid ? 'text-green-600' : 'text-orange-500'}`}>
                    {order.isPaid ? 'Paid' : 'Unpaid'}
                  </p>
                </div>
              </div>

              {order.paymentMethod === 'RAZORPAY' && order.razorpayOrderId && (
                <div className="mt-2 p-4 bg-gray-50/80 rounded-xl border border-gray-100 text-xs text-gray-700">
                  <p className="flex justify-between"><span className="font-bold text-gray-900">Razorpay Order ID:</span> <span>{order.razorpayOrderId}</span></p>
                  {order.razorpayPaymentId && (
                    <p className="flex justify-between mt-2"><span className="font-bold text-gray-900">Payment ID:</span> <span>{order.razorpayPaymentId}</span></p>
                  )}
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Right Col: Customer & Shipping Info */}
        <div className="flex flex-col gap-8">
          
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold mb-4">Customer Info</h2>
            <p className="font-medium text-gray-900">{order.user?.name || 'Guest'}</p>
            <p className="text-sm text-gray-600 mt-1">{order.user?.email || 'N/A'}</p>
            <p className="text-sm text-gray-600 mt-1">{order.user?.phone || 'N/A'}</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><Truck size={20} /> Shipping Address</h2>
            <p className="font-bold text-gray-900">{order.shippingAddress?.fullName} <span className="text-xs font-medium text-gray-500 ml-2 py-0.5 px-2 bg-gray-100 rounded-md">{order.shippingAddress?.label || 'Home'}</span></p>
            <p className="text-sm text-gray-600 leading-relaxed mt-2">
              {order.shippingAddress?.flatHouse}, {order.shippingAddress?.areaStreet}<br />
              {order.shippingAddress?.landmark && <>Landmark: {order.shippingAddress.landmark}<br /></>}
              {order.shippingAddress?.city}, {order.shippingAddress?.state}<br />
              PIN: <span className="font-bold">{order.shippingAddress?.pincode}</span>
            </p>
            {order.shippingAddress?.phone && (
              <p className="text-sm font-medium text-gray-800 mt-2">Phone: {order.shippingAddress.phone}</p>
            )}
          </div>
          
          {order.isDelivered && (
            <div className="bg-green-50 p-6 rounded-2xl shadow-sm border border-green-100 flex items-start gap-4">
              <CheckCircle size={24} className="text-green-500 flex-shrink-0" />
              <div>
                <h3 className="font-bold text-green-800">Delivered</h3>
                <p className="text-xs text-green-600 mt-1">on {new Date(order.deliveredAt).toLocaleString()}</p>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default AdminOrderDetail;
