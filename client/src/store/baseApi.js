import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import env from '../config/env';

export const baseApi = createApi({
  reducerPath: 'baseApi',
  baseQuery: fetchBaseQuery({
    baseUrl: env.API_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth.userInfo?.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Product', 'Category', 'Banner', 'Settings'],
  endpoints: () => ({}),
});
