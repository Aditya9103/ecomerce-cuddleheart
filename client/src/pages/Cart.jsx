import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { useGetCartQuery, useUpdateCartItemMutation, useRemoveFromCartMutation } from '../store/slices/cartApiSlice';

import { useDispatch, useSelector } from 'react-redux';
import { updateGuestCartQuantity, removeFromGuestCart } from '../store/slices/cartSlice';

import { Navigate } from 'react-router-dom';

const Cart = () => {
  const dispatch = useDispatch();
  const { userInfo } = useSelector(state => state.auth);
  const { guestCartItems } = useSelector(state => state.cart);

  const { data: cart, isLoading } = useGetCartQuery(undefined, { skip: !userInfo });
  const [updateCartItem] = useUpdateCartItemMutation();
  const [removeCartItem] = useRemoveFromCartMutation();

  if (!userInfo) {
    return <Navigate to="/login" replace />;
  }

  if (userInfo && isLoading) return <div className="min-h-screen flex items-center justify-center">Loading cart...</div>;

  let items = userInfo ? (cart?.items || []) : guestCartItems;

  // Filter out any invalid items where the product might have been deleted from the database
  items = items.filter(item => item && item.product);

  const subtotal = items.reduce((acc, item) => {
    const p = item.product;
    if (!p) return acc;
    const priceToUse = (p.activeOffer && p.offerPrice) ? p.offerPrice : p.price;
    return acc + (priceToUse * item.quantity);
  }, 0);
  const shipping = subtotal > 999 ? 0 : 50; // free shipping above 999
  const total = subtotal + shipping;

  const handleUpdateQuantity = async (itemId, currentQuantity, change) => {
    const newQuantity = currentQuantity + change;
    if (newQuantity > 0) {
      if (userInfo) {
        await updateCartItem({ itemId, quantity: newQuantity });
      } else {
        dispatch(updateGuestCartQuantity({ id: itemId, quantity: newQuantity }));
      }
    }
  };

  const handleRemove = async (itemId) => {
    if (userInfo) {
      await removeCartItem(itemId);
    } else {
      dispatch(removeFromGuestCart(itemId));
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-body bg-gray-50 text-gray-800">

      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-heading font-bold text-heading mb-8">Your Cart</h1>

        {items.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl shadow-sm text-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingBag size={32} className="text-gray-300" />
            </div>
            <h2 className="text-xl font-bold mb-2">Your cart is empty!</h2>
            <p className="text-gray-500 mb-6">Looks like you haven't added anything to your cart yet.</p>
            <Link to="/shop" className="btn-primary inline-block">Start Shopping</Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">

            {/* Cart Items */}
            <div className="w-full lg:w-2/3 flex flex-col gap-4">
              {items.map((item) => {
                // Determine ID depending on whether it's guest cart or real cart
                const itemId = userInfo ? item._id : item.product._id;

                return (
                  <div key={itemId} className="bg-white p-4 rounded-2xl shadow-sm flex gap-4 items-center">
                    <Link to={`/product/${item.product.slug}`} className="w-24 h-24 bg-gray-50 rounded-lg flex-shrink-0 flex items-center justify-center p-2">
                      <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-contain mix-blend-multiply" />
                    </Link>

                    <div className="flex-grow flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <Link to={`/product/${item.product.slug}`}>
                          <h3 className="font-bold text-gray-800 hover:text-primary transition-colors">{item.product.name}</h3>
                        </Link>
                        <div className="text-primary font-bold mt-1">
                          {item.product.activeOffer && item.product.offerPrice ? (
                            <>
                              ₹{item.product.offerPrice} <span className="text-xs text-gray-400 line-through font-normal">₹{item.product.price}</span>
                              <span className="ml-2 bg-red-100 text-red-600 text-[10px] px-2 py-0.5 rounded-sm uppercase tracking-wider">{item.product.activeOffer.title}</span>
                            </>
                          ) : (
                            <>₹{item.product.price} <span className="text-xs text-gray-400 line-through font-normal">₹{item.product.mrp}</span></>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-6">
                        <div className="flex items-center gap-3 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-200">
                          <button onClick={() => handleUpdateQuantity(itemId, item.quantity, -1)} className="text-gray-500 hover:text-primary disabled:opacity-50" disabled={item.quantity <= 1}>
                            <Minus size={16} />
                          </button>
                          <span className="w-4 text-center text-sm font-bold">{item.quantity}</span>
                          <button onClick={() => handleUpdateQuantity(itemId, item.quantity, 1)} className="text-gray-500 hover:text-primary">
                            <Plus size={16} />
                          </button>
                        </div>

                        <button onClick={() => handleRemove(itemId)} className="text-red-400 hover:text-red-600 p-2 bg-red-50 hover:bg-red-100 rounded-full transition-colors">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Order Summary */}
            <div className="w-full lg:w-1/3">
              <div className="bg-white p-6 rounded-2xl shadow-sm sticky top-24">
                <h3 className="text-xl font-bold mb-4 border-b border-gray-100 pb-4">Order Summary</h3>

                <div className="flex flex-col gap-3 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal ({items.length} items)</span>
                    <span className="font-medium text-gray-800">₹{subtotal}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span className="font-medium text-gray-800">{shipping === 0 ? <span className="text-green-500 font-bold">FREE</span> : `₹${shipping}`}</span>
                  </div>
                </div>

                <div className="flex justify-between items-end border-t border-gray-100 pt-4 mb-6">
                  <span className="font-bold text-gray-800">Total</span>
                  <div className="text-right">
                    <span className="text-2xl font-extrabold text-gray-900 block">₹{total}</span>
                    <span className="text-[10px] text-gray-400 font-medium">Inclusive of all taxes</span>
                  </div>
                </div>

                <Link to={userInfo ? "/checkout" : "/login"} className="btn-primary w-full text-center block py-4 text-lg">
                  Proceed to Checkout
                </Link>

                <div className="mt-4 text-center flex items-center justify-center gap-2 text-xs text-gray-500">
                  <span>🔒 Secure Checkout</span>
                </div>
              </div>
            </div>

          </div>
        )}
      </main>

    </div>
  );
};

export default Cart;
