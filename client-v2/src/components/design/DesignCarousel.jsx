import { useEffect, useMemo, useRef, useState } from 'react';

/**
 * Vehicle image carousel using the design's own `.vehicle-carousel` classes.
 * Auto-advances every 4.2s and pauses on hover, focus or touch — same timings
 * as the original script.
 */
export default function DesignCarousel({ images = [], name = 'Vehicle' }) {
  const slides = useMemo(() => images.filter(image => image?.url), [images]);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const containerRef = useRef(null);
  const hasMultiple = slides.length > 1;

  useEffect(() => setActive(0), [slides.length]);
  useEffect(() => {
    if (!hasMultiple || paused) return undefined;
    const timer = window.setInterval(() => setActive(index => (index + 1) % slides.length), 4200);
    return () => window.clearInterval(timer);
  }, [hasMultiple, paused, slides.length]);

  if (!slides.length) return null;

  const show = index => setActive((index + slides.length) % slides.length);

  return (
    <div
      ref={containerRef}
      className="vehicle-carousel"
      aria-label={`${name} image gallery`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={event => {
        if (!containerRef.current?.contains(event.relatedTarget)) setPaused(false);
      }}
      onTouchStart={() => setPaused(true)}
      onTouchEnd={() => setPaused(false)}
    >
      <div className="vehicle-carousel-track">
        {slides.map((image, index) => (
          <img
            key={image.publicId || image.url}
            className={`vehicle-carousel-slide${index === active ? ' active' : ''}`}
            src={image.url}
            alt={image.alt || `${name} view ${index + 1}`}
            loading={index === 0 ? 'eager' : 'lazy'}
          />
        ))}
      </div>
      {hasMultiple && <>
        <button type="button" className="vehicle-carousel-arrow previous" aria-label="Previous vehicle image" onClick={() => show(active - 1)}>‹</button>
        <button type="button" className="vehicle-carousel-arrow next" aria-label="Next vehicle image" onClick={() => show(active + 1)}>›</button>
        <div className="vehicle-carousel-dots">
          {slides.map((image, index) => (
            <button
              key={image.publicId || image.url}
              type="button"
              className={`vehicle-carousel-dot${index === active ? ' active' : ''}`}
              aria-label={`Show image ${index + 1}`}
              onClick={() => show(index)}
            />
          ))}
        </div>
      </>}
    </div>
  );
}
