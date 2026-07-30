import { CalendarDays, Check, Download, MapPin, Navigation, Phone, Star } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { useBookingQuery } from '../store/api/bookingApi.js';
import { errorMessage } from '../api/errors.js';
import { money } from '../lib/format.js';
import PremiumCard from '../components/ui/PremiumCard.jsx';
import VehicleImageCarousel from '../components/VehicleImageCarousel.jsx';

export default function Confirmation() {
  const { reference } = useParams();
  const { data: booking, error, isLoading } = useBookingQuery(reference, { skip: !reference });

  if (error) return <div className="page-shell empty-state"><h1>Booking not found</h1><p>{errorMessage(error, 'We could not find this booking.')}</p><Link className="button button-gold" to="/">Return home</Link></div>;
  if (isLoading || !booking) return <div className="page-shell loading"><span/><p>Retrieving your confirmation…</p></div>;

  const days = booking.travelDays || 1;
  const otpLink = `/login?mode=otp&email=${encodeURIComponent(booking.passenger.email || '')}`;
  return <div className="page-shell confirmation"><div className="container narrow">
    <div className="success-mark"><Check/></div>
    <p className="eyebrow center">Reservation confirmed</p>
    <h1 className="center">Your driver is booked.</h1>
    <p className="center confirmation-lede">{booking.passenger.email ? `A confirmation has been prepared for ${booking.passenger.email}. ` : 'Your reservation is confirmed. '}We’ll share the assigned driver before pickup.</p>
    <div className="reference"><span>Booking reference</span><b>{booking.reference}</b><button onClick={() => window.print()}><Download/> Receipt</button></div>
    <PremiumCard className="confirmation-card">
      <VehicleImageCarousel images={booking.vehicle.images} name={booking.vehicle.name} className="confirmation-vehicle-carousel" />
      <div className="confirmation-route"><div><span className="route-dot green"/><small>Pickup</small><b>{booking.pickup}</b></div><i/><div><span className="route-dot orange"/><small>Destination</small><b>{booking.destination}</b></div></div>
      <div className="confirmation-meta">
        <span><CalendarDays/><small>Departure<b>{booking.date} · {booking.time}</b></small></span>
        <span><MapPin/><small>Vehicle<b>{booking.vehicle.name}</b></small></span>
        <span><Navigation/><small>Distance & duration<b>{booking.distanceKm || 235} km · {days} {days === 1 ? 'day' : 'days'}</b></small></span>
        <span><Star/><small>Total fare<b>{money(booking.fare.total)}</b></small></span>
      </div>
    </PremiumCard>
    <PremiumCard delay={.08} className="driver-card"><div className="driver-avatar">RR</div><div><p className="eyebrow">Your assigned driver</p><h2>Rajesh Rautela</h2><span><Star/> 4.9 · 1,200+ journeys across India</span></div><a href="tel:+919876543210" className="button button-gold"><Phone/> Call driver</a></PremiumCard>
    {booking.passenger.email && <PremiumCard delay={.12} className="mt-5 border-champagne/30 bg-champagne/5 p-6 text-center">
      <p className="eyebrow">Save this journey</p><h2 className="mt-2 text-3xl">Verify your email to access your account.</h2>
      <p className="mx-auto mt-2 max-w-xl text-xs text-mist">A one-time email code will securely connect this booking to your customer profile.</p>
      <Link className="button button-gold mt-5" to={otpLink}>Verify email and view trips</Link>
    </PremiumCard>}
    <div className="confirmation-actions"><Link className="button button-ghost" to={booking.passenger.email ? otpLink : '/login'}>View my trips</Link><Link className="button button-ember" to="/">Book another ride</Link></div>
  </div></div>;
}
