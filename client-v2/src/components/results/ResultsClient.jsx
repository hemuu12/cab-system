'use client';

import { useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useVehiclesQuery } from '../../store/api/catalogApi.js';
import { useAuth } from '../../hooks/useAuth.js';
import { tripDate, tripFromSearch } from '../../lib/format.js';
import { smoothLogout } from '../../lib/smoothLogout.js';
import DesignStyles from '../design/DesignStyles.jsx';
import Floats, { SUPPORT_PHONE } from '../design/Floats.jsx';
import { IconArrowRight, IconEdit, IconInfo } from '../design/icons.jsx';
import ResultsNav from './ResultsNav.jsx';
import CabCard, { CAB_ART } from './CabCard.jsx';
import LoadingScreen from '../LoadingScreen.jsx';

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

  const trip = tripFromSearch(params);
  const isGroupTravel = trip.serviceMode === 'group-travel';
  const { data: vehicles = [], isLoading } = useVehiclesQuery();
  const sorted = useMemo(() => sortVehicles(vehicles, sort), [sort, vehicles]);

  const signOut = async () => {
    await smoothLogout(logout);
  };

  if (isLoading) return <LoadingScreen message="Finding the right cars…" detail="Matching comfort and capacity to your journey." />;

  const dayLabel = trip.travelDays === 1 ? 'day' : 'days';

  return <>
    <DesignStyles css={resultsCss} page="results" />
    <ResultsNav user={user} onLogout={signOut} />

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
          <div className="trip-tags">{titleCase(trip.tripType)}<span className="km"> · {trip.distanceKm} km one way · {trip.travelDays} {dayLabel}</span></div>
        </div>
        <button className="edit" type="button" title="Edit trip" aria-label="Edit trip" onClick={() => router.push('/#book')}><IconEdit /></button>
      </div>

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
            trip={trip}
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

    <Floats whatsappMessage="Hello WonderTravel, I need help choosing a car." />
  </>;
}
