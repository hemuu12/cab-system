import { useState } from 'react';
import { ArrowDownRight, ArrowUpRight, CalendarCheck2, CarFront, CircleUserRound, IndianRupee, Minus, Star, UsersRound } from 'lucide-react';
import PremiumCard from '../../components/ui/PremiumCard.jsx';
import StatusBadge from '../../components/ui/StatusBadge.jsx';
import { money } from '../../lib/format.js';

const compact = new Intl.NumberFormat('en-IN', { notation: 'compact', maximumFractionDigits: 1 });
const CHART_COLORS = ['#d8b678', '#f26b1d', '#2fbf71', '#74a7d8', '#b68bdd'];

function monthSlots() {
  const now = new Date();
  return Array.from({ length: 6 }, (_, index) => {
    const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 5 + index, 1));
    return { key: `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`, label: date.toLocaleDateString('en-IN', { month: 'short', timeZone: 'UTC' }) };
  });
}

const fillMonths = (entries = [], valueKey = 'count') => {
  const values = new Map(entries.map(item => [item._id, Number(item[valueKey]) || 0]));
  return monthSlots().map(month => ({ ...month, value: values.get(month.key) || 0 }));
};

const summarize = (entries = [], valueKey = 'count') => {
  const data = fillMonths(entries, valueKey);
  const current = data.at(-1)?.value || 0;
  const previous = data.at(-2)?.value || 0;
  const change = previous ? Math.round(((current - previous) / previous) * 100) : current ? 100 : 0;
  const peak = data.reduce((best, item) => item.value > best.value ? item : best, data[0] || { label: '—', value: 0 });
  return { data, current, previous, change, peak, total: data.reduce((sum, item) => sum + item.value, 0) };
};

function Change({ value }) {
  const Icon = value > 0 ? ArrowUpRight : value < 0 ? ArrowDownRight : Minus;
  return <span className={`analytics-change ${value > 0 ? 'positive' : value < 0 ? 'negative' : 'neutral'}`}><Icon />{Math.abs(value)}%</span>;
}

function InsightStrip({ items }) {
  return <div className="analytics-insights">{items.map(item => <article key={item.label}>
    <span><i style={{ background: item.color }} />{item.label}</span>
    <div><b>{item.format ? item.format(item.summary.current) : compact.format(item.summary.current)}</b><Change value={item.summary.change} /></div>
    <small>vs {item.format ? item.format(item.summary.previous) : compact.format(item.summary.previous)} last month</small>
  </article>)}</div>;
}

function GrowthChart({ series }) {
  const [active, setActive] = useState('all');
  const [hoveredMonth, setHoveredMonth] = useState(5);
  const plotted = series.map((item, index) => ({ ...item, color: CHART_COLORS[index], values: fillMonths(item.data) }));
  const maximum = Math.max(1, ...plotted.flatMap(item => item.values.map(point => point.value)));
  const x = index => 42 + index * 101;
  const y = value => 150 - (value / maximum) * 112;
  const selectedMonth = monthSlots()[hoveredMonth];

  return <article className="analytics-card analytics-growth">
    <header><div><span>Six-month activity</span><h3>Growth pulse</h3></div><div className="analytics-live-chip"><i />Live database</div></header>
    <div className="analytics-detail-row"><span><b>{selectedMonth.label}</b>{plotted.map(item => <small key={item.label}><i style={{ background: item.color }} />{item.label} {item.values[hoveredMonth]?.value || 0}</small>)}</span><span><b>{compact.format(maximum)}</b><small>Peak monthly volume</small></span></div>
    <div className="analytics-legend"><button type="button" className={active === 'all' ? 'active' : ''} onClick={() => setActive('all')}>All</button>{plotted.map(item => <button type="button" className={active === item.label ? 'active' : ''} onClick={() => setActive(item.label)} key={item.label}><i style={{ background: item.color }} />{item.label}</button>)}</div>
    <div className="analytics-chart-scroll">
      <svg className="analytics-line-chart" viewBox="0 0 590 190" role="img" aria-label="Interactive monthly growth chart">
        {[38, 94, 150].map((value, index) => <g key={value}><line x1="35" x2="555" y1={value} y2={value} /><text className="analytics-axis-value" x="27" y={value + 3}>{index === 0 ? maximum : index === 1 ? Math.round(maximum / 2) : 0}</text></g>)}
        <line className="analytics-crosshair" x1={x(hoveredMonth)} x2={x(hoveredMonth)} y1="35" y2="153" />
        {plotted.map(item => {
          const points = item.values.map((point, index) => `${x(index)},${y(point.value)}`).join(' ');
          const visible = active === 'all' || active === item.label;
          return <g className={`analytics-series ${visible ? 'visible' : 'muted'}`} key={item.label}>
            <polyline pathLength="1" points={points} style={{ stroke: item.color }} />
            {item.values.map((point, index) => <circle key={point.key} cx={x(index)} cy={y(point.value)} r={index === hoveredMonth ? 5 : 3.5} style={{ fill: item.color }}><title>{item.label}: {point.value} in {point.label}</title></circle>)}
          </g>;
        })}
        {monthSlots().map((month, index) => <rect className="analytics-hit-area" key={`hit-${month.key}`} x={x(index) - 44} y="25" width="88" height="135" tabIndex="0" aria-label={`Show ${month.label} details`} onMouseEnter={() => setHoveredMonth(index)} onFocus={() => setHoveredMonth(index)} />)}
        {monthSlots().map((month, index) => <text key={month.key} x={x(index)} y="179">{month.label}</text>)}
      </svg>
    </div>
  </article>;
}

