import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronLeft, ChevronRight, LogOut, Pencil, RefreshCw, Search, Trash2 } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import {
  useAdminCreateMutation,
  useAdminDashboardQuery,
  useAdminDeleteMutation,
  useAdminResourceQuery,
  useAdminUpdateMutation,
  useAdminUploadVehicleImageMutation
} from '../store/api/adminApi.js';
import { useLogoutMutation } from '../store/api/authApi.js';
import { errorMessage } from '../api/errors.js';
import { longDate, money } from '../lib/format.js';
import { useAuth } from '../hooks/useAuth.js';
import { useToast } from '../hooks/useToast.js';
import BrandLogo from '../components/BrandLogo.jsx';
import PremiumButton from '../components/ui/PremiumButton.jsx';
import StatusBadge from '../components/ui/StatusBadge.jsx';
import { AdminTable, CreatePanel, Field, SelectField, Status, Toggle } from './admin/AdminControls.jsx';
import EditPanel from './admin/EditPanel.jsx';
import Overview from './admin/Overview.jsx';
import {
  BOOKING_STATUSES, DRIVER_STATUSES, FEEDBACK_STATUSES, INQUIRY_STATUSES,
  MAX_IMAGE_BYTES, MAX_VEHICLE_IMAGES, readForm, SEAT_OPTIONS, SECTIONS,
  VEHICLE_CATEGORIES, VEHICLE_FEATURES
} from './admin/constants.js';

/** Maps the edit-panel type onto its API resource and human label. */
const EDIT_TARGETS = {
  vehicle: { resource: 'vehicles', label: 'Vehicle' },
  route: { resource: 'routes', label: 'Route' },
  driver: { resource: 'drivers', label: 'Driver' }
};

const ADMIN_ACCESS_SECTIONS = SECTIONS.filter(([sectionName]) => !['Overview', 'Users'].includes(sectionName));

const sectionFromParam = (value, availableSections) => (
  availableSections.find(([sectionName]) => (
    sectionName.toLowerCase() === String(value || '').toLowerCase()
  ))?.[0] || 'Overview'
);

