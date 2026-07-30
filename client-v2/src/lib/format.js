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
  return {
    pickup: params.get('pickup') || 'Delhi · Indira Gandhi Airport (DEL)',
    destination: params.get('destination') || 'Agra, Uttar Pradesh',
    date: params.get('date') || tomorrowISO(),
    time: params.get('time') || '12:00',
    tripType: params.get('tripType') || 'one-way',
    serviceMode: params.get('serviceMode') || 'chauffeur',
    distanceKm: Math.max(1, Number(params.get('distanceKm')) || 235),
    travelDays: Math.max(1, Number(params.get('travelDays')) || 1)
  };
}
