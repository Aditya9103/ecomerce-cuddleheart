import { baseApi } from '../baseApi';

export const authApiSlice = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (data) => ({
        url: '/auth/login',
        method: 'POST',
        body: data,
      }),
    }),
    adminLogin: builder.mutation({
      query: (data) => ({
        url: '/auth/admin/login',
        method: 'POST',
        body: data,
      }),
    }),
    adminRegister: builder.mutation({
      query: (data) => ({
        url: '/auth/admin/register',
        method: 'POST',
        body: data,
      }),
    }),
    register: builder.mutation({
      query: (data) => ({
        url: '/auth/register',
        method: 'POST',
        body: data,
      }),
    }),
    verifyOtp: builder.mutation({
      query: (data) => ({
        url: '/auth/verify-otp',
        method: 'POST',
        body: data,
      }),
    }),
    getProfile: builder.query({
      query: () => ({
        url: '/auth/me',
      }),
      providesTags: ['User'],
    }),
    updateProfile: builder.mutation({
      query: (data) => ({
        url: '/auth/me',
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),
    addAddress: builder.mutation({
      query: (data) => ({
        url: '/auth/address',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),
    updateAddress: builder.mutation({
      query: ({ id, data }) => ({
        url: `/auth/address/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),
    deleteAddress: builder.mutation({
      query: (id) => ({
        url: `/auth/address/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['User'],
    }),
  }),
});

export const { 
  useLoginMutation, 
  useAdminLoginMutation,
  useAdminRegisterMutation,
  useRegisterMutation, 
  useVerifyOtpMutation,
  useGetProfileQuery,
  useUpdateProfileMutation,
  useAddAddressMutation,
  useUpdateAddressMutation,
  useDeleteAddressMutation
} = authApiSlice;
