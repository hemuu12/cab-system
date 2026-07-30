import { createSlice, nanoid } from '@reduxjs/toolkit';

const DEFAULT_TITLES = { success: 'Success', error: 'Please check this', info: 'Good to know' };

const toastSlice = createSlice({
  name: 'toast',
  initialState: { items: [] },
  reducers: {
    toastShown: {
      reducer(state, action) {
        // Mirror the original behaviour: never stack more than four toasts.
        state.items = [...state.items.slice(-3), action.payload];
      },
      prepare({ message, type = 'info', title }) {
        return { payload: { id: nanoid(), message, type, title: title || DEFAULT_TITLES[type] || DEFAULT_TITLES.info } };
      }
    },
    toastDismissed(state, action) {
      state.items = state.items.filter(item => item.id !== action.payload);
    }
  }
});

export const { toastShown, toastDismissed } = toastSlice.actions;
export const selectToasts = state => state.toast.items;
export default toastSlice.reducer;
