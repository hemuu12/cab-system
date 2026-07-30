import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLogoutMutation, useRestoreSessionQuery } from '../store/api/authApi.js';
import { sessionCleared, sessionReceived, sessionResolved, selectAuthLoading, selectUser } from '../store/slices/authSlice.js';

/**
 * Session access for any component. The restore query is shared by RTK Query's
 * cache, so mounting this hook in ten places still performs one refresh call.
 */
export function useAuth() {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const loading = useSelector(selectAuthLoading);
  const { data, isSuccess, isError } = useRestoreSessionQuery();
  const [logoutRequest] = useLogoutMutation();

  useEffect(() => {
    if (isError) { dispatch(sessionCleared()); return; }
    if (!isSuccess) return;
    if (data?.user) dispatch(sessionReceived(data));
    else dispatch(sessionResolved());
  }, [data, dispatch, isError, isSuccess]);

  const logout = useCallback(() => logoutRequest().unwrap().catch(() => null), [logoutRequest]);

  return { user, loading, logout, isAdmin: user?.role === 'admin' };
}
