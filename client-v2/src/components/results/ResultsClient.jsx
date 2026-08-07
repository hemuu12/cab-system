'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useVehiclesQuery, useQuoteMutation } from '../../store/api/catalogApi.js';
import { useAuth } from '../../hooks/useAuth.js';
import { tripDate, tripFromSearch } from '../../lib/format.js';
import { smoothLogout } from '../../lib/smoothLogout.js';
import DesignStyles from '../design/DesignStyles.jsx';
import Floats, { SUPPORT_PHONE } from '../design/Floats.jsx';
import { IconArrowRight, IconEdit, IconInfo } from '../design/icons.jsx';
import CabCard, { CAB_ART } from './CabCard.jsx';
import LoadingScreen from '../LoadingScreen.jsx';
import HomeFooter from '../home/HomeFooter.jsx';
import HomeNav from '../home/HomeNav.jsx';
import BookingWidget from '../home/BookingWidget.jsx';

const SORTS = ['Recommended', 'Lowest price', 'Passenger capacity'];
const amountFormatter = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 });
const formatAmount = value => amountFormatter.format(Number(value) || 0);

const titleCase = value => value.replace('-', ' ').replace(/\b\w/g, character => character.toUpperCase());

const sortVehicles = (vehicles, sort) => {
  const rows = [...vehicles];
  if (sort === 1) return rows.sort((a, b) => (a.fare?.total || 0) - (b.fare?.total || 0));
  if (sort === 2) return rows.sort((a, b) => (b.seats || 0) - (a.seats || 0));
  return rows.sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)));
};

export default function ResultsClient({ resultsCss }) {
  const router = useRouter();
  const params = useSearchParams();
  const search = params.toString() ? `?${params.toString()}` : '';
  const { user, logout } = useAuth();
  const [sort, setSort] = useState(0);
  const [editing, setEditing] = useState(false);

  const trip = tripFromSearch(params);
  const isGroupTravel = trip.serviceMode === 'group-travel';
  const { data: vehicles = [], isLoading } = useVehiclesQuery();
  const [fetchQuote, { data: quoteResult, isFetching: quoting }] = useQuoteMutation();

  // The vehicle catalogue carries photos/specs but only a sample-trip fare; a real quote for
  // this exact pickup/drop/date is fetched here and merged in below, so the price shown always
  // matches the trip actually chosen instead of a fixed 250 km placeholder.
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
    // Search params are read fresh each render via tripFromSearch; stringify what actually
    // identifies the trip so this only refires when the route itself changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trip.pickup, trip.destination, trip.date, trip.returnDate, trip.time, trip.tripType, trip.pickupPoint?.lat, trip.dropPoint?.lat]);

  const fareById = useMemo(() => {
    const map = new Map();
    (quoteResult?.options || []).forEach(option => map.set(String(option.vehicle._id), option.fare));
    return map;
  }, [quoteResult]);

  const priced = useMemo(() => vehicles.map(vehicle => {
    const liveFare = fareById.get(String(vehicle._id));
    return liveFare ? { ...vehicle, fare: liveFare } : vehicle;
  }), [vehicles, fareById]);

  const sorted = useMemo(() => sortVehicles(priced, sort), [sort, priced]);
  const effectiveTrip = quoteResult?.trip
    ? { ...trip, distanceKm: quoteResult.trip.distanceKm, travelDays: quoteResult.trip.days }
    : trip;

  const signOut = async () => {
    await smoothLogout(logout);
  };

  // The edit panel re-quotes and rewrites the URL in place (shallow, no navigation) so the
  // user stays on this page instead of bouncing back to the landing page and losing their
  // place in the results list.
  const applyEdit = ({ params: nextParams }) => {
    router.replace(`/results?${nextParams}`, { scroll: false });
    setEditing(false);
  };

  if (isLoading) return <LoadingScreen message="Finding the right cars…" detail="Matching comfort and capacity to your journey." />;

  const dayLabel = effectiveTrip.travelDays === 1 ? 'day' : 'days';

  return <>
    <DesignStyles css={resultsCss} page="results" />
    <HomeNav user={user} onLogout={signOut} onPlanJourney={() => router.push('/#book')} />

    <div className="wrap">
      <div className="page-head">
        <span className="eyebrow">{isGroupTravel ? 'Group vehicles for your journey' : 'Cars for your journey'}</span>
        <h1>Choose the right <span className="it">car</span></h1>
        <p>{isGroupTravel
          ? 'Choose from the available vehicles for your group and luggage.'
          : 'Compare available cars and review each fare estimate.'}</p>
      </div>

      <div className="tripbar">
        <div className="route">
          <div className="stop from"><span className="pin a" /> {trip.pickup}</div>
          <div className="stop to"><span className="pin b" /> {trip.destination}</div>
        </div>
        <div className="trip-meta">
          <div className="trip-when">{tripDate(trip.date)}<span className="sep">·</span><span className="time">{trip.time}</span></div>
          <div className="trip-tags">{titleCase(trip.tripType)}<span className="km"> · {quoting ? 'Updating…' : `${effectiveTrip.distanceKm} km one way`} · {effectiveTrip.travelDays} {dayLabel}</span></div>
        </div>
        <button className={`edit${editing ? ' open' : ''}`} type="button" title="Edit trip" aria-label="Edit trip" aria-expanded={editing} onClick={() => setEditing(value => !value)}><IconEdit /></button>
      </div>

      {editing && <div className="results-edit-panel">
        <BookingWidget compact initialTrip={trip} onSubmit={applyEdit} />
      </div>}

      <div className="notice">
        <IconInfo />
        <p><b>Fare estimate.</b> Review the displayed breakdown and contact our travel team if you need help before booking.</p>
      </div>

      <div className="sortbar">
        <div className="result-count"><b>{sorted.length}</b> vehicle options listed</div>
        <div className="filters">
          {SORTS.map((label, index) => (
            <div key={label} className={`chip${sort === index ? ' on' : ''}`} onClick={() => setSort(index)}>{label}</div>
          ))}
        </div>
      </div>

      <div className="cablist">
        {sorted.map((vehicle, index) => (
          <CabCard
            key={vehicle._id}
            vehicle={vehicle}
            art={CAB_ART[index % CAB_ART.length]}
            trip={effectiveTrip}
            search={search}
            formatAmount={formatAmount}
            priority={index < 2}
          />
        ))}
        {!isLoading && !sorted.length && <div className="notice"><IconInfo /><p>No vehicles are available for this route right now. Please contact our travel team for a custom quote.</p></div>}
      </div>

      <div className="help">
        <div>
          <h3>Need help choosing a vehicle?</h3>
          <p>Share your passenger count, luggage and route. Our booking team can explain the listed options.</p>
        </div>
        <button className="btn btn-gold" type="button" onClick={() => { window.location.href = `tel:${SUPPORT_PHONE}`; }}>Call booking support
          <IconArrowRight />
        </button>
      </div>
    </div>

    <HomeFooter />
    <Floats whatsappMessage="Hello WonderTravel, I need help choosing a car." />
  </>;
}
