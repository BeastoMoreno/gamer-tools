'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ArrowRight, Eye, EyeOff, Gamepad2, LockKeyhole, Mail } from 'lucide-react';
import { browserAuth } from '@/lib/supabase/client';
import { socialProviders } from '@/lib/supabase/config';
import { useAuth } from './auth-provider';
type Mode = 'sign-in' | 'sign-up' | 'forgot-password' | 'reset-password';
const titles = {
  'sign-in': 'Welcome back, player.',
  'sign-up': 'Your next chapter starts here.',
  'forgot-password': 'Let’s get you back in.',
  'reset-password': 'A fresh start for your password.',
};
export function AuthForm({ mode, callbackError = false }: { mode: Mode; callbackError?: boolean }) {
  const auth = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [name, setName] = useState('');
  const [visible, setVisible] = useState(false);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState(
    callbackError
      ? 'That sign-in link expired, was canceled, or could not be verified. Please start again.'
      : '',
  );
  const disabled = pending || !auth.configured || auth.loading;
  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const client = browserAuth();
    if (!client || pending) return;
    setError('');
    setMessage('');
    if (
      (mode === 'sign-up' || mode === 'reset-password') &&
      (password.length < 12 || password !== confirmation)
    ) {
      setError('Use at least 12 characters and make sure both passwords match.');
      return;
    }
    setPending(true);
    try {
      if (mode === 'sign-in') {
        const { error } = await client.auth.signInWithPassword({ email: email.trim(), password });
        if (error) {
          setError(
            error.code === 'email_not_confirmed'
              ? 'Check your inbox and confirm your email before signing in.'
              : 'Sign-in failed. Check your email and password, or reset your password.',
          );
          return;
        }
        router.replace('/profile');
        router.refresh();
      } else if (mode === 'sign-up') {
        const { data, error } = await client.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: { display_name: name.trim() },
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        if (error) {
          setError(
            'Account creation could not finish. Try again shortly, or sign in if you already have an account.',
          );
          return;
        }
        if (data.session) {
          router.replace('/profile');
          router.refresh();
        } else {
          setMessage(
            'Check your inbox for a confirmation link. If you already have an account, sign in or reset your password. Open the link in this browser to continue.',
          );
          setPassword('');
          setConfirmation('');
        }
      } else if (mode === 'forgot-password') {
        const { error } = await client.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
        });
        if (error) {
          setError('The reset request could not be sent. Please try again shortly.');
          return;
        }
        setMessage(
          'If an account uses that address, you’ll receive a password-reset link. Open it in this browser.',
        );
      } else {
        const { error } = await client.auth.updateUser({ password });
        if (error) {
          setError('Could not update your password. Request a fresh reset link and try again.');
          return;
        }
        setPassword('');
        setConfirmation('');
        setMessage('Password updated. You can return to your profile.');
      }
    } catch {
      setError('Could not reach accounts. Check your connection and try again.');
    } finally {
      setPending(false);
    }
  };
  const social = async (provider: 'google' | 'facebook' | 'apple') => {
    const client = browserAuth();
    if (!client || pending) return;
    setPending(true);
    setError('');
    try {
      const { error } = await client.auth.signInWithOAuth({
        provider,
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) throw error;
    } catch {
      setError('This sign-in provider is unavailable. Try email sign-in or another provider.');
      setPending(false);
    }
  };
  const passwords = mode !== 'forgot-password';
  return (
    <div className="account-layout">
      <section className="account-intro">
        <span className="account-emblem">
          <Gamepad2 size={44} />
        </span>
        <div className="eyebrow">YOUR OWN CORNER OF THE GAME</div>
        <h1>{titles[mode]}</h1>
        <p>
          Build your gamer identity. Save your profile and keep your favorite games and setup
          together.
        </p>
        <div className="account-benefits">
          <span>
            <LockKeyhole size={18} />
            Your profile is private to your account.
          </span>
          <span>
            <Gamepad2 size={18} />
            Every gaming tool is still free to use as a guest.
          </span>
        </div>
        <Link href="/tools" className="text-link">
          Keep exploring as a guest <ArrowRight size={16} />
        </Link>
      </section>
      <section className="panel account-form-panel">
        <h2>
          {mode === 'sign-in'
            ? 'Sign in'
            : mode === 'sign-up'
              ? 'Create an account'
              : mode === 'forgot-password'
                ? 'Reset your password'
                : 'Choose a new password'}
        </h2>
        {!auth.configured && (
          <p className="account-notice" role="status">
            Accounts aren’t connected on this preview yet. You can explore every tool as a guest.
          </p>
        )}
        {auth.user && mode !== 'reset-password' && (
          <p className="success-notice">
            You’re already signed in. <Link href="/profile">Open your profile →</Link>
          </p>
        )}
        {(error || auth.error) && (
          <p className="error-notice" role="alert">
            {error || auth.error}
          </p>
        )}
        {message && (
          <p className="success-notice" role="status">
            {message}
          </p>
        )}
        {(mode === 'sign-in' || mode === 'sign-up') && (
          <>
            <div className="social-signin">
              {socialProviders.map((provider) => (
                <button
                  type="button"
                  key={provider.id}
                  className="social-button"
                  disabled={disabled || !provider.enabled}
                  onClick={() => social(provider.id)}
                  aria-label={`Continue with ${provider.name}${!provider.enabled ? ' (not enabled)' : ''}`}
                >
                  <span className={`provider-letter provider-${provider.id}`}>
                    {provider.id === 'google' ? 'G' : provider.id === 'facebook' ? 'f' : 'A'}
                  </span>
                  {provider.name}
                </button>
              ))}
            </div>
            <div className="form-divider">
              <span>or continue with email</span>
            </div>
          </>
        )}
        {mode === 'reset-password' && !auth.loading && !auth.user ? (
          <p className="account-notice">
            Open a valid password-reset email first.{' '}
            <Link href="/forgot-password">Request another link.</Link>
          </p>
        ) : (
          <form onSubmit={submit}>
            {mode === 'sign-up' && (
              <label className="field-label">
                Display name
                <input
                  required
                  maxLength={40}
                  autoComplete="nickname"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="What should we call you?"
                  disabled={disabled}
                />
              </label>
            )}
            {mode !== 'reset-password' && (
              <label className="field-label">
                Email address
                <input
                  required
                  type="email"
                  maxLength={254}
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  disabled={disabled}
                />
              </label>
            )}
            {passwords && (
              <label className="field-label">
                Password
                <div className="password-field">
                  <input
                    required
                    aria-label="Password"
                    type={visible ? 'text' : 'password'}
                    minLength={mode === 'sign-in' ? 1 : 12}
                    maxLength={128}
                    autoComplete={mode === 'sign-in' ? 'current-password' : 'new-password'}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    disabled={disabled}
                  />
                  <button
                    type="button"
                    aria-label={visible ? 'Hide password' : 'Show password'}
                    onClick={() => setVisible(!visible)}
                  >
                    {visible ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {mode !== 'sign-in' && (
                  <small>At least 12 characters. A memorable passphrase works well.</small>
                )}
              </label>
            )}
            {(mode === 'sign-up' || mode === 'reset-password') && (
              <label className="field-label">
                Confirm password
                <input
                  required
                  aria-label="Confirm password"
                  type={visible ? 'text' : 'password'}
                  minLength={12}
                  maxLength={128}
                  autoComplete="new-password"
                  value={confirmation}
                  onChange={(event) => setConfirmation(event.target.value)}
                  disabled={disabled}
                />
              </label>
            )}
            {mode === 'sign-in' && (
              <Link href="/forgot-password" className="text-link forgot-link">
                Forgot password?
              </Link>
            )}
            <button className="primary-button account-submit" disabled={disabled}>
              {pending
                ? 'Please wait…'
                : mode === 'sign-in'
                  ? 'Sign in'
                  : mode === 'sign-up'
                    ? 'Create account'
                    : mode === 'forgot-password'
                      ? 'Send reset link'
                      : 'Update password'}
              {mode === 'forgot-password' ? <Mail size={17} /> : <ArrowRight size={17} />}
            </button>
          </form>
        )}
        <p className="account-switch">
          {mode === 'sign-in' ? (
            <>
              New here? <Link href="/sign-up">Create an account</Link>
            </>
          ) : mode === 'sign-up' ? (
            <>
              Already a member? <Link href="/sign-in">Sign in</Link>
            </>
          ) : (
            <Link href={message && mode === 'reset-password' ? '/profile' : '/sign-in'}>
              {message && mode === 'reset-password' ? 'Open your profile' : 'Back to sign in'}
            </Link>
          )}
        </p>
      </section>
    </div>
  );
}
