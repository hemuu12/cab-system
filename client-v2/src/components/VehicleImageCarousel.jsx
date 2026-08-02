'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import VehicleGalleryModal from './VehicleGalleryModal.jsx';
import { optimizedImageUrl, responsiveImageSet } from '../lib/images.js';

export default function VehicleImageCarousel({ images = [], name = 'Vehicle', className = '', priority = false }) {
  const slides = useMemo(() => images.filter(image => image?.url), [images]);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [viewerOpen, setViewerOpen] = useState(false);
  const hasMultiple = slides.length > 1;

  useEffect(() => setActive(0), [slides.length]);
  useEffect(() => {
    if (!hasMultiple || paused) return undefined;
    const timer = window.setInterval(() => setActive(index => (index + 1) % slides.length), 4200);
    return () => window.clearInterval(timer);
  }, [hasMultiple, paused, slides.length]);

  if (!slides.length) return null;

  const move = direction => setActive(index => (index + direction + slides.length) % slides.length);

  return <>
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
            src={optimizedImageUrl(image.url, 960)}
            srcSet={responsiveImageSet(image.url)}
            sizes="(max-width: 680px) 100vw, 50vw"
            alt={image.alt || `${name} view ${index + 1}`}
            loading={priority && index === 0 ? 'eager' : 'lazy'}
            fetchPriority={priority && index === 0 ? 'high' : 'auto'}
            decoding="async"
            aria-hidden={index !== active}
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
        <button className="vehicle-carousel-arrow previous" type="button" aria-label="Previous vehicle image" onClick={() => move(-1)}><ChevronLeft /></button>
        <button className="vehicle-carousel-arrow next" type="button" aria-label="Next vehicle image" onClick={() => move(1)}><ChevronRight /></button>
        <div className="vehicle-carousel-dots" aria-label={`Image ${active + 1} of ${slides.length}`}>
          {slides.map((image, index) => (
            <button key={image.publicId || image.url} className={index === active ? 'active' : ''} type="button" aria-label={`Show image ${index + 1}`} onClick={() => setActive(index)} />
          ))}
        </div>
      </>}
    </div>
    {viewerOpen && <VehicleGalleryModal images={slides} name={name} active={active} onChange={setActive} onClose={() => setViewerOpen(false)} />}
  </>;
}
