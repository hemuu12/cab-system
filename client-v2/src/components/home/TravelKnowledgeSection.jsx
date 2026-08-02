'use client';

import { ArrowRight, BadgeIndianRupee, Map, Mountain } from 'lucide-react';
import Link from 'next/link';

export default function TravelKnowledgeSection() {
  return <section className="home-travel-knowledge" aria-labelledby="travel-knowledge-title">
    <div className="home-knowledge-intro">
      <span className="eyebrow">Plan with clarity</span>
      <h2 id="travel-knowledge-title">Useful answers before your intercity journey begins.</h2>
      <p>WonderTravel supports one-way, round-trip and multi-day cab journeys across India. Our travel guides explain the choices that affect comfort, timing and the final fare—with extra attention to Uttarakhand, where we are based.</p>
    </div>
    <div className="home-knowledge-grid">
      <Link href="/intercity-cab-guide"><Map /><span><small>Complete guide</small><strong>How intercity cab booking works</strong><em>Trip formats, vehicle choice and a booking checklist</em></span><ArrowRight /></Link>
      <Link href="/uttarakhand-cabs"><Mountain /><span><small>Our home ground</small><strong>Uttarakhand cab services</strong><em>Hill stations, city transfers and pilgrimage roadheads</em></span><ArrowRight /></Link>
      <Link href="/intercity-cab-guide#fare-breakdown"><BadgeIndianRupee /><span><small>Know the estimate</small><strong>What your cab fare includes</strong><em>Distance charge, allowance, taxes and road costs</em></span><ArrowRight /></Link>
    </div>
  </section>;
}
