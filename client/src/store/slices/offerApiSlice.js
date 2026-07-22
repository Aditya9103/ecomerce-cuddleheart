import { baseApi } from '../baseApi';

export const offerApiSlice = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    validateCoupon: builder.mutation({
      query: (data) => ({
        url: '/offers/validate',
        method: 'POST',
        body: data, // { code, cartTotal }
      }),
    }),
    getOffers: builder.query({
      query: () => '/offers',
      providesTags: ['Offer'],
    }),
    createOffer: builder.mutation({
      query: (data) => ({
        url: '/offers',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Offer'],
    }),
    updateOffer: builder.mutation({
      query: ({ id, formData }) => ({
        url: `/offers/${id}`,
        method: 'PUT',
        body: formData,
      }),
      invalidatesTags: ['Offer'],
    }),
    deleteOffer: builder.mutation({
      query: (id) => ({
        url: `/offers/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Offer'],
    }),
  }),
});

export const {
  useValidateCouponMutation,
  useGetOffersQuery,
  useCreateOfferMutation,
  useUpdateOfferMutation,
  useDeleteOfferMutation,
} = offerApiSlice;
