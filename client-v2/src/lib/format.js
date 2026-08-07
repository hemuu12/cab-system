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
  const pointFromSearch = (prefix, label) => {
    const lat = Number(params.get(`${prefix}Lat`));
    const lon = Number(params.get(`${prefix}Lon`));
    return Number.isFinite(lat) && Number.isFinite(lon)
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
