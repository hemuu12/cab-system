'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Check, ChevronLeft, KeyRound, Mail } from 'lucide-react';
import { motion } from 'motion/react';
import { useForgotPasswordMutation, useResetPasswordMutation } from '../../store/api/authApi.js';
import { isOtpCode, isStrongPassword } from '../../lib/validation.js';
import { useToast } from '../../hooks/useToast.js';
import BrandLogo from '../../components/BrandLogo.jsx';
import PremiumButton from '../../components/ui/PremiumButton.jsx';
import PremiumCard from '../../components/ui/PremiumCard.jsx';
import StatusBadge from '../../components/ui/StatusBadge.jsx';
import TextField from '../../components/ui/TextField.jsx';

function ForgotPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();
  const [forgotPassword, { isLoading: sending }] = useForgotPasswordMutation();
  const [resetPassword, { isLoading: resetting }] = useResetPasswordMutation();
  const busy = sending || resetting;

  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ email: searchParams.get('email') || '', code: '', password: '', confirmPassword: '' });
  const [developmentCode, setDevelopmentCode] = useState('');
  const requestedReturn = searchParams.get('returnTo') || '';
  const returnTo = requestedReturn.startsWith('/') && !requestedReturn.startsWith('//')
    ? requestedReturn
    : '/account';

  const sendCode = async event => {
    event.preventDefault();
    try {
      const result = await forgotPassword(form.email).unwrap();
      setDevelopmentCode(result.developmentCode || '');
      setStep(2);
      if (result.developmentCode) toast.info('Email delivery is in test mode. Use the development code displayed on this page.', 'Use the on-screen code');
      else toast.success('Check your inbox for a six-digit code. It will expire in 10 minutes.', 'Reset code sent');
    } catch { /* the interceptor already raised a toast */ }
  };

  const submitReset = async event => {
    event.preventDefault();
    if (!isOtpCode(form.code)) return toast.error('Enter the complete six-digit code from your email.', 'Code required');
    if (!isStrongPassword(form.password)) return toast.error('Use 12–128 characters with both a letter and a number.', 'Choose a stronger password');
    if (form.password !== form.confirmPassword) return toast.error('The two passwords do not match. Please enter them again.', 'Passwords do not match');
    try {
      await resetPassword({ email: form.email, code: form.code, password: form.password }).unwrap();
      setStep(3);
      toast.success('Your password has been changed and your account is secure.', 'Password updated');
      window.setTimeout(() => router.replace(returnTo), 900);
    } catch { /* the interceptor already raised a toast */ }
  };

  return <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-night px-5 py-10 text-ivory">
    <motion.div className="pointer-events-none absolute right-[-8rem] top-[-4rem] h-[30rem] w-[30rem] rounded-full bg-champagne/10 blur-[140px]" animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 8, repeat: Infinity }}/>
    <PremiumCard className="relative w-full max-w-[500px] overflow-hidden p-8 sm:p-10">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-champagne/70 to-transparent"/>
      <div className="auth-recovery-head"><BrandLogo className="auth-logo" /><Link className="inline-flex items-center gap-2 text-xs font-semibold text-mist transition hover:text-champagne" href="/login"><ChevronLeft size={15}/> Back to sign in</Link></div>
      <StatusBadge>{step === 1 ? 'Account recovery' : step === 2 ? 'Secure password reset' : 'Password updated'}</StatusBadge>
      <div className="mt-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-champagne/25 bg-champagne/10 text-champagne">{step === 1 ? <Mail/> : step === 2 ? <KeyRound/> : <Check/>}</div>
      <h1 className="mt-5 font-display text-5xl font-semibold tracking-tight">{step === 1 ? 'Forgot your password?' : step === 2 ? 'Create a new password.' : 'You’re all set.'}</h1>
      <p className="mt-3 text-sm text-mist">{step === 1 ? 'Enter the email connected to your WonderTravel account.' : step === 2 ? `Enter the code sent to ${form.email}, then choose a secure password.` : 'Taking you safely to your account…'}</p>

      {developmentCode && step === 2 && <div className="mt-5 rounded-xl border border-champagne/30 bg-champagne/10 px-4 py-3 text-xs text-champagne">Development code: <strong className="tracking-[.25em]">{developmentCode}</strong></div>}

      {step === 1 && <form className="mt-7 grid gap-5" onSubmit={sendCode}>
        <TextField label="Email address" required type="email" autoComplete="email" value={form.email} onChange={event => setForm({ ...form, email: event.target.value })}/>
        <PremiumButton className="w-full py-3.5" disabled={busy}>{busy ? 'Sending code…' : 'Send reset code'}</PremiumButton>
      </form>}

      {step === 2 && <form className="mt-7 grid gap-4" onSubmit={submitReset}>
        <TextField label="Six-digit email code" required inputMode="numeric" pattern="[0-9]{6}" maxLength="6" autoComplete="one-time-code" value={form.code} onChange={event => setForm({ ...form, code: event.target.value.replace(/\D/g, '').slice(0, 6) })}/>
        <TextField label="New password" hint="12–128 characters with a letter and number" required type="password" minLength="12" maxLength="128" autoComplete="new-password" value={form.password} onChange={event => setForm({ ...form, password: event.target.value })}/>
        <TextField label="Confirm new password" required type="password" minLength="12" maxLength="128" autoComplete="new-password" value={form.confirmPassword} onChange={event => setForm({ ...form, confirmPassword: event.target.value })}/>
        <PremiumButton className="mt-1 w-full py-3.5" disabled={busy}>{busy ? 'Securing account…' : 'Update password securely'}</PremiumButton>
        <button type="button" className="mx-auto text-xs font-semibold text-champagne" onClick={() => { setStep(1); setDevelopmentCode(''); }}>Request another code</button>
      </form>}
    </PremiumCard>
  </div>;
}

export default function Page() {
  return <Suspense fallback={null}>
    <ForgotPasswordContent />
  </Suspense>;
}
