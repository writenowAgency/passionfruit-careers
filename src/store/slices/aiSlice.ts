import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AutoApplySettings } from '../../types';

interface AIState {
  settings: AutoApplySettings;
  dailySummary: { jobId: string; title: string; status: string }[];
}

const initialState: AIState = {
  settings: {
    enabled: false,
    dailyLimit: 3,
    minimumMatch: 75,
    excludedCompanies: [],
  },
  dailySummary: [],
};

export const aiSlice = createSlice({
  name: 'ai',
  initialState,
  reducers: {
    updateSettings: (state, action: PayloadAction<Partial<AutoApplySettings>>) => {
      state.settings = { ...state.settings, ...action.payload };
    },
    setDailySummary: (
      state,
      action: PayloadAction<AIState['dailySummary']>,
    ) => {
      state.dailySummary = action.payload;
    },
  },
});

export const { updateSettings, setDailySummary } = aiSlice.actions;

export default aiSlice.reducer;
