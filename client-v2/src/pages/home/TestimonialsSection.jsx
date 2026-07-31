import { useEffect, useRef, useState } from 'react';
import { useCreateFeedbackMutation, useFeedbackQuery } from '../../store/api/catalogApi.js';
import { errorMessage } from '../../api/errors.js';
import { useToast } from '../../hooks/useToast.js';
import { IconStar } from '../../components/design/icons.jsx';
import { ChevronLeft, ChevronRight, Eye, Mail, Quote, ShieldCheck } from 'lucide-react';
import VehicleGalleryModal from '../../components/VehicleGalleryModal.jsx';
import { TESTIMONIALS } from './homeContent.js';
import { optimizedImageUrl, responsiveImageSet } from '../../lib/images.js';

const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
const PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
const RATINGS = [
  { value: 1, label: 'Poor' },
  { value: 2, label: 'Fair' },
  { value: 3, label: 'Satisfied' },
  { value: 4, label: 'Very satisfied' },
  { value: 5, label: 'Excellent' }
];

const Stars = ({ count = 5, label }) => (
  <div className="stars" aria-label={label}>
    {Array.from({ length: count }, (_, index) => <IconStar key={index} />)}
  </div>
);

/** A published guest review from the API, rendered in the design's quote card. */
function LiveQuote({ item, index }) {
  const [photoOpen, setPhotoOpen] = useState(false);
  const photo = item.photo?.url ? item.photo : null;

  return <>
    <article className={`quote feedback-live${index === 0 ? ' is-featured' : ''}${photo ? ' has-photo' : ''}`}>
      {photo && <button className="feedback-photo" type="button" onClick={() => setPhotoOpen(true)} aria-label={`Open photo shared by ${item.name}`}>
        <img src={optimizedImageUrl(photo.url, 960)} srcSet={responsiveImageSet(photo.url)} sizes="(max-width: 860px) 100vw, 45vw" alt={photo.alt || `Photo shared by ${item.name}`} loading="lazy" decoding="async" />
        <span><Eye /> View journey photo</span>
      </button>}
      <div className="feedback-quote-content">
        <div className="feedback-quote-top">
          <Stars count={item.rating} label={`${item.rating} out of 5 stars`} />
          <Quote />
        </div>
        {item.message && <p>{item.message}</p>}
        <div className="who">
          <div className="av">{(item.name || 'G').trim().charAt(0).toUpperCase()}</div>
          <div>
            <div className="nm">{item.name}</div>
            <div className="rl">{item.tripLabel || item.city || 'WonderTravel guest'}</div>
          </div>
        </div>
      </div>
    </article>
    {photoOpen && <VehicleGalleryModal images={[photo]} name={`${item.name}'s journey`} active={0} onChange={() => {}} onClose={() => setPhotoOpen(false)} />}
  </>;
}

const ReviewStandards = () => <aside className="feedback-standards reveal">
  <span className="eyebrow">How publishing works</span>
  <h3>Stories with context, not anonymous claims.</h3>
  <div><ShieldCheck /><p><strong>Guest permission</strong><small>A review is submitted with consent to publish.</small></p></div>
  <div><Eye /><p><strong>Team review</strong><small>Feedback appears only after moderation.</small></p></div>
  <div><Mail /><p><strong>Private contact</strong><small>The guest email is never shown publicly.</small></p></div>
</aside>;

