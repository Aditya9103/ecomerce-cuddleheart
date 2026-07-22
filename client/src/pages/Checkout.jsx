import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useGetCartQuery } from '../store/slices/cartApiSlice';
import { useGetProfileQuery } from '../store/slices/authApiSlice';
import { useValidateCouponMutation } from '../store/slices/offerApiSlice';
import { 
  useCreateOrderMutation, 
  useCreateRazorpayOrderMutation, 
  useVerifyRazorpayPaymentMutation 
} from '../store/slices/orderApiSlice';
import { useGetStoreSettingsQuery } from '../store/slices/settingsApiSlice';
import toast from 'react-hot-toast';

const Checkout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { userInfo } = useSelector((state) => state.auth);
  
  const { data: cart, isLoading: isCartLoading } = useGetCartQuery();
  const { data: profile, isLoading: isProfileLoading } = useGetProfileQuery();
  const { data: storeSettings } = useGetStoreSettingsQuery();
  
  const [validateCoupon, { isLoading: isValidating }] = useValidateCouponMutation();
  const [createOrder, { isLoading: isCreating }] = useCreateOrderMutation();
  const [createRazorpayOrder, { isLoading: isCreatingRazorpay }] = useCreateRazorpayOrderMutation();
  const [verifyRazorpayPayment] = useVerifyRazorpayPaymentMutation();

  const [selectedAddress, setSelectedAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [couponCode, setCouponCode] = useState('');
  const [discountInfo, setDiscountInfo] = useState(null); // { code, discountType, discountValue }
  const [couponError, setCouponError] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const cartItems = cart?.items || [];
  
  // Calculate Totals
  const itemsPrice = Math.round(cartItems.reduce((acc, item) => {
    const p = item.product;
    if (!p) return acc;
    const priceToUse = (p.activeOffer && p.offerPrice) ? p.offerPrice : p.price;
    return acc + (priceToUse * item.quantity);
  }, 0));
  const taxPrice = 0; // Assuming tax is inclusive for now
  const shippingPrice = itemsPrice > 999 ? 0 : 50;
  
  let discountAmount = 0;
  if (discountInfo) {
    if (discountInfo.discountType === 'percentage') {
      discountAmount = Math.round((itemsPrice * discountInfo.discountValue) / 100);
    } else if (discountInfo.discountType === 'fixed') {
      discountAmount = Math.round(discountInfo.discountValue);
    }
  }

  const totalPrice = Math.round(itemsPrice + shippingPrice - discountAmount + taxPrice);

  useEffect(() => {
    if (!userInfo) {
      navigate('/login');
    }
    // Set default address if available
    if (profile?.addresses?.length > 0 && !selectedAddress) {
      const defaultAddr = profile.addresses.find(a => a.isDefault);
      setSelectedAddress(defaultAddr ? defaultAddr._id : profile.addresses[0]._id);
    }
  }, [userInfo, navigate, profile, selectedAddress]);

  useEffect(() => {
    if (storeSettings) {
      if (storeSettings.codEnabled === false && storeSettings.onlineEnabled === true) {
        setPaymentMethod('RAZORPAY');
      } else if (storeSettings.codEnabled !== false) {
        setPaymentMethod('COD');
      }
    }
  }, [storeSettings]);

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    setCouponError('');
    try {
      const res = await validateCoupon({ code: couponCode, cartTotal: itemsPrice }).unwrap();
      setDiscountInfo(res);
    } catch (err) {
      setCouponError(err?.data?.message || 'Invalid coupon');
      setDiscountInfo(null);
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      toast.error('Please select a shipping address');
      return;
    }
    if (cartItems.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    setShowConfirmModal(true);
  };

  const executePlaceOrder = async () => {
    setShowConfirmModal(false);

    const shippingAddressObj = profile.addresses.find(a => a._id === selectedAddress);

    const orderData = {
      orderItems: cartItems.map(item => ({
        name: item.product.name,
        qty: item.quantity,
        image: item.product.images[0],
        price: (item.product.activeOffer && item.product.offerPrice) ? item.product.offerPrice : item.product.price,
        product: item.product._id
      })),
      shippingAddress: {
        fullName: shippingAddressObj.fullName,
        phone: shippingAddressObj.phone,
        pincode: shippingAddressObj.pincode,
        flatHouse: shippingAddressObj.flatHouse,
        areaStreet: shippingAddressObj.areaStreet,
        landmark: shippingAddressObj.landmark,
        city: shippingAddressObj.city,
        state: shippingAddressObj.state,
        label: shippingAddressObj.label,
      },
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      couponApplied: discountInfo ? discountInfo.code : null,
    };

    if (paymentMethod === 'COD') {
      try {
        const res = await createOrder(orderData).unwrap();
        navigate(`/order-success/${res._id}`);
      } catch (err) {
        toast.error(err?.data?.message || 'Failed to place order');
      }
    } else if (paymentMethod === 'RAZORPAY') {
      try {
        const res = await createRazorpayOrder(orderData).unwrap();
        
        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID || '', // Needs to be exposed if frontend needs it, else checkout.js might require it. But typically backend passes key or frontend has it.
          amount: res.amount,
          currency: res.currency,
          name: storeSettings?.storeName || 'Cuddle Hearts',
          description: 'Payment for your order',
          image: storeSettings?.logo || '',
          order_id: res.orderId,
          handler: async function (response) {
            try {
              const verifyRes = await verifyRazorpayPayment({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              }).unwrap();
              toast.success('Payment successful!');
              navigate(`/order-success/${verifyRes.orderId}`);
            } catch (verifyErr) {
              toast.error(verifyErr?.data?.message || 'Payment verification failed');
              // Navigate to a generic orders page or show error
              navigate('/account/orders');
            }
          },
          prefill: {
            name: profile?.name || '',
            email: profile?.email || '',
            contact: shippingAddressObj.phone || ''
          },
          theme: {
            color: '#EC4899'
          },
          modal: {
            ondismiss: function() {
              toast.error('Payment cancelled by user');
            }
          }
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (response) {
          toast.error(response.error.description || 'Payment failed');
        });
        rzp.open();
        
      } catch (err) {
        toast.error(err?.data?.message || 'Failed to initialize payment');
      }
    }
  };

  if (isCartLoading || isProfileLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading checkout...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col font-body bg-gray-50 text-gray-800">
      
      <main className="flex-grow container mx-auto px-4 py-8 max-w-6xl">
        <h1 className="text-3xl font-heading font-bold text-heading mb-8">Checkout</h1>
        
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Left Column: Details */}
          <div className="flex-1 flex flex-col gap-8">
            
            {/* Address Selection */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">1. Shipping Address</h2>
                <button onClick={() => navigate('/account')} className="text-primary text-sm font-medium hover:underline">Add New Address</button>
              </div>
              
              {profile?.addresses?.length === 0 ? (
                <div className="bg-yellow-50 text-yellow-800 p-4 rounded-xl text-sm">
                  You don't have any saved addresses. Please add an address to proceed.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {profile?.addresses?.map(addr => (
                    <label 
                      key={addr._id} 
                      className={`cursor-pointer p-4 border rounded-xl flex items-start gap-3 transition-colors ${selectedAddress === addr._id ? 'border-primary bg-primary-light/10' : 'border-gray-200 hover:border-primary-light'}`}
                    >
                      <input 
                        type="radio" 
                        name="address" 
                        value={addr._id} 
                        checked={selectedAddress === addr._id}
                        onChange={() => setSelectedAddress(addr._id)}
                        className="mt-1 accent-primary"
                      />
                      <div className="text-sm">
                        <span className="font-bold block mb-1">{addr.fullName} <span className="text-xs font-medium text-gray-500 ml-2 py-0.5 px-2 bg-gray-100 rounded-md">{addr.label}</span></span>
                        <p className="text-gray-600">
                          {addr.flatHouse}, {addr.areaStreet} <br/>
                          {addr.landmark && `Landmark: ${addr.landmark}`} {addr.landmark && <br/>}
                          {addr.city}, {addr.state} {addr.pincode} <br/>
                          Phone: {addr.phone}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Payment Method */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold mb-4">2. Payment Method</h2>
              <div className="flex flex-col gap-4">
                {storeSettings?.codEnabled !== false && (
                  <label 
                    className={`cursor-pointer p-4 border rounded-xl flex items-center justify-between transition-colors ${paymentMethod === 'COD' ? 'border-primary bg-primary-light/10' : 'border-gray-200 hover:border-primary-light'}`}
                  >
                    <div className="flex items-center gap-3">
                      <input 
                        type="radio" 
                        name="paymentMethod" 
                        value="COD" 
                        checked={paymentMethod === 'COD'}
                        onChange={() => setPaymentMethod('COD')}
                        className="accent-primary"
                      />
                      <div>
                        <span className="font-bold text-gray-800">Cash on Delivery (COD)</span>
                        <p className="text-xs text-gray-500 mt-1">Pay when your order is delivered to your doorstep.</p>
                      </div>
                    </div>
                  </label>
                )}

                {storeSettings?.onlineEnabled && (
                  <label 
                    className={`cursor-pointer p-4 border rounded-xl flex items-center justify-between transition-colors ${paymentMethod === 'RAZORPAY' ? 'border-primary bg-primary-light/10' : 'border-gray-200 hover:border-primary-light'}`}
                  >
                    <div className="flex items-center gap-3">
                      <input 
                        type="radio" 
                        name="paymentMethod" 
                        value="RAZORPAY" 
                        checked={paymentMethod === 'RAZORPAY'}
                        onChange={() => setPaymentMethod('RAZORPAY')}
                        className="accent-primary"
                      />
                      <div>
                        <span className="font-bold text-gray-800">Razorpay (Online Payment)</span>
                        <p className="text-xs text-gray-500 mt-1">Pay securely via Credit/Debit Cards, UPI, or Netbanking.</p>
                      </div>
                    </div>
                  </label>
                )}
                
                {storeSettings?.codEnabled === false && !storeSettings?.onlineEnabled && (
                  <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 text-sm">
                    No payment methods are currently available. Please contact support.
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Right Column: Order Summary */}
          <div className="w-full lg:w-96 flex-shrink-0">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-24">
              <h2 className="text-xl font-bold mb-4 pb-4 border-b border-gray-100">Order Summary</h2>
              
              {/* Items */}
              <div className="flex flex-col gap-3 mb-6 max-h-60 overflow-y-auto pr-2">
                {cartItems.map(item => (
                  <div key={item._id} className="flex gap-3 text-sm">
                    <img src={item.product.images[0]} alt={item.product.name} className="w-12 h-12 rounded object-cover bg-gray-50 mix-blend-multiply" />
                    <div className="flex-1">
                      <p className="font-medium text-gray-800 line-clamp-1">{item.product.name}</p>
                      <p className="text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <span className="font-bold">₹{((item.product.activeOffer && item.product.offerPrice) ? item.product.offerPrice : item.product.price) * item.quantity}</span>
                  </div>
                ))}
              </div>

              {/* Coupon */}
              <div className="mb-6 pt-4 border-t border-gray-100">
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Coupon Code" 
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    className="flex-1 p-2 border border-gray-200 rounded-lg text-sm focus:border-primary outline-none uppercase"
                  />
                  <button type="submit" disabled={isValidating || !couponCode} className="bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-black disabled:opacity-50">
                    {isValidating ? '...' : 'Apply'}
                  </button>
                </form>
                {couponError && <p className="text-red-500 text-xs mt-2">{couponError}</p>}
                {discountInfo && (
                  <div className="mt-2 text-green-600 text-xs flex justify-between bg-green-50 p-2 rounded">
                    <span>Coupon '{discountInfo.code}' applied!</span>
                    <button type="button" onClick={() => setDiscountInfo(null)} className="font-bold hover:underline">Remove</button>
                  </div>
                )}
              </div>

              {/* Totals */}
              <div className="flex flex-col gap-2 mb-6 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>₹{itemsPrice}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>- ₹{discountAmount}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span>{shippingPrice === 0 ? <span className="text-green-500">FREE</span> : `₹${shippingPrice}`}</span>
                </div>
              </div>

              <div className="flex justify-between items-end border-t border-gray-100 pt-4 mb-6">
                <span className="font-bold text-gray-800">Total</span>
                <span className="text-2xl font-extrabold text-gray-900">₹{totalPrice}</span>
              </div>

              <button 
                onClick={handlePlaceOrder}
                disabled={isCreating || isCreatingRazorpay || cartItems.length === 0 || !selectedAddress}
                className="btn-primary w-full py-4 text-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreating || isCreatingRazorpay ? 'Placing Order...' : 'Place Order'}
              </button>
            </div>
          </div>
          
        </div>
      </main>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6">
              <h3 className="text-xl font-heading font-bold text-gray-900 mb-2">Confirm Order</h3>
              <p className="text-gray-600 mb-4">Are you sure you want to place this order?</p>
              
              <div className="bg-gray-50 rounded-xl p-4 mb-6 space-y-2 text-sm border border-gray-100">
                <div className="flex justify-between">
                  <span className="text-gray-500">Total Amount:</span>
                  <span className="font-bold text-gray-900">₹{totalPrice}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Payment:</span>
                  <span className="font-bold text-gray-900">{paymentMethod === 'COD' ? 'Cash on Delivery' : 'Online (Razorpay)'}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={executePlaceOrder}
                  className="flex-1 px-4 py-2.5 bg-primary text-white font-bold rounded-xl hover:bg-primary-hover transition-colors shadow-sm"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Checkout;
