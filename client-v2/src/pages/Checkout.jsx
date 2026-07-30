import { useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { useVehicleQuery } from '../store/api/catalogApi.js';
import { useCreateBookingMutation } from '../store/api/bookingApi.js';
import { ACCOUNT_STORAGE_KEYS, writeRaw } from '../store/slices/accountSlice.js';
import { errorMessage } from '../api/errors.js';
import { money, tripDate, tripFromSearch } from '../lib/format.js';
import { validatePassenger } from '../lib/validation.js';
import { useToast } from '../hooks/useToast.js';
import PremiumButton from '../components/ui/PremiumButton.jsx';
import PremiumCard from '../components/ui/PremiumCard.jsx';
import StatusBadge from '../components/ui/StatusBadge.jsx';
import VehicleImageCarousel from '../components/VehicleImageCarousel.jsx';

const PAYMENT_METHODS = [
  ['card', 'Credit / Debit card'],
  ['upi', 'UPI (Google Pay, PhonePe, Paytm)'],
  ['netbank', 'Net banking'],
  ['wallet', 'WonderTravel wallet'],
  ['cash', 'Pay at the end of ride (cash only)']
];
/** Methods the API accepts today; anything else is booked as a card payment. */
const SUPPORTED_METHODS = ['card', 'upi', 'cash'];

export default function Checkout() {
  const { vehicleId } = useParams();
  const [params] = useSearchParams();
  const trip = tripFromSearch(params);
  const navigate = useNavigate();
  const toast = useToast();

  const { data: vehicle, isLoading, error: loadError } = useVehicleQuery(vehicleId, { skip: !vehicleId });
  const [createBooking, { isLoading: booking }] = useCreateBookingMutation();

  const [error, setError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [terms, setTerms] = useState(true);
  const [passenger, setPassenger] = useState({ name: '', email: '', phone: '', notes: '' });
  const [touched, setTouched] = useState({ name: false, phone: false, email: false });
  const passengerErrors = validatePassenger(passenger);

  const updatePassenger = (field, value) => {
    setPassenger(current => ({ ...current, [field]: value }));
    if (error) setError('');
  };
  const fieldState = field => {
    if (!touched[field]) return '';
    if (passengerErrors[field]) return 'invalid';
    return passenger[field].trim() ? 'valid' : '';
  };

  const submit = async () => {
    setTouched({ name: true, phone: true, email: true });
    if (Object.keys(passengerErrors).length) {
      setError('Please check the highlighted passenger details.');
      toast.error('Please correct the highlighted passenger information before continuing.', 'Passenger details need attention');
      requestAnimationFrame(() => document.querySelector('.exact-passenger-field.invalid input')?.focus());
      return;
    }
    if (!terms) { setError('Please agree to the terms & conditions.'); toast.error('Please accept the terms and privacy policy to confirm this booking.', 'Agreement required'); return; }
    setError('');
    const normalizedPassenger = { ...passenger, name: passenger.name.trim(), phone: passenger.phone.trim(), email: passenger.email.trim() };
    try {
      const created = await createBooking({
        ...trip,
        vehicleId,
        passenger: normalizedPassenger,
        paymentMethod: SUPPORTED_METHODS.includes(paymentMethod) ? paymentMethod : 'card'
      }).unwrap();
      // The booking is already confirmed; blocked storage must not derail the redirect.
      if (normalizedPassenger.email) writeRaw(ACCOUNT_STORAGE_KEYS.email, normalizedPassenger.email);
      toast.success(`Your ride is confirmed. Reference: ${created.reference}`, 'Booking successful');
      navigate(`/confirmation/${created.reference}`);
    } catch (requestError) {
      setError(errorMessage(requestError, 'We could not confirm this booking.'));
    }
  };

  if (isLoading) return <div className="page-shell loading"><span/><p>Preparing your booking…</p></div>;
  if (!vehicle) return <div className="page-shell empty-state"><h1>Vehicle unavailable</h1><p>{errorMessage(loadError, 'This vehicle is no longer available.')}</p></div>;

  const fare = vehicle.fare;
  const date = tripDate(trip.date);
  return <div className="exact-booking exact-wrap">
    <motion.section initial={{opacity:0,y:18}} animate={{opacity:1,y:0}} transition={{duration:.45}} className="exact-success-head">
      <div className="exact-check"><svg viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5"/></svg></div>
      <h1>Review and confirm</h1>
      <p>Your selected car and fare are held while you complete the reservation.</p>
      <StatusBadge className="mt-3">Secure checkout · Fare locked</StatusBadge>
    </motion.section>
    {error && <div className="form-error">{error}</div>}
    <div className="exact-booking-grid">
      <PremiumCard className="exact-trip-card">
        <h2>Journey summary</h2>
        <div className="exact-trip-details">
          <div className="exact-stop"><i className="from"/><div><h3>Pickup</h3><p>{trip.pickup}<br/>{date} · {trip.time}</p></div></div>
          <div className="exact-stop"><i className="to"/><div><h3>Dropoff</h3><p>{trip.destination}<br/>Approx. 1:05 PM</p></div></div>
        </div>
        <div className="exact-trip-meta">
          <div><span>Approx. distance</span><b>{trip.distanceKm} km one way</b></div><div><span>Trip type</span><b>{trip.tripType.replace('-', ' ')}</b></div>
          <div><span>Travel duration</span><b>{trip.travelDays} {trip.travelDays === 1 ? 'day' : 'days'}</b></div>
          <label className={`exact-passenger-field ${fieldState('name')}`}>
            <span>Passenger name <em>Required</em></span>
            <input value={passenger.name} placeholder="Enter full name" autoComplete="name" required aria-invalid={fieldState('name') === 'invalid'} aria-describedby="passenger-name-help" onBlur={()=>setTouched(current=>({...current,name:true}))} onChange={e=>updatePassenger('name',e.target.value)}/>
            <small id="passenger-name-help">{touched.name && passengerErrors.name ? passengerErrors.name : 'Name of the person travelling'}</small>
          </label>
          <label className={`exact-passenger-field ${fieldState('phone')}`}>
            <span>Phone number <em>Required</em></span>
            <input type="tel" inputMode="tel" value={passenger.phone} placeholder="+91 98765 43210" autoComplete="tel" required maxLength={16} aria-invalid={fieldState('phone') === 'invalid'} aria-describedby="passenger-phone-help" onBlur={()=>setTouched(current=>({...current,phone:true}))} onChange={e=>updatePassenger('phone',e.target.value)}/>
            <small id="passenger-phone-help">{touched.phone && passengerErrors.phone ? passengerErrors.phone : 'Used for driver and journey updates'}</small>
          </label>
          <label className={`exact-passenger-field ${fieldState('email')}`}>
            <span>Email address <em className="optional">Optional</em></span>
            <input type="email" value={passenger.email} placeholder="you@example.com" autoComplete="email" aria-invalid={fieldState('email') === 'invalid'} aria-describedby="passenger-email-help" onBlur={()=>setTouched(current=>({...current,email:true}))} onChange={e=>updatePassenger('email',e.target.value)}/>
            <small id="passenger-email-help">{touched.email && passengerErrors.email ? passengerErrors.email : 'Add an email to receive the confirmation'}</small>
          </label>
        </div>
        <div className="exact-vehicle-info">
          <VehicleImageCarousel images={vehicle.images} name={vehicle.name} className="exact-vehicle-carousel" />
          <h3>{vehicle.name}</h3>
          <div className="exact-vehicle-specs"><span><strong>Seats:</strong> {vehicle.seats}</span><span><strong>Color:</strong> White</span><span><strong>Number plate:</strong> UK-09 AB 5678</span><span><strong>Air-conditioned:</strong> Yes</span></div>
          <div className="exact-driver-profile"><div className="exact-driver-av">RR</div><div className="exact-driver-info"><div>Rajesh Rautela</div><span>4.8 ★ · 1,240+ trips · Verified</span></div><a className="exact-driver-call" href="tel:+919876543210"><svg viewBox="0 0 24 24"><path d="M6.6 10.8a15 15 0 006.6 6.6l2.2-2.2a1 1 0 011-.2 11 11 0 003.5.6 1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1 11 11 0 00.6 3.5 1 1 0 01-.3 1z"/></svg></a></div>
        </div>
        <div className="exact-support"><svg viewBox="0 0 24 24"><path d="M12 2a10 10 0 110 20 10 10 0 010-20zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg><span>Cancellation free up to 2 hours before pickup. <a href="#">View policy.</a></span></div>
      </PremiumCard>
      <PremiumCard as="aside" delay={.08} className="exact-price-card">
        <h2>Choose a payment method</h2>
        <div className="exact-price-breakdown"><div><span>Estimated route package</span><b>{money(fare.base)}</b></div><div><span>Driver allowance</span><b>{money(fare.driverAllowance)}</b></div><div><span>Toll & state permit estimate</span><b>{money(fare.toll)}</b></div><div><span>GST (5%)</span><b>{money(fare.gst)}</b></div></div>
        <div className="exact-price-total"><span>Total payable</span><b>{money(fare.total)}</b></div>
        <div className="exact-payment-options">{PAYMENT_METHODS.map(([value,label])=><label key={value}><input type="radio" value={value} checked={paymentMethod===value} onChange={()=>setPaymentMethod(value)}/><span>{label}</span></label>)}</div>
        <label className="exact-terms"><input type="checkbox" checked={terms} onChange={e=>setTerms(e.target.checked)}/> I agree to the <a href="#">terms & conditions</a> and <a href="#">privacy policy</a></label>
        <PremiumButton className="exact-confirm" onClick={submit} disabled={booking}>{booking ? 'Securing your ride…' : `Confirm booking · ${money(fare.total)}`}</PremiumButton>
        <div className="exact-support orange"><svg viewBox="0 0 24 24"><path d="M6.6 10.8a15 15 0 006.6 6.6l2.2-2.2a1 1 0 011-.2 11 11 0 003.5.6 1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1 11 11 0 00.6 3.5 1 1 0 01-.3 1z"/></svg><span><strong>Questions before booking?</strong> Our travel team is available around the clock.</span></div>
      </PremiumCard>
    </div>
  </div>;
}
