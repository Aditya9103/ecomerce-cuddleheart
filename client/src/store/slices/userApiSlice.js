import { baseApi } from '../baseApi';

export const userApiSlice = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query({
      query: () => '/users',
      providesTags: ['User'],
    }),
    toggleBlockUser: builder.mutation({
      query: (id) => ({
        url: `/users/${id}/block`,
        method: 'PUT',
      }),
      invalidatesTags: ['User'],
    }),
  }),
});

export const {
  useGetUsersQuery,
  useToggleBlockUserMutation,
} = userApiSlice;
