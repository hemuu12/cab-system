import { X } from 'lucide-react';
import PremiumButton from '../../components/ui/PremiumButton.jsx';
import StatusBadge from '../../components/ui/StatusBadge.jsx';
import { Field, SelectField } from './AdminControls.jsx';
import { DRIVER_STATUSES, SEAT_OPTIONS, VEHICLE_CATEGORIES, VEHICLE_FEATURES } from './constants.js';

export default function EditPanel({ editing, saving, onClose, onSubmit }) {
  const { item, type } = editing;
  const isVehicle = type === 'vehicle';
  const isRoute = type === 'route';
  return <div className="admin-edit-backdrop" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}>
    <section className="admin-edit-panel" role="dialog" aria-modal="true" aria-labelledby="edit-panel-title">
      <header><div><StatusBadge>Edit {type}</StatusBadge><h2 id="edit-panel-title">{item.name || item.destination}</h2><p>{isVehicle ? 'Update vehicle details and live availability.' : isRoute ? 'Update destination details, distance and visibility.' : 'Update driver identity, verification and working status.'}</p></div><button type="button" aria-label="Close edit panel" onClick={onClose}><X /></button></header>
      <form className="admin-create-form admin-edit-form" onSubmit={onSubmit}>
        {isVehicle ? <>
          <Field name="name" label="Vehicle name" defaultValue={item.name} />
          <SelectField name="category" label="Category" defaultValue={item.category} options={VEHICLE_CATEGORIES} />
          <SelectField name="seats" label="Seating" defaultValue={String(item.seats)} options={SEAT_OPTIONS} />
          <fieldset className="vehicle-feature-picker"><legend>Vehicle features</legend>{VEHICLE_FEATURES.map(feature => <label key={feature}><input type="checkbox" name="features" value={feature} defaultChecked={item.features?.includes(feature)} /><span>{feature}</span></label>)}</fieldset>
          <label className="wide">Description<textarea name="description" rows="3" defaultValue={item.description} placeholder="Vehicle description" /></label>
          <div className="vehicle-publish-options"><label><input type="checkbox" name="featured" defaultChecked={item.featured} /><span>Featured vehicle</span></label><label><input type="checkbox" name="active" defaultChecked={item.active} /><span>Available now</span></label></div>
        </> : isRoute ? <>
          <Field name="destination" label="Destination" defaultValue={item.destination} />
          <Field name="region" label="Region" defaultValue={item.region} />
          <Field name="distanceKm" label="Distance (km)" type="number" min="1" defaultValue={item.distanceKm} />
          <Field name="sortOrder" label="Display order" type="number" min="0" defaultValue={item.sortOrder || 0} />
          <div className="vehicle-publish-options route-publish-options"><label><input type="checkbox" name="popular" defaultChecked={item.popular} /><span>Popular route</span></label><label><input type="checkbox" name="active" defaultChecked={item.active} /><span>Live route</span></label></div>
        </> : <>
          <Field name="name" label="Full name" defaultValue={item.name} />
          <Field name="phone" label="Phone number" type="tel" defaultValue={item.phone} />
          <Field name="email" label="Email (optional)" type="email" required={false} defaultValue={item.email} />
          <Field name="city" label="Operating city" defaultValue={item.city} />
          <Field name="licenseNumber" label="Driving licence" defaultValue={item.licenseNumber} />
          <Field name="experienceYears" label="Experience (years)" type="number" min="0" defaultValue={item.experienceYears} />
          <SelectField name="status" label="Working status" defaultValue={item.status} options={DRIVER_STATUSES} />
          <label className="admin-check-field"><input type="checkbox" name="verified" defaultChecked={item.verified} /><span>Identity verified</span></label>
          <label className="wide">Internal notes<textarea name="notes" rows="3" defaultValue={item.notes} placeholder="Languages, routes and availability…" /></label>
        </>}
        <div className="admin-edit-actions"><button type="button" onClick={onClose}>Cancel</button><PremiumButton disabled={saving}>{saving ? 'Saving…' : `Save ${type}`}</PremiumButton></div>
      </form>
    </section>
  </div>;
}
