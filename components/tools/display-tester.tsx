'use client';
import { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Download,
  Expand,
  Eye,
  EyeOff,
  Monitor,
  Pause,
  Play,
  RotateCcw,
  X,
} from 'lucide-react';
import {
  displayTests,
  solidColors,
  fieldColor,
  type DisplayTestId,
  type Inspection,
} from '@/lib/display-tests';
import { useGamer } from '../gamer-provider';
import { DisplayPattern } from './display-pattern';
import { DisplayDiagnostics, readScreen, type TimingReading } from './display-diagnostics';

export function DisplayTester() {
  const { reducedMotion } = useGamer();
  const [selected, setSelected] = useState<DisplayTestId>('pixels');
  const [category, setCategory] = useState('All');
  const [variant, setVariant] = useState(0);
  const [opened, setOpened] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [notice, setNotice] = useState('');
  const [moving, setMoving] = useState(false);
  const [speed, setSpeed] = useState(480);
  const [contacts, setContacts] = useState(0);
  const [resetKey, setResetKey] = useState(0);
  const [observations, setObservations] = useState<Partial<Record<DisplayTestId, Inspection>>>({});
  const [timing, setTiming] = useState<TimingReading | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const viewer = useRef<HTMLDivElement>(null);
  const launcher = useRef<HTMLButtonElement | null>(null);
  const test = displayTests.find((item) => item.id === selected)!;
  const inspection = observations[selected] ?? { finding: 'unreviewed', notes: '' };
  const reviewed = Object.values(observations).filter(
    (item) => item.finding !== 'unreviewed',
  ).length;
  const select = (id: DisplayTestId) => {
    setSelected(id);
    setVariant(0);
    setMoving(false);
    setContacts(0);
    setResetKey((old) => old + 1);
  };
  const next = (direction: number) =>
    setVariant((old) => (old + direction + test.variants.length) % test.variants.length);
  const close = async () => {
    setMoving(false);
    if (document.fullscreenElement === viewer.current)
      await document.exitFullscreen().catch(() => {});
    setOpened(false);
    setHidden(false);
    setContacts(0);
    dialog.current?.close();
    requestAnimationFrame(() => {
      if (launcher.current?.isConnected) launcher.current.focus();
    });
  };
  useEffect(() => {
    if (opened && hidden) viewer.current?.focus();
  }, [opened, hidden]);
  useEffect(() => {
    const node = viewer.current;
    const change = () => setFullscreen(document.fullscreenElement === node);
    const visibility = () => {
      if (document.hidden) setMoving(false);
    };
    document.addEventListener('fullscreenchange', change);
    document.addEventListener('visibilitychange', visibility);
    return () => {
      document.removeEventListener('fullscreenchange', change);
      document.removeEventListener('visibilitychange', visibility);
      if (document.fullscreenElement === node) void document.exitFullscreen().catch(() => {});
    };
  }, []);
  const open = (event: React.MouseEvent<HTMLButtonElement>, color?: number) => {
    launcher.current = event.currentTarget;
    if (color !== undefined) {
      setSelected('pixels');
      setVariant(color);
    }
    setOpened(true);
    setHidden(false);
    setNotice('');
    setMoving(false);
    setResetKey((old) => old + 1);
    dialog.current?.showModal();
  };
  const enterFullscreen = async () => {
    try {
      if (!viewer.current?.requestFullscreen) throw new Error('Unavailable');
      await viewer.current.requestFullscreen();
      setNotice('');
    } catch {
      setNotice('Fullscreen is unavailable here. The full-window test is still usable.');
    }
  };
  const edit = (value: Partial<Inspection>) =>
    setObservations((old) => ({
      ...old,
      [selected]: { ...(old[selected] ?? { finding: 'unreviewed', notes: '' }), ...value },
    }));
  const exportReport = () => {
    const report = {
      title: 'I AM GAMER — Display inspection',
      createdAt: new Date().toISOString(),
      screen: readScreen(),
      frameTiming: timing,
      checks: displayTests.map((item) => ({
        id: item.id,
        name: item.name,
        ...(observations[item.id] ?? { finding: 'unreviewed', notes: '' }),
      })),
      scope:
        'Findings are user observations, not automated panel diagnoses. Browser readings are estimates and do not certify physical specifications.',
    };
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' }),
    );
    const link = document.createElement('a');
    link.href = url;
    link.download = 'iamgamer-display-report.json';
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  const controls = (
    <>
      <label className="field-label">
        Pattern
        <select
          aria-label="Test pattern"
          value={variant}
          onChange={(event) => setVariant(Number(event.target.value))}
        >
          {test.variants.map((name, index) => (
            <option key={name} value={index}>
              {name}
            </option>
          ))}
        </select>
      </label>
      {selected === 'motion' && (
        <>
          <label className="field-label">
            Speed · {speed} CSS px/s
            <input
              aria-label="Motion speed"
              type="range"
              min={120}
              max={1440}
              step={120}
              value={speed}
              onChange={(event) => setSpeed(Number(event.target.value))}
            />
          </label>
          <button
            className="subtle-button"
            aria-pressed={moving}
            onClick={() => setMoving(!moving)}
          >
            {moving ? <Pause size={16} /> : <Play size={16} />}{' '}
            {moving ? 'Pause motion' : 'Start motion'}
          </button>
        </>
      )}
      {selected === 'touch' && (
        <>
          <span className="display-contact-count">
            {contacts} active contact{contacts === 1 ? '' : 's'}
          </span>
          <button
            className="subtle-button"
            onClick={() => {
              setResetKey((old) => old + 1);
              setContacts(0);
            }}
          >
            <RotateCcw size={15} />
            Reset coverage
          </button>
        </>
      )}
    </>
  );
  return (
    <div className="display-lab">
      <section className="display-lab-banner">
        <div>
          <span className="eyebrow">LOOK CLOSER. PLAY CLEARER.</span>
          <h2>Know the screen behind every frame.</h2>
          <p>
            A guided display lab for your next monitor, your current setup, or a quick check before
            game night.
          </p>
          <div className="display-banner-meta">
            <span>
              <Monitor size={15} />
              12 visual checks
            </span>
            <span>
              <Eye size={15} />
              Step-by-step inspection
            </span>
          </div>
          <a href="#display-workbench" className="subtle-button display-start-link">
            Start a screen check <ArrowRight size={16} />
          </a>
        </div>
        <div className="display-monitor-art" aria-hidden="true">
          <div>
            <span />
            <span />
            <span />
            <span />
            <span />
            <span />
          </div>
          <i />
        </div>
      </section>
      <div className="display-lab-toolbar">
        <div className="category-tabs" role="group" aria-label="Display test category">
          {['All', 'Panel', 'Color', 'Motion', 'Input'].map((item) => (
            <button
              key={item}
              aria-pressed={category === item}
              className={category === item ? 'selected' : ''}
              onClick={() => setCategory(item)}
            >
              {item}
            </button>
          ))}
        </div>
        <span className="display-reviewed">{reviewed}/12 reviewed</span>
        <button className="subtle-button" onClick={exportReport}>
          <Download size={16} />
          Export inspection
        </button>
      </div>
      <div className="display-test-library" role="group" aria-label="Display checks">
        {displayTests
          .filter((item) => category === 'All' || item.group === category)
          .map((item) => (
            <button
              key={item.id}
              className={`display-test-card ${selected === item.id ? 'selected' : ''}`}
              aria-pressed={selected === item.id}
              onClick={() => select(item.id)}
            >
              <span className={`display-mini-pattern mini-${item.preview}`} aria-hidden="true" />
              <span>
                <strong>{item.name}</strong>
                <small>{item.short}</small>
              </span>
              {observations[item.id]?.finding === 'clear' ? (
                <Check size={16} />
              ) : (
                <ArrowRight size={16} />
              )}
            </button>
          ))}
      </div>
      <div className="display-workbench" id="display-workbench">
        <section className="panel display-preview-panel">
          <div className="display-section-title">
            <span className="display-test-index">
              {String(displayTests.findIndex((item) => item.id === selected) + 1).padStart(2, '0')}
            </span>
            <div>
              <span className="eyebrow">{test.group.toUpperCase()} INSPECTION</span>
              <h2>{test.name}</h2>
            </div>
          </div>
          <div className="display-pattern-preview" data-testid="display-preview">
            {!opened && (
              <DisplayPattern
                id={selected}
                variant={variant}
                moving={moving}
                speed={speed}
                resetKey={resetKey}
                onContacts={setContacts}
              />
            )}
          </div>
          <div className="display-pattern-controls">{!opened && controls}</div>
          <div className="tool-actions">
            <button className="primary-button" onClick={(event) => open(event)}>
              <Expand size={17} />
              Open {selected === 'pixels' ? 'pixel test' : 'test viewer'}
            </button>
            <span className="hint">Fullscreen available inside</span>
          </div>
          {selected === 'pixels' && (
            <div className="display-colors">
              {solidColors.map((color, index) => (
                <button
                  key={color}
                  aria-label={`Inspect ${displayTests[0].variants[index].toLowerCase()} pixels`}
                  style={{ background: color }}
                  onClick={(event) => open(event, index)}
                />
              ))}
            </div>
          )}
          {selected === 'motion' && (
            <p className="hint section-spacer">
              Motion starts only when you choose it.
              {reducedMotion
                ? ' Your reduced-animation preference is enabled; you can still explicitly start this test.'
                : ''}
            </p>
          )}
        </section>
        <aside className="panel display-instructions">
          <span className="eyebrow">YOUR INSPECTION GUIDE</span>
          <h2>What to do</h2>
          <ol>
            {test.how.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
          <h3>What to look for</h3>
          <p>{test.look}</p>
          <div className="display-limit">
            <strong>How to interpret it</strong>
            <p>{test.limit}</p>
          </div>
        </aside>
      </div>
      <section className="panel display-observation">
        <div>
          <h2>Your observation</h2>
          <p>
            Record what you saw in {test.name.toLowerCase()}. Notes stay in this page until you
            export or leave.
          </p>
        </div>
        <div className="display-observation-fields">
          <label className="field-label">
            Inspection finding
            <select
              aria-label="Inspection finding"
              value={inspection.finding}
              onChange={(event) => edit({ finding: event.target.value as Inspection['finding'] })}
            >
              <option value="unreviewed">Not reviewed yet</option>
              <option value="clear">No issue noticed</option>
              <option value="check-again">Something to check again</option>
            </select>
          </label>
          <label className="field-label">
            Notes
            <textarea
              aria-label="Inspection notes"
              maxLength={1500}
              rows={3}
              value={inspection.notes}
              placeholder="e.g. A faint patch near the lower-left edge on dark gray."
              onChange={(event) => edit({ notes: event.target.value })}
            />
          </label>
        </div>
      </section>
      <DisplayDiagnostics onTiming={setTiming} />
      <section className="panel display-faq">
        <h2>A few things before you judge the panel</h2>
        <details>
          <summary>How should I prepare my screen?</summary>
          <p>
            Use the native resolution, reset browser zoom, clean the screen, and keep your viewing
            position and room lighting consistent. Record the monitor preset and brightness with
            your notes so comparisons are repeatable.
          </p>
        </details>
        <details>
          <summary>Can this page measure HDR, color accuracy, or input lag?</summary>
          <p>
            The patterns support visual inspection, and browser APIs provide limited environment
            information. They do not measure peak brightness, color error, panel response time, or
            end-to-end input lag. Those measurements need suitable equipment and a controlled
            method.
          </p>
        </details>
        <details>
          <summary>What should I do if something looks wrong?</summary>
          <p>
            Repeat the check at your normal brightness, try another input or device if available,
            and compare with ordinary content. Keep your observations and consult the monitor
            manufacturer’s guidance and support options for a persistent issue.
          </p>
        </details>
        <details>
          <summary>Does this fix dead pixels or OLED burn-in?</summary>
          <p>
            No. These are inspection patterns. They do not promise repairs or run rapid flashing
            routines. Use the panel maker’s instructions for any maintenance feature.
          </p>
        </details>
      </section>
      <dialog
        ref={dialog}
        className="display-viewer pixel-overlay"
        tabIndex={-1}
        aria-label={`${test.name} viewer`}
        style={{ background: fieldColor(selected, variant) }}
        onCancel={(event) => {
          event.preventDefault();
          close();
        }}
        onClose={() => {
          setOpened(false);
          setMoving(false);
          setHidden(false);
        }}
        onKeyDown={(event) => {
          if ((event.target as HTMLElement).matches('textarea,input')) return;
          if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
            if ((event.target as HTMLElement).matches('select')) return;
            event.preventDefault();
            next(event.key === 'ArrowRight' ? 1 : -1);
          }
          if (event.key.toLowerCase() === 'h') {
            event.preventDefault();
            setHidden((old) => !old);
          }
        }}
      >
        <div
          ref={viewer}
          className="display-viewer-content"
          tabIndex={-1}
          style={{ background: fieldColor(selected, variant) }}
        >
          {opened && (
            <DisplayPattern
              id={selected}
              variant={variant}
              moving={moving}
              speed={speed}
              resetKey={resetKey}
              onContacts={setContacts}
            />
          )}
          <div className="display-viewer-toolbar" hidden={hidden}>
            <div>
              <strong>{test.name}</strong>
              <small>{test.variants[variant]} · ← → change pattern · H hide controls</small>
            </div>
            <div className="display-viewer-options">{opened && controls}</div>
            <div className="tool-actions">
              <button
                className="subtle-button"
                aria-label="Previous pattern"
                onClick={() => next(-1)}
              >
                <ArrowLeft size={17} />
              </button>
              <button
                className="subtle-button"
                onClick={() => next(1)}
                aria-label={selected === 'pixels' ? 'Next color' : 'Next pattern'}
              >
                <ArrowRight size={17} />
                Next
              </button>
              <button
                className="subtle-button"
                onClick={() => {
                  if (fullscreen) void document.exitFullscreen().catch(() => {});
                  else void enterFullscreen();
                }}
              >
                <Expand size={16} />
                {fullscreen ? 'Leave fullscreen' : 'Fullscreen'}
              </button>
              <button
                className="subtle-button"
                onClick={() => {
                  setHidden(true);
                }}
              >
                <EyeOff size={16} />
                Hide controls
              </button>
              <button className="subtle-button" onClick={close}>
                <X size={17} />
                Exit
              </button>
            </div>
            {notice && <p role="status">{notice}</p>}
          </div>
          <button
            className="display-reveal"
            hidden={!hidden}
            aria-label="Show test controls"
            onClick={() => setHidden(false)}
          >
            <Eye size={16} />
            <span>Show controls · H</span>
          </button>
        </div>
      </dialog>
    </div>
  );
}
