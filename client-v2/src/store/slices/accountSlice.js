import { createSlice } from '@reduxjs/toolkit';

export const ACCOUNT_STORAGE_KEYS = {
  profile: 'wondertravelProfileV2',
  prefs: 'wondertravelPrefsV2',
  addresses: 'wondertravelAddressesV2',
  payments: 'wondertravelPaymentsV2',
  wallet: 'wondertravelWalletV2',
  email: 'wondertravelEmailV2',
  name: 'wondertravelNameV2'
};

/** Raw string access. Storage throws outright when the browser blocks it. */
const readRaw = (key, fallback = '') => {
  try { return localStorage.getItem(key) ?? fallback; } catch { return fallback; }
};

export const writeRaw = (key, value) => {
  try { localStorage.setItem(key, String(value)); } catch { /* private mode */ }
};

export const readLocal = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? fallback : (JSON.parse(raw) ?? fallback);
  } catch { return fallback; }
};

export const writeLocal = (key, value) => {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* private mode */ }
};

const initialState = {
  profile: readLocal(ACCOUNT_STORAGE_KEYS.profile, {
    name: '',
    email: readRaw(ACCOUNT_STORAGE_KEYS.email),
    phone: '',
    dob: ''
  }),
  prefs: readLocal(ACCOUNT_STORAGE_KEYS.prefs, [true, true, false]),
  addresses: readLocal(ACCOUNT_STORAGE_KEYS.addresses, []),
  payments: readLocal(ACCOUNT_STORAGE_KEYS.payments, []),
  wallet: Number(readRaw(ACCOUNT_STORAGE_KEYS.wallet) || 0)
};

const accountSlice = createSlice({
  name: 'account',
  initialState,
  reducers: {
    profileChanged(state, action) {
      state.profile = { ...state.profile, ...action.payload };
    },
    prefToggled(state, action) {
      state.prefs = state.prefs.map((value, index) => (index === action.payload ? !value : value));
    },
    addressAdded(state, action) {
      state.addresses.push(action.payload);
    },
    addressUpdated(state, action) {
      const { index, address } = action.payload;
      if (state.addresses[index]) state.addresses[index].address = address;
    },
    addressRemoved(state, action) {
      state.addresses.splice(action.payload, 1);
    },
    paymentAdded(state, action) {
      state.payments.push(action.payload);
    },
    paymentUpdated(state, action) {
      const { index, details } = action.payload;
      if (state.payments[index]) state.payments[index].details = details;
    },
    paymentRemoved(state, action) {
      state.payments.splice(action.payload, 1);
    },
    walletToppedUp(state, action) {
      state.wallet += action.payload;
    },
    settingsSaved(state) {
      writeLocal(ACCOUNT_STORAGE_KEYS.profile, state.profile);
      writeLocal(ACCOUNT_STORAGE_KEYS.prefs, state.prefs);
      writeLocal(ACCOUNT_STORAGE_KEYS.name, state.profile.name);
    }
  }
});

export const {
  profileChanged,
  prefToggled,
  addressAdded,
  addressUpdated,
  addressRemoved,
  paymentAdded,
  paymentUpdated,
  paymentRemoved,
  walletToppedUp,
  settingsSaved
} = accountSlice.actions;

export const selectProfile = state => state.account.profile;
export const selectPrefs = state => state.account.prefs;
export const selectAddresses = state => state.account.addresses;
export const selectPayments = state => state.account.payments;
export const selectWallet = state => state.account.wallet;

export default accountSlice.reducer;
