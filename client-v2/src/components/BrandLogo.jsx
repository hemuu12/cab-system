import { Link } from 'react-router-dom';

export default function BrandLogo({ className = '', linked = true, iconOnly = false, onClick }) {
  const image = <img
    className={iconOnly ? 'brand-logo-icon' : 'brand-logo-wordmark'}
    src={iconOnly ? '/branding/wondertravel-icon.png' : '/branding/wondertravel-wordmark-header.png'}
    alt={iconOnly ? 'WonderTravel' : 'WonderTravel logo'}
    width={iconOnly ? 512 : 720}
    height={iconOnly ? 512 : 180}
    decoding="async"
  />;

  if (!linked) return <span className={`brand-logo ${className}`.trim()}>{image}</span>;
  return <Link className={`brand-logo ${className}`.trim()} to="/" aria-label="WonderTravel home" onClick={onClick}>{image}</Link>;
}
