import { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { CheckCircle2, ChevronRight, Package, Truck, Calendar } from 'lucide-react';
import { useGetOrderDetailsQuery } from '../store/slices/orderApiSlice';

const OrderSuccess = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { data: order, isLoading, error } = useGetOrderDetailsQuery(orderId);

  useEffect(() => {
    if (error) {
      navigate('/orders'); // Redirect to order history if invalid ID or error
    }
  }, [error, navigate]);

  if (isLoading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!order) return null;

  // Calculate estimated delivery (e.g., 5 days from now)
  const deliveryDate = new Date(order.createdAt);
  deliveryDate.setDate(deliveryDate.getDate() + 5);
  const formattedDelivery = deliveryDate.toLocaleDateString('en-US', {
    weekday: 'long', month: 'short', day: 'numeric'
  });

  return (
    <div className="min-h-screen flex flex-col font-body bg-gray-50 text-gray-800">
      
      <main className="flex-grow flex items-center justify-center p-4 py-12">
        <div className="bg-white p-8 md:p-12 rounded-2xl shadow-sm max-w-2xl w-full text-center">
          
          <div className="w-24 h-24 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={48} />
          </div>
          
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-heading mb-2">Order Confirmed!</h1>
          <p className="text-gray-500 text-lg mb-8">Thank you for your purchase. Your order has been placed successfully.</p>
          
          <div className="bg-gray-50 p-6 rounded-2xl text-left mb-8 border border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-500 mb-1">Order ID</p>
                <p className="font-bold text-gray-900 truncate">#{order._id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Total Amount</p>
                <p className="font-bold text-gray-900">₹{order.totalPrice}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Payment Method</p>
                <p className="font-bold text-gray-900">{order.paymentMethod}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Order Date</p>
                <p className="font-bold text-gray-900">{new Date(order.createdAt).toLocaleDateString()}</p>
              </div>
              {order.paymentMethod === 'RAZORPAY' && order.isPaid && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Payment Status</p>
                  <p className="font-bold text-green-600">Paid Successfully</p>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10 text-sm">
            <div className="flex flex-col items-center gap-2 p-4 bg-white border border-gray-100 rounded-xl">
              <Package className="text-primary" size={24} />
              <span className="font-medium text-gray-700">Order Placed</span>
            </div>
            <div className="flex flex-col items-center gap-2 p-4 bg-white border border-gray-100 rounded-xl">
              <Truck className="text-gray-400" size={24} />
              <span className="font-medium text-gray-400">Processing</span>
            </div>
            <div className="flex flex-col items-center gap-2 p-4 bg-white border border-gray-100 rounded-xl">
              <Calendar className="text-gray-400" size={24} />
              <span className="font-medium text-gray-400">Est: {formattedDelivery}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to={`/orders/${order._id}`} className="px-8 py-3 bg-gray-100 text-gray-700 font-bold rounded-full hover:bg-gray-200 transition">
              View Order Details
            </Link>
            <Link to="/shop" className="btn-primary">
              Continue Shopping
            </Link>
          </div>
          
        </div>
      </main>

    </div>
  );
};

export default OrderSuccess;