function RevenueChart({ entries = [] }) {
  const summary = summarize(entries, 'revenue');
  const maximum = Math.max(1, ...summary.data.map(item => item.value));
  return <article className="analytics-card analytics-revenue">
    <header><div><span>Booked revenue · six months</span><h3>{money(summary.total)}</h3></div><Change value={summary.change} /></header>
    <div className="analytics-revenue-meta"><span><b>{money(summary.current)}</b><small>This month</small></span><span><b>{money(Math.round(summary.total / 6))}</b><small>Monthly average</small></span><span><b>{summary.peak.label}</b><small>Best · {money(summary.peak.value)}</small></span></div>
    <div className="analytics-bars" role="img" aria-label="Monthly booked revenue chart">
      {summary.data.map((item, index) => <div key={item.key}>
        <span className="analytics-bar-track" tabIndex="0"><em>{money(item.value)}</em><i style={{ '--bar-height': `${Math.max(item.value ? 8 : 2, (item.value / maximum) * 100)}%`, animationDelay: `${index * 80}ms` }} /></span>
        <b>{item.label}</b><small>{item.value ? compact.format(item.value) : '0'}</small>
      </div>)}
    </div>
  </article>;
}

function BreakdownChart({ title, subtitle, entries = [], colors = CHART_COLORS }) {
  const total = entries.reduce((sum, item) => sum + Number(item.count || 0), 0);
  if (!entries.length) return null;
  const leading = entries[0];
  return <article className="analytics-card analytics-breakdown">
    <header><div><span>{subtitle}</span><h3>{title}</h3></div><small><b>{leading?._id}</b><br />largest segment</small></header>
    <div className="analytics-segmented" aria-hidden="true">{entries.map((item, index) => <i key={item._id} style={{ width: `${(item.count / total) * 100}%`, background: colors[index % colors.length] }} />)}</div>
    <div>{entries.map((item, index) => {
      const percent = total ? Math.round((item.count / total) * 100) : 0;
      return <div className="analytics-breakdown-row" key={item._id || 'unknown'}>
        <span><b><i style={{ background: colors[index % colors.length] }} />{item._id || 'Unknown'}</b><small>{item.count} · {percent}%</small></span>
        <i><em style={{ '--breakdown-width': `${percent}%`, background: colors[index % colors.length], animationDelay: `${index * 100}ms` }} /></i>
      </div>;
    })}</div>
  </article>;
}

