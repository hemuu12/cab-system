'use client';

import { useVehiclesQuery } from '../../store/api/catalogApi.js';
import DesignCarousel from '../design/DesignCarousel.jsx';
import { IconArrowRightPlain, IconSeat } from '../design/icons.jsx';
import { money } from '../../lib/format.js';

/** Real fleet snapshot used only when the API is temporarily unavailable. */
const FLEET_FALLBACK = [
  { name: 'Comfort Sedan', category: 'Sedan', seats: 5, luggage: 2, description: 'Quiet, refined travel for airport runs and couples.', features: ['Air conditioning', 'Music system'], fare: { total: 5009 }, images: [] },
  { name: 'SUV · Road Ready', category: 'SUV', seats: 7, luggage: 4, description: 'Confident comfort for highways, cities and varied regional roads.', features: ['Air conditioning', 'Rear AC'], fare: { total: 5670 }, images: [] },
  { name: 'Innova', category: 'Premium MPV', seats: 7, luggage: 4, description: 'Generous cabin space for families and longer journeys.', features: ['Extra legroom', 'Rear AC'], fare: { total: 6458 }, images: [] },
  { name: 'Innova Crysta', category: 'Luxury MPV', seats: 7, luggage: 4, description: 'Our most polished ride, made for effortless touring.', features: ['Captain seats', 'Rear AC'], fare: { total: 7140 }, images: [] },
  { name: 'Maruti Suzuki Dzire', category: 'Sedan', seats: 5, luggage: 2, description: 'A comfortable and fuel-efficient sedan for city rides, airport transfers and outstation journeys.', features: ['Air conditioning', 'Music system'], fare: { total: 4673 }, images: [] },
  { name: 'Renault Triber', category: 'MUV / MPV', seats: 7, luggage: 4, description: 'A flexible seven-seat family car with practical space for passengers and luggage.', features: ['Air conditioning', 'Rear AC'], fare: { total: 5460 }, images: [] }
];

/** Illustrated cars shown only until a vehicle has uploaded photos. */
const CAR_ART = [
  <svg viewBox="0 0 200 90" xmlns="http://www.w3.org/2000/svg" key="executive"><path d="M18 62c-5 0-8-3-8-8 0-4 3-6 7-7l14-3c8-7 18-13 30-15 16-3 40-3 56 4 8 3 20 8 32 10 12 2 18 5 18 12 0 5-3 7-8 7z" fill="#1A1A1A"/><path d="M52 34c10-6 22-9 34-9 12 0 24 2 34 7l-6 8H58z" fill="#3A3A3A"/><circle cx="52" cy="62" r="13" fill="#0C0C0C"/><circle cx="52" cy="62" r="6" fill="#555"/><circle cx="150" cy="62" r="13" fill="#0C0C0C"/><circle cx="150" cy="62" r="6" fill="#555"/></svg>,
  <svg viewBox="0 0 200 90" xmlns="http://www.w3.org/2000/svg" key="tempo"><path d="M20 66c-6 0-9-4-9-9V34c0-6 4-10 12-11l40-4c30-2 62-1 90 3 8 1 12 5 12 12v20c0 5-3 9-9 9z" fill="#F0EEEA"/><path d="M28 30h120v20H28z" fill="#8FB8D4" opacity=".85"/><path d="M40 30v20M64 30v20M88 30v20M112 30v20M136 30v20" stroke="#5E7E93" strokeWidth="2"/><circle cx="54" cy="66" r="13" fill="#111"/><circle cx="54" cy="66" r="6" fill="#666"/><circle cx="150" cy="66" r="13" fill="#111"/><circle cx="150" cy="66" r="6" fill="#666"/></svg>,
  <svg viewBox="0 0 200 90" xmlns="http://www.w3.org/2000/svg" key="sedan"><path d="M16 64c-5 0-7-3-7-7 0-4 3-6 8-7l12-2c9-8 20-14 33-16 15-2 35-1 50 5 7 3 17 7 28 9 11 2 17 5 17 11 0 4-3 7-8 7z" fill="#F4F3F0"/><path d="M50 34c9-6 20-9 32-9 11 0 22 2 31 7l-5 8H55z" fill="#B9D2E4" opacity=".9"/><circle cx="52" cy="64" r="13" fill="#111"/><circle cx="52" cy="64" r="6" fill="#666"/><circle cx="148" cy="64" r="13" fill="#111"/><circle cx="148" cy="64" r="6" fill="#666"/></svg>,
  <svg viewBox="0 0 200 90" xmlns="http://www.w3.org/2000/svg" key="suv"><path d="M16 64c-5 0-7-3-7-7 0-4 3-6 8-7l11-2c9-9 21-15 35-17 16-2 37-1 52 5 7 3 15 7 26 9 11 2 17 5 17 11 0 4-3 7-8 7z" fill="#EFEEEB"/><path d="M46 33c11-7 24-10 37-10 12 0 23 3 32 8l-4 9H50z" fill="#C7DCEC" opacity=".9"/><circle cx="54" cy="64" r="13" fill="#111"/><circle cx="54" cy="64" r="6" fill="#666"/><circle cx="150" cy="64" r="13" fill="#111"/><circle cx="150" cy="64" r="6" fill="#666"/></svg>
];

export default function FleetSection({ onSelectVehicle }) {
  const { data: vehicles = [] } = useVehiclesQuery();

  const cards = vehicles.length ? vehicles : FLEET_FALLBACK;

  return <section className="pad" id="fleet">
    <div className="wrap">
      <div className="sec-head reveal">
        <span className="eyebrow">Choose your vehicle</span>
        <h2>The right car for <span className="it">every journey</span></h2>
        <p>Clean, air-conditioned vehicles selected for comfort, luggage space and the road ahead.</p>
      </div>
      <div className="fleet-track">
        {cards.map((card, index) => (
          <div className="car reveal" key={`${card.name}-${index}`}>
            <div className="car-img">
              <span className="car-tier">{card.category}</span>
              {card.images?.length ? <DesignCarousel images={card.images} name={card.name} /> : CAR_ART[index % CAR_ART.length]}
            </div>
            <div className="car-body">
              <div className="car-spec">
                <span className="chip"><IconSeat />{card.seats} seats</span>
                <span className="chip">{card.luggage ?? (card.seats === 7 ? 4 : 2)} bags</span>
                <span className="chip">{card.features?.[0] || 'Air conditioning'}</span>
              </div>
              <h3>{card.name}</h3><p>{card.description}</p>
              <div className="car-foot">
                <div className="car-price">
                  <div className="p-l">Starting fare</div>
                  <div className="p-v">{money(card.fare?.total ?? card.totalFare)}<span>/trip</span></div>
                </div>
                <button className="car-go" type="button" aria-label={`Book the ${card.name}`} onClick={onSelectVehicle}><IconArrowRightPlain /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>;
}
