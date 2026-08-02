import Link from 'next/link';

export default function NotFound() {
  return <div className="page-shell empty-state">
    <p className="eyebrow">404</p>
    <h1>This road leads nowhere.</h1>
    <p>Let’s get you back to familiar ground.</p>
    <Link className="button button-ember" href="/">Return home</Link>
  </div>;
}
