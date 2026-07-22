import { baseApi } from '../baseApi';

export const orderApiSlice = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createOrder: builder.mutation({
      query: (order) => ({
        url: '/orders',
        method: 'POST',
        body: order,
      }),
    }),
    getOrderDetails: builder.query({
      query: (orderId) => ({
        url: `/orders/${orderId}`,
      }),
      providesTags: ['Order'],
    }),
    getMyOrders: builder.query({
      query: () => ({
        url: '/orders/myorders',
      }),
      providesTags: ['Order'],
    }),
    getOrderById: builder.query({
      query: (id) => `/orders/${id}`,
      providesTags: ['Order'],
    }),
    getAllOrders: builder.query({
      query: () => '/orders',
      providesTags: ['Order'],
    }),
    updateOrderStatus: builder.mutation({
      query: ({ id, orderStatus }) => ({
        url: `/orders/${id}/status`,
        method: 'PUT',
        body: { orderStatus },
      }),
      invalidatesTags: ['Order'],
    }),
    getDashboardStats: builder.query({
      query: () => '/orders/dashboard/stats',
      providesTags: ['Order'],
    }),
    createRazorpayOrder: builder.mutation({
      query: (orderData) => ({
        url: '/orders/razorpay/create',
        method: 'POST',
        body: orderData,
      }),
    }),
    verifyRazorpayPayment: builder.mutation({
      query: (verificationData) => ({
        url: '/orders/razorpay/verify',
        method: 'POST',
        body: verificationData,
      }),
    }),
  }),
});

export const {
  useCreateOrderMutation,
  useGetOrderDetailsQuery,
  useGetMyOrdersQuery,
  useGetOrderByIdQuery,
  useGetAllOrdersQuery,
  useUpdateOrderStatusMutation,
  useGetDashboardStatsQuery,
  useCreateRazorpayOrderMutation,
  useVerifyRazorpayPaymentMutation,
} = orderApiSlice;
