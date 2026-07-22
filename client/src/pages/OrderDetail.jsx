import { useParams, Link } from 'react-router-dom';
import { useGetOrderDetailsQuery } from '../store/slices/orderApiSlice';
import { ArrowLeft, CheckCircle2, Package, Truck, Check, FileText } from 'lucide-react';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';

const OrderDetail = () => {
  const { id } = useParams();
  const { data: order, isLoading, error } = useGetOrderDetailsQuery(id);
  const { userInfo } = useSelector((state) => state.auth);

  const handleDownloadInvoice = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/orders/${order._id}/invoice`, {
        headers: {
          'Authorization': `Bearer ${userInfo.token}`
        }
      });
      if (!response.ok) throw new Error('Failed to download invoice');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Invoice-INV-${order._id.toString().slice(-6).toUpperCase()}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (err) {
      console.error(err);
      toast.error('Could not download invoice');
    }
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center">Loading order details...</div>;

  if (error || !order) return (
    <div className="min-h-screen flex flex-col font-body">
      <main className="flex-grow flex items-center justify-center text-center p-4">
        <div>
          <h2 className="text-2xl font-bold mb-2">Order Not Found</h2>
          <p className="text-gray-500 mb-4">We couldn't find the order you're looking for.</p>
          <Link to="/orders" className="text-primary hover:underline">Back to My Orders</Link>
        </div>
      </main>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col font-body bg-gray-50 text-gray-800">

      <main className="flex-grow container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <Link to="/orders" className="inline-flex items-center text-sm text-gray-500 hover:text-primary transition-colors">
            <ArrowLeft size={16} className="mr-1" /> Back to My Orders
          </Link>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div>
            <h1 className="text-2xl md:text-3xl font-heading font-extrabold text-gray-900">Order #{order._id.substring(0,8).toUpperCase()}</h1>
            <p className="text-gray-500 text-sm mt-1">Placed on {new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
          </div>
          <div className="flex gap-2">
            <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm border
              ${order.status === 'delivered' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200'}`}>
              {order.status || order.orderStatus}
            </span>
            <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm border
              ${order.paymentStatus === 'paid' || order.isPaid ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-600 border-gray-200'}`}>
              {order.paymentStatus === 'paid' || order.isPaid ? 'PAID' : 'UNPAID'}
            </span>
            <button onClick={handleDownloadInvoice} className="px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm border bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100 flex items-center gap-1 transition-colors">
              <FileText size={14} /> INVOICE
            </button>
          </div>
        </div>

        {/* Order Timeline */}
        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 mb-8 overflow-x-auto">
          <h2 className="text-lg font-bold mb-6 font-heading">Order Status</h2>
          
          <div className="flex items-center min-w-[500px]">
            {/* Step 1: Placed */}
            <div className="flex flex-col items-center flex-1 relative">
              <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center z-10 shadow-md">
                <Check size={20} />
              </div>
              <div className="absolute top-5 left-1/2 w-full h-1 bg-primary"></div>
              <p className="mt-3 text-sm font-bold text-gray-900">Order Placed</p>
            </div>
            
            {/* Step 2: Processing */}
            <div className="flex flex-col items-center flex-1 relative">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center z-10 shadow-md transition-colors ${['Processing', 'Shipped', 'Delivered'].includes(order.orderStatus) ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400 border-2 border-gray-200'}`}>
                <Package size={20} />
              </div>
              <div className={`absolute top-5 left-1/2 w-full h-1 transition-colors ${['Processing', 'Shipped', 'Delivered'].includes(order.orderStatus) ? 'bg-primary' : 'bg-gray-100'}`}></div>
              <p className={`mt-3 text-sm font-bold ${['Processing', 'Shipped', 'Delivered'].includes(order.orderStatus) ? 'text-gray-900' : 'text-gray-400'}`}>Processing</p>
            </div>
            
            {/* Step 3: Shipped */}
            <div className="flex flex-col items-center flex-1 relative">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center z-10 shadow-md transition-colors ${['Shipped', 'Delivered'].includes(order.orderStatus) ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400 border-2 border-gray-200'}`}>
                <Truck size={20} />
              </div>
              <div className={`absolute top-5 left-1/2 w-full h-1 transition-colors ${order.orderStatus === 'Delivered' ? 'bg-primary' : 'bg-gray-100'}`}></div>
              <p className={`mt-3 text-sm font-bold ${['Shipped', 'Delivered'].includes(order.orderStatus) ? 'text-gray-900' : 'text-gray-400'}`}>Shipped</p>
            </div>
            
            {/* Step 4: Delivered */}
            <div className="flex flex-col items-center flex-1">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center z-10 shadow-md transition-colors ${order.orderStatus === 'Delivered' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-400 border-2 border-gray-200'}`}>
                <CheckCircle2 size={20} />
              </div>
              <p className={`mt-3 text-sm font-bold ${order.orderStatus === 'Delivered' ? 'text-green-600' : 'text-gray-400'}`}>Delivered</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">

          {/* Left Col: Items & Shipping */}
          <div className="md:col-span-2 flex flex-col gap-8">

            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold mb-6 font-heading">Items in your order</h2>
              <div className="flex flex-col gap-6">
                {order.items.map((item) => (
                  <div key={item._id} className="flex gap-4 md:gap-6 items-center p-4 rounded-xl border border-gray-50 hover:shadow-md transition-all bg-gray-50/30">
                    <div className="w-24 h-24 bg-white rounded-lg flex-shrink-0 border border-gray-100 p-2 shadow-sm">
                      <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                    </div>
                    <div className="flex-1">
                      <Link to={`/product/${item.product}`} className="font-bold text-lg text-gray-900 hover:text-primary transition-colors line-clamp-1">{item.name}</Link>
                      <p className="text-gray-500 text-sm mt-1">Quantity: <span className="font-bold text-gray-700">{item.quantity}</span></p>
                    </div>
                    <div className="font-extrabold text-xl text-gray-900">₹{item.price * item.quantity}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold mb-4 font-heading border-b border-gray-50 pb-4">Shipping Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-1">Customer</p>
                  <p className="font-bold text-gray-900">{order.user.name}</p>
                  <p className="text-gray-500 text-sm">{order.shippingAddress.phone}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-1">Delivery Address</p>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    <span className="font-bold text-gray-900">{order.shippingAddress.fullName}</span> <span className="text-[10px] font-bold text-gray-500 ml-1 py-0.5 px-1.5 bg-gray-100 rounded-md uppercase tracking-wider">{order.shippingAddress.label || 'Home'}</span><br/>
                    {order.shippingAddress.flatHouse}, {order.shippingAddress.areaStreet} <br />
                    {order.shippingAddress.landmark && <>Landmark: {order.shippingAddress.landmark}<br/></>}
                    {order.shippingAddress.city}, {order.shippingAddress.state} <br/>
                    <span className="font-bold">PIN: {order.shippingAddress.pincode}</span>
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* Right Col: Summary */}
          <div className="md:col-span-1">
            <div className="bg-gradient-to-b from-white to-gray-50 p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 sticky top-24">
              <h2 className="text-lg font-bold mb-6 font-heading">Order Summary</h2>

              <div className="flex flex-col gap-4 text-sm mb-6">
                <div className="flex justify-between text-gray-600">
                  <span className="font-medium">Subtotal</span>
                  <span className="font-bold text-gray-900">₹{order.subtotal}</span>
                </div>
                {order.couponCode && (
                  <div className="flex justify-between text-green-600 bg-green-50 p-2 rounded-lg -mx-2 px-2">
                    <span className="font-bold">Coupon ({order.couponCode})</span>
                    <span className="font-bold">- ₹{order.discount}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600">
                  <span className="font-medium">Shipping</span>
                  <span className="font-bold text-gray-900">{order.shippingFee === 0 ? <span className="text-green-500 bg-green-50 px-2 py-0.5 rounded text-xs">FREE</span> : `₹${order.shippingFee}`}</span>
                </div>
              </div>

              <div className="flex justify-between items-center border-t border-dashed border-gray-200 pt-6 mb-8">
                <span className="font-bold text-gray-900">Total</span>
                <span className="text-3xl font-black text-primary">₹{order.totalAmount}</span>
              </div>

              <div className="p-4 bg-white border border-gray-100 rounded-xl flex flex-col gap-4 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center">
                    <CheckCircle2 size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-0.5">Payment Method</p>
                    <p className="font-bold text-gray-800">{order.paymentMethod}</p>
                  </div>
                </div>
                {order.paymentMethod === 'RAZORPAY' && order.razorpayPaymentId && (
                  <div className="border-t border-dashed border-gray-200 pt-3 text-xs text-gray-500">
                    <p>Transaction ID: <span className="font-medium text-gray-800">{order.razorpayPaymentId}</span></p>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </main>

    </div>
  );
};

export default OrderDetail;
