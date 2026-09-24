'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { Check, Gamepad2, LogOut, Save, ShieldCheck, UserRound } from 'lucide-react';
import { useAuth } from './auth-provider';
import { useGamer } from './gamer-provider';
import { browserAuth } from '@/lib/supabase/client';
import {
  avatarColors,
  emptyProfile,
  gameOptions,
  profileError,
  type GamerProfile,
} from '@/lib/profile';
export function Profile() {
  const auth = useAuth();
  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">YOUR IDENTITY. YOUR SETUP.</div>
          <h1>
            Player profile<span className="purple-text">.</span>
          </h1>
          <p>Make yourself at home. Keep your gamer identity and setup in one place.</p>
        </div>
      </div>
      {auth.loading ? (
        <div className="panel" role="status">
          Loading your account…
        </div>
      ) : !auth.user ? (
        <div className="empty-state">
          <UserRound size={46} />
          <h2>Your player card is waiting.</h2>
          <p>
            Sign in to create a private profile, choose your games, and save your setup across
            devices.
          </p>
          <div className="tool-actions">
            <Link href="/sign-in" className="primary-button">
              Sign in
            </Link>
            <Link href="/sign-up" className="subtle-button">
              Create account
            </Link>
          </div>
        </div>
      ) : (
        <ProfileEditor key={auth.user.id} user={auth.user} />
      )}
    </>
  );
}
function ProfileEditor({ user }: { user: User }) {
  const auth = useAuth();
  const { results } = useGamer();
  const [profile, setProfile] = useState<GamerProfile | null>(null);
  const [draft, setDraft] = useState<GamerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [saving, setSaving] = useState(false);
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    const client = browserAuth();
    if (!client) return;
    let alive = true;
    void Promise.resolve(client.from('profiles').select('*').eq('id', user.id).maybeSingle())
      .then(({ data, error: loadError }) => {
        if (!alive) return;
        if (loadError)
          setError('Your profile could not be loaded. Check your connection and try again.');
        else {
          const displayName =
            typeof user.user_metadata?.display_name === 'string'
              ? user.user_metadata.display_name
              : typeof user.user_metadata?.full_name === 'string'
                ? user.user_metadata.full_name
                : '';
          const next = data as GamerProfile | null;
          setProfile(next);
          setDraft(next || emptyProfile(user.id, displayName));
          setError('');
        }
        setLoading(false);
      })
      .catch(() => {
        if (alive) {
          setError('Your profile could not be loaded. Check your connection and try again.');
          setLoading(false);
        }
      });
    return () => {
      alive = false;
    };
  }, [user.id, user.user_metadata, revision]);
  if (loading)
    return (
      <div className="panel" role="status">
        Loading your player card…
      </div>
    );
  if (!draft)
    return (
      <div className="panel">
        <p className="error-notice" role="alert">
          {error}
        </p>
        <button
          className="subtle-button"
          onClick={() => {
            setLoading(true);
            setRevision((old) => old + 1);
          }}
        >
          Try again
        </button>
      </div>
    );
  const edit = <K extends keyof GamerProfile>(key: K, value: GamerProfile[K]) => {
    setDraft((old) => (old ? { ...old, [key]: value } : old));
    setNotice('');
  };
  const completion = [
    draft.display_name.trim(),
    draft.username,
    draft.bio.trim(),
    draft.region.trim(),
    draft.favorite_games.length,
    draft.main_game,
  ].filter(Boolean).length;
  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    const client = browserAuth();
    if (!client || saving) return;
    const next: GamerProfile = {
      ...draft,
      id: user.id,
      username: draft.username?.trim().toLowerCase() || null,
      display_name: draft.display_name.trim(),
      bio: draft.bio.trim(),
      region: draft.region.trim(),
    };
    const invalid = profileError(next);
    if (invalid) {
      setError(invalid);
      return;
    }
    setSaving(true);
    setError('');
    setNotice('');
    try {
      const { data, error: saveError } = await client
        .from('profiles')
        .upsert(next, { onConflict: 'id' })
        .select()
        .single();
      if (saveError) {
        setError(
          saveError.code === '23505'
            ? 'That handle is already taken. Try another one.'
            : 'Could not save your profile. Your edits are still here; please try again.',
        );
        return;
      }
      setProfile(data as GamerProfile);
      setDraft(data as GamerProfile);
      setNotice('Profile saved to your account.');
    } catch {
      setError('Could not connect. Your edits are still here; please try again.');
    } finally {
      setSaving(false);
    }
  };
  return (
    <div className="profile-layout">
      <aside className="panel player-card">
        <div className={`player-avatar avatar-${draft.avatar_color}`}>
          <Gamepad2 size={44} />
        </div>
        <span className="eyebrow">PLAYER CARD</span>
        <h2>{draft.display_name || 'Your gamer name'}</h2>
        <p className="player-handle">@{draft.username || 'your_handle'}</p>
        <p>{draft.bio || 'A little about the gamer behind the screen.'}</p>
        <div className="profile-completion">
          <span>
            Profile details <strong>{Math.round((completion / 6) * 100)}%</strong>
          </span>
          <progress value={completion} max={6} />
        </div>
        <div className="player-stat">
          <span>Sessions on this device</span>
          <strong>{results.length}</strong>
        </div>
        <div className="player-stat">
          <span>Account email</span>
          <strong>{user.email || 'Provider account'}</strong>
        </div>
        <span className="profile-private">
          <ShieldCheck size={16} />
          Private to your account
        </span>
        <button className="subtle-button" onClick={() => void auth.signOut()}>
          <LogOut size={16} />
          Sign out on this device
        </button>
        {auth.error && (
          <p className="error-notice" role="alert">
            {auth.error}
          </p>
        )}
      </aside>
      <form className="panel profile-form" onSubmit={save}>
        <h2>{profile ? 'Edit your profile' : 'Complete your profile'}</h2>
        <p>
          Your profile syncs to your account. Practice history and favorites remain on this device.
        </p>
        {error && (
          <p className="error-notice section-spacer" role="alert">
            {error}
          </p>
        )}
        {notice && (
          <p className="success-notice section-spacer" role="status">
            <Check size={16} />
            {notice}
          </p>
        )}
        <fieldset disabled={saving} className="profile-fields">
          <legend>Gamer identity</legend>
          <div className="form-two-columns">
            <label className="field-label">
              Display name
              <input
                required
                maxLength={40}
                autoComplete="nickname"
                value={draft.display_name}
                onChange={(event) => edit('display_name', event.target.value)}
              />
            </label>
            <label className="field-label">
              Handle
              <input
                maxLength={24}
                minLength={3}
                pattern="[a-z0-9_]{3,24}"
                value={draft.username || ''}
                onChange={(event) => edit('username', event.target.value.toLowerCase())}
                placeholder="your_handle"
              />
              <small>Optional · lowercase letters, numbers, underscores</small>
            </label>
          </div>
          <label className="field-label">
            Bio
            <textarea
              rows={3}
              maxLength={300}
              value={draft.bio}
              onChange={(event) => edit('bio', event.target.value)}
              placeholder="Your favorite games, playstyle, or next big goal."
            />
            <small>{draft.bio.length}/300 characters</small>
          </label>
          <div className="field-label">
            Player card color
            <div className="avatar-colors" role="group" aria-label="Player card color">
              {avatarColors.map((color) => (
                <button
                  type="button"
                  key={color}
                  className={`avatar-${color} ${draft.avatar_color === color ? 'selected' : ''}`}
                  aria-label={`${color} avatar`}
                  aria-pressed={draft.avatar_color === color}
                  onClick={() => edit('avatar_color', color)}
                >
                  {draft.avatar_color === color && <Check size={20} />}
                </button>
              ))}
            </div>
          </div>
          <div className="form-two-columns">
            <label className="field-label">
              Region
              <input
                maxLength={40}
                value={draft.region}
                onChange={(event) => edit('region', event.target.value)}
                placeholder="e.g. Southeast Asia"
              />
            </label>
            <label className="field-label">
              Main platform
              <select
                value={draft.platform}
                onChange={(event) =>
                  edit('platform', event.target.value as GamerProfile['platform'])
                }
              >
                {['PC', 'PlayStation', 'Xbox', 'Nintendo', 'Mobile'].map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>
          </div>
          <div className="field-label">
            Favorite games <small>Choose up to 8</small>
            <div className="game-options">
              {gameOptions.map((game) => (
                <label key={game}>
                  <input
                    type="checkbox"
                    checked={draft.favorite_games.includes(game)}
                    onChange={(event) =>
                      edit(
                        'favorite_games',
                        event.target.checked
                          ? [...draft.favorite_games, game].slice(0, 8)
                          : draft.favorite_games.filter((item) => item !== game),
                      )
                    }
                    disabled={
                      !draft.favorite_games.includes(game) && draft.favorite_games.length >= 8
                    }
                  />
                  {game}
                </label>
              ))}
            </div>
          </div>
        </fieldset>
        <fieldset disabled={saving} className="profile-fields">
          <legend>Your setup</legend>
          <label className="field-label">
            Main game
            <select
              value={draft.main_game}
              onChange={(event) => edit('main_game', event.target.value)}
            >
              <option value="">Choose a game (optional)</option>
              {gameOptions.map((game) => (
                <option key={game}>{game}</option>
              ))}
            </select>
          </label>
          <div className="form-two-columns">
            <label className="field-label">
              Mouse DPI
              <input
                type="number"
                min={100}
                max={100000}
                step={1}
                value={draft.mouse_dpi ?? ''}
                onChange={(event) =>
                  edit('mouse_dpi', event.target.value ? Number(event.target.value) : null)
                }
                placeholder="e.g. 800"
              />
            </label>
            <label className="field-label">
              Main-game sensitivity
              <input
                type="number"
                min={0.000001}
                max={1000}
                step="any"
                value={draft.sensitivity ?? ''}
                onChange={(event) =>
                  edit('sensitivity', event.target.value ? Number(event.target.value) : null)
                }
                placeholder="Optional"
              />
            </label>
          </div>
          <p className="hint">
            Your game sensitivity is saved for reference. Browser training uses its own sensitivity
            control.
          </p>
        </fieldset>
        <div className="tool-actions">
          <button className="primary-button" disabled={saving}>
            <Save size={16} />
            {saving ? 'Saving…' : 'Save profile'}
          </button>
          <Link href="/forgot-password" className="text-link">
            Reset account password
          </Link>
        </div>
      </form>
    </div>
  );
}
