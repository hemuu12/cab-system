'use client';

import { Suspense, useEffect, useId, useState } from 'react';
import Link from 'next/link';
import { useRouter, useParams, usePathname, useSearchParams } from 'next/navigation';
import { motion } from 'motion/react';
import { useVehicleQuery, useQuoteMutation } from '../../../../store/api/catalogApi.js';
import { useCreateBookingMutation } from '../../../../store/api/bookingApi.js';
import { ACCOUNT_STORAGE_KEYS, writeRaw } from '../../../../store/slices/accountSlice.js';
import { errorMessage } from '../../../../api/errors.js';
import { money, tripDate, tripFromSearch } from '../../../../lib/format.js';
import { validatePassenger } from '../../../../lib/validation.js';
import { useToast } from '../../../../hooks/useToast.js';
import { useAuth } from '../../../../hooks/useAuth.js';
import PremiumButton from '../../../../components/ui/PremiumButton.jsx';
import PremiumCard from '../../../../components/ui/PremiumCard.jsx';
import StatusBadge from '../../../../components/ui/StatusBadge.jsx';
import VehicleImageCarousel from '../../../../components/VehicleImageCarousel.jsx';
import LoadingScreen from '../../../../components/LoadingScreen.jsx';

const PAYMENT_METHODS = [
  ['cash', 'Cash payment']
];
const SUPPORTED_METHODS = ['cash'];

