import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { ProfileSummary, SessionPayload } from '@/types/api';
import { apiSlice } from '@/services/apiSlice';

export type SessionState = {
  status: 'idle' | 'loading' | 'ready' | 'error';
  authenticated: boolean;
  domestic: boolean;
  email?: string;
  userType?: number;
  profile: ProfileSummary | null;
  csrfToken?: string;
  error?: string;
};

const initialState: SessionState = {
  status: 'idle',
  authenticated: false,
  domestic: false,
  profile: null,
};

const applySessionPayload = (state: SessionState, payload?: SessionPayload) => {
  state.status = 'ready';
  if (!payload) {
    return;
  }

  state.csrfToken = payload.csrfToken;
  state.domestic = Boolean(payload.domestic);
  state.email = payload.email;
  state.userType = payload.userType;
  state.profile = payload.profile ?? null;
  state.authenticated = Boolean(payload.email && payload.profile);
  state.error = undefined;
};

const sessionSlice = createSlice({
  name: 'session',
  initialState,
  reducers: {
    resetSession: () => initialState,
    upsertProfile(state, action: PayloadAction<ProfileSummary | null>) {
      state.profile = action.payload;
      state.authenticated = Boolean(action.payload && state.email);
    },
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(apiSlice.endpoints.getSession.matchPending, (state) => {
        state.status = state.status === 'ready' ? 'ready' : 'loading';
      })
      .addMatcher(apiSlice.endpoints.getSession.matchFulfilled, (state, action) => {
        applySessionPayload(state, action.payload);
      })
      .addMatcher(apiSlice.endpoints.getSession.matchRejected, (state, action) => {
        state.status = 'error';
        state.error = action.error?.message ?? 'Unable to fetch user session';
      })
      .addMatcher(apiSlice.endpoints.login.matchFulfilled, (state, action) => {
        applySessionPayload(state, action.payload);
      })
      .addMatcher(apiSlice.endpoints.login.matchRejected, (state, action) => {
        state.status = 'error';
        state.error = action.error?.message ?? 'Login failed';
      })
      .addMatcher(apiSlice.endpoints.logout.matchFulfilled, () => initialState)
      .addMatcher(apiSlice.endpoints.setStatus.matchFulfilled, (state, action) => {
        if (state.profile) {
          state.profile.status = action.payload;
        }
      })
      .addMatcher(apiSlice.endpoints.setPosition.matchFulfilled, (state, action) => {
        if (state.profile) {
          state.profile.latitude = action.payload.latitude;
          state.profile.longitude = action.payload.longitude;
        }
      })
      .addMatcher(apiSlice.endpoints.getProfile.matchFulfilled, (state, action) => {
        if (state.profile && action.payload?.profile?.id === state.profile.id) {
          state.profile = { ...state.profile, ...action.payload.profile };
        }
      });
  },
});

export const { resetSession, upsertProfile } = sessionSlice.actions;
export default sessionSlice.reducer;

