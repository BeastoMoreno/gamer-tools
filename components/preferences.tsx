'use client';
import { useState } from 'react';
import { Check, Download, ShieldCheck, Trash2 } from 'lucide-react';
import { useGamer } from './gamer-provider';
export function Preferences() {
  const {
    favorites,
    results,
    reducedMotion,
    setReducedMotion,
    clearData,
    storageAvailable,
    ready,
  } = useGamer();
  const [confirm, setConfirm] = useState(false);
  const [cleared, setCleared] = useState(false);
  const download = () => {
    const url = URL.createObjectURL(
      new Blob([JSON.stringify({ favorites, results, reducedMotion }, null, 2)], {
        type: 'application/json',
      }),
    );
    const link = document.createElement('a');
    link.download = 'iamgamer-data.json';
    link.href = url;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  return (
    <div inert={!ready}>
      <div className="page-heading">
        <div>
          <div className="eyebrow">MAKE YOURSELF AT HOME</div>
          <h1>
            Your space, your preferences<span className="purple-text">.</span>
          </h1>
          <p>A few little things to make your toolkit feel right.</p>
        </div>
      </div>
      {!storageAvailable && (
        <div className="error-notice">
          Browser storage is unavailable. Your current session still works, but results may not
          survive a reload.
        </div>
      )}
      {cleared && (
        <div className="success-notice" role="status">
          <Check size={15} style={{ display: 'inline' }} /> Your saved results, favorites, and
          preferences have been cleared.
        </div>
      )}
      <div className="panel">
        <h2>Look & feel</h2>
        <div className="settings-row">
          <div>
            <h3>Reduce animation</h3>
            <p>
              Turn off decorative motion and transitions. Your system’s reduced-motion preference is
              also respected.
            </p>
          </div>
          <input
            type="checkbox"
            aria-label="Reduce animation"
            checked={reducedMotion}
            onChange={(event) => setReducedMotion(event.target.checked)}
          />
        </div>
      </div>
      <div className="panel">
        <h2>Your data belongs to you</h2>
        <div className="settings-row">
          <div>
            <h3>Stored on this device</h3>
            <p>
              {favorites.length} favorites and {results.length} session results are stored locally.
              Clearing your browser data removes your saved progress. If you sign in, your player
              profile is stored separately in your account; this local reset does not delete it.
            </p>
          </div>
          <ShieldCheck size={25} className="purple-text" />
        </div>
        <div className="settings-row">
          <div>
            <h3>Download your data</h3>
            <p>
              Keep a JSON copy of your results, favorites, and preferences for your own records.
            </p>
          </div>
          <button className="subtle-button" onClick={download}>
            <Download size={15} />
            Export data
          </button>
        </div>
        <div className="settings-row">
          <div>
            <h3>Start fresh</h3>
            <p>
              Clear this site’s saved results, favorites, and preferences from this browser. This
              cannot be undone.
            </p>
          </div>
          {confirm ? (
            <div className="tool-actions">
              <button
                className="subtle-button danger-button"
                onClick={() => {
                  clearData();
                  setConfirm(false);
                  setCleared(true);
                }}
              >
                Yes, clear my data
              </button>
              <button className="subtle-button" onClick={() => setConfirm(false)}>
                Cancel
              </button>
            </div>
          ) : (
            <button className="subtle-button danger-button" onClick={() => setConfirm(true)}>
              <Trash2 size={14} />
              Clear local data
            </button>
          )}
        </div>
      </div>
      <div className="panel">
        <h2>Permission, only when you need it</h2>
        <p>
          Camera and microphone access is requested only inside those tools after you click Start.
          Streams stay in your browser and stop when you leave the tool. Manage any previously
          granted permissions in your browser’s site settings.
        </p>
      </div>
    </div>
  );
}
