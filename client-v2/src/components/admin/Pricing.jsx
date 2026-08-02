'use client';

import { useEffect, useMemo, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import {
  useAdminPricingPreviewMutation,
  useAdminPricingQuery,
  useAdminUpdatePricingClassMutation,
  useAdminUpdateMutation
} from '../../store/api/adminApi.js';
import { errorMessage } from '../../api/errors.js';
import { money } from '../../lib/format.js';
import { useToast } from '../../hooks/useToast.js';
import PremiumButton from '../ui/PremiumButton.jsx';
import AdminSkeleton from './AdminSkeleton.jsx';
import { AdminTable, Toggle } from './AdminControls.jsx';

const TRIP_FIELDS = [
  ['oneWay', 'One-way', 'minKm', 'Minimum km per trip'],
  ['roundTrip', 'Round trip', 'minKmPerDay', 'Minimum km per day']
];

const numberOrEmpty = value => (value === null || value === undefined ? '' : String(value));

/** Deep-copies the editable parts of a rate card so form edits never mutate cache data. */
const toDraft = card => ({
  label: card.label,
  nightCharge: card.nightCharge ?? 0,
  statePermitFlat: card.statePermitFlat ?? 0,
  gstPercent: card.gstPercent ?? 5,
  oneWay: { ...card.oneWay, slabs: (card.oneWay?.slabs || []).map(slab => ({ ...slab })) },
  roundTrip: { ...card.roundTrip, slabs: (card.roundTrip?.slabs || []).map(slab => ({ ...slab })) }
});

function SlabRows({ slabs, onChange }) {
  const update = (index, field, value) => onChange(slabs.map((slab, position) => (
    position === index ? { ...slab, [field]: value === '' ? (field === 'upToKm' ? null : '') : Number(value) } : slab
  )));

  return <div className="pricing-slabs">
    {slabs.map((slab, index) => <div className="pricing-slab-row" key={index}>
      <label>
        <span>{slab.upToKm === null ? 'Beyond the last slab' : 'Up to (km)'}</span>
        <input
          type="number" min="1" step="1" inputMode="numeric"
          value={numberOrEmpty(slab.upToKm)}
          placeholder={slab.upToKm === null ? 'No limit' : ''}
          disabled={slab.upToKm === null}
          onChange={event => update(index, 'upToKm', event.target.value)}
        />
      </label>
      <label>
        <span>Rate (₹ per km)</span>
        <input
          type="number" min="1" max="500" step="1" inputMode="numeric" required
          value={numberOrEmpty(slab.perKm)}
          onChange={event => update(index, 'perKm', event.target.value)}
        />
      </label>
      <button
        type="button" className="pricing-slab-remove" aria-label="Remove this slab"
        disabled={slabs.length <= 1 || slab.upToKm === null}
        onClick={() => onChange(slabs.filter((_, position) => position !== index))}
      ><Trash2 aria-hidden="true" /></button>
    </div>)}
    <button
      type="button" className="pricing-slab-add"
      onClick={() => {
        const bounded = slabs.filter(slab => slab.upToKm !== null);
        const nextLimit = (bounded[bounded.length - 1]?.upToKm || 0) + 300;
        const open = slabs.filter(slab => slab.upToKm === null);
        onChange([...bounded, { upToKm: nextLimit, perKm: open[0]?.perKm ?? 10 }, ...open]);
      }}
    ><Plus aria-hidden="true" /> Add a distance slab</button>
  </div>;
}

function RateCard({ card, canEdit, onSaved }) {
  const toast = useToast();
  const [draft, setDraft] = useState(() => toDraft(card));
  const [save, { isLoading: saving }] = useAdminUpdatePricingClassMutation();
  const [error, setError] = useState('');

  // A refetch after somebody else saves must not silently overwrite an edit in progress.
  useEffect(() => { setDraft(toDraft(card)); }, [card]);

  const setTrip = (tripKey, field, value) => setDraft(current => ({
    ...current, [tripKey]: { ...current[tripKey], [field]: value }
  }));

  const submit = async event => {
    event.preventDefault();
    setError('');
    try {
      await save({ key: card.key, body: draft }).unwrap();
      toast.success(`${card.label} rates updated. New quotes use them immediately.`, 'Rate card saved');
      onSaved?.();
    } catch (requestError) {
      setError(errorMessage(requestError, 'We could not save this rate card.'));
    }
  };

  return <form className="pricing-card" onSubmit={submit}>
    <header>
      <h3>{card.label}</h3>
      <span>{card.key}</span>
    </header>

    {TRIP_FIELDS.map(([tripKey, tripLabel, floorField, floorLabel]) => <section key={tripKey}>
      <h4>{tripLabel}</h4>
      <SlabRows slabs={draft[tripKey].slabs} onChange={slabs => setTrip(tripKey, 'slabs', slabs)} />
      <div className="pricing-grid">
        <label><span>{floorLabel}</span>
          <input type="number" min="0" step="1" inputMode="numeric" disabled={!canEdit}
            value={numberOrEmpty(draft[tripKey][floorField])}
            onChange={event => setTrip(tripKey, floorField, Number(event.target.value))} /></label>
        <label><span>Driver allowance (₹ per day)</span>
          <input type="number" min="0" step="1" inputMode="numeric" disabled={!canEdit}
            value={numberOrEmpty(draft[tripKey].driverAllowancePerDay)}
            onChange={event => setTrip(tripKey, 'driverAllowancePerDay', Number(event.target.value))} /></label>
      </div>
    </section>)}

    <section>
      <h4>Surcharges</h4>
      <div className="pricing-grid">
        <label><span>Night charge (₹)</span>
          <input type="number" min="0" step="1" inputMode="numeric" disabled={!canEdit} value={numberOrEmpty(draft.nightCharge)}
            onChange={event => setDraft(current => ({ ...current, nightCharge: Number(event.target.value) }))} /></label>
        <label><span>Interstate permit (₹)</span>
          <input type="number" min="0" step="1" inputMode="numeric" disabled={!canEdit} value={numberOrEmpty(draft.statePermitFlat)}
            onChange={event => setDraft(current => ({ ...current, statePermitFlat: Number(event.target.value) }))} /></label>
        <label><span>GST (%)</span>
          <input type="number" min="0" max="28" step="1" inputMode="numeric" disabled={!canEdit} value={numberOrEmpty(draft.gstPercent)}
            onChange={event => setDraft(current => ({ ...current, gstPercent: Number(event.target.value) }))} /></label>
      </div>
    </section>

    {error && <div className="form-error">{error}</div>}
    {canEdit
      ? <PremiumButton type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save rate card'}</PremiumButton>
      : <p className="pricing-note">Only the super administrator can change rate cards.</p>}
  </form>;
}

function VehicleRow({ vehicle, classes }) {
  const toast = useToast();
  const [update, { isLoading }] = useAdminUpdateMutation();
  const patch = async body => {
    try {
      await update({ resource: 'vehicles', id: vehicle._id, body }).unwrap();
    } catch (requestError) {
      toast.error(errorMessage(requestError, 'We could not update this vehicle.'), 'Update failed');
    }
  };

  const card = classes.find(item => item.key === vehicle.pricingClass);
  const sampleRate = card?.oneWay?.slabs?.[0]?.perKm;

  return <tr>
    <td><b>{vehicle.name}</b><small>{vehicle.category} · {vehicle.seats} seats</small></td>
    <td>
      <select className="admin-status" value={vehicle.pricingClass || ''} disabled={isLoading}
        onChange={event => patch({ pricingClass: event.target.value })}>
        {classes.map(item => <option value={item.key} key={item.key}>{item.label}</option>)}
      </select>
    </td>
    <td>
      <input type="number" className="pricing-inline-input" min="-20" max="200" step="1" inputMode="numeric"
        defaultValue={vehicle.perKmDelta ?? 0} disabled={isLoading}
        onBlur={event => {
          const next = Math.round(Number(event.target.value) || 0);
          if (next !== (vehicle.perKmDelta ?? 0)) patch({ perKmDelta: next });
        }} />
    </td>
    <td><span className="pricing-effective-rate">{sampleRate ? `₹${sampleRate + (vehicle.perKmDelta ?? 0)}/km` : '—'}</span></td>
    <td><Toggle value={Boolean(vehicle.pricingConfigured)} onChange={value => patch({ pricingConfigured: value })} /></td>
  </tr>;
}

export default function Pricing({ isSuperAdmin }) {
  const { data, isLoading, error } = useAdminPricingQuery();
  const [preview, { data: previewData, isLoading: previewing }] = useAdminPricingPreviewMutation();

  const classes = useMemo(() => data?.classes || [], [data]);

  // Refresh the sample prices whenever the saved rates or vehicle premiums change.
  useEffect(() => { if (classes.length) preview({}); }, [classes, data?.vehicles, preview]);

  if (isLoading) return <AdminSkeleton section="Pricing" />;
  if (error) return <div className="form-error">{errorMessage(error, 'We could not load pricing.')}</div>;

  return <div className="admin-pricing">
    <p className="pricing-intro">
      Every vehicle is priced from one of two rate cards. A vehicle&apos;s premium is added on top of its
      card&apos;s per-km rate, so changing a card reprices the whole fleet at once. Tolls and parking stay
      outside the fare and are paid at actual.
    </p>

    <div className="pricing-cards">
      {classes.map(card => <RateCard key={card.key} card={card} canEdit={isSuperAdmin} />)}
    </div>

    <h3 className="pricing-heading">Vehicles</h3>
    <AdminTable className="pricing-vehicle-table" heads={['Vehicle', 'Rate card', 'Premium (₹/km)', 'Short-trip rate', 'Published']}>
      {(data?.vehicles || []).map(vehicle => <VehicleRow key={vehicle._id} vehicle={vehicle} classes={classes} />)}
    </AdminTable>
    <p className="pricing-note">
      A vehicle stays hidden from customers until it is published. Publish it once its rate card and premium are correct.
    </p>

    <h3 className="pricing-heading">What customers would pay {previewing && <small>updating…</small>}</h3>
    <div className="pricing-preview">
      {(previewData || []).map(sample => <div className="pricing-preview-card" key={sample.trip}>
        <h4>{sample.trip}</h4>
        {sample.options.map(option => <div className="pricing-preview-row" key={option.name}>
          <span>{option.name}</span>
          <span>₹{option.perKm}/km</span>
          <b>{money(option.total)}</b>
        </div>)}
      </div>)}
    </div>
  </div>;
}
