'use client';

import { useEffect, useRef, useState } from 'react';
import { useCreateInquiryMutation } from '../../store/api/catalogApi.js';
import { errorMessage } from '../../api/errors.js';
import { IconCalendar, IconCheck, IconPhone, IconPin, IconSend } from '../design/icons.jsx';

const EMPTY_FORM = { name: '', phone: '', pickup: '', drop: '', date: '' };

/**
 * A no-fare, no-verification enquiry form: name, phone, pickup, drop-off and
 * a date. Submitting saves the enquiry straight to the backend (Inquiries,
 * visible in admin) and emails the team — the customer never leaves the site
 * or opens WhatsApp. The dialog then shows a success screen with a reference
 * they can quote when we follow up.
 */
export default function QuickBookingDialog({ open, onClose }) {
  const dialogRef = useRef(null);
  const today = new Date().toISOString().split('T')[0];
  const [form, setForm] = useState(EMPTY_FORM);
  const [invalid, setInvalid] = useState({});
  const [reference, setReference] = useState('');
  const [error, setError] = useState('');
  const [createInquiry, { isLoading: sending }] = useCreateInquiryMutation();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    else if (!open && dialog.open) dialog.close();
  }, [open]);

  // Reset to a blank form only after the dialog has fully closed, so the
  // success screen doesn't flash back to the form while it fades out.
  const resetAfterClose = () => {
    setForm(EMPTY_FORM);
    setInvalid({});
    setReference('');
    setError('');
    onClose();
  };

  const field = (name, value) => {
    setForm(current => ({ ...current, [name]: value }));
    setInvalid(current => (current[name] ? { ...current, [name]: false } : current));
  };

  const openPicker = event => {
    const input = event.currentTarget.querySelector('input');
    if (!input || event.target === input) return;
    input.focus();
    input.showPicker?.();
  };

  const submit = async event => {
    event.preventDefault();
    const cleanName = form.name.trim();
    const cleanPhone = form.phone.trim();
    const cleanPickup = form.pickup.trim();
    const cleanDrop = form.drop.trim();
    const errors = {
      name: !cleanName,
      phone: !/^[+\d][\d\s()-]{6,19}$/.test(cleanPhone),
      pickup: !cleanPickup,
      drop: !cleanDrop,
      date: !form.date
    };
    setInvalid(errors);
    if (Object.values(errors).some(Boolean)) return;

    setError('');
    try {
      const result = await createInquiry({
        type: 'quick-booking',
        name: cleanName,
        phone: cleanPhone,
        pickup: cleanPickup,
        drop: cleanDrop,
        travelDate: form.date
      }).unwrap();
      setReference(result.reference || '');
    } catch (requestError) {
      setError(errorMessage(requestError, 'We could not send that just now. Please try again.'));
    }
  };

  return <dialog
    className="modal quick-booking-dialog"
    ref={dialogRef}
    onClose={resetAfterClose}
    onClick={event => { if (event.target === dialogRef.current) dialogRef.current?.close(); }}
  >
    <div className="modal-in">
      <button className="modal-close" type="button" aria-label="Close" onClick={() => dialogRef.current?.close()}>×</button>
      {reference ? <div className="quick-success" role="status">
        <span className="quick-success-badge"><IconCheck /></span>
        <h2>Sent — we’ve got it.</h2>
        <p>We’ll reach out to you within a few hours to confirm your car and fare.</p>
        <div className="quick-success-id">
          <span>Your reference</span>
          <strong>{reference}</strong>
        </div>
        <p className="quick-success-note">Keep this handy — mention it if you follow up with us.</p>
        <button className="btn btn-ember" type="button" onClick={() => dialogRef.current?.close()}>Done</button>
      </div> : <>
        <span className="eyebrow">Quick booking</span>
        <h2>Tell us where you’re headed.</h2>
        <p className="quick-booking-note">Share the essentials and we’ll call you back with the car and fare — no forms, no fuss.</p>
        <form className="quick-booking-form" onSubmit={submit}>
          <div className="row-2">
            <div className="field">
              <label htmlFor="qbName">Your name</label>
              <div className="input" style={invalid.name ? { borderColor: 'var(--ember)' } : undefined}>
                <IconPin />
                <input id="qbName" type="text" placeholder="Who should we ask for?" autoComplete="name" value={form.name} onChange={event => field('name', event.target.value)} />
              </div>
            </div>
            <div className="field">
              <label htmlFor="qbPhone">Phone number</label>
              <div className="input" style={invalid.phone ? { borderColor: 'var(--ember)' } : undefined}>
                <IconPhone />
                <input id="qbPhone" type="tel" placeholder="For us to call you back" autoComplete="tel" value={form.phone} onChange={event => field('phone', event.target.value)} />
              </div>
            </div>
          </div>
          <div className="row-2">
            <div className="field">
              <label htmlFor="qbPickup">Pick-up location</label>
              <div className="input" style={invalid.pickup ? { borderColor: 'var(--ember)' } : undefined}>
                <IconPin />
                <input id="qbPickup" type="text" placeholder="City or area" autoComplete="off" value={form.pickup} onChange={event => field('pickup', event.target.value)} />
              </div>
            </div>
            <div className="field">
              <label htmlFor="qbDrop">Drop-off location</label>
              <div className="input" style={invalid.drop ? { borderColor: 'var(--ember)' } : undefined}>
                <IconSend />
                <input id="qbDrop" type="text" placeholder="Where to?" autoComplete="off" value={form.drop} onChange={event => field('drop', event.target.value)} />
              </div>
            </div>
          </div>
          <div className="field">
            <label htmlFor="qbDate">Travel date</label>
            <div className="input" style={invalid.date ? { borderColor: 'var(--ember)' } : undefined} onClick={openPicker}>
              <IconCalendar />
              <input id="qbDate" type="date" aria-label="Travel date" min={today} value={form.date} onChange={event => field('date', event.target.value)} />
            </div>
          </div>
          {error && <p className="quick-booking-error" role="alert">{error}</p>}
          <button className="btn btn-ember book-cta" type="submit" disabled={sending}>{sending ? 'Sending…' : 'Send request'}</button>
        </form>
      </>}
    </div>
  </dialog>;
}
