import { useCallback, useRef, useState } from 'react';
import { useFeedbackQuery, useVehiclesQuery } from '../store/api/catalogApi.js';
import { useAuth } from '../hooks/useAuth.js';
import { useReveal } from '../hooks/useReveal.js';
import DesignStyles from '../components/design/DesignStyles.jsx';
import Floats from '../components/design/Floats.jsx';
import HomeNav from './home/HomeNav.jsx';
import HomeHero from './home/HomeHero.jsx';
import BookingWidget from './home/BookingWidget.jsx';
import RouteGroups from './home/RouteGroups.jsx';
import WhySection from './home/WhySection.jsx';
import FleetSection from './home/FleetSection.jsx';
import TestimonialsSection from './home/TestimonialsSection.jsx';
import PartnerSection from './home/PartnerSection.jsx';
import HomeFooter from './home/HomeFooter.jsx';
import VideoDialog from './home/VideoDialog.jsx';
import homeCss from '../styles/home.css?raw';

const NAV_FALLBACK_HEIGHT = 72;
const SAFE_GAP = 18;

export default function Home() {
  const { user, logout } = useAuth();
  const bookingRef = useRef(null);
  const [videoOpen, setVideoOpen] = useState(false);

  // Re-scan reveal targets once async sections have rendered their content.
  const { data: vehicles } = useVehiclesQuery();
  const { data: feedback } = useFeedbackQuery();
  useReveal([vehicles?.length, feedback?.length]);

  /** Scrolls the booking widget fully into view, but only when it is not already. */
  const openBooking = useCallback(() => {
    const booking = bookingRef.current?.element;
    if (!booking) return;
    const navHeight = document.getElementById('nav')?.getBoundingClientRect().height || NAV_FALLBACK_HEIGHT;
    const safeTop = navHeight + SAFE_GAP;
    const bounds = booking.getBoundingClientRect();
    if (bounds.top >= safeTop && bounds.bottom <= window.innerHeight - SAFE_GAP) return;
    window.scrollTo({ top: Math.max(0, window.scrollY + bounds.top - safeTop), behavior: 'smooth' });
  }, []);

  /** A route chip fills the widget's destination, then scrolls it into view. */
  const chooseRoute = useCallback(route => {
    bookingRef.current?.setDestination(route);
    openBooking();
  }, [openBooking]);

  const signOut = useCallback(async () => {
    await logout();
    window.location.assign('/');
  }, [logout]);

  return <>
    <DesignStyles css={homeCss} page="home" />
    <HomeNav user={user} onLogout={signOut} onPlanJourney={openBooking} />
    <HomeHero
      booking={<BookingWidget ref={bookingRef} />}
      onBookDriver={openBooking}
      onSeeHowItWorks={() => setVideoOpen(true)}
    />
    <RouteGroups onChooseRoute={chooseRoute} />
    <WhySection onBook={openBooking} />
    <FleetSection onSelectVehicle={openBooking} />
    <TestimonialsSection />
    <PartnerSection />
    <HomeFooter />
    <VideoDialog open={videoOpen} onClose={() => setVideoOpen(false)} onPlanJourney={openBooking} />
    <Floats labelled whatsappMessage="Hello WonderTravel, I need help planning a journey." />
  </>;
}
