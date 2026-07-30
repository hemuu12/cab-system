import { baseApi, TAGS } from './baseApi.js';
import { clearAccessToken, setAccessToken } from '../../api/tokenStore.js';
import { refreshSession } from '../../api/httpClient.js';
import { sessionCleared, sessionReceived } from '../slices/authSlice.js';

/** Shared `onQueryStarted` for every endpoint that returns `{ accessToken, user }`. */
async function adoptSession(_arg, { dispatch, queryFulfilled }) {
  try {
    const { data } = await queryFulfilled;
    if (data?.accessToken) setAccessToken(data.accessToken);
    if (data?.user) dispatch(sessionReceived(data));
  } catch {
    /* the interceptor already surfaced the error */
  }
}

async function dropSession(_arg, { dispatch, queryFulfilled }) {
  try { await queryFulfilled; } catch { /* sign out locally regardless */ }
  clearAccessToken();
  dispatch(sessionCleared());
  dispatch(baseApi.util.resetApiState());
}

export const authApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    /**
     * Restores the session from the httpOnly refresh cookie. Uses the shared
     * single-flight refresh so a remount never fires a second network call.
     */
    restoreSession: builder.query({
      queryFn: async () => {
        const session = await refreshSession();
        return { data: session || { user: null } };
      },
      providesTags: [TAGS.Session]
    }),
    me: builder.query({
      query: () => ({ url: '/auth/me' }),
      providesTags: [TAGS.Session]
    }),
    login: builder.mutation({
      query: body => ({ url: '/auth/login', method: 'POST', body }),
      onQueryStarted: adoptSession
    }),
    register: builder.mutation({
      query: body => ({ url: '/auth/register', method: 'POST', body }),
      onQueryStarted: adoptSession
    }),
    requestEmailOtp: builder.mutation({
      query: email => ({ url: '/auth/otp/request', method: 'POST', body: { email } })
    }),
    verifyEmailOtp: builder.mutation({
      query: body => ({ url: '/auth/otp/verify', method: 'POST', body }),
      onQueryStarted: adoptSession
    }),
    forgotPassword: builder.mutation({
      query: email => ({ url: '/auth/password/forgot', method: 'POST', body: { email } })
    }),
    resetPassword: builder.mutation({
      query: body => ({ url: '/auth/password/reset', method: 'POST', body }),
      onQueryStarted: adoptSession
    }),
    logout: builder.mutation({
      query: () => ({ url: '/auth/logout', method: 'POST' }),
      onQueryStarted: dropSession
    }),
    logoutAll: builder.mutation({
      query: () => ({ url: '/auth/logout-all', method: 'POST' }),
      onQueryStarted: dropSession
    })
  })
});

export const {
  useRestoreSessionQuery,
  useMeQuery,
  useLoginMutation,
  useRegisterMutation,
  useRequestEmailOtpMutation,
  useVerifyEmailOtpMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useLogoutMutation,
  useLogoutAllMutation
} = authApi;
