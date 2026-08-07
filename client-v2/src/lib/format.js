const inrFormatter = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });

export const money = value => inrFormatter.format(Number(value) || 0);

export const initialsOf = (name = '') =>
  name.split(' ').filter(Boolean).map(part => part[0]).slice(0, 2).join('').toUpperCase();

export const firstNameOf = (name = '') => name.split(' ')[0] || '';

export const longDate = value => (value
  ? new Date(value).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
  : '—');

export const tripDate = value => new Date(`${value}T00:00:00`)
  .toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

export const tomorrowISO = () => new Date(Date.now() + 86400000).toISOString().slice(0, 10);

/** Reads the trip parameters out of a URLSearchParams, applying the demo defaults. */
export function tripFromSearch(params) {
  const pickup = params.get('pickup') || 'Dehradun, Uttarakhand';
  const destination = params.get('destination') || 'Rishikesh, Uttarakhand';
  // Both params must actually be present: Number(null) is 0, which passes Number.isFinite, so
  // a missing lat/lon used to produce a valid-looking { lat: 0, lon: 0 } "null island" point.
  // Two of those are identical coordinates, so a quote for them returns a 0 km — floored to
  // 1 km — trip instead of being skipped as unlocated.
  const pointFromSearch = (prefix, label) => {
    const rawLat = params.get(`${prefix}Lat`);
    const rawLon = params.get(`${prefix}Lon`);
    if (rawLat === null || rawLon === null || rawLat === '' || rawLon === '') return null;
    const lat = Number(rawLat);
    const lon = Number(rawLon);
    return Number.isFinite(lat) && Number.isFinite(lon) && Math.abs(lat) <= 90 && Math.abs(lon) <= 180
      ? { lat, lon, label, state: params.get(`${prefix}State`) || '' }
      : null;
  };
  return {
    pickup,
    destination,
    date: params.get('date') || tomorrowISO(),
    returnDate: params.get('returnDate') || '',
    time: params.get('time') || '12:00',
    tripType: params.get('tripType') || 'one-way',
    serviceMode: params.get('serviceMode') || 'chauffeur',
    distanceKm: Math.max(1, Number(params.get('distanceKm')) || 45),
    travelDays: Math.max(1, Number(params.get('travelDays')) || 1),
    pickupPoint: pointFromSearch('pickup', pickup),
    dropPoint: pointFromSearch('drop', destination)
  };
}
