import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { Job } from '../../types';
import { jobSeekerApi } from '../../services/jobSeekerApi';
import { RootState } from '../index';

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

export const fetchSavedJobs = createAsyncThunk('jobs/fetchSavedJobs', async (_, { getState }) => {
    const { auth } = getState() as RootState;
    if (!auth.token) return { savedJobIds: [] };
    const response = await jobSeekerApi.getSavedJobs(auth.token);
    return response;
});

export const toggleSavedJob = createAsyncThunk('jobs/toggleSavedJob', async (jobId: string, { getState }) => {
    const { auth, jobs } = getState() as RootState;
    if (!auth.token) throw new Error('Not authenticated');
    
    const isSaved = jobs.saved.includes(jobId);

    if (isSaved) {
        await jobSeekerApi.unsaveJob(auth.token, jobId);
    } else {
        await jobSeekerApi.saveJob(auth.token, jobId);
    }
    
    return { jobId, isSaved };
});


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
    setSavedJobs: (state, action: PayloadAction<string[]>) => {
        state.saved = action.payload;
    },
    setFilters: (
      state,
      action: PayloadAction<JobsState['filters']>,
    ) => {
      state.filters = { ...state.filters, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    builder
        .addCase(fetchSavedJobs.fulfilled, (state, action) => {
            state.saved = action.payload.savedJobIds;
        })
        .addCase(toggleSavedJob.fulfilled, (state, action) => {
            const { jobId, isSaved } = action.payload;
            if (isSaved) {
                state.saved = state.saved.filter(id => id !== jobId);
            } else {
                state.saved.push(jobId);
            }
        });
  }
});

export const { setJobs, setStatus, setSavedJobs, setFilters } = jobsSlice.actions;

export default jobsSlice.reducer;
