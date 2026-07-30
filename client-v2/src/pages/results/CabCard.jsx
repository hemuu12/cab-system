import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DesignCarousel from '../../components/design/DesignCarousel.jsx';
import {
  IconChevronDownSmall, IconClimate, IconInfo, IconMusic, IconSeatSpec, IconStarBadge
} from '../../components/design/icons.jsx';

/** Illustrated cars used until a vehicle has uploaded photos. */
export const CAB_ART = [
  <svg viewBox="0 0 200 90" xmlns="http://www.w3.org/2000/svg" key="sedan"><path d="M16 64c-5 0-7-3-7-7 0-4 3-6 8-7l12-2c9-8 20-14 33-16 15-2 35-1 50 5 7 3 17 7 28 9 11 2 17 5 17 11 0 4-3 7-8 7z" fill="#F4F3F0"/><path d="M50 34c9-6 20-9 32-9 11 0 22 2 31 7l-5 8H55z" fill="#B9D2E4" opacity=".9"/><circle cx="52" cy="64" r="13" fill="#111"/><circle cx="52" cy="64" r="6" fill="#666"/><circle cx="148" cy="64" r="13" fill="#111"/><circle cx="148" cy="64" r="6" fill="#666"/></svg>,
  <svg viewBox="0 0 200 90" xmlns="http://www.w3.org/2000/svg" key="suv"><path d="M16 64c-5 0-7-3-7-7 0-4 3-6 8-7l11-2c9-9 21-15 35-17 16-2 37-1 52 5 7 3 15 7 26 9 11 2 17 5 17 11 0 4-3 7-8 7z" fill="#EFEEEB"/><path d="M46 33c11-7 24-10 37-10 12 0 23 3 32 8l-4 9H50z" fill="#C7DCEC" opacity=".9"/><circle cx="54" cy="64" r="13" fill="#111"/><circle cx="54" cy="64" r="6" fill="#666"/><circle cx="150" cy="64" r="13" fill="#111"/><circle cx="150" cy="64" r="6" fill="#666"/></svg>,
  <svg viewBox="0 0 200 90" xmlns="http://www.w3.org/2000/svg" key="innova"><path d="M14 66c-5 0-8-3-8-8V36c0-6 4-9 11-10l16-2c9-8 20-13 33-15 15-2 34-1 49 4 7 2 13 6 22 8 11 2 15 5 15 12v23c0 5-3 8-8 8z" fill="#F1F0ED"/><path d="M40 32c10-6 22-9 34-9 12 0 23 2 32 7l-4 10H44z" fill="#AFCADE" opacity=".9"/><circle cx="52" cy="66" r="13" fill="#111"/><circle cx="52" cy="66" r="6" fill="#666"/><circle cx="150" cy="66" r="13" fill="#111"/><circle cx="150" cy="66" r="6" fill="#666"/></svg>,
  <svg viewBox="0 0 200 90" xmlns="http://www.w3.org/2000/svg" key="crysta"><path d="M14 66c-5 0-8-3-8-8V35c0-6 4-9 11-10l17-2c9-8 21-13 34-15 15-2 33-1 48 4 7 2 14 6 23 8 11 2 15 5 15 13v22c0 5-3 8-8 8z" fill="#F5F4F1"/><path d="M42 31c10-6 22-9 34-9 12 0 22 2 31 7l-4 11H46z" fill="#9FBFD6" opacity=".9"/><circle cx="52" cy="66" r="13.5" fill="#0E0E0E"/><circle cx="52" cy="66" r="6" fill="#777"/><circle cx="150" cy="66" r="13.5" fill="#0E0E0E"/><circle cx="150" cy="66" r="6" fill="#777"/></svg>
];

/** Default spec labels; a vehicle's own features replace slots 2 and 3. */
const DEFAULT_FEATURES = ['Audio system', 'Climate control'];
const SPEC_ICONS = [IconMusic, IconClimate];

export default function CabCard({ vehicle, art, trip, search, formatAmount, priority = false }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const fare = vehicle.fare || {};
  const features = [0, 1].map(index => vehicle.features?.[index] || DEFAULT_FEATURES[index]);
  const dayLabel = trip.travelDays === 1 ? 'day' : 'days';

  return <div className={`cab${vehicle.featured ? ' top' : ''}`}>
    {vehicle.featured && <div className="badge"><IconStarBadge /> Guest favourite</div>}
    <div className="cab-img">
      {vehicle.images?.length ? <DesignCarousel images={vehicle.images} name={vehicle.name} priority={priority} sizes="(max-width: 860px) 100vw, 38vw" /> : art}
    </div>
    <div className="cab-mid">
      <h3>{vehicle.name}</h3>
      <div className="rate-note">
        <IconInfo /> Route estimate · {trip.distanceKm} km one way · {trip.travelDays} {dayLabel} · incl. 5% GST
      </div>
      <div className="specs">
        <div className="spec"><span className="si"><IconSeatSpec /></span>{vehicle.seats} passengers</div>
        {features.map((feature, index) => {
          const Icon = SPEC_ICONS[index];
          return <div className="spec" key={feature}><span className="si"><Icon /></span>{feature}</div>;
        })}
        <div className="spec"><span className="si"><IconSeatSpec /></span>Driver details before pickup</div>
      </div>
      <div className={`breakup-toggle${open ? ' open' : ''}`} onClick={() => setOpen(value => !value)}>
        See price details <IconChevronDownSmall />
      </div>
      <div className={`breakup${open ? ' open' : ''}`}>
        <div className="breakup-in">
          <div className="brow"><span>Route base fare</span><span>₹{formatAmount(fare.base)}</span></div>
          <div className="brow"><span>Driver allowance</span><span>₹{formatAmount(fare.driverAllowance)}</span></div>
          <div className="brow"><span>Toll &amp; state permit</span><span>₹{formatAmount(fare.toll)}</span></div>
          <div className="brow"><span>GST (5%)</span><span>₹{formatAmount(fare.gst)}</span></div>
          <div className="brow tot"><span>Total payable</span><span>₹{formatAmount(fare.total)}</span></div>
        </div>
      </div>
    </div>
    <div className="cab-price">
      <div className="price"><span className="r">₹</span>{formatAmount(fare.total)}</div>
      <div className="price-sub">taxes &amp; allowance included</div>
      <button className="btn btn-ember" type="button" onClick={() => navigate(`/checkout/${vehicle._id}${search}`)}>Select this car</button>
    </div>
  </div>;
}
