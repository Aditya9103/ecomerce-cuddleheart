import { baseApi } from '../baseApi';

export const settingsApiSlice = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getStoreSettings: builder.query({
      query: () => '/settings',
      providesTags: ['Settings'],
    }),
    updateStoreSettings: builder.mutation({
      query: (data) => ({
        url: '/settings',
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Settings'],
    }),
  }),
});

export const { useGetStoreSettingsQuery, useUpdateStoreSettingsMutation } = settingsApiSlice;
