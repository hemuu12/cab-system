import { useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { toastShown } from '../store/slices/toastSlice.js';

/** Same call signature as the original context API: `toast.success(message, title)`. */
export function useToast() {
  const dispatch = useDispatch();
  return useMemo(() => {
    const show = (message, type = 'info', title) => dispatch(toastShown({ message, type, title }));
    return {
      show,
      success: (message, title = 'Success') => show(message, 'success', title),
      error: (message, title = 'Please check this') => show(message, 'error', title),
      info: (message, title = 'Good to know') => show(message, 'info', title)
    };
  }, [dispatch]);
}
