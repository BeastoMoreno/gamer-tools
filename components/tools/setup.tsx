'use client';
import { useEffect, useRef, useState } from 'react';
import { Check, Copy, Download, Pause, Play, RotateCcw, Timer } from 'lucide-react';
import { ToolHelp } from '../tool-ui';
import { useGamer } from '../gamer-provider';

export function SensitivityCalculator() {
  const [dpi, setDpi] = useState('800');
  const [sensitivity, setSensitivity] = useState('0.4');
  const [newDpi, setNewDpi] = useState('1600');
  const [notice, setNotice] = useState('');
  const valid = [dpi, sensitivity, newDpi].every(
    (value) => Number.isFinite(Number(value)) && Number(value) > 0 && Number(value) <= 100000,
  );
  const edpi = Number(dpi) * Number(sensitivity);
  const converted = edpi / Number(newDpi);
  return (
    <>
      <div className="tool-grid">
        <div className="panel">
          <h2>Dial in your settings</h2>
          <label className="field-label">
            Current mouse DPI
            <input
              type="number"
              min="1"
              max="100000"
              value={dpi}
              onChange={(event) => {
                setDpi(event.target.value);
                setNotice('');
              }}
            />
          </label>
          <label className="field-label">
            In-game sensitivity
            <input
              type="number"
              min="0.0001"
              max="100000"
              step="0.01"
              value={sensitivity}
              onChange={(event) => {
                setSensitivity(event.target.value);
                setNotice('');
              }}
            />
          </label>
          <label className="field-label">
            New mouse DPI
            <input
              type="number"
              min="1"
              max="100000"
              value={newDpi}
              onChange={(event) => {
                setNewDpi(event.target.value);
                setNotice('');
              }}
            />
          </label>
          <p className="hint">
            Keep your turn distance consistent when changing DPI in the same game.
          </p>
        </div>
        <div className="panel">
          <span className="result-caption">Your effective DPI</span>
          <div className="calculator-result">
            {valid ? Number(edpi.toFixed(4)).toLocaleString() : '—'}
            <small> eDPI</small>
          </div>
          <div className="result-divider" />
          <span className="result-caption">Sensitivity at your new DPI</span>
          <div className="calculator-result">{valid ? Number(converted.toFixed(6)) : '—'}</div>
          {!valid && (
            <p className="error-notice">Enter positive numbers up to 100,000 in all fields.</p>
          )}
          <button
            className="subtle-button"
            disabled={!valid}
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(String(Number(converted.toFixed(6))));
                setNotice('Sensitivity copied.');
              } catch {
                setNotice('Clipboard unavailable. Select and copy the number above.');
              }
            }}
          >
            <Copy size={14} />
            Copy sensitivity
          </button>
          <p className="hint section-spacer" role="status">
            {notice}
          </p>
        </div>
      </div>
      <ToolHelp>
        eDPI = mouse DPI × in-game sensitivity. New sensitivity = eDPI ÷ new DPI. Use this within
        the same game and sensitivity scale; different games need different conversion factors.
        Mouse acceleration can affect the feel.
      </ToolHelp>
    </>
  );
}

export function CrosshairStudio() {
  const [length, setLength] = useState(10);
  const [gap, setGap] = useState(5);
  const [thickness, setThickness] = useState(2);
  const [color, setColor] = useState('#a4ffbf');
  const [dot, setDot] = useState(false);
  const [outline, setOutline] = useState(true);
  const [notice, setNotice] = useState('');
  const segments = [
    { left: -thickness / 2, top: -gap - length, width: thickness, height: length },
    { left: -thickness / 2, top: gap, width: thickness, height: length },
    { left: -gap - length, top: -thickness / 2, width: length, height: thickness },
    { left: gap, top: -thickness / 2, width: length, height: thickness },
    ...(dot
      ? [{ left: -thickness / 2, top: -thickness / 2, width: thickness, height: thickness }]
      : []),
  ];
  const download = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    segments.forEach((segment) => {
      if (outline) {
        ctx.fillStyle = '#000000';
        ctx.fillRect(
          64 + segment.left - 1,
          64 + segment.top - 1,
          segment.width + 2,
          segment.height + 2,
        );
      }
      ctx.fillStyle = color;
      ctx.fillRect(64 + segment.left, 64 + segment.top, segment.width, segment.height);
    });
    const link = document.createElement('a');
    link.download = 'iamgamer-crosshair.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
    setNotice('Your transparent 128 × 128 PNG is ready.');
  };
  return (
    <>
      <div className="tool-grid">
        <div className="panel">
          <h2>Make it yours</h2>
          <div className="presets">
            <button
              onClick={() => {
                setLength(10);
                setGap(5);
                setThickness(2);
                setDot(false);
              }}
            >
              Classic
            </button>
            <button
              onClick={() => {
                setLength(5);
                setGap(3);
                setThickness(1);
                setDot(false);
              }}
            >
              Precision
            </button>
            <button
              onClick={() => {
                setLength(0);
                setGap(0);
                setThickness(4);
                setDot(true);
              }}
            >
              Dot
            </button>
          </div>
          {[
            { name: 'Line length', value: length, set: setLength, min: 0, max: 25 },
            { name: 'Center gap', value: gap, set: setGap, min: 0, max: 20 },
            { name: 'Thickness', value: thickness, set: setThickness, min: 1, max: 8 },
          ].map((field) => (
            <label className="field-label" key={field.name}>
              <span>
                {field.name}
                <small>{field.value} px</small>
              </span>
              <input
                type="range"
                min={field.min}
                max={field.max}
                value={field.value}
                onChange={(event) => field.set(Number(event.target.value))}
              />
            </label>
          ))}
          <label className="field-label">
            Crosshair color
            <input type="color" value={color} onChange={(event) => setColor(event.target.value)} />
          </label>
          <div className="settings-row">
            <label htmlFor="crosshair-dot">Center dot</label>
            <input
              id="crosshair-dot"
              type="checkbox"
              checked={dot}
              onChange={(event) => setDot(event.target.checked)}
            />
          </div>
          <div className="settings-row">
            <label htmlFor="crosshair-outline">Black outline</label>
            <input
              id="crosshair-outline"
              type="checkbox"
              checked={outline}
              onChange={(event) => setOutline(event.target.checked)}
            />
          </div>
        </div>
        <div className="panel">
          <h2>The view from here</h2>
          <div className="crosshair-preview">
            <span className="preview-label">LIVE PREVIEW · ACTUAL PIXEL SIZE</span>
            <div className="crosshair-lines">
              {segments.map((segment, index) => (
                <i
                  key={index}
                  style={{
                    ...segment,
                    background: color,
                    boxShadow: outline ? '0 0 0 1px #000' : 'none',
                  }}
                />
              ))}
            </div>
          </div>
          <div className="tool-actions">
            <button className="primary-button" onClick={download} disabled={length === 0 && !dot}>
              <Download size={15} />
              Export PNG
            </button>
            <button
              className="subtle-button"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(
                    JSON.stringify({ length, gap, thickness, color, dot, outline }),
                  );
                  setNotice('Design settings copied as JSON.');
                } catch {
                  setNotice('Clipboard unavailable. Your settings are visible in the controls.');
                }
              }}
            >
              <Copy size={14} />
              Copy settings
            </button>
          </div>
          <p className="hint section-spacer" role="status">
            {notice ||
              'Transparent background. Ready for your stream graphics or design references.'}
          </p>
        </div>
      </div>
      <ToolHelp>
        This studio creates an image and design settings, not a game-specific import code or an
        in-game overlay. Match the values manually in games that support custom crosshairs.
      </ToolHelp>
    </>
  );
}

