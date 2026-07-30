import { useRef, useState } from 'react';
import { useCreateFeedbackMutation, useFeedbackQuery } from '../../store/api/catalogApi.js';
import { errorMessage } from '../../api/errors.js';
import { useToast } from '../../hooks/useToast.js';
import { IconStar } from '../../components/design/icons.jsx';
import { TESTIMONIALS } from './homeContent.js';

const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
const PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
const RATINGS = [1, 2, 3, 4, 5];

const Stars = ({ count = 5, label }) => (
  <div className="stars" aria-label={label}>
    {Array.from({ length: count }, (_, index) => <IconStar key={index} />)}
  </div>
);

/** A published guest review from the API, rendered in the design's quote card. */
function LiveQuote({ item }) {
  return <article className="quote feedback-live">
    <Stars count={item.rating} label={`${item.rating} out of 5 stars`} />
    {item.photo?.url && <img className="feedback-photo" src={item.photo.url} alt={item.photo.alt || `Photo shared by ${item.name}`} loading="lazy" />}
    <p>{item.message}</p>
    <div className="who">
      <div className="av">{(item.name || 'G').trim().charAt(0).toUpperCase()}</div>
      <div>
        <div className="nm">{item.name}</div>
        <div className="rl">{item.tripLabel || item.city || 'WonderTravel guest'}</div>
      </div>
    </div>
  </article>;
}

export default function TestimonialsSection() {
  const toast = useToast();
  const { data: published = [] } = useFeedbackQuery();
  const [createFeedback, { isLoading: saving }] = useCreateFeedbackMutation();
  const formRef = useRef(null);
  const startedAtRef = useRef(Date.now());
  const [status, setStatus] = useState({ tone: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  // Newest published reviews lead the grid, ahead of the design's static quotes.
  const liveQuotes = published.slice(0, 6).slice().reverse();

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
      startedAtRef.current = Date.now();
      toast.success(result.message, 'Thank you for sharing');
      window.setTimeout(() => setSubmitted(false), 1800);
    } catch (requestError) {
      setStatus({ tone: 'error', message: errorMessage(requestError, 'Unable to save feedback') });
    }
  };

  const buttonLabel = saving ? 'Saving feedback…' : submitted ? 'Feedback received' : status.tone === 'error' ? 'Try again' : 'Send feedback';

  return <section className="testi pad" id="testi">
    <div className="wrap">
      <div className="sec-head reveal">
        <span className="eyebrow">Guest stories</span>
        <h2>Trusted from pickup to <span className="it">drop-off</span></h2>
        <p>Real experiences from guests travelling across India.</p>
      </div>
      <div className="testi-grid">
        {liveQuotes.map(item => <LiveQuote key={item._id || item.id} item={item} />)}
        {TESTIMONIALS.map(([name, role, quote]) => (
          <div className="quote reveal" key={name}>
            <Stars />
            <p>{quote}</p>
            <div className="who">
              <div className="av">{name.charAt(0)}</div>
              <div><div className="nm">{name}</div><div className="rl">{role}</div></div>
            </div>
          </div>
        ))}
      </div>
      <div className="feedback-panel reveal">
        <div className="feedback-intro">
          <span className="eyebrow">Share your experience</span>
          <h3>Help the next guest travel with confidence.</h3>
          <p>Your feedback is saved securely and reviewed by our team before it appears in Guest stories.</p>
        </div>
        <form className="feedback-form" ref={formRef} onSubmit={submit}>
          <label>Your name<input name="name" autoComplete="name" maxLength={80} required /></label>
          <label>Email <small>(never published)</small><input name="email" type="email" autoComplete="email" maxLength={120} /></label>
          <label>City<input name="city" autoComplete="address-level2" maxLength={80} /></label>
          <label>Journey or route<input name="tripLabel" maxLength={120} placeholder="Delhi to Rishikesh" /></label>
          <fieldset className="feedback-rating"><legend>Your rating</legend>
            {RATINGS.map(rating => (
              <label key={rating}><input type="radio" name="rating" value={rating} required={rating === 1} /><span>{rating} ★</span></label>
            ))}
          </fieldset>
          <label className="feedback-photo-field">Journey photo <small>Optional · JPG, PNG, WebP or AVIF · maximum 5 MB</small><input name="photo" type="file" accept="image/jpeg,image/png,image/webp,image/avif" /></label>
          <label className="feedback-message">Your feedback<textarea name="message" minLength={15} maxLength={800} required placeholder="Tell us what made your journey memorable…" /></label>
          <label className="feedback-consent"><input type="checkbox" name="consentToPublish" required /> I allow WonderTravel to publish my name, rating and review after moderation. My email will remain private.</label>
          <label className="feedback-hp" aria-hidden="true">Website<input name="website" tabIndex={-1} autoComplete="off" /></label>
          <p className={`feedback-status${status.tone ? ` ${status.tone}` : ''}`} aria-live="polite">{status.message}</p>
          <button className="btn btn-gold" type="submit" disabled={saving}>{buttonLabel}</button>
        </form>
      </div>
    </div>
  </section>;
}
