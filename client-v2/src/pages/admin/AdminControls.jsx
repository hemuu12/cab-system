import { Children, cloneElement, isValidElement } from 'react';
import { Inbox } from 'lucide-react';

const EMPTY_COPY = {
  Driver: ['No drivers found', 'No drivers have been added yet, or nothing matches what you are looking for.'],
  Image: ['No vehicles found', 'No vehicles have been added yet, or nothing matches what you are looking for.'],
  Reference: ['No bookings found', 'There are no bookings to show, or nothing matches what you are looking for.'],
  Name: ['No inquiries found', 'There are no customer inquiries to show, or nothing matches what you are looking for.'],
  Guest: ['No feedback found', 'There are no guest reviews to show, or nothing matches what you are looking for.'],
  Destination: ['No routes found', 'No routes have been added yet, or nothing matches what you are looking for.'],
  User: ['No users found', 'No accounts match your search or selected account type.']
};

export function CreatePanel({ title, subtitle, children }) {
  return <details className="admin-create-panel"><summary><div><b>{title}</b><span>{subtitle}</span></div><i>+</i></summary>{children}</details>;
}

export function Field({ label, required = true, ...props }) {
  return <label>{label}<input required={required} {...props} /></label>;
}

export function SelectField({ label, options, ...props }) {
  return <label>{label}<select required {...props}>{options.map(option => {
    const [value, text] = Array.isArray(option) ? option : [option, option];
    return <option value={value} key={value}>{text}</option>;
  })}</select></label>;
}

/** Mirrors each column heading onto its cell as `data-label` for the mobile card layout. */
export function AdminTable({ heads, children, emptyTitle, emptyMessage, className = '' }) {
  const labelledRows = Children.map(children, row => {
    if (!isValidElement(row)) return row;
    const cells = Children.map(row.props.children, (cell, index) => isValidElement(cell)
      ? cloneElement(cell, { 'data-label': heads[index] })
      : cell);
    return cloneElement(row, {}, cells);
  });
  const [resolvedTitle, resolvedMessage] = EMPTY_COPY[heads[0]] || ['No data found', 'There are no records to show, or nothing matches what you are looking for.'];
  if (!Children.count(children)) return <div className="admin-empty-state" role="status">
    <span><Inbox aria-hidden="true" /></span>
    <h2>{emptyTitle || resolvedTitle}</h2>
    <p>{emptyMessage || resolvedMessage}</p>
  </div>;
  return <div className={`admin-table-wrap ${className}`.trim()}><table className="admin-table"><thead><tr>{heads.map(head => <th key={head}>{head}</th>)}</tr></thead><tbody>{labelledRows}</tbody></table></div>;
}

export function Status({ value, options, onChange }) {
  return <select className={`admin-status status-${value}`} value={value} onChange={event => onChange(event.target.value)}>{options.map(item => <option key={item}>{item}</option>)}</select>;
}

export function Toggle({ value, onChange }) {
  return <button type="button" aria-label={value ? 'Set inactive' : 'Set active'} aria-pressed={value} className={`admin-toggle ${value ? 'active' : ''}`} onClick={() => onChange(!value)}><i/></button>;
}
