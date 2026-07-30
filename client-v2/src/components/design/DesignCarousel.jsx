import { useEffect, useMemo, useRef, useState } from 'react';
import VehicleGalleryModal from '../VehicleGalleryModal.jsx';
import { optimizedImageUrl, responsiveImageSet } from '../../lib/images.js';

/**
 * Vehicle image carousel using the design's own `.vehicle-carousel` classes.
 * Auto-advances every 4.2s and pauses on hover, focus or touch — same timings
 * as the original script.
 */
export default function DesignCarousel({ images = [], name = 'Vehicle', priority = false, sizes = '(max-width: 860px) 100vw, 40vw' }) {
  const slides = useMemo(() => images.filter(image => image?.url), [images]);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [viewerOpen, setViewerOpen] = useState(false);
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

  return <>
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
            src={optimizedImageUrl(image.url, 960)}
            srcSet={responsiveImageSet(image.url)}
            sizes={sizes}
            alt={image.alt || `${name} view ${index + 1}`}
            loading={priority && index === 0 ? 'eager' : 'lazy'}
            fetchPriority={priority && index === 0 ? 'high' : 'auto'}
            decoding="async"
            role="button"
            tabIndex={index === active ? 0 : -1}
            aria-label={`Open ${name} image gallery`}
            onClick={() => setViewerOpen(true)}
            onKeyDown={event => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                setViewerOpen(true);
              }
            }}
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
    {viewerOpen && <VehicleGalleryModal images={slides} name={name} active={active} onChange={setActive} onClose={() => setViewerOpen(false)} />}
  </>;
}
