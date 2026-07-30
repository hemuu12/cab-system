export default function StatusBadge({ children, tone = 'gold', className = '' }) {
  const tones = {
    gold: 'border-champagne/30 bg-champagne/10 text-champagne',
    orange: 'border-ember/35 bg-ember/10 text-ember-light',
    green: 'border-success/35 bg-success/10 text-[#63d996]',
    neutral: 'border-white/10 bg-white/[.04] text-mist'
  };
  return <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[9px] font-bold uppercase tracking-[.12em] ${tones[tone]} ${className}`}>{children}</span>;
}
