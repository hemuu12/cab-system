import { Children, cloneElement, isValidElement } from 'react';

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
export function AdminTable({ heads, children }) {
  const labelledRows = Children.map(children, row => {
    if (!isValidElement(row)) return row;
    const cells = Children.map(row.props.children, (cell, index) => isValidElement(cell)
      ? cloneElement(cell, { 'data-label': heads[index] })
      : cell);
    return cloneElement(row, {}, cells);
  });
  return <div className="admin-table-wrap"><table className="admin-table"><thead><tr>{heads.map(head => <th key={head}>{head}</th>)}</tr></thead><tbody>{labelledRows}</tbody></table></div>;
}

export function Status({ value, options, onChange }) {
  return <select className={`admin-status status-${value}`} value={value} onChange={event => onChange(event.target.value)}>{options.map(item => <option key={item}>{item}</option>)}</select>;
}

export function Toggle({ value, onChange }) {
  return <button type="button" aria-label={value ? 'Set inactive' : 'Set active'} aria-pressed={value} className={`admin-toggle ${value ? 'active' : ''}`} onClick={() => onChange(!value)}><i/></button>;
}
