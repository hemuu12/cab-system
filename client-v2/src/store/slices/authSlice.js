import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null,
  /** True until the refresh-cookie probe finishes, so guards can hold rendering. */
  loading: true,
  accessToken: ''
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    sessionReceived(state, action) {
      state.user = action.payload?.user || null;
      state.accessToken = action.payload?.accessToken || state.accessToken;
      state.loading = false;
    },
    sessionCleared(state) {
      state.user = null;
      state.accessToken = '';
      state.loading = false;
    },
    sessionResolved(state) {
      state.loading = false;
    },
    accessTokenChanged(state, action) {
      state.accessToken = action.payload || '';
    }
  }
});

export const { sessionReceived, sessionCleared, sessionResolved, accessTokenChanged } = authSlice.actions;

export const selectUser = state => state.auth.user;
export const selectAuthLoading = state => state.auth.loading;
export const selectIsAdmin = state => state.auth.user?.role === 'admin';

export default authSlice.reducer;
