import { baseApi } from '../baseApi';

export const productApiSlice = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProducts: builder.query({
      query: (params) => {
        let queryString = '/products?';
        if (params) {
          Object.keys(params).forEach(key => {
            if (params[key]) queryString += `${key}=${params[key]}&`;
          });
        }
        return queryString;
      },
      providesTags: ['Product'],
    }),
    getProductBySlug: builder.query({
      query: (slug) => `/products/${slug}`,
      providesTags: ['Product'],
    }),
    getCategories: builder.query({
      query: () => '/categories',
      providesTags: ['Category'],
    }),
    getBanners: builder.query({
      query: () => '/banners',
      providesTags: ['Banner'],
    }),
    createProduct: builder.mutation({
      query: (data) => ({
        url: '/products',
        method: 'POST',
        body: data, // FormData
      }),
      invalidatesTags: ['Product'],
    }),
    updateProduct: builder.mutation({
      query: ({ id, formData }) => ({
        url: `/products/${id}`,
        method: 'PUT',
        body: formData,
      }),
      invalidatesTags: ['Product'],
    }),
    deleteProduct: builder.mutation({
      query: (id) => ({
        url: `/products/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Product'],
    }),
    createCategory: builder.mutation({
      query: (data) => ({
        url: '/categories',
        method: 'POST',
        body: data, // FormData
      }),
      invalidatesTags: ['Category'],
    }),
    updateCategory: builder.mutation({
      query: ({ id, formData }) => ({
        url: `/categories/${id}`,
        method: 'PUT',
        body: formData,
      }),
      invalidatesTags: ['Category'],
    }),
    deleteCategory: builder.mutation({
      query: (id) => ({
        url: `/categories/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Category'],
    }),
    createBanner: builder.mutation({
      query: (data) => ({
        url: '/banners',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Banner'],
    }),
    updateBanner: builder.mutation({
      query: ({ id, formData }) => ({
        url: `/banners/${id}`,
        method: 'PUT',
        body: formData,
      }),
      invalidatesTags: ['Banner'],
    }),
    deleteBanner: builder.mutation({
      query: (id) => ({
        url: `/banners/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Banner'],
    }),
    createProductReview: builder.mutation({
      query: (data) => ({
        url: `/products/${data.productId}/reviews`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Product'],
    }),
    getAllReviewsAdmin: builder.query({
      query: () => '/reviews/all',
      providesTags: ['Review'],
    }),
    deleteReviewAdmin: builder.mutation({
      query: ({ productId, reviewId }) => ({
        url: `/products/${productId}/reviews/${reviewId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Product', 'Review'],
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetProductBySlugQuery,
  useGetCategoriesQuery,
  useGetBannersQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useCreateBannerMutation,
  useUpdateBannerMutation,
  useDeleteBannerMutation,
  useCreateProductReviewMutation,
  useGetAllReviewsAdminQuery,
  useDeleteReviewAdminMutation,
} = productApiSlice;
