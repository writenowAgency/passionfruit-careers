import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { Job, Applicant } from '../../types';
import { API_CONFIG } from '../../config/api';

type RootStateLike = {
  auth: {
    token: string | null;
  };
};

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: API_CONFIG.BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootStateLike).auth.token;
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      headers.set('Accept', 'application/json');
      return headers;
    },
  }),
  tagTypes: ['Jobs', 'Applicants', 'Applications'],
  endpoints: (builder) => ({
    getJobs: builder.query<Job[], { categoryId?: string } | void>({
      query: (params) => {
        if (params && 'categoryId' in params && params.categoryId) {
          return `/jobs?categoryId=${params.categoryId}`;
        }
        return '/jobs';
      },
      providesTags: ['Jobs'],
    }),
    getCategories: builder.query<{ id: number; name: string; jobCount: number }[], void>({
      query: () => '/jobs/categories',
    }),
    getJobMatchScore: builder.query<{ jobId: string; score: number }, string>({
      query: (jobId) => `/jobs/${jobId}/match-score`,
    }),
    applyToJob: builder.mutation<{ success: boolean }, { jobId: string }>({
      query: ({ jobId }) => ({
        url: `/jobs/${jobId}/apply`,
        method: 'POST',
      }),
      invalidatesTags: ['Applications'],
    }),
    getApplicants: builder.query<Applicant[], void>({
      query: () => '/employer/applicants',
      providesTags: ['Applicants'],
    }),
  }),
});

export const {
  useGetJobsQuery,
  useLazyGetJobsQuery,
  useGetCategoriesQuery,
  useGetJobMatchScoreQuery,
  useApplyToJobMutation,
  useGetApplicantsQuery,
} = apiSlice;
