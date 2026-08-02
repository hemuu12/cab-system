'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

const pageWindow = (current, total) => {
  if (total <= 5) return Array.from({ length: total }, (_, index) => index + 1);
  const start = Math.min(Math.max(1, current - 2), total - 4);
  return Array.from({ length: 5 }, (_, index) => start + index);
};

export default function AdminPagination({ page, pageSize, total, onChange }) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (total <= pageSize) return null;
  const first = (page - 1) * pageSize + 1;
  const last = Math.min(page * pageSize, total);

  return <nav className="admin-pagination" aria-label="Table pagination">
    <span className="admin-pagination-summary">Showing <b>{first}–{last}</b> of {total}</span>
    <div>
      <button type="button" aria-label="Previous page" disabled={page <= 1} onClick={() => onChange(page - 1)}>
        <ChevronLeft aria-hidden="true" /> <span>Previous</span>
      </button>
      <div className="admin-pagination-pages" aria-label={`Page ${page} of ${totalPages}`}>
        {pageWindow(page, totalPages).map(number => <button
          type="button"
          key={number}
          className={number === page ? 'active' : ''}
          aria-current={number === page ? 'page' : undefined}
          aria-label={`Page ${number}`}
          onClick={() => onChange(number)}
        >{number}</button>)}
      </div>
      <button type="button" aria-label="Next page" disabled={page >= totalPages} onClick={() => onChange(page + 1)}>
        <span>Next</span> <ChevronRight aria-hidden="true" />
      </button>
    </div>
  </nav>;
}
