import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'motion/react';
import { useBookingsQuery, useCancelBookingMutation } from '../store/api/bookingApi.js';
import { useLogoutAllMutation, useMeQuery } from '../store/api/authApi.js';
import {
  addressAdded, addressRemoved, addressUpdated,
  paymentAdded, paymentRemoved, paymentUpdated,
  prefToggled, profileChanged, selectAddresses, selectPayments, selectPrefs, selectProfile, selectWallet,
  settingsSaved, walletToppedUp
} from '../store/slices/accountSlice.js';
import { errorMessage } from '../api/errors.js';
import { APP_EVENTS, onAppEvent } from '../api/events.js';
import { firstNameOf, initialsOf, money } from '../lib/format.js';
import { useToast } from '../hooks/useToast.js';

const TABS = ['Upcoming journey', 'Past journeys', 'Saved places', 'Payment methods', 'Preferences'];
const PREFERENCE_LABELS = ['Email journey updates', 'SMS journey updates', 'Offers and travel inspiration'];
const CLOSED_STATUSES = ['cancelled', 'completed'];

export default function Account() {
  const toast = useToast();
  const dispatch = useDispatch();
  const profile = useSelector(selectProfile);
  const prefs = useSelector(selectPrefs);
  const addresses = useSelector(selectAddresses);
  const payments = useSelector(selectPayments);
  const wallet = useSelector(selectWallet);

  const { data: session } = useMeQuery();
  const { data: bookings = [], error: bookingsError } = useBookingsQuery();
  const [cancelBooking] = useCancelBookingMutation();
  const [logoutAll] = useLogoutAllMutation();

  const [activeTab, setActiveTab] = useState(0);
  const [error, setError] = useState('');

  // Server identity wins over the locally cached profile copy.
  useEffect(() => {
    if (!session?.user) return;
    dispatch(profileChanged({ name: session.user.name, email: session.user.email, ...(session.user.phone ? { phone: session.user.phone } : {}) }));
  }, [dispatch, session]);

  useEffect(() => setError(errorMessage(bookingsError, '')), [bookingsError]);
  useEffect(() => onAppEvent(APP_EVENTS.settings, () => setActiveTab(4)), []);

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
    const share = { title: 'WonderTravel Cab Service', text: 'Plan your next journey from Delhi with WonderTravel.', url: window.location.origin };
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
  const addMoney = () => {
    const amount = Number(window.prompt('Amount to add to wallet'));
    if (amount > 0) dispatch(walletToppedUp(amount));
  };
  const saveSettings = () => {
    dispatch(settingsSaved());
    toast.success('Your profile and communication preferences have been saved.', 'Preferences updated');
  };
  const signOutEverywhere = () => logoutAll().unwrap().catch(() => null).finally(() => location.assign('/login'));

  return <motion.div initial={{opacity:0,y:14}} animate={{opacity:1,y:0}} transition={{duration:.42}} className="exact-account account-wrap">
    <section className="exact-account-head">
      <div className="exact-profile"><div className="exact-account-avatar">{initialsOf(profile.name)}</div><div><h1>Welcome back, {firstNameOf(profile.name)}</h1><p>WonderTravel member · {bookings.length} journeys on this account</p></div></div>
      <div><button className="button button-ghost" onClick={editProfile}>Edit profile</button><button className="button button-ghost" onClick={inviteFriend}>Invite a friend</button></div>
    </section>
    <div className="exact-tabs">{TABS.map((tab, index) => <button className={activeTab === index ? 'active' : ''} onClick={() => setActiveTab(index)} key={tab}>{tab}</button>)}</div>
    {error && <div className="form-error">{error}</div>}

    {activeTab === 0 && (active ? <section className="exact-active-card">
      <h2>ⓘ Your upcoming journey</h2><div><span><small>Route</small><b>{active.pickup} → {active.destination}</b></span><span><small>Date & time</small><b>{active.date} · {active.time}</b></span><span><small>Driver</small><b>Rajesh Rautela · 4.8★</b></span></div>
      <footer><button className="button button-ghost" onClick={() => toast.info('Live tracking becomes available shortly before your pickup time.', 'Tracking not active yet')}>Track journey</button><a className="button button-ghost" href="tel:+919876543210">Contact driver</a><button className="button button-ghost" onClick={() => cancel(active.reference)}>Cancel journey</button></footer>
    </section> : <section className="exact-no-active"><p>You have no upcoming journeys.</p><Link className="button button-ember" to="/#book">Plan a journey</Link></section>)}

    {activeTab === 1 && <div className="exact-history">{bookings.length ? bookings.map(booking => <article key={booking.reference}><div><h3>{booking.pickup} → {booking.destination}</h3><p><span className={booking.status}>● {booking.status}</span><span>{booking.date}</span></p><footer><span>{money(booking.fare.total)}</span><span>{booking.vehicle?.name}</span><span>{booking.reference}</span></footer></div><Link className="button button-ghost" to={`/?pickup=${encodeURIComponent(booking.pickup)}&destination=${encodeURIComponent(booking.destination)}`}>Book again</Link></article>) : <p className="exact-muted">Your completed journeys will appear here.</p>}</div>}

    {activeTab === 2 && <div className="exact-address-grid">{addresses.map(({ name, address }, index) => <article key={`${name}-${index}`}><h3>⌖ {name}</h3><p>{address}</p><footer><button onClick={() => editAddress(index)}>Edit</button><i>·</i><button onClick={() => window.confirm('Remove this saved place?') && dispatch(addressRemoved(index))}>Remove</button></footer></article>)}<button className="exact-add" onClick={addAddress}>+ Add a saved place</button></div>}

    {activeTab === 3 && <div className="exact-payment-grid">{payments.map((payment, index) => <article key={`${payment.type}-${index}`}><small>{payment.type}</small><b>{payment.details}</b><span>{payment.meta}</span><footer><button className="button button-ghost" onClick={() => editPayment(index)}>Edit</button><button className="button button-ghost" onClick={() => window.confirm('Remove this payment method?') && dispatch(paymentRemoved(index))}>Remove</button></footer></article>)}<article><small>WonderTravel wallet</small><b className="green">Balance: {money(wallet)}</b><span>Available for your next journey</span><footer><button className="button button-ghost" onClick={addMoney}>Add money</button></footer></article><button className="exact-add" onClick={addPayment}>+ Add payment method</button></div>}

    {activeTab === 4 && <div className="exact-settings"><section><h3>Personal information</h3><div className="exact-setting-row"><label>Full name<input value={profile.name} onChange={e => dispatch(profileChanged({ name: e.target.value }))}/></label><label>Email<input type="email" value={profile.email} readOnly/></label></div><div className="exact-setting-row"><label>Phone number<input value={profile.phone} onChange={e => dispatch(profileChanged({ phone: e.target.value }))}/></label><label>Date of birth<input type="date" value={profile.dob} onChange={e => dispatch(profileChanged({ dob: e.target.value }))}/></label></div></section><section><h3>Communication preferences</h3>{PREFERENCE_LABELS.map((label, index) => <div className="exact-toggle-row" key={label}><span>{label}</span><button aria-label={`Toggle ${label}`} className={prefs[index] ? 'active' : ''} onClick={() => dispatch(prefToggled(index))}/></div>)}</section><section><h3>Account security</h3><Link className="button button-ghost" to={`/forgot-password?email=${encodeURIComponent(profile.email)}`}>Change password</Link><button className="button button-ghost" onClick={signOutEverywhere}>Sign out all devices</button><button className="button button-ghost danger" onClick={() => toast.info('Please contact WonderTravel support to permanently close your account.', 'Account closure requires support')}>Close account</button></section><div className="exact-save"><button className="button button-ember" onClick={saveSettings}>Save preferences</button></div></div>}
  </motion.div>;
}
