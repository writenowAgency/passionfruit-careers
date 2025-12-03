import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Job } from '../../types';

interface JobsState {
  list: Job[];
  saved: string[];
  filters: {
    location?: string;
    minMatch?: number;
    type?: string;
  };
  status: 'idle' | 'loading' | 'error';
  error?: string;
}

const initialState: JobsState = {
  list: [],
  saved: [],
  filters: {},
  status: 'idle',
};

export const jobsSlice = createSlice({
  name: 'jobs',
  initialState,
  reducers: {
    setJobs: (state, action: PayloadAction<Job[]>) => {
      state.list = action.payload;
      state.status = 'idle';
    },
    setStatus: (state, action: PayloadAction<JobsState['status']>) => {
      state.status = action.payload;
    },
    toggleSavedJob: (state, action: PayloadAction<string>) => {
      if (state.saved.includes(action.payload)) {
        state.saved = state.saved.filter((id) => id !== action.payload);
      } else {
        state.saved.push(action.payload);
      }
    },
    setFilters: (
      state,
      action: PayloadAction<JobsState['filters']>,
    ) => {
      state.filters = { ...state.filters, ...action.payload };
    },
  },
});

export const { setJobs, setStatus, toggleSavedJob, setFilters } = jobsSlice.actions;

export default jobsSlice.reducer;
