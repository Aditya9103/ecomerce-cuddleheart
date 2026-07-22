import { baseApi } from '../baseApi';

export const contactApiSlice = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    submitContactMessage: builder.mutation({
      query: (data) => ({
        url: '/contact',
        method: 'POST',
        body: data,
      }),
    }),
    getContactMessages: builder.query({
      query: () => ({
        url: '/contact',
      }),
      providesTags: ['Contact'],
    }),
    updateContactMessage: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/contact/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Contact'],
    }),
  }),
});

export const {
  useSubmitContactMessageMutation,
  useGetContactMessagesQuery,
  useUpdateContactMessageMutation,
} = contactApiSlice;