export default function TestimonialsSection() {
  const toast = useToast();
  const { data: published = [] } = useFeedbackQuery();
  const [createFeedback, { isLoading: saving }] = useCreateFeedbackMutation();
  const formRef = useRef(null);
  const startedAtRef = useRef(Date.now());
  const [status, setStatus] = useState({ tone: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [selectedRating, setSelectedRating] = useState(0);
  const [wallPage, setWallPage] = useState(0);
  const [wallPaused, setWallPaused] = useState(false);
  const [pageSize, setPageSize] = useState(() => typeof window !== 'undefined' && window.innerWidth <= 860 ? 2 : 6);

  // Only reviews approved through the feedback workflow are published.
  const liveQuotes = published.slice(0, 100);
  const originalTestimonials = TESTIMONIALS.map(([name, role, message], index) => ({
    id: `testimonial-${index}`,
    name,
    rating: 5,
    tripLabel: role,
    message
  }));
  // Newly approved reviews lead; original testimonials fill the remaining wall.
  const wallQuotes = [...liveQuotes, ...originalTestimonials].slice(0, 100);
  const totalPages = Math.max(1, Math.ceil(wallQuotes.length / pageSize));
  const visibleQuotes = wallQuotes.slice(wallPage * pageSize, wallPage * pageSize + pageSize);
  const rangeStart = wallQuotes.length ? wallPage * pageSize + 1 : 0;
  const rangeEnd = Math.min((wallPage + 1) * pageSize, wallQuotes.length);

  useEffect(() => {
    const media = window.matchMedia('(max-width: 860px)');
    const syncPageSize = () => setPageSize(media.matches ? 2 : 6);
    syncPageSize();
    media.addEventListener('change', syncPageSize);
    return () => media.removeEventListener('change', syncPageSize);
  }, []);

  useEffect(() => {
    setWallPage(current => Math.min(current, totalPages - 1));
  }, [totalPages]);

  useEffect(() => {
    if (wallPaused || totalPages <= 1 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const timer = window.setInterval(() => setWallPage(current => (current + 1) % totalPages), 8000);
    return () => window.clearInterval(timer);
  }, [totalPages, wallPaused]);

  const moveWall = direction => setWallPage(current => (current + direction + totalPages) % totalPages);

  const submit = async event => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const photo = formData.get('photo');

    if (photo?.size > MAX_PHOTO_BYTES) {
      setStatus({ tone: 'error', message: 'Choose a photo smaller than 5 MB.' });
      return;
    }
    if (photo?.size && !PHOTO_TYPES.includes(photo.type)) {
      setStatus({ tone: 'error', message: 'Choose a JPG, PNG, WebP or AVIF image.' });
      return;
    }

    formData.set('consentToPublish', String(formData.has('consentToPublish')));
    formData.set('startedAt', String(startedAtRef.current));
    setStatus({ tone: '', message: '' });

    try {
      const result = await createFeedback(formData).unwrap();
      setStatus({ tone: 'success', message: result.message });
      setSubmitted(true);
      form.reset();
      setSelectedRating(0);
      startedAtRef.current = Date.now();
      toast.success(result.message, 'Thank you for sharing');
      window.setTimeout(() => setSubmitted(false), 1800);
    } catch (requestError) {
      setStatus({ tone: 'error', message: errorMessage(requestError, 'Unable to save feedback') });
    }
  };

  const buttonLabel = saving ? 'Saving feedback…' : submitted ? 'Feedback received' : status.tone === 'error' ? 'Try again' : 'Send feedback';

  return <section className="testi pad" id="testi">
    <svg className="testi-route-art" viewBox="0 0 1200 540" preserveAspectRatio="none" aria-hidden="true">
      <path d="M-40 410C170 250 270 490 455 305S760 85 1240 210" />
      <circle cx="455" cy="305" r="6" />
      <circle cx="930" cy="150" r="6" />
    </svg>
    <div className="wrap">
      <div className="sec-head testi-head reveal">
        <div><span className="eyebrow">Guest feedback</span>
          <h2>Stories from the <span className="it">road</span></h2>
        </div>
        <p>Every journey leaves a story. Discover the moments, routes and experiences our guests chose to share from the road.</p>
      </div>
      <div className="feedback-wall" onMouseEnter={() => setWallPaused(true)} onMouseLeave={() => setWallPaused(false)} onFocusCapture={() => setWallPaused(true)} onBlurCapture={event => {
        if (!event.currentTarget.contains(event.relatedTarget)) setWallPaused(false);
      }}>
        <div className="feedback-wall-toolbar">
          <p>Showing {rangeStart}–{rangeEnd} of {wallQuotes.length}</p>
          <div className="feedback-wall-controls">
            <button type="button" onClick={() => moveWall(-1)} disabled={totalPages <= 1} aria-label="Previous reviews"><ChevronLeft /></button>
            <span>{wallPage + 1} / {totalPages}</span>
            <button type="button" onClick={() => moveWall(1)} disabled={totalPages <= 1} aria-label="Next reviews"><ChevronRight /></button>
          </div>
        </div>
        <div className="feedback-wall-stage" aria-label={`Showing reviews ${rangeStart} to ${rangeEnd}`}>
          <div className={`testi-grid feedback-count-${Math.min(wallQuotes.length, 6)}`}>
            {visibleQuotes.map((item, index) => <LiveQuote key={item._id || item.id} item={item} index={index} />)}
            {wallQuotes.length < 3 && <ReviewStandards />}
          </div>
        </div>
      </div>
      <div className="feedback-panel reveal">
        <div className="feedback-intro">
          <span className="eyebrow">Share your experience</span>
          <h3>Add your journey to the wall.</h3>
          <p>Tell future guests what was useful. Add an optional travel photo to make the story more visual.</p>
          <div className="feedback-intro-tags"><span>Consent-led</span><span>Moderated</span><span>Photo optional</span></div>
        </div>
        <form className="feedback-form" ref={formRef} onSubmit={submit}>
          <label>Your name<input name="name" autoComplete="name" maxLength={80} required /></label>
          <label>Email <small>(never published)</small><input name="email" type="email" autoComplete="email" maxLength={120} /></label>
          <label>City<input name="city" autoComplete="address-level2" maxLength={80} /></label>
          <label>Journey or route<input name="tripLabel" maxLength={120} placeholder="Dehradun to Rishikesh" /></label>
          <fieldset className="feedback-rating">
            <legend>Rate your journey</legend>
            <div className="feedback-rating-head"><span>Rate your journey</span><small>Choose the option that best matches your experience</small></div>
            <div className="feedback-rating-options">
              {RATINGS.map(({ value, label }) => (
                <label key={value}>
                  <input type="radio" name="rating" value={value} required={value === 1} onChange={() => setSelectedRating(value)} />
                  <span><IconStar /><b>{label}</b><small>{value}/5</small></span>
                </label>
              ))}
            </div>
            <p className={`feedback-rating-selection${selectedRating ? ' selected' : ''}`}>
              {selectedRating ? RATINGS[selectedRating - 1].label : 'Choose your rating'}
            </p>
          </fieldset>
          <label className="feedback-photo-field">Journey photo <small>Optional · JPG, PNG, WebP or AVIF · maximum 5 MB</small><input name="photo" type="file" accept="image/jpeg,image/png,image/webp,image/avif" /></label>
          <label className="feedback-message">Your feedback <small>(optional)</small><textarea name="message" maxLength={800} placeholder="Add a quick note, or simply submit your rating…" /></label>
          <label className="feedback-consent"><input type="checkbox" name="consentToPublish" required /> I allow WonderTravel to publish my name, rating and review after moderation. My email will remain private.</label>
          <label className="feedback-hp" aria-hidden="true">Website<input name="website" tabIndex={-1} autoComplete="off" /></label>
          <div className="feedback-submit-row">
            <p className={`feedback-status${status.tone ? ` ${status.tone}` : ''}`} aria-live="polite">{status.message}</p>
            <button className="btn btn-gold" type="submit" disabled={saving}>{buttonLabel}</button>
          </div>
        </form>
      </div>
    </div>
  </section>;
}
