import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { Job, Applicant } from '../../types';

type RootStateLike = {
  auth: {
    token: string | null;
  };
};

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: 'https://api.passionfruit.careers',
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
    getJobs: builder.query<Job[], void>({
      query: () => '/jobs',
      providesTags: ['Jobs'],
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
  useGetJobMatchScoreQuery,
  useApplyToJobMutation,
  useGetApplicantsQuery,
} = apiSlice;
