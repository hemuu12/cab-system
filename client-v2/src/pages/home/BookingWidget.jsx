import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRoutesQuery } from '../../store/api/catalogApi.js';
import { DELHI_ROUTES } from '../../data/routes.js';
import { tomorrowISO } from '../../lib/format.js';
import { useToast } from '../../hooks/useToast.js';
import {
  IconBus, IconCalendar, IconCar, IconChevronDown, IconClock, IconLock, IconPin, IconSend, IconTrend
} from '../../components/design/icons.jsx';

const TRIP_TABS = ['One way', 'Round trip', 'City use', 'Outstation'];
const SERVICE_MODES = ['chauffeur', 'group-travel'];
const MAX_SUGGESTIONS = 7;
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

const FALLBACK_ROUTES = DELHI_ROUTES.map(route => [route.destination, route.distanceKm]);

const BookingWidget = forwardRef(function BookingWidget(props, ref) {
  const navigate = useNavigate();
  const toast = useToast();
  const { data: apiRoutes } = useRoutesQuery();

  // Server routes win when present; the bundled list keeps the widget usable offline.
  const routes = useMemo(() => (
    apiRoutes?.length ? apiRoutes.map(route => [route.destination, route.distanceKm]) : FALLBACK_ROUTES
  ), [apiRoutes]);

  const today = new Date().toISOString().split('T')[0];
  const [serviceMode, setServiceMode] = useState(0);
  const [tripTab, setTripTab] = useState(0);
  const [pickup, setPickup] = useState('Delhi · Indira Gandhi Airport (DEL)');
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [travelDays, setTravelDays] = useState(1);
  const [distanceLabel, setDistanceLabel] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeOption, setActiveOption] = useState(-1);
  const [invalid, setInvalid] = useState({ pickup: false, destination: false });

  const destinationRef = useRef(null);
  const fieldRef = useRef(null);
  const rootRef = useRef(null);
  const optionRefs = useRef([]);
  // Read by the stable callbacks below so they never match against a stale list.
  const routesRef = useRef(routes);
  routesRef.current = routes;

  const suggestions = useMemo(() => {
    const query = destination.toLowerCase().trim();
    return routes.filter(([place]) => !query || place.toLowerCase().includes(query)).slice(0, MAX_SUGGESTIONS);
  }, [destination, routes]);

  const closeMenu = useCallback(() => { setMenuOpen(false); setActiveOption(-1); }, []);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const closeOnOutside = event => { if (!fieldRef.current?.contains(event.target)) closeMenu(); };
    document.addEventListener('pointerdown', closeOnOutside);
    return () => document.removeEventListener('pointerdown', closeOnOutside);
  }, [closeMenu, menuOpen]);

  useEffect(() => {
    if (activeOption < 0) return;
    optionRefs.current[activeOption]?.scrollIntoView({ block: 'nearest' });
  }, [activeOption]);

  const applyDestination = useCallback(value => {
    setDestination(value);
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
    const route = suggestions[index];
    if (!route) return;
    setDestination(route[0]);
    setDistanceLabel(`${route[1]} km`);
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
    setInvalid({ pickup: !cleanPickup, destination: !cleanDestination });
    if (!cleanPickup || !cleanDestination) {
      (!cleanPickup ? document.getElementById('pickupLocation') : destinationRef.current)?.focus();
      toast.error('Choose both a pickup location and destination to see available cars.', 'Journey details required');
      return;
    }
    const route = matchRoute(routes, cleanDestination);
    const params = new URLSearchParams({
      pickup: cleanPickup,
      date: date || tomorrowISO(),
      time: time || '12:00',
      destination: cleanDestination,
      tripType: TRIP_TABS[tripTab].toLowerCase().replace(' ', '-'),
      serviceMode: SERVICE_MODES[serviceMode] || 'chauffeur',
      distanceKm: route?.[1] || DEFAULT_DISTANCE_KM,
      travelDays: Math.min(30, Math.max(1, Number(travelDays) || 1))
    });
    navigate(`/results?${params}`);
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
          <div key={label} className={`trip-tab${tripTab === index ? ' active' : ''}`} onClick={() => setTripTab(index)}>{label}</div>
        ))}
      </div>
      <div className="field">
        <label htmlFor="pickupLocation">Pick-up location</label>
        <div className="input" style={invalid.pickup ? { borderColor: 'var(--ember)' } : undefined}>
          <IconPin />
          <input
            id="pickupLocation"
            type="text"
            value={pickup}
            placeholder="Airport, station, hotel or full address"
            onChange={event => {
              setPickup(event.target.value);
              if (invalid.pickup && event.target.value.trim()) setInvalid(current => ({ ...current, pickup: false }));
            }}
          />
        </div>
      </div>
      <div className="row-2">
        <div className="field">
          <label>Travel date</label>
          <div className="input" onClick={openPicker}>
            <IconCalendar />
            <input type="date" aria-label="Pickup date" required min={today} value={date} onChange={event => setDate(event.target.value)} />
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
        <label htmlFor="destinationLocation">Drop-off location</label>
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
            onFocus={() => { setMenuOpen(true); setActiveOption(-1); }}
            onKeyDown={onDestinationKeyDown}
          />
          <button
            className="destination-toggle"
            type="button"
            aria-label="Show destinations"
            tabIndex={-1}
            onClick={() => {
              if (menuOpen) closeMenu();
              else if (document.activeElement === destinationRef.current) setMenuOpen(true);
              else destinationRef.current?.focus({ preventScroll: true });
            }}
          ><IconChevronDown /></button>
        </div>
        <div className="destination-menu" id="destinationMenu" role="listbox">
          {suggestions.length ? suggestions.map(([place, km], index) => (
            <button
              key={place}
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
              <strong>{place}</strong><small>{km} km</small>
            </button>
          )) : <div className="destination-empty">No matching route — enter any destination for a custom quote.</div>}
        </div>
      </div>
      <div className="row-2">
        <div className="field">
          <label htmlFor="distanceKm">Approx. one-way distance</label>
          <div className="input">
            <IconTrend />
            <input id="distanceKm" type="text" placeholder="Select a destination" readOnly value={distanceLabel} />
          </div>
        </div>
        <div className="field">
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
        </div>
      </div>
      <button className="btn btn-ember book-cta" type="button" onClick={submit}>Show available cars</button>
    </div>
  </div>;
});

export default BookingWidget;
