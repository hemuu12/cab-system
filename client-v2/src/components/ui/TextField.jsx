export default function TextField({ label, hint, optional = false, error, className = '', ...props }) {
  return <label className={`grid gap-2 text-[10px] font-bold uppercase tracking-[.09em] text-mist ${className}`}>
    <span className="flex items-center justify-between">{label}{optional && <span className="rounded-full border border-champagne/25 bg-champagne/[.08] px-2 py-0.5 text-[8px] text-champagne">Optional</span>}</span>
    <input
      className={`w-full rounded-xl border bg-black/25 px-3.5 py-3 text-sm font-medium normal-case tracking-normal text-ivory outline-none transition focus:ring-3 ${error ? 'border-ember-light/80 ring-ember/10 focus:border-ember-light focus:ring-ember/10' : 'border-white/10 focus:border-champagne focus:ring-champagne/10'}`}
      {...props}
    />
    {(error || hint) && <small className={error ? 'text-[9px] normal-case tracking-normal text-[#ff9c79]' : 'text-[9px] normal-case tracking-normal text-slate-muted'}>{error || hint}</small>}
  </label>;
}
