'use client';

import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLazySearchLocationsQuery, useRoutesQuery } from '../../store/api/catalogApi.js';
import { FEATURED_ROUTES } from '../../data/routes.js';
import { tomorrowISO } from '../../lib/format.js';
import { useToast } from '../../hooks/useToast.js';
import {
  IconBus, IconCalendar, IconCar, IconClock, IconLock, IconPin, IconSend, IconTrend
} from '../design/icons.jsx';

const TRIP_TABS = ['One way', 'Round trip', 'Outstation'];
const SERVICE_MODES = ['chauffeur', 'group-travel'];
const TRIP_DESCRIPTIONS = [
  'A direct pickup-to-destination journey.',
  'Return to your pickup city on a selected date.',
  'Plan a multi-day driver-assisted journey.'
];
const DEFAULT_DISTANCE_KM = 235;

/** Matches typed text against a route the way the original design script did. */
const matchRoute = (routes, value) => {
  const query = value.toLowerCase().trim();
  if (!query) return undefined;
  return routes.find(([place]) => {
    const name = place.toLowerCase();
    return name === query || name.startsWith(query) || query.startsWith(place.split(',')[0].toLowerCase());
  });
};

const FALLBACK_ROUTES = FEATURED_ROUTES.map(route => [route.destination, route.distanceKm]);

