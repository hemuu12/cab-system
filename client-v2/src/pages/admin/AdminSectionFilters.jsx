import { useState } from 'react';
import { ChevronDown, Search, SlidersHorizontal, X } from 'lucide-react';

const normalize = value => String(value ?? '').trim().toLowerCase();
const uniqueOptions = (rows, field) => [...new Set(rows.map(item => item[field]).filter(Boolean))]
  .sort((a, b) => String(a).localeCompare(String(b)));

const SECTION_CONTROLS = {
  Drivers: [
    ['status', 'Status', ['onboarding', 'active', 'inactive', 'suspended']],
    ['verified', 'Verification', [['true', 'Verified'], ['false', 'Unverified']]]
  ],
  Vehicles: [
    ['category', 'Category', 'dynamic'],
    ['active', 'Availability', [['true', 'Available'], ['false', 'Unavailable']]],
    ['featured', 'Placement', [['true', 'Featured'], ['false', 'Standard']]]
  ],
  Bookings: [['status', 'Status', ['confirmed', 'active', 'completed', 'cancelled']]],
  Inquiries: [['status', 'Status', ['new', 'contacted', 'closed']]],
  Feedback: [
    ['status', 'Moderation', [['pending', 'Unverified'], ['approved', 'Verified'], ['rejected', 'Rejected']]],
    ['rating', 'Rating', [['5', '5 stars'], ['4', '4 stars'], ['3', '3 stars'], ['2', '2 stars'], ['1', '1 star']]]
  ],
  Routes: [
    ['region', 'Region', 'dynamic'],
    ['active', 'Visibility', [['true', 'Live'], ['false', 'Hidden']]],
    ['popular', 'Popularity', [['true', 'Popular'], ['false', 'Standard']]]
  ],
  Users: [
    ['role', 'Account type', [['customer', 'Customers'], ['admin', 'Administrators']]],
    ['emailVerified', 'Verification', [['true', 'Verified'], ['false', 'Unverified']]],
    ['accountStatus', 'Account status', [['active', 'Active'], ['provisional', 'Provisional'], ['blocked', 'Blocked']]],
    ['active', 'Access', [['true', 'Enabled'], ['false', 'Disabled']]]
  ]
};

export const EMPTY_ADMIN_FILTERS = Object.freeze({ search: '' });

export function filterAdminRows(rows, filters) {
  if (!Array.isArray(rows)) return rows;
  const search = normalize(filters.search);
  return rows.filter(item => {
    if (search && !normalize(JSON.stringify(item)).includes(search)) return false;
    return Object.entries(filters).every(([field, value]) => {
      if (field === 'search' || !value || value === 'all') return true;
      if (value === 'true' || value === 'false') return Boolean(item[field]) === (value === 'true');
      return normalize(item[field]) === normalize(value);
    });
  });
}

function SelectFilter({ field, label, options, value, onChange }) {
  return <label className="admin-filter-select">
    <span>{label}</span>
    <select value={value || 'all'} onChange={event => onChange(field, event.target.value)}>
      <option value="all">All</option>
      {options.map(option => {
        const [optionValue, optionLabel] = Array.isArray(option) ? option : [option, option];
        return <option value={optionValue} key={optionValue}>{optionLabel}</option>;
      })}
    </select>
  </label>;
}

export default function AdminSectionFilters({ section, rows, filters, filteredCount, onChange, onReset }) {
  const controls = SECTION_CONTROLS[section] || [];
  const [expanded, setExpanded] = useState(() => typeof window === 'undefined' || window.innerWidth > 680);
  const activeFilterCount = Object.entries(filters).filter(([key, value]) => (
    key === 'search' ? Boolean(value?.trim()) : value && value !== 'all'
  )).length;
  const hasFilters = activeFilterCount > 0;

  return <section className={`admin-section-filters${expanded ? ' is-open' : ''}`} aria-label={`${section} filters`}>
    <button className="admin-filter-toggle" type="button" aria-expanded={expanded} onClick={() => setExpanded(value => !value)}>
      <span><SlidersHorizontal aria-hidden="true" /><b>Filters</b><small>Search and narrow {section.toLowerCase()}</small></span>
      <span>{activeFilterCount > 0 && <i>{activeFilterCount} active</i>}<ChevronDown aria-hidden="true" /></span>
    </button>
    <div className="admin-filter-body">
      <label className="admin-filter-search">
        <span className="sr-only">Search {section.toLowerCase()}</span>
        <Search aria-hidden="true" />
        <input
          type="search"
          value={filters.search || ''}
          placeholder={`Search ${section.toLowerCase()}…`}
          onChange={event => onChange('search', event.target.value)}
        />
      </label>
      <div className="admin-filter-controls">
        {controls.map(([field, label, configuredOptions]) => <SelectFilter
          key={field}
          field={field}
          label={label}
          value={filters[field]}
          options={configuredOptions === 'dynamic' ? uniqueOptions(rows, field) : configuredOptions}
          onChange={onChange}
        />)}
      </div>
      <div className="admin-filter-summary" aria-live="polite">
        <span>Showing <b>{filteredCount}</b> of {rows.length}</span>
        {hasFilters && <button type="button" onClick={onReset}><X />Clear filters</button>}
      </div>
    </div>
  </section>;
}
