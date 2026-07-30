import { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, MotionConfig } from 'motion/react';
import Header from './components/Header.jsx';
import SupportButtons from './components/SupportButtons.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import PageTransition from './components/ui/PageTransition.jsx';
import PwaExperience from './components/PwaExperience.jsx';
import Home from './pages/Home.jsx';
import Results from './pages/Results.jsx';
import Checkout from './pages/Checkout.jsx';
import Confirmation from './pages/Confirmation.jsx';
import Account from './pages/Account.jsx';
import NotFound from './pages/NotFound.jsx';
import Login from './pages/Login.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';
import Admin from './pages/Admin.jsx';

/** Routes rendering a handed-over static design, which brings its own chrome. */
const EXACT_DESIGN_PATHS = ['/', '/results'];
/** Routes that render full-screen without the site header or support buttons. */
const STANDALONE_PATHS = ['/login', '/forgot-password'];

function ScrollManager() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) setTimeout(() => document.querySelector(hash)?.scrollIntoView({ behavior: 'smooth' }), 0);
    else window.scrollTo({ top: 0, behavior: 'auto' });
  }, [pathname, hash]);
  return null;
}

export default function App() {
  const location = useLocation();
  const { pathname } = location;
  const usesExactDesign = EXACT_DESIGN_PATHS.includes(pathname);
  const usesStandaloneLayout = STANDALONE_PATHS.includes(pathname) || pathname.startsWith('/admin');
  const showChrome = !usesExactDesign && !usesStandaloneLayout;
  const routes = <Routes location={location}>
    <Route path="/" element={<Home />} />
    <Route path="/results" element={<Results />} />
    <Route path="/checkout/:vehicleId" element={<Checkout />} />
    <Route path="/confirmation/:reference" element={<Confirmation />} />
    <Route path="/login" element={<Login />} />
    <Route path="/forgot-password" element={<ForgotPassword />} />
    <Route path="/account" element={<ProtectedRoute><Account /></ProtectedRoute>} />
    <Route path="/admin" element={<ProtectedRoute admin><Admin /></ProtectedRoute>} />
    <Route path="*" element={<NotFound />} />
  </Routes>;
  return <MotionConfig reducedMotion="user"><>
    <ScrollManager />
    {showChrome && <Header />}
    <main>{showChrome ? <AnimatePresence mode="wait" initial={false}><PageTransition key={pathname}>{routes}</PageTransition></AnimatePresence> : routes}</main>
    {showChrome && <SupportButtons />}
    <PwaExperience />
  </></MotionConfig>;
}