const BookingWidget = forwardRef(function BookingWidget(props, ref) {
  const router = useRouter();
  const toast = useToast();
  const { data: apiRoutes } = useRoutesQuery();
  const [searchPickup, pickupSearch] = useLazySearchLocationsQuery();
  const [searchDestination, destinationSearch] = useLazySearchLocationsQuery();

  // Server routes win when present; the bundled list keeps the widget usable offline.
  const routes = useMemo(() => (
    apiRoutes?.length ? apiRoutes.map(route => [route.destination, route.distanceKm]) : FALLBACK_ROUTES
  ), [apiRoutes]);

  const today = new Date().toISOString().split('T')[0];
  const [serviceMode, setServiceMode] = useState(0);
  const [tripTab, setTripTab] = useState(0);
  const [pickup, setPickup] = useState('');
  const [destination, setDestination] = useState('');
  const [pickupPoint, setPickupPoint] = useState(null);
  const [dropPoint, setDropPoint] = useState(null);
  const [date, setDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [time, setTime] = useState('');
  const [travelDays, setTravelDays] = useState(1);
  const [distanceLabel, setDistanceLabel] = useState('');
  const [pickupMenuOpen, setPickupMenuOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeOption, setActiveOption] = useState(-1);
  const [invalid, setInvalid] = useState({ pickup: false, destination: false });

  const destinationRef = useRef(null);
  const pickupFieldRef = useRef(null);
  const fieldRef = useRef(null);
  const rootRef = useRef(null);
  const optionRefs = useRef([]);
  // Read by the stable callbacks below so they never match against a stale list.
  const routesRef = useRef(routes);
  routesRef.current = routes;

  const pickupSuggestions = pickup.trim().length >= 3 && pickupSearch.originalArgs === pickup.trim()
    ? pickupSearch.data || []
    : [];
  const addressSuggestions = destination.trim().length >= 3 && destinationSearch.originalArgs === destination.trim()
    ? destinationSearch.data || []
    : [];
  const suggestions = addressSuggestions;

  const closeMenu = useCallback(() => { setMenuOpen(false); setActiveOption(-1); }, []);
  const closePickupMenu = useCallback(() => setPickupMenuOpen(false), []);

  useEffect(() => {
    const query = pickup.trim();
    if (query.length < 3) return undefined;
    const timer = window.setTimeout(() => searchPickup(query, true), 350);
    return () => window.clearTimeout(timer);
  }, [pickup, searchPickup]);

  useEffect(() => {
    const query = destination.trim();
    if (query.length < 3) return undefined;
    const timer = window.setTimeout(() => searchDestination(query, true), 350);
    return () => window.clearTimeout(timer);
  }, [destination, searchDestination]);

  useEffect(() => {
    if (!menuOpen && !pickupMenuOpen) return undefined;
    const closeOnOutside = event => {
      if (!fieldRef.current?.contains(event.target)) closeMenu();
      if (!pickupFieldRef.current?.contains(event.target)) closePickupMenu();
    };
    document.addEventListener('pointerdown', closeOnOutside);
    return () => document.removeEventListener('pointerdown', closeOnOutside);
  }, [closeMenu, closePickupMenu, menuOpen, pickupMenuOpen]);

  useEffect(() => {
    if (activeOption < 0) return;
    optionRefs.current[activeOption]?.scrollIntoView({ block: 'nearest' });
  }, [activeOption]);

  const applyDestination = useCallback(value => {
    setDestination(value);
    setDropPoint(null);
    const route = matchRoute(routesRef.current, value);
    setDistanceLabel(route ? `${route[1]} km` : value.trim() ? 'Distance confirmed after route review' : '');
    if (value.trim()) setInvalid(current => (current.destination ? { ...current, destination: false } : current));
  }, []);

  // Exposes what the page needs: the element to measure when scrolling the
  // widget into view, and a setter the route chips use to fill in a destination.
  // `element` is read through the ref so it is never stale or pre-mount null.
  useImperativeHandle(ref, () => ({
    get element() { return rootRef.current; },
    setDestination: value => { applyDestination(value); closeMenu(); }
  }), [applyDestination, closeMenu]);

  const chooseSuggestion = index => {
    const location = suggestions[index];
    if (!location) return;
    setDestination(location.label);
    setDropPoint({ label: location.label, state: location.state || '', lat: location.lat, lon: location.lon });
    setDistanceLabel('Distance securely calculated from selected locations');
    setInvalid(current => ({ ...current, destination: false }));
    closeMenu();
  };

  const moveActive = step => {
    if (!suggestions.length) return;
    setActiveOption(current => (current + step + suggestions.length) % suggestions.length);
  };

  const onDestinationKeyDown = event => {
    if (event.key === 'Escape') { closeMenu(); return; }
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      if (!menuOpen) setMenuOpen(true);
      moveActive(event.key === 'ArrowDown' ? 1 : -1);
    }
    if (event.key === 'Enter' && activeOption >= 0) {
      event.preventDefault();
      chooseSuggestion(activeOption);
    }
  };

  /** Focus the native picker when the surrounding field is clicked. */
  const openPicker = event => {
    const input = event.currentTarget.querySelector('input');
    if (!input || event.target === input) return;
    input.focus();
    input.showPicker?.();
  };

  const submit = () => {
    const cleanPickup = pickup.trim();
    const cleanDestination = destination.trim();
    setInvalid({ pickup: !cleanPickup || !pickupPoint, destination: !cleanDestination || !dropPoint });
    if (!cleanPickup || !cleanDestination || !pickupPoint || !dropPoint) {
      (!cleanPickup || !pickupPoint ? document.getElementById('pickupLocation') : destinationRef.current)?.focus();
      toast.error('Choose both locations from the address suggestions so we can verify the route and fare.', 'Select verified locations');
      return;
    }
    if (tripTab === 1 && !returnDate) {
      toast.error('Choose when you plan to return.', 'Return date required');
      return;
    }
    const route = matchRoute(routes, cleanDestination);
    const roundTripDays = date && returnDate
      ? Math.max(1, Math.ceil((new Date(`${returnDate}T12:00:00`) - new Date(`${date}T12:00:00`)) / 86400000) + 1)
      : 2;
    const resolvedTravelDays = tripTab === 0
      ? 1
      : tripTab === 1
        ? roundTripDays
        : Math.min(30, Math.max(1, Number(travelDays) || 1));
    const params = new URLSearchParams({
      pickup: cleanPickup,
      date: date || tomorrowISO(),
      time: time || '12:00',
      destination: cleanDestination,
      tripType: TRIP_TABS[tripTab].toLowerCase().replace(' ', '-'),
      serviceMode: SERVICE_MODES[serviceMode] || 'chauffeur',
      distanceKm: route?.[1] || DEFAULT_DISTANCE_KM,
      travelDays: resolvedTravelDays,
      pickupLat: pickupPoint.lat,
      pickupLon: pickupPoint.lon,
      pickupState: pickupPoint.state || '',
      dropLat: dropPoint.lat,
      dropLon: dropPoint.lon,
      dropState: dropPoint.state || ''
    });
    if (tripTab === 1) params.set('returnDate', returnDate);
    router.push(`/results?${params}`);
  };

  return <div className="booking reveal in" ref={rootRef} id="book">
    <div className="book-modes">
      <div className={`mode${serviceMode === 0 ? ' active' : ''}`} onClick={() => setServiceMode(0)}>
        <IconCar />
        With driver
      </div>
      <div className="mode locked" aria-disabled="true" title="Group travel is coming soon">
        <IconBus />
        <span>Group travel</span>
        <span className="coming-badge"><IconLock />Coming soon</span>
      </div>
    </div>
    <div className="book-body">
      <div className="trip-tabs">
        {TRIP_TABS.map((label, index) => (
          <button key={label} className={`trip-tab${tripTab === index ? ' active' : ''}`} type="button" onClick={() => setTripTab(index)}>{label}</button>
        ))}
      </div>
      <p className="trip-tab-note">{TRIP_DESCRIPTIONS[tripTab]}</p>
      <div className={`field destination-field${pickupMenuOpen ? ' menu-open' : ''}`} ref={pickupFieldRef}>
        <label htmlFor="pickupLocation">Pick-up location</label>
        <div className="input destination-control" style={invalid.pickup ? { borderColor: 'var(--ember)' } : undefined}>
          <IconPin />
          <input
            id="pickupLocation"
            type="text"
            value={pickup}
            placeholder="Airport, station, hotel or full address"
            autoComplete="off"
            role="combobox"
            aria-autocomplete="list"
            aria-controls="pickupLocationMenu"
            aria-expanded={pickupMenuOpen}
            onChange={event => {
              setPickup(event.target.value);
              setPickupPoint(null);
              setPickupMenuOpen(true);
              if (invalid.pickup && event.target.value.trim()) setInvalid(current => ({ ...current, pickup: false }));
            }}
            onFocus={() => setPickupMenuOpen(pickup.trim().length >= 3)}
          />
        </div>
        <div className="destination-menu" id="pickupLocationMenu" role="listbox">
          {pickupSearch.isFetching
            ? <div className="destination-empty">Searching addresses…</div>
            : pickupSuggestions.length
              ? pickupSuggestions.map((location, index) => (
                <button
                  key={location.id}
                  className="destination-option"
                  type="button"
                  role="option"
                  style={{ '--i': index }}
                  onMouseDown={event => event.preventDefault()}
                  onClick={() => {
                    setPickup(location.label);
                    setPickupPoint({ label: location.label, state: location.state || '', lat: location.lat, lon: location.lon });
                    setInvalid(current => ({ ...current, pickup: false }));
                    closePickupMenu();
                  }}
                ><strong>{location.label}</strong></button>
              ))
              : <div className="destination-empty">Type at least 3 characters and choose a verified address.</div>}
          <a className="location-attribution" href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">Addresses © OpenStreetMap contributors</a>
        </div>
      </div>
      <div className="row-2 schedule-row">
        <div className="field">
          <label>{tripTab === 1 ? 'Departure date' : tripTab === 2 ? 'Journey start date' : 'Travel date'}</label>
          <div className="input" onClick={openPicker}>
            <IconCalendar />
            <input type="date" aria-label="Pickup date" required min={today} value={date} onChange={event => {
              const nextDate = event.target.value;
              setDate(nextDate);
              if (returnDate && returnDate < nextDate) setReturnDate('');
            }} />
          </div>
        </div>
        <div className="field">
          <label>Pick-up time</label>
          <div className="input" onClick={openPicker}>
            <IconClock />
            <input type="time" aria-label="Pickup time" required value={time} onChange={event => setTime(event.target.value)} />
          </div>
        </div>
      </div>
      <div className={`field destination-field${menuOpen ? ' menu-open' : ''}`} ref={fieldRef}>
        <label htmlFor="destinationLocation">{tripTab === 0 ? 'Drop-off location' : tripTab === 1 ? 'Round-trip destination' : 'Outstation destination'}</label>
        <div className="input destination-control" style={invalid.destination ? { borderColor: 'var(--ember)' } : undefined}>
          <IconSend />
          <input
            id="destinationLocation"
            ref={destinationRef}
            type="text"
            placeholder="Search a city or destination"
            autoComplete="off"
            role="combobox"
            aria-autocomplete="list"
            aria-controls="destinationMenu"
            aria-expanded={menuOpen}
            value={destination}
            onChange={event => { applyDestination(event.target.value); setMenuOpen(true); setActiveOption(-1); }}
            onFocus={() => { setMenuOpen(destination.trim().length >= 3); setActiveOption(-1); }}
            onKeyDown={onDestinationKeyDown}
          />
        </div>
        <div className="destination-menu" id="destinationMenu" role="listbox">
          {destinationSearch.isFetching ? <div className="destination-empty">Searching addresses…</div> : suggestions.length ? suggestions.map((location, index) => (
            <button
              key={location.id}
              ref={element => { optionRefs.current[index] = element; }}
              className={`destination-option${index === activeOption ? ' active' : ''}`}
              type="button"
              tabIndex={-1}
              role="option"
              aria-selected={index === activeOption}
              style={{ '--i': index }}
              onMouseDown={event => event.preventDefault()}
              onClick={() => chooseSuggestion(index)}
            >
              <strong>{location.label}</strong>
            </button>
          )) : <div className="destination-empty">Type at least 3 characters and choose a verified address.</div>}
          <a className="location-attribution" href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">Addresses © OpenStreetMap contributors</a>
        </div>
      </div>
      <div className={`row-2 trip-detail-row trip-detail-${tripTab}`}>
        <div className={`field${tripTab === 0 ? ' full' : ''}`}>
          <label htmlFor="distanceKm">Approx. one-way distance</label>
          <div className="input">
            <IconTrend />
            <input id="distanceKm" type="text" placeholder="Select a destination" readOnly value={distanceLabel} />
          </div>
        </div>
        {tripTab === 1 && <div className="field">
          <label htmlFor="returnDate">Return date</label>
          <div className="input" onClick={openPicker}>
            <IconCalendar />
            <input
              id="returnDate"
              type="date"
              aria-label="Return date"
              min={date || today}
              value={returnDate}
              onChange={event => setReturnDate(event.target.value)}
            />
          </div>
        </div>}
        {tripTab === 2 && <div className="field">
          <label htmlFor="travelDays">Number of travel days</label>
          <div className="input">
            <IconCalendar />
            <input
              id="travelDays"
              type="number"
              min="1"
              max="30"
              aria-label="Number of travel days"
              value={travelDays}
              onChange={event => setTravelDays(event.target.value)}
            />
          </div>
        </div>}
      </div>
      <button className="btn btn-ember book-cta" type="button" onClick={submit}>Show available cars</button>
    </div>
  </div>;
});

export default BookingWidget;
