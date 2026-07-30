import { createListenerMiddleware, isAnyOf } from '@reduxjs/toolkit';
import {
  ACCOUNT_STORAGE_KEYS,
  addressAdded,
  addressRemoved,
  addressUpdated,
  paymentAdded,
  paymentRemoved,
  paymentUpdated,
  walletToppedUp,
  writeLocal,
  writeRaw
} from '../slices/accountSlice.js';

/**
 * Mirrors the account slice into localStorage. Doing it here (rather than in an
 * effect inside the page) keeps the persistence rule in one place and survives
 * the page unmounting mid-edit.
 */
export const persistAccountMiddleware = createListenerMiddleware();

persistAccountMiddleware.startListening({
  matcher: isAnyOf(addressAdded, addressUpdated, addressRemoved),
  effect: (action, api) => writeLocal(ACCOUNT_STORAGE_KEYS.addresses, api.getState().account.addresses)
});

persistAccountMiddleware.startListening({
  matcher: isAnyOf(paymentAdded, paymentUpdated, paymentRemoved),
  effect: (action, api) => writeLocal(ACCOUNT_STORAGE_KEYS.payments, api.getState().account.payments)
});

persistAccountMiddleware.startListening({
  actionCreator: walletToppedUp,
  effect: (action, api) => writeRaw(ACCOUNT_STORAGE_KEYS.wallet, api.getState().account.wallet)
});
