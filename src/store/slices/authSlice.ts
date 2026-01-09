import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { UserRole } from '../../types';

export interface AuthState {
  token: string | null;
  userRole: UserRole | null;
  isAuthenticated: boolean;
  status: 'idle' | 'loading' | 'error';
  error?: string;
}

const AUTH_KEY = 'pf_auth';

const initialState: AuthState = {
  token: null,
  userRole: null,
  isAuthenticated: false,
  status: 'idle',
};

export const bootstrapAuth = createAsyncThunk('auth/bootstrap', async () => {
  try {
    const raw = await AsyncStorage.getItem(AUTH_KEY);
    if (!raw) return null;

    const auth = JSON.parse(raw) as Pick<AuthState, 'token' | 'userRole'>;

    // Validate token is not expired (basic check)
    if (auth.token) {
      try {
        const payload = JSON.parse(atob(auth.token.split('.')[1]));
        const expiryTime = payload.exp * 1000; // Convert to milliseconds

        if (Date.now() >= expiryTime) {
          // Token expired, clear storage
          await AsyncStorage.removeItem(AUTH_KEY);
          return null;
        }
      } catch (e) {
        // Invalid token format, clear it
        await AsyncStorage.removeItem(AUTH_KEY);
        return null;
      }
    }

    return auth;
  } catch (error) {
    // If anything fails, clear storage and return null
    await AsyncStorage.removeItem(AUTH_KEY);
    return null;
  }
});

const persistAuth = async (state: Pick<AuthState, 'token' | 'userRole'>) => {
  await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(state));
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess: (
      state,
      action: PayloadAction<{ token: string; userRole: UserRole }>,
    ) => {
      state.token = action.payload.token;
      state.userRole = action.payload.userRole;
      state.isAuthenticated = true;
      persistAuth({ token: state.token, userRole: state.userRole! });
    },
    logout: (state) => {
      state.token = null;
      state.userRole = null;
      state.isAuthenticated = false;
      AsyncStorage.removeItem(AUTH_KEY);
    },
    setRole: (state, action: PayloadAction<UserRole>) => {
      state.userRole = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(bootstrapAuth.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(bootstrapAuth.fulfilled, (state, action) => {
        state.status = 'idle';
        if (action.payload) {
          state.token = action.payload.token;
          state.userRole = action.payload.userRole;
          state.isAuthenticated = Boolean(action.payload.token);
        }
      })
      .addCase(bootstrapAuth.rejected, (state, action) => {
        state.status = 'error';
        state.error = action.error.message;
      });
  },
});

export const { loginSuccess, logout, setRole } = authSlice.actions;

export default authSlice.reducer;