export function SessionTimer() {
  const { addResult } = useGamer();
  const [mode, setMode] = useState<'focus' | 'break'>('focus');
  const [minutes, setMinutes] = useState(25);
  const [remaining, setRemaining] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [completed, setCompleted] = useState(false);
  const deadline = useRef(0);
  useEffect(() => {
    if (!running) return;
    const timer = setInterval(() => {
      const left = Math.max(0, Math.ceil((deadline.current - Date.now()) / 1000));
      setRemaining(left);
      if (left === 0) {
        clearInterval(timer);
        setRunning(false);
        setCompleted(true);
        if (mode === 'focus') addResult('session', minutes, 'min');
      }
    }, 200);
    return () => clearInterval(timer);
  }, [running, mode, minutes, addResult]);
  const configure = (nextMode: typeof mode, value: number) => {
    setRunning(false);
    setCompleted(false);
    setMode(nextMode);
    setMinutes(value);
    setRemaining(value * 60);
  };
  return (
    <>
      <div className="panel center-panel">
        <div className="presets">
          <button
            className={mode === 'focus' ? 'selected' : ''}
            onClick={() => configure('focus', 25)}
          >
            Focus session
          </button>
          <button
            className={mode === 'break' ? 'selected' : ''}
            onClick={() => configure('break', 5)}
          >
            Take a break
          </button>
        </div>
        <Timer size={27} style={{ margin: '0 auto', color: 'var(--purple)' }} />
        <h2 style={{ marginTop: 15 }}>
          {completed
            ? mode === 'focus'
              ? 'Good session. Time to reset.'
              : 'Refreshed and ready.'
            : mode === 'focus'
              ? 'One session. Full focus.'
              : 'Step away. Come back fresh.'}
        </h2>
        <p>
          {mode === 'focus'
            ? 'Set an intention, settle in, and enjoy your game.'
            : 'Look away from the screen, stretch, and get some water.'}
        </p>
        <div
          className="timer-display"
          role="timer"
          aria-label={`${Math.floor(remaining / 60)} minutes ${remaining % 60} seconds`}
        >
          {String(Math.floor(remaining / 60)).padStart(2, '0')}:
          {String(remaining % 60).padStart(2, '0')}
        </div>
        {completed && (
          <p className="success-notice" role="status">
            <Check size={15} style={{ display: 'inline', verticalAlign: 'middle' }} />{' '}
            {mode === 'focus' ? 'Focus session saved to your progress.' : 'Break complete.'}
          </p>
        )}
        <div className="tool-actions centered">
          <button
            className="primary-button"
            onClick={() => {
              if (running) {
                setRemaining(Math.max(0, Math.ceil((deadline.current - Date.now()) / 1000)));
                setRunning(false);
              } else {
                const seconds = remaining || minutes * 60;
                setRemaining(seconds);
                setCompleted(false);
                deadline.current = Date.now() + seconds * 1000;
                setRunning(true);
              }
            }}
          >
            {running ? <Pause size={15} /> : <Play size={15} />}{' '}
            {running ? 'Pause' : completed ? 'Start again' : 'Start timer'}
          </button>
          <button className="subtle-button" onClick={() => configure(mode, minutes)}>
            <RotateCcw size={15} />
            Reset
          </button>
        </div>
        <div className="presets" style={{ marginTop: 25, marginBottom: 0 }}>
          {(mode === 'focus' ? [15, 25, 45, 60] : [5, 10, 15]).map((value) => (
            <button
              key={value}
              className={minutes === value ? 'selected' : ''}
              onClick={() => configure(mode, value)}
            >
              {value} min
            </button>
          ))}
        </div>
      </div>
      <ToolHelp>
        Keep this tool open during your session. The timer continues in a background tab using
        elapsed time; navigating away or reloading resets it. Completed focus sessions are saved on
        this device.
      </ToolHelp>
    </>
  );
}