function CheckoutContent() {
  const { vehicleId } = useParams();
  const params = useSearchParams();
  const trip = tripFromSearch(params);
  const router = useRouter();
  const pathname = usePathname();
  const toast = useToast();
  const { user, loading: authLoading } = useAuth();

  const { data: vehicle, isLoading, error: loadError } = useVehicleQuery(vehicleId, { skip: !vehicleId });
  const [createBooking, { isLoading: booking }] = useCreateBookingMutation();
  // vehicle.fare is priced against a fixed 250 km sample trip (the catalogue's default
  // preview), not this booking's real pickup/drop — fetch a live quote so the price shown
  // here matches what the server actually charges when the booking is confirmed.
  const [fetchQuote, { data: quoteResult, isFetching: quoting }] = useQuoteMutation();

  useEffect(() => {
    if (!trip.pickupPoint || !trip.dropPoint) return;
    fetchQuote({
      pickup: { ...trip.pickupPoint, label: trip.pickup },
      drop: { ...trip.dropPoint, label: trip.destination },
      tripType: trip.tripType === 'round-trip' ? 'round-trip' : 'one-way',
      date: trip.date,
      returnDate: trip.tripType === 'round-trip' ? trip.returnDate : undefined,
      time: trip.time
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trip.pickup, trip.destination, trip.date, trip.returnDate, trip.time, trip.tripType, trip.pickupPoint?.lat, trip.dropPoint?.lat]);

  const [error, setError] = useState('');
  // On mobile the fare card collapses into a sticky bottom bar (total + Confirm, always
  // reachable without scrolling); tapping it expands the full breakdown upward as a sheet.
  // Desktop ignores this — CSS keeps the card in normal flow at >700px regardless of state.
  const [fareExpanded, setFareExpanded] = useState(false);
  const fareSheetId = useId();
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [terms, setTerms] = useState(true);
  const [passengerInput, setPassengerInput] = useState({ name: null, email: null, phone: null, notes: '' });
  const [touched, setTouched] = useState({ name: false, phone: false, email: false });
  const passenger = {
    ...passengerInput,
    name: passengerInput.name ?? user?.name ?? '',
    phone: passengerInput.phone ?? user?.phone ?? '',
    email: passengerInput.email ?? user?.email ?? ''
  };
  const passengerErrors = validatePassenger(passenger);
  const checkoutQuery = params.toString();
  const returnTo = `${pathname}${checkoutQuery ? `?${checkoutQuery}` : ''}`;
  const loginHref = `/login?from=${encodeURIComponent(returnTo)}${passenger.email.trim() ? `&email=${encodeURIComponent(passenger.email.trim())}` : ''}`;

  const updatePassenger = (field, value) => {
    setPassengerInput(current => ({ ...current, [field]: value }));
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
    if (!terms) { setError('Please confirm that the booking details are correct.'); toast.error('Please review and confirm the journey and passenger details.', 'Confirmation required'); return; }
    setError('');
    const normalizedPassenger = { ...passenger, name: passenger.name.trim(), phone: passenger.phone.trim(), email: passenger.email.trim() };
    try {
      const created = await createBooking({
        ...trip,
        vehicleId,
        passenger: normalizedPassenger,
        paymentMethod: SUPPORTED_METHODS.includes(paymentMethod) ? paymentMethod : 'cash'
      }).unwrap();
      // The booking is already confirmed; blocked storage must not derail the redirect.
      if (normalizedPassenger.email) writeRaw(ACCOUNT_STORAGE_KEYS.email, normalizedPassenger.email);
      toast.success(`Your ride is confirmed. Reference: ${created.reference}`, 'Booking successful');
      router.push(`/confirmation/${created.reference}#access=${encodeURIComponent(created.accessToken || '')}`);
    } catch (requestError) {
      setError(errorMessage(requestError, 'We could not confirm this booking.'));
    }
  };

  if (isLoading) return <LoadingScreen message="Preparing your booking…" detail="Confirming the vehicle and journey details." />;
  if (!vehicle) return <div className="page-shell empty-state"><h1>Vehicle unavailable</h1><p>{errorMessage(loadError, 'This vehicle is no longer available.')}</p></div>;

  const liveFare = quoteResult?.options?.find(option => String(option.vehicle._id) === String(vehicleId))?.fare;
  if (!liveFare && quoting) return <LoadingScreen message="Pricing your journey…" detail="Matching the fare to your exact route." />;
  const fare = liveFare || vehicle.fare;

  // The premium this vehicle carries over its class (perKmDelta) is broken out as its own
  // line rather than buried in the km charge, so "base fare" reads as the plain per-km cost
  // with GST folded into that one figure. GST itself is split proportionally between the base
  // km charge and everything else (premium, allowance, night charge, permit), so the two
  // GST slices still add up to fare.gst and the total still matches fare.total exactly.
  const gstPercent = fare.gstPercent ?? 5;
  const premiumAmount = fare.perKmDelta > 0 ? fare.perKmDelta * fare.billableKm : 0;
  const baseKmCharge = fare.kmCharge - premiumAmount;
  const baseGst = Math.round(baseKmCharge * (gstPercent / 100));
  const baseFare = baseKmCharge + baseGst;
  const otherGst = fare.gst - baseGst;
  const date = tripDate(trip.date);
  return <div className="exact-booking exact-wrap">
    <motion.section initial={{opacity:0,y:18}} animate={{opacity:1,y:0}} transition={{duration:.45}} className="exact-success-head">
      <div className="exact-check"><svg viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5"/></svg></div>
      <h1>Review and confirm</h1>
      <p>Your selected car and fare are held while you complete the reservation.</p>
      <StatusBadge className="mt-3">Booking review · Fare estimate</StatusBadge>
    </motion.section>
    {error && <div className="form-error">{error}</div>}
    <div className="exact-booking-grid">
      <div className="exact-trip-column">
        <PremiumCard className="exact-trip-card">
          <div className="exact-trip-card-head">
            <h2>Journey summary</h2>
            <div className="exact-vehicle-chip">
              <VehicleImageCarousel images={vehicle.images} name={vehicle.name} className="exact-vehicle-thumb" />
              <div><b>{vehicle.name}</b><span>{vehicle.seats} seats</span></div>
            </div>
          </div>
          <div className="exact-route">
            <div className="exact-route-line" aria-hidden="true"><i className="exact-route-dot" /></div>
            <div className="exact-route-stops">
              <div className="exact-stop"><i className="from"/><div><h3>Pickup</h3><p>{trip.pickup}<br/>{date} · {trip.time}</p></div></div>
              <div className="exact-stop"><i className="to"/><div><h3>Dropoff</h3><p>{trip.destination}</p></div></div>
            </div>
          </div>
          <div className="exact-trip-meta exact-trip-meta-solo">
            <div><span>Approx. distance</span><b>{trip.distanceKm} km one way</b></div>
            <div><span>Trip type</span><b>{trip.tripType.replace('-', ' ')}</b></div>
            <div><span>Travel duration</span><b>{trip.travelDays} {trip.travelDays === 1 ? 'day' : 'days'}</b></div>
          </div>
          <div className="exact-driver-profile"><div className="exact-driver-av">WT</div><div className="exact-driver-info"><div>Driver assignment</div><span>Driver details will be confirmed before pickup.</span></div></div>
        </PremiumCard>
        <PremiumCard className="exact-passenger-card" delay={.05}>
          <h2>Passenger details</h2>
          <div className="exact-passenger-grid">
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
          {!authLoading && !user && <div className="exact-member-login">
            <span><strong>Already have an account?</strong><small>Sign in to fill your saved passenger details.</small></span>
            <Link href={loginHref}>Sign in</Link>
          </div>}
          {!authLoading && user && <div className="exact-member-login is-signed-in">
            <span><strong>Member details added</strong><small>Signed in as {user.email || user.phone || user.name}.</small></span>
          </div>}
          <div className="exact-support"><svg viewBox="0 0 24 24"><path d="M12 2a10 10 0 110 20 10 10 0 010-20zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg><span>Contact our booking team if you need to change or cancel this journey.</span></div>
        </PremiumCard>
      </div>
      {fareExpanded && <div className="exact-price-backdrop" onClick={() => setFareExpanded(false)} aria-hidden="true" />}
      <PremiumCard as="aside" delay={.08} className={`exact-price-card${fareExpanded ? ' is-expanded' : ''}`}>
        <button type="button" className="exact-price-toggle" aria-expanded={fareExpanded} aria-controls={fareSheetId} onClick={() => setFareExpanded(value => !value)}>
          <span className="exact-price-toggle-total"><small>Total payable</small><b>{money(fare.total)}</b></span>
          <span className="exact-price-toggle-hint">{fareExpanded ? 'Hide details' : 'View fare details'}<i className="exact-price-toggle-chevron" /></span>
        </button>
        <div id={fareSheetId} className="exact-price-sheet">
          <h2>Choose a payment method</h2>
          <div className="exact-price-breakdown">
            <div><span>Base fare · {fare.billableKm} km × {money(baseKmCharge / fare.billableKm)}/km <em>incl. {gstPercent}% GST</em></span><b>{money(baseFare)}</b></div>
            {premiumAmount > 0 && <div><span>Vehicle premium</span><b>{money(premiumAmount)}</b></div>}
            <div><span>Driver allowance{fare.days > 1 ? ` · ${fare.days} days` : ''}</span><b>{money(fare.driverAllowance)}</b></div>
            {fare.nightCharge > 0 && <div><span>Night charge</span><b>{money(fare.nightCharge)}</b></div>}
            {fare.statePermit > 0 && <div><span>Interstate permit &amp; state tax</span><b>{money(fare.statePermit)}</b></div>}
            {otherGst > 0 && <div><span>GST on add-ons ({gstPercent}%)</span><b>{money(otherGst)}</b></div>}
          </div>
          {fare.notes?.length > 0 && <ul className="exact-fare-notes">{fare.notes.map(note => <li key={note}>{note}</li>)}</ul>}
          <div className="exact-price-total"><span>Total payable</span><b>{money(fare.total)}</b></div>
          <div className="exact-payment-options">{PAYMENT_METHODS.map(([value,label])=><label key={value}><input type="radio" value={value} checked={paymentMethod===value} onChange={()=>setPaymentMethod(value)}/><span>{label}</span></label>)}</div>
          <label className="exact-terms"><input type="checkbox" checked={terms} onChange={e=>setTerms(e.target.checked)}/> I confirm that the journey and passenger details above are correct.</label>
          <div className="exact-support orange"><svg viewBox="0 0 24 24"><path d="M6.6 10.8a15 15 0 006.6 6.6l2.2-2.2a1 1 0 011-.2 11 11 0 003.5.6 1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1 11 11 0 00.6 3.5 1 1 0 01-.3 1z"/></svg><span><strong>Questions before booking?</strong> Contact our travel team for help.</span></div>
        </div>
        <PremiumButton className="exact-confirm" onClick={submit} disabled={booking}>{booking ? 'Securing your ride…' : `Confirm booking · ${money(fare.total)}`}</PremiumButton>
      </PremiumCard>
    </div>
  </div>;
}

export default function CheckoutPage() {
  return (
    <main>
      <Suspense fallback={<LoadingScreen message="Preparing your booking…" detail="Confirming the vehicle and journey details." />}>
        <CheckoutContent />
      </Suspense>
    </main>
  );
}