export default function Admin() {
  const { user } = useAuth();
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const isSuperAdmin = user?.adminRole === 'super_admin';
  const canDelete = user?.permissions?.includes('admin:delete') || isSuperAdmin;
  const assignedSections = new Set(user?.adminSections || ADMIN_ACCESS_SECTIONS.map(([item]) => item.toLowerCase()));
  const availableSections = isSuperAdmin
    ? SECTIONS
    : SECTIONS.filter(([item]) => item === 'Overview' || assignedSections.has(item.toLowerCase()));
  const section = sectionFromParam(searchParams.get('section'), availableSections);
  const [error, setError] = useState('');
  const [uploadingVehicle, setUploadingVehicle] = useState('');
  const [deleting, setDeleting] = useState('');
  const [vehicleSeats, setVehicleSeats] = useState(5);
  const [editing, setEditing] = useState(null);
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('all');
  const [navScroll, setNavScroll] = useState({ left: false, right: false });
  const navRef = useRef(null);

  const setSection = useCallback(nextSection => {
    const next = sectionFromParam(nextSection, availableSections);
    setSearchParams(next === 'Overview' ? {} : { section: next.toLowerCase() }, { replace: true });
  }, [availableSections, setSearchParams]);

  const isOverview = section === 'Overview';
  const resource = section.toLowerCase();

  const dashboard = useAdminDashboardQuery(undefined, { skip: !isOverview });
  const list = useAdminResourceQuery(resource, { skip: isOverview });
  const activeQuery = isOverview ? dashboard : list;
  const rows = activeQuery.data || (isOverview ? {} : []);
  const normalizedUserSearch = userSearch.trim().toLowerCase();
  const visibleUsers = section === 'Users' && Array.isArray(rows)
    ? rows.filter(item => {
        const matchesRole = userRoleFilter === 'all' ||
          (userRoleFilter === 'admins' ? item.role === 'admin' : item.role === 'customer');
        const matchesSearch = !normalizedUserSearch || [
          item.name,
          item.email,
          item.phone,
          item.role,
          item.adminRole,
          item.accountStatus
        ].some(value => String(value || '').toLowerCase().includes(normalizedUserSearch));
        return matchesRole && matchesSearch;
      })
    : [];
  const userCounts = section === 'Users' && Array.isArray(rows)
    ? {
        all: rows.length,
        customers: rows.filter(item => item.role === 'customer').length,
        admins: rows.filter(item => item.role === 'admin').length
      }
    : { all: 0, customers: 0, admins: 0 };

  const [adminCreate] = useAdminCreateMutation();
  const [adminUpdate, { isLoading: savingEdit }] = useAdminUpdateMutation();
  const [adminDelete] = useAdminDeleteMutation();
  const [uploadVehicleImageRequest] = useAdminUploadVehicleImageMutation();
  const [logout] = useLogoutMutation();

  useEffect(() => setError(errorMessage(activeQuery.error, '')), [activeQuery.error]);
  useEffect(() => { setError(''); }, [section]);

  const syncNavScroll = useCallback(() => {
    const nav = navRef.current;
    if (!nav) return;
    setNavScroll({
      left: nav.scrollLeft > 2,
      right: nav.scrollLeft + nav.clientWidth < nav.scrollWidth - 2
    });
  }, []);

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return undefined;
    const frame = requestAnimationFrame(syncNavScroll);
    nav.addEventListener('scroll', syncNavScroll, { passive: true });
    window.addEventListener('resize', syncNavScroll);
    return () => {
      cancelAnimationFrame(frame);
      nav.removeEventListener('scroll', syncNavScroll);
      window.removeEventListener('resize', syncNavScroll);
    };
  }, [syncNavScroll]);

  useEffect(() => {
    const nav = navRef.current;
    const active = nav?.querySelector('.active');
    if (!nav || !active || window.innerWidth > 720) return;
    nav.scrollTo({
      left: active.offsetLeft - (nav.clientWidth - active.offsetWidth) / 2,
      behavior: 'smooth'
    });
  }, [section]);

  const scrollNavigation = direction => {
    navRef.current?.scrollBy({
      left: direction * Math.max(144, navRef.current.clientWidth * 0.65),
      behavior: 'smooth'
    });
  };

  const update = async (id, body) => {
    try {
      await adminUpdate({ resource, id, body }).unwrap();
      toast.success(`${section === 'Feedback' ? 'Feedback' : section.slice(0, -1)} updated successfully.`, 'Changes saved');
    } catch (requestError) { setError(errorMessage(requestError, 'We could not save that change.')); }
  };

  const create = async (target, payload, form, message) => {
    setError('');
    try {
      const item = await adminCreate({ resource: target.toLowerCase(), body: payload }).unwrap();
      form.reset();
      toast.success(message, `${target.slice(0, -1)} added`);
      return item;
    } catch (requestError) { setError(errorMessage(requestError, 'We could not create that record.')); return null; }
  };

  const removeRow = async (target, item, label, confirmation) => {
    if (!window.confirm(confirmation)) return;
    setError('');
    setDeleting(item._id);
    try {
      await adminDelete({ resource: target, id: item._id }).unwrap();
      toast.success(`${label} was removed.`, `${target === 'vehicles' ? 'Vehicle' : 'Route'} deleted`);
    } catch (requestError) { setError(errorMessage(requestError, 'We could not delete that record.')); }
    finally { setDeleting(''); }
  };

  const addDriver = event => {
    event.preventDefault();
    const form = event.currentTarget;
    const values = readForm(form, { numbers: ['experienceYears'] });
    create('Drivers', { ...values, verified: false, status: 'onboarding' }, form, 'The driver is ready for verification and activation.');
  };

  const addVehicle = async event => {
    event.preventDefault();
    const form = event.currentTarget;
    const values = readForm(form, { numbers: ['seats'], multi: ['features'], booleans: ['featured', 'active'] });
    const item = await create('Vehicles', values, form, 'The vehicle is live in the fleet catalogue.');
    if (item) setVehicleSeats(5);
  };

  const addRoute = event => {
    event.preventDefault();
    const form = event.currentTarget;
    const values = readForm(form, { numbers: ['distanceKm'] });
    create('Routes', { ...values, active: true }, form, 'The route is now available in the catalogue.');
  };

  const addAdmin = event => {
    event.preventDefault();
    const form = event.currentTarget;
    create('Users', readForm(form), form, 'The administrator can now sign in through the existing login page.');
  };

  const setAdminSectionAccess = (item, adminSection, enabled) => {
    const current = new Set(Array.isArray(item.adminSections)
      ? item.adminSections
      : ADMIN_ACCESS_SECTIONS.map(([name]) => name.toLowerCase()));
    if (enabled) current.add(adminSection);
    else current.delete(adminSection);
    update(item._id, { adminSections: [...current] });
  };

  const saveEdit = async event => {
    event.preventDefault();
    const form = event.currentTarget;
    const { resource: editResource, label } = EDIT_TARGETS[editing.type];
    const payload = editing.type === 'vehicle'
      ? readForm(form, { numbers: ['seats'], multi: ['features'], booleans: ['featured', 'active'] })
      : editing.type === 'route'
        ? readForm(form, { numbers: ['distanceKm', 'sortOrder'], booleans: ['popular', 'active'] })
        : readForm(form, { numbers: ['experienceYears'], booleans: ['verified'] });
    setError('');
    try {
      const item = await adminUpdate({ resource: editResource, id: editing.item._id, body: payload }).unwrap();
      setEditing(null);
      toast.success(`${item.name || item.destination} was updated.`, `${label} saved`);
    } catch (requestError) { setError(errorMessage(requestError, 'We could not save those changes.')); }
  };

  const uploadVehicleImage = async (vehicleId, file, input) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) { setError('Select a valid image file.'); return; }
    if (file.size > MAX_IMAGE_BYTES) { setError('Image must be smaller than 8 MB.'); return; }
    setError('');
    setUploadingVehicle(vehicleId);
    try {
      await uploadVehicleImageRequest({ id: vehicleId, file }).unwrap();
      toast.success('The image was uploaded and linked to this vehicle.', 'Vehicle image saved');
    } catch (requestError) { setError(errorMessage(requestError, 'We could not upload that image.')); }
    finally {
      setUploadingVehicle('');
      if (input) input.value = '';
    }
  };

  const copyImageUrl = async url => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success('The Cloudinary image URL is in your clipboard.', 'URL copied');
    } catch {
      setError('Could not copy automatically. Open the image and copy its address.');
    }
  };

  return <div className="admin-page">
    <aside className="admin-sidebar">
      <div className="admin-brand"><BrandLogo /><span>Fleet operations</span></div>
      <p>ADMIN WORKSPACE</p>
      <nav ref={navRef}>{availableSections.map(([item, Icon]) => <button key={item} className={section === item ? 'active' : ''} onClick={() => setSection(item)}><Icon />{item}</button>)}</nav>
      {navScroll.left && <button className="admin-nav-scroll previous" type="button" aria-label="Show previous admin sections" onClick={() => scrollNavigation(-1)}><ChevronLeft /></button>}
      {navScroll.right && <button className="admin-nav-scroll next" type="button" aria-label="Show more admin sections" onClick={() => scrollNavigation(1)}><ChevronRight /></button>}
      <div className="admin-side-actions">
        <button className="admin-logout" aria-label="Sign out" onClick={() => logout().unwrap().catch(() => null).finally(() => location.assign('/'))}><LogOut /> Sign out</button>
      </div>
    </aside>

    <main className="admin-main">
      <header>
        <div><StatusBadge>{isSuperAdmin ? 'Super administrator' : 'Administrator'}</StatusBadge><h1>{section}</h1><p>Manage WonderTravel from one secure workspace.</p></div>
        <PremiumButton variant="ghost" onClick={() => activeQuery.refetch()}><RefreshCw /> Refresh</PremiumButton>
      </header>
      {error && <div className="form-error">{error}</div>}
      {activeQuery.isLoading ? <div className="loading admin-loading"><span/><p>Loading live data…</p></div> : <AnimatePresence mode="wait">
        <motion.div key={section} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: .2 }}>
          {section === 'Overview' && <Overview rows={rows} setSection={setSection} availableSections={availableSections.map(([name]) => name)} />}
          {section === 'Drivers' && <><CreatePanel title="Onboard a driver" subtitle="Add identity and licence details. New drivers start in onboarding status."><form className="admin-create-form driver-form" onSubmit={addDriver}>
            <Field name="name" label="Full name" placeholder="Enter full name" />
            <Field name="phone" label="Phone number" type="tel" placeholder="+91 98765 43210" />
            <Field name="email" label="Email (optional)" type="email" required={false} placeholder="driver@example.com" />
            <Field name="city" label="Operating city" placeholder="Dehradun" />
            <Field name="licenseNumber" label="Driving licence" placeholder="DL-1420110012345" />
            <Field name="experienceYears" label="Experience (years)" type="number" min="0" placeholder="5" />
            <label className="wide">Internal notes<textarea name="notes" rows="2" placeholder="Languages, preferred routes, availability…" /></label>
            <PremiumButton>Onboard driver</PremiumButton>
          </form></CreatePanel>
          <AdminTable heads={['Driver', 'Contact', 'City', 'Licence', 'Experience', 'Verified', 'Status', 'Actions']}>{rows.map(item => <tr key={item._id}><td><b>{item.name}</b><small>Added {longDate(item.onboardedAt)}</small></td><td><b>{item.phone}</b><small>{item.email || 'No email'}</small></td><td>{item.city}</td><td>{item.licenseNumber}</td><td>{item.experienceYears} years</td><td><Toggle value={item.verified} onChange={verified => update(item._id, { verified })} /></td><td><Status value={item.status} options={DRIVER_STATUSES} onChange={status => update(item._id, { status })} /></td><td><button type="button" className="admin-edit" onClick={() => setEditing({ type: 'driver', item })}><Pencil /> Edit</button></td></tr>)}</AdminTable></>}
          {section === 'Vehicles' && <><CreatePanel title="Add a vehicle" subtitle="Create a bookable vehicle and publish it to the customer fleet."><form className="admin-create-form vehicle-form" onSubmit={addVehicle}>
            <Field name="name" label="Vehicle name" placeholder="Toyota Innova Hycross" />
            <SelectField name="category" label="Category" options={VEHICLE_CATEGORIES} />
            <SelectField name="seats" label="Seating" value={vehicleSeats} onChange={event => setVehicleSeats(Number(event.target.value))} options={SEAT_OPTIONS} />
            <div className="vehicle-estimate"><span>Pricing</span><b>Configure later</b><small>Fare will be configured separately for each route and vehicle combination.</small></div>
            <fieldset className="vehicle-feature-picker"><legend>Vehicle features</legend>{VEHICLE_FEATURES.map(feature => <label key={feature}><input type="checkbox" name="features" value={feature} /><span>{feature}</span></label>)}</fieldset>
            <label className="wide">Description<textarea name="description" rows="2" placeholder="Comfortable long-distance vehicle for families." /></label>
            <div className="vehicle-publish-options"><label><input type="checkbox" name="featured" /><span>Featured vehicle</span></label><label><input type="checkbox" name="active" defaultChecked /><span>Available now</span></label></div>
            <PremiumButton>Add vehicle</PremiumButton>
          </form></CreatePanel>
          <AdminTable heads={['Image', 'Vehicle', 'Category', 'Seats', 'Pricing', 'Featured', 'Availability', 'Actions']}>{rows.map(item => <tr key={item._id}><td><div className="admin-vehicle-media">{item.images?.[0] ? <a href={item.images[0].url} target="_blank" rel="noreferrer"><img src={item.images[0].url} alt={item.images[0].alt || item.name} /></a> : <span>No image</span>}<div className="admin-media-actions"><label className={uploadingVehicle === item._id ? 'busy' : ''}>{uploadingVehicle === item._id ? 'Uploading…' : item.images?.length ? `Add image (${item.images.length}/${MAX_VEHICLE_IMAGES})` : 'Upload image'}<input type="file" accept="image/png,image/jpeg,image/webp,image/avif" disabled={uploadingVehicle === item._id || item.images?.length >= MAX_VEHICLE_IMAGES} onChange={event => uploadVehicleImage(item._id, event.target.files?.[0], event.currentTarget)} /></label>{item.images?.[0] && <button type="button" onClick={() => copyImageUrl(item.images[0].url)}>Copy URL</button>}</div></div>{item.images?.[0] && <small className="admin-image-url" title={item.images[0].url}>{item.images[0].url}</small>}</td><td><b>{item.name}</b><small>{item.description || 'No description'}</small></td><td>{item.category}</td><td>{item.seats} seater</td><td>{item.pricingConfigured === false ? <><span className="pricing-pending">Pending</span><small>Set by route and vehicle later</small></> : <><span className="pricing-current">Current pricing</span><small>Existing fare retained</small></>}</td><td><Toggle value={item.featured} onChange={featured => update(item._id, { featured })} /></td><td><Toggle value={item.active} onChange={active => update(item._id, { active })} /></td><td><div className="admin-row-actions"><button type="button" className="admin-edit" onClick={() => setEditing({ type: 'vehicle', item })}><Pencil /> Edit</button>{canDelete && <button type="button" className="admin-delete" disabled={deleting === item._id} onClick={() => removeRow('vehicles', item, item.name, `Delete ${item.name}? Its Cloudinary images will also be deleted. This cannot be undone.`)}><Trash2 />{deleting === item._id ? 'Deleting…' : 'Delete'}</button>}</div></td></tr>)}</AdminTable></>}
          {section === 'Bookings' && <AdminTable heads={['Reference', 'Passenger', 'Route', 'Date', 'Fare', 'Status']}>{rows.map(item => <tr key={item._id}><td>{item.reference}</td><td><b>{item.passenger?.name}</b><small>{item.passenger?.phone}</small></td><td>{item.pickup} → {item.destination}</td><td>{item.date}</td><td>{money(item.fare?.total || 0)}</td><td><Status value={item.status} options={BOOKING_STATUSES} onChange={status => update(item._id, { status })} /></td></tr>)}</AdminTable>}
          {section === 'Inquiries' && <AdminTable heads={['Name', 'Contact', 'Type', 'City', 'Received', 'Status']}>{rows.map(item => <tr key={item._id}><td>{item.name}</td><td><b>{item.phone}</b><small>{item.email || 'No email'}</small></td><td>{item.type}</td><td>{item.city}</td><td>{longDate(item.createdAt)}</td><td><Status value={item.status} options={INQUIRY_STATUSES} onChange={status => update(item._id, { status })} /></td></tr>)}</AdminTable>}
          {section === 'Feedback' && <AdminTable heads={['Guest', 'Photo', 'Rating', 'Feedback', 'Journey', 'Received', 'Featured', 'Status']}>{rows.map(item => <tr key={item._id}><td><b>{item.name}</b><small>{item.email || item.city || 'No contact supplied'}</small></td><td>{item.photo?.url ? <a href={item.photo.url} target="_blank" rel="noreferrer"><img className="admin-feedback-photo" src={item.photo.url} alt={item.photo.alt || `Photo from ${item.name}`} /></a> : <small>No photo</small>}</td><td><b className="admin-rating">{'★'.repeat(item.rating)}</b><small>{item.rating}/5</small></td><td><b>{item.message}</b><small>{item.consentToPublish ? 'Publication approved by guest' : 'No publication consent'}</small></td><td>{item.tripLabel || item.city || 'Not specified'}</td><td>{longDate(item.createdAt)}</td><td>{item.status === 'approved' ? <Toggle value={item.featured} onChange={featured => update(item._id, { featured })} /> : <small>Approve first</small>}</td><td><Status value={item.status} options={FEEDBACK_STATUSES} onChange={status => update(item._id, { status })} /></td></tr>)}</AdminTable>}
          {section === 'Routes' && <><CreatePanel title="Add a route" subtitle="Publish a new destination and its approximate road distance."><form className="admin-create-form route-form" onSubmit={addRoute}><Field name="destination" label="Destination" placeholder="Jaipur, Rajasthan" /><Field name="region" label="Region" placeholder="Rajasthan" /><Field name="distanceKm" label="Distance (km)" type="number" min="1" placeholder="280" /><PremiumButton>Add route</PremiumButton></form></CreatePanel><AdminTable heads={['Destination', 'Region', 'Distance', 'Popular', 'Live', 'Actions']}>{rows.map(item => <tr key={item._id}><td>{item.destination}</td><td>{item.region}</td><td>{item.distanceKm} km</td><td><Toggle value={item.popular} onChange={popular => update(item._id, { popular })} /></td><td><Toggle value={item.active} onChange={active => update(item._id, { active })} /></td><td><div className="admin-row-actions"><button type="button" className="admin-edit" onClick={() => setEditing({ type: 'route', item })}><Pencil /> Edit</button>{canDelete && <button type="button" className="admin-delete" disabled={deleting === item._id} onClick={() => removeRow('routes', item, item.destination, `Delete the route to ${item.destination}? This cannot be undone.`)}><Trash2 />{deleting === item._id ? 'Deleting…' : 'Delete'}</button>}</div></td></tr>)}</AdminTable></>}
          {section === 'Users' && <><CreatePanel title="Create an administrator" subtitle="Only the super administrator can issue another admin ID and password."><form className="admin-create-form admin-account-form" onSubmit={addAdmin}>
            <Field name="name" label="Admin name" placeholder="Operations Manager" />
            <Field name="email" label="Admin ID (email)" type="email" placeholder="admin@wondertravel.in" />
            <Field name="phone" label="Phone (optional)" type="tel" required={false} placeholder="+91 98765 43210" />
            <Field name="password" label="Temporary password" type="password" minLength="8" placeholder="Minimum 8 characters" />
            <PremiumButton>Create admin</PremiumButton>
          </form></CreatePanel><div className="admin-user-filters mb-4 flex flex-col gap-3 rounded-2xl border border-white/10 bg-black/15 p-3"><label className="admin-user-search relative flex-1"><span className="sr-only">Search users</span><Search aria-hidden="true" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-muted" /><input type="search" className="w-full rounded-xl border border-white/10 bg-black/25 py-3 pl-10 pr-4 text-sm text-ivory outline-none transition placeholder:text-slate-muted focus:border-champagne focus:ring-3 focus:ring-champagne/10" placeholder="Search name, email, phone, role or status" value={userSearch} onChange={event => setUserSearch(event.target.value)} /></label><div className="admin-user-filter-row"><div className="admin-user-role-tabs" role="group" aria-label="Filter account type">{[['all', 'All'], ['customers', 'Customers'], ['admins', 'Admins']].map(([value, label]) => <button key={value} type="button" className={userRoleFilter === value ? 'active' : ''} aria-pressed={userRoleFilter === value} onClick={() => setUserRoleFilter(value)}><span>{label}</span><b>{userCounts[value]}</b></button>)}</div><span className="admin-result-count" aria-live="polite">Showing <b>{visibleUsers.length}</b> of {rows.length}</span></div></div><AdminTable heads={['User', 'Contact', 'Joined', 'Role', 'Section access', 'Verification', 'Account status', 'Active']}>{visibleUsers.map(item => <tr key={item._id}><td><b>{item.name}</b><small>{item.createdFrom === 'booking' ? 'Created from booking' : item.createdFrom === 'admin' ? 'Created by administrator' : 'Registered account'}</small></td><td><b>{item.email}</b><small>{item.phone || 'No phone number'}</small></td><td><b>{longDate(item.createdAt)}</b><small>{item.lastLoginAt ? `Last login ${longDate(item.lastLoginAt)}` : 'No recorded login'}</small></td><td><span className={`admin-role role-${item.adminRole || item.role}`}>{item.adminRole === 'super_admin' ? 'super admin' : item.role}</span>{item.role === 'admin' && <small>{item.adminRole === 'super_admin' ? 'Owner account' : 'Staff administrator'}</small>}</td><td className={item.role === 'admin' ? '' : 'admin-only-cell'}>{item.adminRole === 'super_admin' ? <small>Full access</small> : item.role === 'admin' ? <details className="admin-access-picker min-w-40"><summary className="cursor-pointer text-champagne">Manage access</summary><div className="mt-2 grid gap-2">{ADMIN_ACCESS_SECTIONS.map(([name]) => { const value = name.toLowerCase(); const checked = Array.isArray(item.adminSections) ? item.adminSections.includes(value) : true; return <label key={value} className="flex items-center gap-2 text-[10px] normal-case"><input type="checkbox" checked={checked} onChange={event => setAdminSectionAccess(item, value, event.target.checked)} />{name}</label>; })}</div></details> : null}</td><td>{item.emailVerified ? <span className="pricing-current">Verified</span> : <span className="pricing-pending">Not verified</span>}</td><td><span className={`admin-status status-${item.accountStatus}`}>{item.accountStatus}</span></td><td>{item.adminRole === 'super_admin' ? <small>Always active</small> : <Toggle value={item.active} onChange={active => update(item._id, { active })} />}</td></tr>)}</AdminTable></>}
        </motion.div>
      </AnimatePresence>}
    </main>
    {editing && <EditPanel key={`${editing.type}-${editing.item._id}`} editing={editing} saving={savingEdit} onClose={() => setEditing(null)} onSubmit={saveEdit} />}
  </div>;
}