export default function Overview({ rows = {}, setSection, availableSections = [] }) {
  const allowed = new Set(availableSections);
  const coreStats = [
    { label: 'Booked revenue', value: money(rows.revenue || 0), detail: 'Non-cancelled bookings', target: 'Bookings', Icon: IndianRupee },
    { label: 'Total bookings', value: rows.bookings ?? 0, detail: `${rows.activeBookings || 0} active journeys`, target: 'Bookings', Icon: CalendarCheck2 },
    { label: 'Active users', value: rows.users ?? 0, detail: 'Customer and staff accounts', target: 'Users', Icon: UsersRound },
    { label: 'Guest rating', value: `${rows.averageRating || 0}/5`, detail: `${rows.pendingFeedback || 0} awaiting review`, target: 'Feedback', Icon: Star }
  ].filter(item => allowed.has(item.target));
  const growthSeries = [
    allowed.has('Bookings') && { label: 'Bookings', data: rows.bookingTrend },
    allowed.has('Users') && { label: 'Users', data: rows.userTrend },
    allowed.has('Feedback') && { label: 'Reviews', data: rows.feedbackTrend },
    allowed.has('Inquiries') && { label: 'Inquiries', data: rows.inquiryTrend },
    allowed.has('Drivers') && { label: 'Drivers', data: rows.driverTrend }
  ].filter(item => item && Array.isArray(item.data));
  const insightItems = [
    allowed.has('Bookings') && { label: 'Bookings this month', summary: summarize(rows.bookingTrend), color: CHART_COLORS[0] },
    allowed.has('Bookings') && { label: 'Revenue this month', summary: summarize(rows.bookingTrend, 'revenue'), color: CHART_COLORS[1], format: money },
    allowed.has('Users') && { label: 'New users this month', summary: summarize(rows.userTrend), color: CHART_COLORS[2] },
    allowed.has('Feedback') && { label: 'Reviews this month', summary: summarize(rows.feedbackTrend), color: CHART_COLORS[3] }
  ].filter(Boolean);
  const canManageDrivers = allowed.has('Drivers');
  const canManageVehicles = allowed.has('Vehicles');

  return <>
    <div className="overview-core-stats">{coreStats.map(({ label, value, detail, target, Icon }, index) => <PremiumCard as="button" interactive delay={index * .04} key={label} className="overview-core-stat" onClick={() => setSection(target)}><span><Icon />{label}</span><b>{value}</b><small>{detail}</small><i>Open {target.toLowerCase()} →</i></PremiumCard>)}</div>
    {(growthSeries.length || rows.bookingTrend || rows.feedbackStatusBreakdown) && <section className="admin-analytics" aria-labelledby="analytics-title">
      <div className="analytics-heading"><div><StatusBadge>Live analytics</StatusBadge><h2 id="analytics-title">Business performance</h2></div><p>Hover or focus chart points for details. Select a series to isolate its trend.</p></div>
      {insightItems.length > 0 && <InsightStrip items={insightItems} />}
      <div className="analytics-dashboard-grid">
        {growthSeries.length > 0 && <GrowthChart series={growthSeries} />}
        {allowed.has('Bookings') && <RevenueChart entries={rows.bookingTrend} />}
        <div className="analytics-dashboard-lower">
          {allowed.has('Bookings') && <BreakdownChart title="Booking status" subtitle="Journey pipeline" entries={rows.bookingStatusBreakdown} />}
          {allowed.has('Feedback') && <div className="analytics-rating-wrap"><div className="analytics-rating"><span>Average guest rating</span><b>{rows.averageRating || 0}<small>/5</small></b><i>{'★'.repeat(Math.round(rows.averageRating || 0))}{'☆'.repeat(5 - Math.round(rows.averageRating || 0))}</i><small>Across all submitted reviews</small></div><BreakdownChart title="Review moderation" subtitle="Review health" entries={rows.feedbackStatusBreakdown} /></div>}
        </div>
      </div>
    </section>}
    <div className="admin-quick"><div><StatusBadge>Today’s workspace</StatusBadge><h2>Your assigned operations, in one place.</h2><p>The dashboard only shows information and actions granted by the super administrator.</p></div>{(canManageDrivers || canManageVehicles) && <div className="admin-quick-actions">{canManageDrivers && <button onClick={() => setSection('Drivers')}><CircleUserRound /> Onboard driver</button>}{canManageVehicles && <button onClick={() => setSection('Vehicles')}><CarFront /> Add vehicle</button>}</div>}</div>
  </>;
}
