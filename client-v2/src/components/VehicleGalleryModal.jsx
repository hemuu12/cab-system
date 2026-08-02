'use client';

import { createPortal } from 'react-dom';
import { useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { optimizedImageUrl, responsiveImageSet } from '../lib/images.js';

export default function VehicleGalleryModal({ images, name, active, onChange, onClose }) {
  const touchStart = useRef(null);
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKeyDown = event => {
      if (event.key === 'Escape') onClose();
      if (event.key === 'ArrowLeft') onChange((active - 1 + images.length) % images.length);
      if (event.key === 'ArrowRight') onChange((active + 1) % images.length);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [active, images.length, onChange, onClose]);

  if (!images.length || typeof document === 'undefined') return null;
  const show = index => onChange((index + images.length) % images.length);
  const current = images[active];

  return createPortal(
    <div className="vehicle-gallery-backdrop" role="presentation" onMouseDown={event => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <section className="vehicle-gallery-dialog" role="dialog" aria-modal="true" aria-label={`${name} image gallery`}>
        <header>
          <div>
            <strong>{name}</strong>
            <span>Image {active + 1} of {images.length}</span>
          </div>
          <button type="button" onClick={onClose} aria-label="Close image gallery"><X /></button>
        </header>
        <div
          className="vehicle-gallery-stage"
          onTouchStart={event => { touchStart.current = event.changedTouches[0]?.clientX ?? null; }}
          onTouchEnd={event => {
            const end = event.changedTouches[0]?.clientX;
            if (touchStart.current === null || end === undefined) return;
            const distance = end - touchStart.current;
            touchStart.current = null;
            if (Math.abs(distance) < 45 || images.length < 2) return;
            show(active + (distance < 0 ? 1 : -1));
          }}
        >
          <img src={optimizedImageUrl(current.url, 1600)} srcSet={responsiveImageSet(current.url, [640, 960, 1280, 1600])} sizes="100vw" alt={current.alt || `${name} view ${active + 1}`} decoding="async" />
          {images.length > 1 && <>
            <button type="button" className="vehicle-gallery-arrow previous" onClick={() => show(active - 1)} aria-label="Previous image"><ChevronLeft /></button>
            <button type="button" className="vehicle-gallery-arrow next" onClick={() => show(active + 1)} aria-label="Next image"><ChevronRight /></button>
          </>}
        </div>
        {images.length > 1 && <div className="vehicle-gallery-thumbs" aria-label="Choose an image">
          {images.map((image, index) => (
            <button type="button" className={index === active ? 'active' : ''} onClick={() => show(index)} key={image.publicId || image.url} aria-label={`Show image ${index + 1}`}>
              <img src={optimizedImageUrl(image.url, 160)} alt="" loading="lazy" decoding="async" />
            </button>
          ))}
        </div>}
      </section>
    </div>,
    document.body
  );
}
