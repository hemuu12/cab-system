import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { Eye, EyeOff } from 'lucide-react';
import {
  useLoginMutation,
  useRegisterMutation,
  useRequestEmailOtpMutation,
  useVerifyEmailOtpMutation
} from '../store/api/authApi.js';
import { errorMessage } from '../api/errors.js';
import { firstNameOf } from '../lib/format.js';
import { useAuth } from '../hooks/useAuth.js';
import { useToast } from '../hooks/useToast.js';
import PremiumButton from '../components/ui/PremiumButton.jsx';
import PremiumCard from '../components/ui/PremiumCard.jsx';
import StatusBadge from '../components/ui/StatusBadge.jsx';
import TextField from '../components/ui/TextField.jsx';
import BrandLogo from '../components/BrandLogo.jsx';

const homeFor = user => (user?.role === 'admin' ? '/admin' : '/account');

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { loading, user } = useAuth();
  const toast = useToast();
  const [searchParams] = useSearchParams();

  const [login, { isLoading: signingIn }] = useLoginMutation();
  const [register, { isLoading: registeringAccount }] = useRegisterMutation();
  const [requestEmailOtp, { isLoading: sendingCode }] = useRequestEmailOtpMutation();
  const [verifyEmailOtp, { isLoading: verifying }] = useVerifyEmailOtpMutation();
  const busy = signingIn || registeringAccount || sendingCode || verifying;

  const [registering, setRegistering] = useState(false);
  const [otpMode, setOtpMode] = useState(searchParams.get('mode') === 'otp');
  const [showPassword, setShowPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [code, setCode] = useState('');
  const [notice, setNotice] = useState('');
  const [form, setForm] = useState({ name: '', email: searchParams.get('email') || '', phone: '', password: '' });
  const [error, setError] = useState('');
  const requestedPath = typeof location.state?.from === 'string'
    && location.state.from.startsWith('/')
    && !location.state.from.startsWith('//')
    ? location.state.from
    : '';

  useEffect(() => {
    if (!loading && user) navigate(requestedPath || homeFor(user), { replace: true });
  }, [loading, navigate, requestedPath, user]);

  if (loading || user) return <div className="page-shell loading"><span/><p>Restoring your secure session…</p></div>;

  const completeSignIn = (session, title) => {
    toast.success(`Welcome back, ${firstNameOf(session.user.name)}.`, title);
    navigate(requestedPath || homeFor(session.user), { replace: true });
  };

  const submit = async event => {
    event.preventDefault();
    setError('');
    try {
      if (otpMode && !otpSent) {
        const result = await requestEmailOtp(form.email).unwrap();
        setOtpSent(true);
        setNotice(result.developmentCode ? `Email test mode · Use code: ${result.developmentCode}` : 'We sent a six-digit code to your email.');
        if (result.developmentCode) toast.info('Email delivery is in test mode. Use the code displayed in the form.', 'Use the on-screen code');
        else toast.success('The verification code is valid for 10 minutes.', 'Code sent');
        return;
      }
      if (otpMode) {
        completeSignIn(await verifyEmailOtp({ email: form.email, code }).unwrap(), 'Email verified');
        return;
      }
      const session = registering
        ? await register(form).unwrap()
        : await login({ email: form.email, password: form.password }).unwrap();
      completeSignIn(session, registering ? 'Account created' : 'Signed in');
    } catch (requestError) {
      setError(errorMessage(requestError, 'We could not sign you in.'));
    }
  };

  const switchOtpMode = () => {
    setOtpMode(current => !current);
    setOtpSent(false); setCode(''); setNotice(''); setError('');
  };

  return <div className="login-page relative flex min-h-screen items-center justify-center overflow-hidden bg-night px-5 py-10 text-ivory">
    <motion.div className="pointer-events-none absolute -right-24 top-0 h-96 w-96 rounded-full bg-champagne/10 blur-[120px]" animate={{ scale: [1, 1.12, 1], opacity: [.45, .75, .45] }} transition={{ duration: 8, repeat: Infinity }}/>
    <motion.div className="pointer-events-none absolute -bottom-32 -left-24 h-80 w-80 rounded-full bg-ember/10 blur-[110px]" animate={{ x: [0, 35, 0], y: [0, -20, 0] }} transition={{ duration: 10, repeat: Infinity }}/>
    <PremiumCard
      layout
      transition={{ layout: { type: 'spring', stiffness: 260, damping: 28 }, duration: .42, ease: [0.22, 1, 0.36, 1] }}
      className="login-card relative w-full max-w-[480px] overflow-hidden p-8 sm:p-10"
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-champagne/70 to-transparent"/>
      <BrandLogo className="auth-logo login-logo mb-8" />
      <StatusBadge>{otpMode ? 'Email verification' : registering ? 'New membership' : 'Secure member access'}</StatusBadge>
      <h1 className="login-title mt-4 font-display text-5xl font-semibold tracking-tight">{otpMode ? 'Access your journeys.' : registering ? 'Start travelling with us.' : 'Welcome back.'}</h1>
      <p className="login-copy mt-3 text-sm text-mist">{otpMode ? 'Use the email from your booking. No password is required.' : registering ? 'Keep journeys, preferences and updates together.' : 'Sign in to manage bookings and account details.'}</p>

      {!otpMode && <div className="login-tabs mt-7 grid grid-cols-2 rounded-xl bg-black/25 p-1">
        {[[false, 'Sign in'], [true, 'Create account']].map(([value, label]) =>
          <button key={label} type="button" className={`relative rounded-lg px-3 py-2.5 text-xs font-bold transition ${registering === value ? 'text-champagne' : 'text-slate-muted'}`} onClick={() => { setRegistering(value); setError(''); }}>
            {registering === value && <motion.span layoutId="auth-tab" transition={{ type: 'spring', stiffness: 360, damping: 30 }} className="absolute inset-0 rounded-lg border border-champagne/25 bg-champagne/10"/>}<span className="relative">{label}</span>
          </button>
        )}
      </div>}

      <AnimatePresence mode="popLayout">{error && <motion.div layout initial={{ opacity: 0, y: -8, height: 0 }} animate={{ opacity: 1, y: 0, height: 'auto' }} exit={{ opacity: 0, y: -4, height: 0 }} transition={{ duration: .25, ease: [0.22, 1, 0.36, 1] }} className="mt-4 overflow-hidden rounded-xl border border-ember/35 bg-ember/10 px-4 py-3 text-xs text-[#ffc09b]">{error}</motion.div>}</AnimatePresence>
      <AnimatePresence mode="popLayout">{notice && <motion.div layout initial={{ opacity: 0, y: -8, height: 0 }} animate={{ opacity: 1, y: 0, height: 'auto' }} exit={{ opacity: 0, y: -4, height: 0 }} transition={{ duration: .25, ease: [0.22, 1, 0.36, 1] }} className="mt-4 overflow-hidden rounded-xl border border-success/30 bg-success/10 px-4 py-3 text-xs text-[#8de0ae]">{notice}</motion.div>}</AnimatePresence>

      <motion.form layout onSubmit={submit} className="login-form mt-5 grid gap-4">
        <AnimatePresence initial={false} mode="popLayout">{registering && !otpMode && <motion.div layout initial={{ opacity: 0, height: 0, y: -8 }} animate={{ opacity: 1, height: 'auto', y: 0 }} exit={{ opacity: 0, height: 0, y: -6 }} transition={{ duration: .3, ease: [0.22, 1, 0.36, 1] }} className="grid gap-4 overflow-hidden">
          <TextField label="Full name" required minLength="2" autoComplete="name" value={form.name} onChange={event => setForm({ ...form, name: event.target.value })}/>
          <TextField label="Phone number" optional type="tel" autoComplete="tel" value={form.phone} onChange={event => setForm({ ...form, phone: event.target.value })}/>
        </motion.div>}</AnimatePresence>
        <TextField label="Email address" required type="email" autoComplete="email" disabled={otpMode && otpSent} value={form.email} onChange={event => setForm({ ...form, email: event.target.value })}/>
        {otpMode && otpSent
          ? <TextField label="Six-digit code" required inputMode="numeric" pattern="[0-9]{6}" maxLength="6" autoComplete="one-time-code" value={code} onChange={event => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))}/>
          : !otpMode && <TextField
            id="login-password"
            className="password-field"
            label="Password"
            hint={registering ? 'Use at least 8 characters' : undefined}
            required
            minLength="8"
            type={showPassword ? 'text' : 'password'}
            autoComplete={registering ? 'new-password' : 'current-password'}
            value={form.password}
            onChange={event => setForm({ ...form, password: event.target.value })}
            endAdornment={<button
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-muted transition hover:bg-white/5 hover:text-champagne focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-champagne"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              aria-controls="login-password"
              aria-pressed={showPassword}
              title={showPassword ? 'Hide password' : 'Show password'}
              onClick={() => setShowPassword(current => !current)}
            >
              {showPassword ? <EyeOff aria-hidden="true" className="h-4 w-4" /> : <Eye aria-hidden="true" className="h-4 w-4" />}
            </button>}
          />}
        {!otpMode && !registering && <Link className="-mt-1 justify-self-end text-[11px] font-semibold text-champagne transition hover:text-ivory" to="/forgot-password">Forgot password?</Link>}
        <PremiumButton className="login-submit mt-1 w-full py-3.5" disabled={busy}>{busy ? 'Please wait…' : otpMode ? otpSent ? 'Verify and view my trips' : 'Send verification code' : registering ? 'Create secure account' : 'Sign in securely'}</PremiumButton>
      </motion.form>
      {!registering && <button type="button" className="login-alt mx-auto mt-5 block text-xs font-semibold text-champagne transition hover:text-ivory" onClick={switchOtpMode}>{otpMode ? 'Use password instead' : 'Use an email verification code'}</button>}
      <p className="login-note mt-5 text-center text-[9px] text-slate-muted">Codes expire after 10 minutes and can only be used once.</p>
    </PremiumCard>
  </div>;
}
