import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

export default function VehicleImageCarousel({ images = [], name = 'Vehicle', className = '' }) {
  const slides = useMemo(() => images.filter(image => image?.url), [images]);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const hasMultiple = slides.length > 1;

  useEffect(() => setActive(0), [slides.length]);
  useEffect(() => {
    if (!hasMultiple || paused) return undefined;
    const timer = window.setInterval(() => setActive(index => (index + 1) % slides.length), 4200);
    return () => window.clearInterval(timer);
  }, [hasMultiple, paused, slides.length]);

  if (!slides.length) return null;

  const move = direction => setActive(index => (index + direction + slides.length) % slides.length);

  return (
    <div
      className={`vehicle-image-carousel ${className}`.trim()}
      aria-label={`${name} image gallery`}
      aria-roledescription="carousel"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={event => {
        if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false);
      }}
      onTouchStart={() => setPaused(true)}
      onTouchEnd={() => setPaused(false)}
    >
      <div className="vehicle-carousel-track">
        {slides.map((image, index) => (
          <img
            key={image.publicId || image.url}
            className={index === active ? 'active' : ''}
            src={image.url}
            alt={image.alt || `${name} view ${index + 1}`}
            loading={index === 0 ? 'eager' : 'lazy'}
            aria-hidden={index !== active}
          />
        ))}
      </div>
      {hasMultiple && <>
        <button className="vehicle-carousel-arrow previous" type="button" aria-label="Previous vehicle image" onClick={() => move(-1)}><ChevronLeft /></button>
        <button className="vehicle-carousel-arrow next" type="button" aria-label="Next vehicle image" onClick={() => move(1)}><ChevronRight /></button>
        <div className="vehicle-carousel-dots" aria-label={`Image ${active + 1} of ${slides.length}`}>
          {slides.map((image, index) => (
            <button key={image.publicId || image.url} className={index === active ? 'active' : ''} type="button" aria-label={`Show image ${index + 1}`} onClick={() => setActive(index)} />
          ))}
        </div>
      </>}
    </div>
  );
}
