import { CarFront, CircleUserRound } from 'lucide-react';
import PremiumCard from '../../components/ui/PremiumCard.jsx';
import StatusBadge from '../../components/ui/StatusBadge.jsx';
import { money } from '../../lib/format.js';

export default function Overview({ rows = {}, setSection, availableSections = [] }) {
  const allowed = new Set(availableSections);
  const stats = [
    ['Active drivers', rows.activeDrivers, 'Drivers'],
    ['Drivers onboarded', rows.drivers, 'Drivers'],
    ['Active vehicles', rows.activeVehicles, 'Vehicles'],
    ['Active journeys', rows.activeBookings, 'Bookings'],
    ['Total bookings', rows.bookings, 'Bookings'],
    ['New inquiries', rows.newInquiries, 'Inquiries'],
    ['Pending feedback', rows.pendingFeedback, 'Feedback'],
    ['Live routes', rows.activeRoutes, 'Routes'],
    ['Booked revenue', money(rows.revenue || 0), 'Bookings'],
    ['Active users', rows.users, 'Users']
  ].filter(([, , target]) => allowed.has(target));
  const canManageDrivers = allowed.has('Drivers');
  const canManageVehicles = allowed.has('Vehicles');
  return <><div className="admin-stats">{stats.map(([label, value, target], index) => <PremiumCard as="button" interactive delay={index * .03} key={label} className="admin-stat" onClick={() => setSection(target)}><span>{label}</span><b>{value ?? 0}</b><small>View {target.toLowerCase()} →</small></PremiumCard>)}</div><div className="admin-quick"><div><StatusBadge>Today’s workspace</StatusBadge><h2>Your assigned operations, in one place.</h2><p>The dashboard only shows information and actions granted by the super administrator.</p></div>{(canManageDrivers || canManageVehicles) && <div className="admin-quick-actions">{canManageDrivers && <button onClick={() => setSection('Drivers')}><CircleUserRound /> Onboard driver</button>}{canManageVehicles && <button onClick={() => setSection('Vehicles')}><CarFront /> Add vehicle</button>}</div>}</div></>;
}
