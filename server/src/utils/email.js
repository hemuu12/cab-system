export async function sendOtpEmail({ email, code, name, purpose = 'login' }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    if (process.env.NODE_ENV === 'production') throw new Error('Email verification is not configured');
    console.log(`[DEV EMAIL OTP:${purpose}] ${email}: ${code}`);
    return { development: true };
  }

  const configuredFrom = process.env.RESEND_FROM || 'WonderTravel <onboarding@resend.dev>';
  const usesPublicMailbox = /@(gmail|yahoo|outlook|hotmail)\./i.test(configuredFrom);
  const from = process.env.NODE_ENV !== 'production' && usesPublicMailbox
    ? 'WonderTravel <onboarding@resend.dev>'
    : configuredFrom;
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from,
      to: [email],
      subject: purpose === 'password-reset' ? 'Reset your WonderTravel password' : 'Your WonderTravel verification code',
      html: `<div style="background:#0b0f14;color:#f3f1ec;font-family:Arial,sans-serif;padding:36px">
        <div style="font-family:Georgia,serif;font-size:28px">WonderTravel<span style="color:#f26b1d">•</span></div>
        <h1 style="font-family:Georgia,serif;font-size:34px;margin:32px 0 8px">${purpose === 'password-reset' ? 'Reset your password' : 'Verify your email'}</h1>
        <p style="color:#9ba6b2">Hello ${escapeHtml(name || 'traveller')}, use this code ${purpose === 'password-reset' ? 'to choose a new password' : 'to access your journeys'}:</p>
        <div style="color:#d8b678;font-size:34px;font-weight:700;letter-spacing:10px;margin:28px 0">${code}</div>
        <p style="color:#6b7683;font-size:12px">This code expires in 10 minutes. If you did not request it, you can ignore this email.</p>
      </div>`
    })
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`[DEV EMAIL FALLBACK] ${data.message || 'Resend rejected the message'}. Code for ${email}: ${code}`);
      return { development: true };
    }
    const error = new Error('We could not send the email right now. Please contact WonderTravel support or try again later.');
    error.name = 'EmailDeliveryError';
    throw error;
  }
  return { development: false };
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' })[character]);
}

/** Notifies the team inbox the moment a Quick booking enquiry comes in. Best-effort: never blocks the customer's response. */
export async function sendQuickBookingEmail({ reference, name, phone, pickup, drop, travelDate }) {
  const apiKey = process.env.RESEND_API_KEY;
  const notifyTo = process.env.NOTIFY_EMAIL;
  if (!apiKey || !notifyTo) {
    console.log(`[DEV QUICK BOOKING] ${reference}: ${name} (${phone}) ${pickup} -> ${drop} on ${travelDate}`);
    return { development: true };
  }

  const configuredFrom = process.env.RESEND_FROM || 'WonderTravel <onboarding@resend.dev>';
  const usesPublicMailbox = /@(gmail|yahoo|outlook|hotmail)\./i.test(configuredFrom);
  const from = process.env.NODE_ENV !== 'production' && usesPublicMailbox
    ? 'WonderTravel <onboarding@resend.dev>'
    : configuredFrom;
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from,
      to: [notifyTo],
      subject: `Quick booking ${reference} — ${escapeHtml(name)}`,
      html: `<div style="background:#0b0f14;color:#f3f1ec;font-family:Arial,sans-serif;padding:36px">
        <div style="font-family:Georgia,serif;font-size:28px">WonderTravel<span style="color:#f26b1d">•</span></div>
        <h1 style="font-family:Georgia,serif;font-size:30px;margin:32px 0 8px">New quick booking</h1>
        <p style="color:#d8b678;font-size:20px;font-weight:700;letter-spacing:4px;margin:0 0 22px">${escapeHtml(reference)}</p>
        <table style="color:#f3f1ec;font-size:14px;border-collapse:collapse">
          <tr><td style="color:#9ba6b2;padding:4px 16px 4px 0">Name</td><td>${escapeHtml(name)}</td></tr>
          <tr><td style="color:#9ba6b2;padding:4px 16px 4px 0">Phone</td><td>${escapeHtml(phone)}</td></tr>
          <tr><td style="color:#9ba6b2;padding:4px 16px 4px 0">Pick-up</td><td>${escapeHtml(pickup)}</td></tr>
          <tr><td style="color:#9ba6b2;padding:4px 16px 4px 0">Drop-off</td><td>${escapeHtml(drop)}</td></tr>
          <tr><td style="color:#9ba6b2;padding:4px 16px 4px 0">Travel date</td><td>${escapeHtml(travelDate)}</td></tr>
        </table>
        <p style="color:#6b7683;font-size:12px;margin-top:28px">Reply to this customer from the admin panel's Inquiries section.</p>
      </div>`
    })
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    console.warn(`[QUICK BOOKING EMAIL FAILED] ${data.message || 'Resend rejected the message'} — reference ${reference} is still saved in Inquiries.`);
    return { development: false, delivered: false };
  }
  return { development: false, delivered: true };
}
