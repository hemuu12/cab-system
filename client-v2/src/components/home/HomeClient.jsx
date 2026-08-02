'use client';

import { useCallback, useRef, useState } from 'react';
import { useFeedbackQuery, useVehiclesQuery } from '../../store/api/catalogApi.js';
import { useAuth } from '../../hooks/useAuth.js';
import { useReveal } from '../../hooks/useReveal.js';
import DesignStyles from '../design/DesignStyles.jsx';
import Floats from '../design/Floats.jsx';
import HomeNav from './HomeNav.jsx';
import HomeHero from './HomeHero.jsx';
import BookingWidget from './BookingWidget.jsx';
import RouteGroups from './RouteGroups.jsx';
import JourneyGuideSection from './JourneyGuideSection.jsx';
import WhySection from './WhySection.jsx';
import FleetSection from './FleetSection.jsx';
import TravelHelpSection from './TravelHelpSection.jsx';
import TestimonialsSection from './TestimonialsSection.jsx';
import PartnerSection from './PartnerSection.jsx';
import HomeFooter from './HomeFooter.jsx';
import PopularRouteLinks from './PopularRouteLinks.jsx';
import TravelKnowledgeSection from './TravelKnowledgeSection.jsx';
import VideoDialog from './VideoDialog.jsx';
import { smoothLogout } from '../../lib/smoothLogout.js';

const NAV_FALLBACK_HEIGHT = 72;
const SAFE_GAP = 18;

export default function HomeClient({ homeCss }) {
  const { user, logout } = useAuth();
  const bookingRef = useRef(null);
  const [videoOpen, setVideoOpen] = useState(false);

  // Re-scan reveal targets once async sections have rendered their content.
  const { data: vehicles } = useVehiclesQuery();
  const { data: feedback } = useFeedbackQuery();
  useReveal([vehicles?.length, feedback?.reviews?.length]);

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
    await smoothLogout(logout);
  }, [logout]);

  return <>
    <DesignStyles css={homeCss} page="home" />
    <HomeNav user={user} onLogout={signOut} onPlanJourney={openBooking} />
    <HomeHero
      booking={<BookingWidget ref={bookingRef} />}
      onBookDriver={openBooking}
      onSeeHowItWorks={() => setVideoOpen(true)}
      verifiedReviewCount={feedback?.verifiedCount}
    />
    <JourneyGuideSection onPlanJourney={openBooking} />
    <RouteGroups onChooseRoute={chooseRoute} />
    <WhySection onBook={openBooking} />
    <FleetSection onSelectVehicle={openBooking} />
    <TravelHelpSection onPlanJourney={openBooking} />
    <TestimonialsSection />
    <PartnerSection />
    <TravelKnowledgeSection />
    <PopularRouteLinks />
    <HomeFooter />
    <VideoDialog open={videoOpen} onClose={() => setVideoOpen(false)} onPlanJourney={openBooking} />
    <Floats labelled whatsappMessage="Hello WonderTravel, I need help planning a journey." />
  </>;
}
