import { useVehiclesQuery } from '../../store/api/catalogApi.js';
import DesignCarousel from '../../components/design/DesignCarousel.jsx';
import { IconArrowRightPlain, IconSeat } from '../../components/design/icons.jsx';
import { FLEET_FALLBACK } from './homeContent.js';

/** The four illustrated cars from the design, shown until a vehicle has photos. */
const CAR_ART = [
  <svg viewBox="0 0 200 90" xmlns="http://www.w3.org/2000/svg" key="executive"><path d="M18 62c-5 0-8-3-8-8 0-4 3-6 7-7l14-3c8-7 18-13 30-15 16-3 40-3 56 4 8 3 20 8 32 10 12 2 18 5 18 12 0 5-3 7-8 7z" fill="#1A1A1A"/><path d="M52 34c10-6 22-9 34-9 12 0 24 2 34 7l-6 8H58z" fill="#3A3A3A"/><circle cx="52" cy="62" r="13" fill="#0C0C0C"/><circle cx="52" cy="62" r="6" fill="#555"/><circle cx="150" cy="62" r="13" fill="#0C0C0C"/><circle cx="150" cy="62" r="6" fill="#555"/></svg>,
  <svg viewBox="0 0 200 90" xmlns="http://www.w3.org/2000/svg" key="tempo"><path d="M20 66c-6 0-9-4-9-9V34c0-6 4-10 12-11l40-4c30-2 62-1 90 3 8 1 12 5 12 12v20c0 5-3 9-9 9z" fill="#F0EEEA"/><path d="M28 30h120v20H28z" fill="#8FB8D4" opacity=".85"/><path d="M40 30v20M64 30v20M88 30v20M112 30v20M136 30v20" stroke="#5E7E93" strokeWidth="2"/><circle cx="54" cy="66" r="13" fill="#111"/><circle cx="54" cy="66" r="6" fill="#666"/><circle cx="150" cy="66" r="13" fill="#111"/><circle cx="150" cy="66" r="6" fill="#666"/></svg>,
  <svg viewBox="0 0 200 90" xmlns="http://www.w3.org/2000/svg" key="sedan"><path d="M16 64c-5 0-7-3-7-7 0-4 3-6 8-7l12-2c9-8 20-14 33-16 15-2 35-1 50 5 7 3 17 7 28 9 11 2 17 5 17 11 0 4-3 7-8 7z" fill="#F4F3F0"/><path d="M50 34c9-6 20-9 32-9 11 0 22 2 31 7l-5 8H55z" fill="#B9D2E4" opacity=".9"/><circle cx="52" cy="64" r="13" fill="#111"/><circle cx="52" cy="64" r="6" fill="#666"/><circle cx="148" cy="64" r="13" fill="#111"/><circle cx="148" cy="64" r="6" fill="#666"/></svg>,
  <svg viewBox="0 0 200 90" xmlns="http://www.w3.org/2000/svg" key="suv"><path d="M16 64c-5 0-7-3-7-7 0-4 3-6 8-7l11-2c9-9 21-15 35-17 16-2 37-1 52 5 7 3 15 7 26 9 11 2 17 5 17 11 0 4-3 7-8 7z" fill="#EFEEEB"/><path d="M46 33c11-7 24-10 37-10 12 0 23 3 32 8l-4 9H50z" fill="#C7DCEC" opacity=".9"/><circle cx="54" cy="64" r="13" fill="#111"/><circle cx="54" cy="64" r="6" fill="#666"/><circle cx="150" cy="64" r="13" fill="#111"/><circle cx="150" cy="64" r="6" fill="#666"/></svg>
];

export default function FleetSection({ onSelectVehicle }) {
  const { data: vehicles = [] } = useVehiclesQuery();

  // Real vehicles replace the placeholder copy slot-for-slot, as in the design.
  const cards = FLEET_FALLBACK.map((fallback, index) => {
    const vehicle = vehicles[index];
    if (!vehicle) return { ...fallback, images: [] };
    return {
      tier: vehicle.category || fallback.tier,
      name: vehicle.name,
      seats: vehicle.seats ?? fallback.seats,
      description: vehicle.description || `${vehicle.seats}-seater ${vehicle.category} for comfortable journeys.`,
      price: fallback.price,
      images: vehicle.images || []
    };
  });

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
              <span className="car-tier">{card.tier}</span>
              {card.images?.length ? <DesignCarousel images={card.images} name={card.name} /> : CAR_ART[index]}
            </div>
            <div className="car-body">
              <div className="car-spec">
                <span className="chip"><IconSeat />{card.seats}</span>
                <span className="chip">A/C</span>
                <span className="chip">Push-back</span>
              </div>
              <h3>{card.name}</h3><p>{card.description}</p>
              <div className="car-foot">
                <div className="car-price">
                  <div className="p-l">Starting at</div>
                  <div className="p-v">{card.price}<span>/km</span></div>
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
