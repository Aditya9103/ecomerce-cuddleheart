import { baseApi } from '../baseApi';

export const newsletterApiSlice = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSubscribers: builder.query({
      query: () => '/newsletter',
      providesTags: ['Newsletter'],
    }),
    subscribeNewsletter: builder.mutation({
      query: (data) => ({
        url: '/newsletter',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Newsletter'],
    }),
  }),
});

export const {
  useGetSubscribersQuery,
  useSubscribeNewsletterMutation,
} = newsletterApiSlice;
