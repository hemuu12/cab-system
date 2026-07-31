const Block = ({ className = '' }) => <span className={`skeleton-block ${className}`.trim()} aria-hidden="true" />;

function TableSkeleton() {
  return <div className="admin-skeleton-table">
    <div className="admin-skeleton-table-head">{Array.from({ length: 6 }, (_, index) => <Block key={index} />)}</div>
    {Array.from({ length: 6 }, (_, row) => <div className="admin-skeleton-table-row" key={row}>{Array.from({ length: 6 }, (__, cell) => <Block key={cell} className={cell === 0 ? 'primary' : ''} />)}</div>)}
  </div>;
}

function OverviewSkeleton() {
  return <div className="admin-skeleton-overview">
    <div className="admin-skeleton-stats">{Array.from({ length: 4 }, (_, index) => <div className="admin-skeleton-stat" key={index}><Block className="short" /><Block className="number" /><Block className="link" /></div>)}</div>
    <div className="admin-skeleton-analytics">
      <div className="admin-skeleton-chart wide"><Block className="short" /><Block className="heading" /><div className="skeleton-chart-lines"><i /><i /><i /></div></div>
      <div className="admin-skeleton-chart"><Block className="short" /><Block className="heading" /><div className="skeleton-bars">{Array.from({ length: 6 }, (_, index) => <i key={index} />)}</div></div>
    </div>
  </div>;
}

function PricingSkeleton() {
  return <div className="admin-skeleton-pricing">
    <Block className="copy" /><Block className="copy half" />
    <div className="admin-skeleton-rate-cards">{Array.from({ length: 2 }, (_, index) => <div className="admin-skeleton-rate" key={index}><Block className="heading" />{Array.from({ length: 6 }, (__, field) => <Block key={field} className="field" />)}</div>)}</div>
    <Block className="heading" />
    <TableSkeleton />
  </div>;
}

function ResourceSkeleton() {
  return <div className="admin-skeleton-resource">
    <div className="admin-skeleton-filter"><Block className="search" /><Block /><Block /><Block className="count" /></div>
    <TableSkeleton />
  </div>;
}

export default function AdminSkeleton({ section }) {
  return <div className="admin-skeleton" role="status" aria-live="polite" aria-label={`Loading ${section.toLowerCase()}`}>
    {section === 'Overview' ? <OverviewSkeleton /> : section === 'Pricing' ? <PricingSkeleton /> : <ResourceSkeleton />}
    <span className="sr-only">Loading {section.toLowerCase()}…</span>
  </div>;
}
