'use client';

import { Suspense, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'motion/react';
import { useBookingsQuery, useCancelBookingMutation } from '../../../store/api/bookingApi.js';
import { useLogoutAllMutation, useMeQuery } from '../../../store/api/authApi.js';
import {
  addressAdded, addressRemoved, addressUpdated,
  paymentAdded, paymentRemoved, paymentUpdated,
  prefToggled, profileChanged, selectAddresses, selectPayments, selectPrefs, selectProfile,
  settingsSaved
} from '../../../store/slices/accountSlice.js';
import { errorMessage } from '../../../api/errors.js';
import { firstNameOf, initialsOf, money } from '../../../lib/format.js';
import { smoothLogout } from '../../../lib/smoothLogout.js';
import { useToast } from '../../../hooks/useToast.js';
import { SUPPORT_PHONE } from '../../../components/design/Floats.jsx';
import ProtectedRoute from '../../../components/ProtectedRoute.jsx';
import LoadingScreen from '../../../components/LoadingScreen.jsx';

const ACCOUNT_SECTIONS = [
  ['upcoming', 'Upcoming journey'],
  ['past', 'Past journeys'],
  ['saved-places', 'Saved places'],
  ['payments', 'Payment methods'],
  ['preferences', 'Preferences']
];
const PREFERENCE_LABELS = ['Email journey updates', 'SMS journey updates', 'Offers and travel inspiration'];
const CLOSED_STATUSES = ['cancelled', 'completed'];
const sectionFromParam = value => (
  ACCOUNT_SECTIONS.some(([key]) => key === String(value || '').toLowerCase())
    ? String(value).toLowerCase()
    : 'upcoming'
);

function AccountContent() {
  const toast = useToast();
  const dispatch = useDispatch();
  const profile = useSelector(selectProfile);
  const prefs = useSelector(selectPrefs);
  const addresses = useSelector(selectAddresses);
  const payments = useSelector(selectPayments);

  const { data: session } = useMeQuery();
  const { data: bookings = [], error: bookingsError } = useBookingsQuery();
  const [cancelBooking] = useCancelBookingMutation();
  const [logoutAll] = useLogoutAllMutation();

  const router = useRouter();
  const searchParams = useSearchParams();
  const section = sectionFromParam(searchParams.get('section'));
  const activeTab = ACCOUNT_SECTIONS.findIndex(([key]) => key === section);
  const [error, setError] = useState('');
  const setSection = useCallback(nextSection => {
    const next = sectionFromParam(nextSection);
    router.replace(next === 'upcoming' ? '/account' : `/account?section=${next}`);
  }, [router]);

  // Server identity wins over the locally cached profile copy.
  useEffect(() => {
    if (!session?.user) return;
    dispatch(profileChanged({ name: session.user.name, email: session.user.email, ...(session.user.phone ? { phone: session.user.phone } : {}) }));
  }, [dispatch, session]);

  useEffect(() => setError(errorMessage(bookingsError, '')), [bookingsError]);

  const active = bookings.find(booking => !CLOSED_STATUSES.includes(booking.status));

  const cancel = async reference => {
    if (!window.confirm('Cancel this journey?')) return;
    try {
      await cancelBooking(reference).unwrap();
      toast.success('The journey has been cancelled successfully.', 'Booking cancelled');
    } catch (requestError) {
      setError(errorMessage(requestError, 'We could not cancel this journey.'));
    }
  };

  const editProfile = () => {
    const name = window.prompt('Full name', profile.name)?.trim();
    if (name) dispatch(profileChanged({ name }));
  };
  const inviteFriend = async () => {
    const share = { title: 'WonderTravel Cab Service', text: 'Plan your next intercity journey across India with WonderTravel.', url: window.location.origin };
    if (navigator.share) await navigator.share(share);
    else { await navigator.clipboard.writeText(window.location.origin); toast.success('WonderTravel link copied to your clipboard.', 'Link copied'); }
  };
  const editAddress = index => {
    const address = window.prompt('Update address', addresses[index].address)?.trim();
    if (address) dispatch(addressUpdated({ index, address }));
  };
  const addAddress = () => {
    const name = window.prompt('Place name (for example, Home or Office)')?.trim();
    if (!name) return;
    const address = window.prompt('Full address')?.trim();
    if (address) dispatch(addressAdded({ name, address }));
  };
  const editPayment = index => {
    const details = window.prompt('Update payment reference', payments[index].details)?.trim();
    if (details) dispatch(paymentUpdated({ index, details }));
  };
  const addPayment = () => {
    const type = window.prompt('Payment type (Card or UPI)')?.trim();
    if (!type) return;
    const details = window.prompt('Last four card digits or UPI ID')?.trim();
    if (details) dispatch(paymentAdded({ type, details, meta: 'Added now' }));
  };
  const saveSettings = () => {
    dispatch(settingsSaved());
    toast.success('Your profile and communication preferences have been saved.', 'Preferences updated');
  };
  const signOutEverywhere = () => smoothLogout(() => logoutAll().unwrap());

  return <motion.div initial={{opacity:0,y:14}} animate={{opacity:1,y:0}} transition={{duration:.42}} className="exact-account account-wrap">
    <section className="exact-account-head">
      <div className="exact-profile"><div className="exact-account-avatar">{initialsOf(profile.name)}</div><div><h1>Welcome back, {firstNameOf(profile.name)}</h1><p>WonderTravel member · {bookings.length} journeys on this account</p></div></div>
      <div><button className="button button-ghost" onClick={editProfile}>Edit profile</button><button className="button button-ghost" onClick={inviteFriend}>Invite a friend</button></div>
    </section>
    <div className="exact-tabs">{ACCOUNT_SECTIONS.map(([key, label], index) => <button className={activeTab === index ? 'active' : ''} onClick={() => setSection(key)} key={key}>{label}</button>)}</div>
    {error && <div className="form-error">{error}</div>}

    {activeTab === 0 && (active ? <section className="exact-active-card">
      <h2>ⓘ Your upcoming journey</h2><div><span><small>Route</small><b>{active.pickup} → {active.destination}</b></span><span><small>Date & time</small><b>{active.date} · {active.time}</b></span><span><small>Driver</small><b>Details shared before pickup</b></span></div>
      <footer><a className="button button-ghost" href={`tel:${SUPPORT_PHONE}`}>Call support</a><button className="button button-ghost" onClick={() => cancel(active.reference)}>Cancel journey</button></footer>
    </section> : <section className="exact-no-active"><p>You have no upcoming journeys.</p><Link className="button button-ember" href="/#book">Plan a journey</Link></section>)}

    {activeTab === 1 && <div className="exact-history">{bookings.length ? bookings.map(booking => <article key={booking.reference}><div><h3>{booking.pickup} → {booking.destination}</h3><p><span className={booking.status}>● {booking.status}</span><span>{booking.date}</span></p><footer><span>{money(booking.fare.total)}</span><span>{booking.vehicle?.name}</span><span>{booking.reference}</span></footer></div><Link className="button button-ghost" href={`/?pickup=${encodeURIComponent(booking.pickup)}&destination=${encodeURIComponent(booking.destination)}`}>Book again</Link></article>) : <p className="exact-muted">Your completed journeys will appear here.</p>}</div>}

    {activeTab === 2 && <div className="exact-address-grid">{addresses.map(({ name, address }, index) => <article key={`${name}-${index}`}><h3>⌖ {name}</h3><p>{address}</p><footer><button onClick={() => editAddress(index)}>Edit</button><i>·</i><button onClick={() => window.confirm('Remove this saved place?') && dispatch(addressRemoved(index))}>Remove</button></footer></article>)}<button className="exact-add" onClick={addAddress}>+ Add a saved place</button></div>}

    {activeTab === 3 && <div className="exact-payment-grid">{payments.map((payment, index) => <article key={`${payment.type}-${index}`}><small>{payment.type}</small><b>{payment.details}</b><span>{payment.meta}</span><footer><button className="button button-ghost" onClick={() => editPayment(index)}>Edit</button><button className="button button-ghost" onClick={() => window.confirm('Remove this payment method?') && dispatch(paymentRemoved(index))}>Remove</button></footer></article>)}<button className="exact-add" onClick={addPayment}>+ Add payment method</button></div>}

    {activeTab === 4 && <div className="exact-settings"><section><h3>Personal information</h3><div className="exact-setting-row"><label>Full name<input value={profile.name} onChange={e => dispatch(profileChanged({ name: e.target.value }))}/></label><label>Email<input type="email" value={profile.email} readOnly/></label></div><div className="exact-setting-row"><label>Phone number<input value={profile.phone} onChange={e => dispatch(profileChanged({ phone: e.target.value }))}/></label><label>Date of birth<input type="date" value={profile.dob} onChange={e => dispatch(profileChanged({ dob: e.target.value }))}/></label></div></section><section><h3>Communication preferences</h3>{PREFERENCE_LABELS.map((label, index) => <div className="exact-toggle-row" key={label}><span>{label}</span><button aria-label={`Toggle ${label}`} className={prefs[index] ? 'active' : ''} onClick={() => dispatch(prefToggled(index))}/></div>)}</section><section><h3>Account security</h3><Link className="button button-ghost" href={`/forgot-password?email=${encodeURIComponent(profile.email)}&returnTo=${encodeURIComponent('/account?section=preferences')}`}>Change password</Link><button className="button button-ghost" onClick={signOutEverywhere}>Sign out all devices</button><button className="button button-ghost danger" onClick={() => toast.info('Please contact WonderTravel support to permanently close your account.', 'Account closure requires support')}>Close account</button></section><div className="exact-save"><button className="button button-ember" onClick={saveSettings}>Save preferences</button></div></div>}
  </motion.div>;
}

export default function Page() {
  return <Suspense fallback={<LoadingScreen message="Loading your account…" />}>
    <ProtectedRoute>
      <main>
        <AccountContent />
      </main>
    </ProtectedRoute>
  </Suspense>;
}
