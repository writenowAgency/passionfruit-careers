import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { profileApi, ProfileData, PersonalInfoUpdate, SkillCreate, ExperienceCreate, EducationCreate } from '../../services/profileApi';
import { RootState } from '../store';

interface ProfileState {
  data: ProfileData | null;
  loading: boolean;
  error: string | null;
}

const initialState: ProfileState = {
  data: null,
  loading: false,
  error: null,
};

// Async thunks for API calls
export const fetchProfile = createAsyncThunk(
  'profile/fetchProfile',
  async (_, { getState, rejectWithValue, dispatch }) => {
    try {
      const state = getState() as RootState;
      const token = state.auth.token;

      if (!token) {
        return rejectWithValue('No authentication token found');
      }

      const profile = await profileApi.getProfile(token);
      return profile;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch profile';

      // If token is invalid or expired, clear auth state
      if (message.includes('Invalid or expired token') || message.includes('Forbidden')) {
        // Import and dispatch logout action
        const { logout } = await import('./authSlice');
        dispatch(logout());
      }

      return rejectWithValue(message);
    }
  }
);

export const updatePersonalInfo = createAsyncThunk(
  'profile/updatePersonalInfo',
  async (data: PersonalInfoUpdate, { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState;
      const token = state.auth.token;

      if (!token) {
        throw new Error('No authentication token found');
      }

      await profileApi.updatePersonalInfo(token, data);
      // Refetch profile to get updated data
      const profile = await profileApi.getProfile(token);
      return profile;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to update personal info');
    }
  }
);

export const addSkillAsync = createAsyncThunk(
  'profile/addSkill',
  async (skill: SkillCreate, { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState;
      const token = state.auth.token;

      if (!token) {
        throw new Error('No authentication token found');
      }

      await profileApi.addSkill(token, skill);
      const profile = await profileApi.getProfile(token);
      return profile;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to add skill');
    }
  }
);

export const removeSkillAsync = createAsyncThunk(
  'profile/removeSkill',
  async (skillId: number, { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState;
      const token = state.auth.token;

      if (!token) {
        throw new Error('No authentication token found');
      }

      await profileApi.removeSkill(token, skillId);
      const profile = await profileApi.getProfile(token);
      return profile;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to remove skill');
    }
  }
);

export const addExperienceAsync = createAsyncThunk(
  'profile/addExperience',
  async (experience: ExperienceCreate, { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState;
      const token = state.auth.token;

      if (!token) {
        throw new Error('No authentication token found');
      }

      await profileApi.addExperience(token, experience);
      const profile = await profileApi.getProfile(token);
      return profile;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to add experience');
    }
  }
);

export const addEducationAsync = createAsyncThunk(
  'profile/addEducation',
  async (education: EducationCreate, { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState;
      const token = state.auth.token;

      if (!token) {
        throw new Error('No authentication token found');
      }

      await profileApi.addEducation(token, education);
      const profile = await profileApi.getProfile(token);
      return profile;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to add education');
    }
  }
);

export const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    clearProfile: (state) => {
      state.data = null;
      state.error = null;
      state.loading = false;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch profile
    builder.addCase(fetchProfile.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchProfile.fulfilled, (state, action) => {
      state.loading = false;
      state.data = action.payload;
    });
    builder.addCase(fetchProfile.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Update personal info
    builder.addCase(updatePersonalInfo.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(updatePersonalInfo.fulfilled, (state, action) => {
      state.loading = false;
      state.data = action.payload;
    });
    builder.addCase(updatePersonalInfo.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Add skill
    builder.addCase(addSkillAsync.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(addSkillAsync.fulfilled, (state, action) => {
      state.loading = false;
      state.data = action.payload;
    });
    builder.addCase(addSkillAsync.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Remove skill
    builder.addCase(removeSkillAsync.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(removeSkillAsync.fulfilled, (state, action) => {
      state.loading = false;
      state.data = action.payload;
    });
    builder.addCase(removeSkillAsync.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Add experience
    builder.addCase(addExperienceAsync.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(addExperienceAsync.fulfilled, (state, action) => {
      state.loading = false;
      state.data = action.payload;
    });
    builder.addCase(addExperienceAsync.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Add education
    builder.addCase(addEducationAsync.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(addEducationAsync.fulfilled, (state, action) => {
      state.loading = false;
      state.data = action.payload;
    });
    builder.addCase(addEducationAsync.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

export const { clearProfile, clearError } = profileSlice.actions;

export default profileSlice.reducer;
