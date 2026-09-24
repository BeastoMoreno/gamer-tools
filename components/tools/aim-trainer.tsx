'use client';
import { useEffect, useRef, useState } from 'react';
import { Crosshair, Expand, Play, Square } from 'lucide-react';
import type { AimDetails, AimEngine, AimSnapshot } from '@/lib/aim-engine';
import { useGamer } from '../gamer-provider';
import { ToolHelp } from '../tool-ui';
import { AimAnalysis } from './aim-analysis';

const initial: AimSnapshot = {
  phase: 'idle',
  remaining: 30,
  countdown: 3,
  hits: 0,
  shots: 0,
  accuracy: 0,
  go: false,
};
export function AimTrainer() {
  const { addResult, reducedMotion } = useGamer();
  const stage = useRef<HTMLDivElement>(null);
  const viewport = useRef<HTMLDivElement>(null);
  const target = useRef<HTMLButtonElement>(null);
  const engine = useRef<AimEngine | null>(null);
  const phase = useRef(initial.phase);
  const starting = useRef(false);
  const generation = useRef(0);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [snapshot, setSnapshot] = useState(initial);
  const [result, setResult] = useState<AimDetails | null>(null);
  const [duration, setDuration] = useState(30);
  const [full, setFull] = useState(false);
  const [locked, setLocked] = useState(false);
  const [sensitivity, setSensitivity] = useState(1);
  const [launching, setLaunching] = useState(false);
  const active = snapshot.phase === 'countdown' || snapshot.phase === 'running';
  useEffect(() => {
    let alive = true;
    const mountGeneration = generation.current;
    const root = stage.current;
    const release = () => {
      if (document.pointerLockElement === root) document.exitPointerLock();
      if (document.fullscreenElement === root) void document.exitFullscreen().catch(() => {});
    };
    const cancel = (message: string) => {
      if (!['running', 'countdown'].includes(phase.current)) return;
      phase.current = 'idle';
      engine.current?.cancel();
      setNotice(message);
      release();
    };
    void import('@/lib/aim-engine')
      .then(({ AimEngine }) => {
        if (!alive || !viewport.current) return;
        try {
          engine.current = new AimEngine(
            viewport.current,
            {
              tick: (value) => {
                if (alive) {
                  phase.current = value.phase;
                  setSnapshot(value);
                }
              },
              finish: (value) => {
                if (!alive) return;
                phase.current = 'done';
                setResult(value);
                addResult('aim', value.hits, 'hits', value);
                release();
              },
              target: (x, y, diameter, visible) => {
                const button = target.current;
                if (!button) return;
                button.style.left = `${x}px`;
                button.style.top = `${y}px`;
                button.style.width = `${diameter}px`;
                button.style.height = `${diameter}px`;
                button.style.display = visible ? 'block' : 'none';
              },
              contextLost: () => {
                if (alive) {
                  setReady(false);
                  setError(
                    'The 3D range lost its graphics connection. Reload this page to reconnect.',
                  );
                  release();
                }
              },
            },
            reducedMotion || matchMedia('(prefers-reduced-motion: reduce)').matches,
          );
          setReady(true);
        } catch {
          setError(
            'This range needs WebGL graphics. Enable hardware acceleration in your browser, then reload.',
          );
        }
      })
      .catch(() => {
        if (alive) setError('The range could not load. Check your connection and reload.');
      });
    const movement = (event: MouseEvent) => {
      if (document.pointerLockElement === root)
        engine.current?.look(event.movementX, event.movementY);
    };
    const lockChange = () => {
      const isLocked = document.pointerLockElement === root;
      setLocked(isLocked);
      if (!isLocked && !starting.current)
        cancel('Round canceled when mouse look was released. Your unfinished round was not saved.');
    };
    const fullscreenChange = () => {
      if (!document.fullscreenElement && !starting.current)
        cancel('Round canceled when fullscreen was closed. Start again when ready.');
    };
    const visibility = () => {
      if (document.hidden) cancel('Round canceled because the tab was hidden.');
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') cancel('Round canceled. Start again when ready.');
    };
    document.addEventListener('mousemove', movement);
    document.addEventListener('pointerlockchange', lockChange);
    document.addEventListener('fullscreenchange', fullscreenChange);
    document.addEventListener('visibilitychange', visibility);
    document.addEventListener('keydown', escape);
    return () => {
      alive = false;
      generation.current = mountGeneration + 1;
      release();
      engine.current?.dispose();
      engine.current = null;
      document.removeEventListener('mousemove', movement);
      document.removeEventListener('pointerlockchange', lockChange);
      document.removeEventListener('fullscreenchange', fullscreenChange);
      document.removeEventListener('visibilitychange', visibility);
      document.removeEventListener('keydown', escape);
    };
  }, [addResult, reducedMotion]);
  const start = async () => {
    if (!engine.current || !ready || starting.current || active) return;
    starting.current = true;
    setLaunching(true);
    setNotice('');
    setResult(null);
    const currentGeneration = generation.current;
    const root = stage.current!;
    let mode: AimDetails['mode'] = 'cursor';
    try {
      if (full) {
        if (!root.requestFullscreen) {
          setNotice('Fullscreen is not supported here. Starting a windowed cursor round.');
        } else {
          try {
            await root.requestFullscreen();
            if (generation.current !== currentGeneration) return;
            try {
              await root.requestPointerLock();
              if (document.pointerLockElement === root) mode = 'mouse-look';
              else setNotice('Mouse look is unavailable. Use your cursor to aim in fullscreen.');
            } catch {
              setNotice('Mouse look was not granted. Use your cursor to aim in fullscreen.');
            }
          } catch {
            setNotice('Fullscreen was not granted. Starting a windowed cursor round.');
          }
        }
      }
      if (generation.current !== currentGeneration || document.hidden) return;
      engine.current?.start(duration, sensitivity, mode);
    } finally {
      starting.current = false;
      if (generation.current === currentGeneration) setLaunching(false);
    }
  };
  const stop = () => {
    phase.current = 'idle';
    engine.current?.cancel();
    setNotice('Round canceled. No result saved.');
    if (document.pointerLockElement === stage.current) document.exitPointerLock();
    if (document.fullscreenElement === stage.current)
      void document.exitFullscreen().catch(() => {});
  };
  return (
    <>
      <div className="panel range-settings">
        <fieldset disabled={active || launching}>
          <legend>Session length</legend>
          <div className="range-duration" role="group" aria-label="Session length">
            {[15, 30, 60].map((value) => (
              <button
                key={value}
                className={duration === value ? 'selected' : ''}
                aria-pressed={duration === value}
                onClick={() => setDuration(value)}
              >
                {value} sec
              </button>
            ))}
          </div>
        </fieldset>
        <label className="range-fullscreen">
          <input
            type="checkbox"
            checked={full}
            disabled={active || launching}
            onChange={(event) => setFull(event.target.checked)}
          />
          <Expand size={18} />
          <span>
            Fullscreen mouse look<small>Immersive view · press Esc to exit</small>
          </span>
        </label>
        <label className="field-label range-sensitivity">
          Mouse-look sensitivity · {sensitivity.toFixed(2)}
          <input
            type="range"
            min={0.2}
            max={3}
            step={0.05}
            value={sensitivity}
            disabled={active || launching}
            onChange={(event) => setSensitivity(Number(event.target.value))}
          />
        </label>
      </div>
      {notice && (
        <p className="account-notice" role="status">
          {notice}
        </p>
      )}
      {error && (
        <p className="error-notice" role="alert">
          {error}
        </p>
      )}
      <div
        ref={stage}
        className={`aim-stage ${locked ? 'mouse-locked' : ''}`}
        onContextMenu={(event) => event.preventDefault()}
        onPointerDown={(event) => {
          if (event.button === 0 && phase.current === 'running') {
            event.preventDefault();
            engine.current?.shoot(event.clientX, event.clientY);
          }
        }}
      >
        <div ref={viewport} className="aim-viewport" />
        <div className="range-hud">
          <span>
            <i />
            PRACTICE RANGE <small>{locked ? 'MOUSE LOOK' : 'CURSOR AIM'}</small>
          </span>
          <div>
            <span>
              HITS<strong>{snapshot.hits}</strong>
            </span>
            <span>
              TIME
              <strong>
                {Math.ceil(active ? snapshot.remaining : duration)}
                <small>s</small>
              </strong>
            </span>
            <span>
              ACCURACY
              <strong>
                {snapshot.accuracy}
                <small>%</small>
              </strong>
            </span>
          </div>
        </div>
        <button
          ref={target}
          className="aim-target-access"
          aria-label="Hit target"
          tabIndex={-1}
          style={{ display: 'none' }}
        />
        {locked && active && <span className="range-crosshair" aria-hidden="true" />}
        {snapshot.phase === 'countdown' && (
          <div className="range-countdown" role="status">
            <span>GET READY</span>
            <strong key={snapshot.countdown}>{snapshot.countdown}</strong>
            <p>
              {locked
                ? 'Move your mouse to look. Click to fire.'
                : 'Point at the targets. Click or tap to fire.'}
            </p>
          </div>
        )}
        {snapshot.go && (
          <div className="range-go" role="status">
            GO
          </div>
        )}
        {!active && (
          <div className="range-welcome">
            <span className="eyebrow">THE RANGE IS YOURS</span>
            <Crosshair size={44} />
            <h2>{snapshot.phase === 'done' ? 'Good practice. Go again?' : 'Find your focus.'}</h2>
            <p>{duration} seconds. One target at a time.</p>
            <button
              className="primary-button"
              disabled={!ready || launching}
              onClick={() => void start()}
            >
              <Play size={17} />
              {launching
                ? 'Opening range…'
                : !ready
                  ? 'Loading range…'
                  : snapshot.phase === 'done'
                    ? 'Play again'
                    : 'Start training'}
            </button>
          </div>
        )}
        <div className="range-bottom">
          <span>
            {active
              ? locked
                ? 'LEFT CLICK · FIRE / ESC · EXIT'
                : 'CLICK OR TAP · FIRE / ESC · CANCEL'
              : '3D TARGET PRACTICE / NO DOWNLOAD NEEDED'}
          </span>
          {active && (
            <button
              className="subtle-button"
              onPointerDown={(event) => event.stopPropagation()}
              onClick={stop}
            >
              <Square size={13} />
              End round
            </button>
          )}
        </div>
      </div>
      <ToolHelp>
        Choose 15, 30, or 60 seconds. Fullscreen adds first-person mouse look when your browser
        permits it; windowed mode uses your cursor. The timer starts after 3–2–1. Exiting
        fullscreen, releasing mouse look, or switching tabs cancels the round. Use the same mode and
        duration for comparisons. Browser input and display delays affect results.
      </ToolHelp>
      {result && (
        <AimAnalysis key={`${result.duration}-${result.hits}-${result.shots}`} result={result} />
      )}
    </>
  );
}
