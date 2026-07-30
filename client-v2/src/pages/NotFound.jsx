import { Link } from 'react-router-dom';
export default function NotFound(){return <div className="page-shell empty-state"><p className="eyebrow">404</p><h1>This road leads nowhere.</h1><p>Let’s get you back to familiar ground.</p><Link className="button button-ember" to="/">Return home</Link></div>}
