'use client';
import { useEffect, useRef, useState } from 'react';
import { Gamepad2, Keyboard, RotateCcw } from 'lucide-react';
import { Metric, ToolHelp } from '../tool-ui';
import { MouseModel } from './mouse-model';

const keyRows = [
  [
    'Escape:Esc',
    'F1',
    'F2',
    'F3',
    'F4',
    'F5',
    'F6',
    'F7',
    'F8',
    'F9',
    'F10',
    'F11',
    'F12',
    'Delete:Del',
  ],
  [
    'Backquote:`',
    'Digit1:1',
    'Digit2:2',
    'Digit3:3',
    'Digit4:4',
    'Digit5:5',
    'Digit6:6',
    'Digit7:7',
    'Digit8:8',
    'Digit9:9',
    'Digit0:0',
    'Minus:-',
    'Equal:=',
    'Backspace',
  ],
  [
    'Tab',
    'KeyQ:Q',
    'KeyW:W',
    'KeyE:E',
    'KeyR:R',
    'KeyT:T',
    'KeyY:Y',
    'KeyU:U',
    'KeyI:I',
    'KeyO:O',
    'KeyP:P',
    'BracketLeft:[',
    'BracketRight:]',
    'Backslash:\\',
  ],
  [
    'CapsLock:Caps',
    'KeyA:A',
    'KeyS:S',
    'KeyD:D',
    'KeyF:F',
    'KeyG:G',
    'KeyH:H',
    'KeyJ:J',
    'KeyK:K',
    'KeyL:L',
    'Semicolon:;',
    'Quote:’',
    'Enter',
  ],
  [
    'ShiftLeft:Shift',
    'KeyZ:Z',
    'KeyX:X',
    'KeyC:C',
    'KeyV:V',
    'KeyB:B',
    'KeyN:N',
    'KeyM:M',
    'Comma:,',
    'Period:.',
    'Slash:/',
    'ShiftRight:Shift',
    'ArrowUp:↑',
  ],
  [
    'ControlLeft:Ctrl',
    'MetaLeft:Win',
    'AltLeft:Alt',
    'Space:Space',
    'AltRight:Alt',
    'ControlRight:Ctrl',
    'ArrowLeft:←',
    'ArrowDown:↓',
    'ArrowRight:→',
  ],
];
export function KeyboardTester() {
  const [pressed, setPressed] = useState<string[]>([]);
  const [seen, setSeen] = useState<string[]>([]);
  const [peak, setPeak] = useState(0);
  const [log, setLog] = useState<string[]>([]);
  const [active, setActive] = useState(false);
  const held = useRef(new Set<string>());
  const board = useRef<HTMLDivElement>(null);
  return (
    <>
      <div className="metric-row">
        <Metric label="Keys tested" value={seen.length} />
        <Metric label="Currently held" value={pressed.length} />
        <Metric label="Max simultaneous" value={peak} />
      </div>
      <div
        className="panel keyboard-test"
        ref={board}
        tabIndex={0}
        role="group"
        aria-label="Keyboard test area. Press keys to test. Tab or Escape exits."
        onFocus={() => setActive(true)}
        onBlur={() => {
          held.current.clear();
          setPressed([]);
          setActive(false);
        }}
        onKeyDown={(event) => {
          if (event.key === 'Tab' || event.key === 'Escape') {
            if (event.key === 'Escape') board.current?.blur();
            return;
          }
          event.preventDefault();
          if (event.repeat) return;
          held.current.add(event.code);
          setPressed([...held.current]);
          setPeak((old) => Math.max(old, held.current.size));
          setSeen((old) => (old.includes(event.code) ? old : [...old, event.code]));
          setLog((old) => [event.code, ...old].slice(0, 12));
        }}
        onKeyUp={(event) => {
          held.current.delete(event.code);
          setPressed([...held.current]);
        }}
      >
        <div className="section-heading">
          <h2>{active ? 'Listening to your keyboard…' : 'Click here, then press any key'}</h2>
          <Keyboard size={23} className="purple-text" />
        </div>
        <p>
          Test individual keys or hold a combination. Press Tab or Escape to leave the test area.
        </p>
        <div className="keyboard-board" aria-hidden="true">
          {keyRows.map((row, index) => (
            <div className="key-row" key={index}>
              {row.map((item) => {
                const [code, label] = item.split(':');
                return (
                  <span
                    key={code}
                    className={`keyboard-key ${['Backspace', 'Enter', 'ShiftLeft', 'ShiftRight', 'CapsLock', 'Tab'].includes(code) ? 'wide' : ''} ${code === 'Space' ? 'space' : ''} ${seen.includes(code) ? 'seen' : ''} ${pressed.includes(code) ? 'pressed' : ''}`}
                  >
                    {label || code}
                  </span>
                );
              })}
            </div>
          ))}
        </div>
        <div className="key-log">
          {log.length ? log.join(' · ') : 'Your recent key presses will appear here.'}
        </div>
      </div>
      <div className="tool-actions">
        <button
          className="subtle-button"
          onClick={() => {
            held.current.clear();
            setPressed([]);
            setSeen([]);
            setPeak(0);
            setLog([]);
          }}
        >
          <RotateCcw size={15} />
          Reset keyboard
        </button>
      </div>
      <ToolHelp>
        The layout shows physical US key positions; the event log works with other layouts and
        numpads too. Tab and Escape are reserved for leaving the test. System and browser shortcuts
        may be intercepted before reaching this page. This test cannot measure switch latency.
      </ToolHelp>
    </>
  );
}

export function MouseTester() {
  const [counts, setCounts] = useState([0, 0, 0, 0, 0]);
  const [buttons, setButtons] = useState(0);
  const [scroll, setScroll] = useState(0);
  const [rate, setRate] = useState(0);
  const [trail, setTrail] = useState<{ x: number; y: number }[]>([]);
  const [rapid, setRapid] = useState(0);
  const times = useRef<number[]>([]);
  const lastClicks = useRef<Record<number, number>>({});
  const arena = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const node = arena.current;
    const wheel = (event: WheelEvent) => {
      event.preventDefault();
      setScroll((old) => old + event.deltaY);
    };
    node?.addEventListener('wheel', wheel, { passive: false });
    // Browser history is canceled only while this tester is mounted. No history entries are added.
    const mouseDown = (event: MouseEvent) => {
      const side = event.button === 3 || event.button === 4;
      if (!side && !node?.contains(event.target as Node)) return;
      event.preventDefault();
      const now = performance.now();
      const last = lastClicks.current[event.button];
      if (last !== undefined && now - last < 70) setRapid((old) => old + 1);
      lastClicks.current[event.button] = now;
      setCounts((old) => old.map((count, index) => (index === event.button ? count + 1 : count)));
      setButtons(event.buttons);
    };
    const releaseButton = (event: MouseEvent) => {
      if (event.button === 3 || event.button === 4) event.preventDefault();
      setButtons(event.buttons);
    };
    const cancelAuxiliary = (event: MouseEvent) => {
      if (event.button === 3 || event.button === 4 || node?.contains(event.target as Node))
        event.preventDefault();
    };
    const blur = () => setButtons(0);
    window.addEventListener('mousedown', mouseDown, { capture: true, passive: false });
    window.addEventListener('mouseup', releaseButton, { capture: true, passive: false });
    window.addEventListener('pointerup', releaseButton, { capture: true, passive: false });
    window.addEventListener('auxclick', cancelAuxiliary, { capture: true, passive: false });
    window.addEventListener('blur', blur);
    const timer = setInterval(() => {
      const now = performance.now();
      times.current = times.current.filter((time) => time > now - 1000);
      setRate(times.current.length);
    }, 250);
    return () => {
      node?.removeEventListener('wheel', wheel);
      window.removeEventListener('mousedown', mouseDown, true);
      window.removeEventListener('mouseup', releaseButton, true);
      window.removeEventListener('pointerup', releaseButton, true);
      window.removeEventListener('auxclick', cancelAuxiliary, true);
      window.removeEventListener('blur', blur);
      clearInterval(timer);
    };
  }, []);
  return (
    <>
      <div className="metric-row">
        <Metric label="Total clicks" value={counts.reduce((a, b) => a + b, 0)} />
        <Metric label="Move events" value={rate} unit="/ sec" />
        <Metric label="Rapid pairs (<70 ms)" value={rapid} />
      </div>
      <div
        ref={arena}
        className="mouse-arena"
        onContextMenu={(event) => event.preventDefault()}
        onPointerMove={(event) => {
          times.current.push(performance.now());
          const rect = event.currentTarget.getBoundingClientRect();
          setTrail((old) => [
            ...old.slice(-49),
            { x: event.clientX - rect.left, y: event.clientY - rect.top },
          ]);
          setButtons(event.buttons);
        }}
      >
        <MouseModel buttons={buttons} />
        <div className="mouse-arena-instructions">
          <h2>See every click.</h2>
          <p>
            Press a mouse button to light it up in silver. Move and scroll anywhere in this area.
          </p>
        </div>
        {trail.map((point, index) => (
          <span
            className="mouse-trail"
            key={index}
            style={{ left: point.x, top: point.y, opacity: ((index + 1) / trail.length) * 0.7 }}
          />
        ))}
      </div>
      <div className="button-indicators">
        {['Left', 'Middle', 'Right', 'Back', 'Forward'].map((name, index) => (
          <span className={buttons & [1, 4, 2, 8, 16][index] ? 'active' : ''} key={name}>
            {name}: {counts[index]}
          </span>
        ))}
        <span>Scroll delta: {Math.round(scroll)}</span>
      </div>
      <div className="tool-actions">
        <button
          className="subtle-button"
          onClick={() => {
            setCounts([0, 0, 0, 0, 0]);
            setButtons(0);
            setScroll(0);
            setRate(0);
            setRapid(0);
            setTrail([]);
            times.current = [];
            lastClicks.current = {};
          }}
        >
          <RotateCcw size={15} />
          Reset test
        </button>
      </div>
      <ToolHelp>
        Move events are browser-delivered events, not your mouse’s hardware polling rate. Rapid
        pairs can be intentional and don’t prove a faulty switch. Scroll delta units depend on the
        device and browser. Back/Forward navigation is blocked while this tester is open. Mouse
        software that remaps a side button to a keyboard shortcut must be changed in that software.
      </ToolHelp>
    </>
  );
}

type Pad = { id: string; axes: number[]; buttons: { pressed: boolean; value: number }[] };
export function GamepadTester() {
  const [pad, setPad] = useState<Pad | null>(null);
  const [error, setError] = useState('');
  useEffect(() => {
    const timer = setInterval(() => {
      try {
        if (!navigator.getGamepads) {
          setError('This browser does not support the Gamepad API. Try a current desktop browser.');
          return;
        }
        const connected = Array.from(navigator.getGamepads()).find((item) => item?.connected);
        setPad(
          connected
            ? {
                id: connected.id,
                axes: [...connected.axes],
                buttons: connected.buttons.map((button) => ({
                  pressed: button.pressed,
                  value: button.value,
                })),
              }
            : null,
        );
      } catch {
        setError('Controller access is unavailable in this browser context.');
      }
    }, 60);
    return () => clearInterval(timer);
  }, []);
  return (
    <>
      {error && (
        <div className="error-notice" role="alert">
          {error}
        </div>
      )}
      {!pad ? (
        <div className="training-field">
          <Gamepad2 size={60} />
          <h2>Your controller goes here.</h2>
          <p>Connect a controller by USB or Bluetooth, then press a button to wake it up.</p>
          <span className="hint">Listening for a connected gamepad…</span>
        </div>
      ) : (
        <div className="panel">
          <p className="gamepad-name">{pad.id}</p>
          <div className="metric-row">
            <Metric label="Buttons" value={pad.buttons.length} />
            <Metric label="Axes" value={pad.axes.length} />
            <Metric
              label="Active buttons"
              value={pad.buttons.filter((button) => button.pressed).length}
            />
          </div>
          <div className="sticks">
            {[0, 2]
              .filter((offset) => pad.axes.length > offset + 1)
              .map((offset) => (
                <div className="stick" key={offset}>
                  <span
                    style={{
                      left: `${50 + pad.axes[offset] * 46}%`,
                      top: `${50 + pad.axes[offset + 1] * 46}%`,
                    }}
                  />
                  <small>
                    {offset ? 'Right' : 'Left'}: {pad.axes[offset].toFixed(3)},{' '}
                    {pad.axes[offset + 1].toFixed(3)}
                  </small>
                </div>
              ))}
          </div>
          <div className="gamepad-buttons">
            {pad.buttons.map((button, index) => (
              <div key={index} className={button.pressed ? 'pressed' : ''}>
                B{index}
                <small>{button.value.toFixed(2)}</small>
              </div>
            ))}
          </div>
          {pad.axes.length > 4 && (
            <p className="hint section-spacer">
              Additional axes:{' '}
              {pad.axes
                .slice(4)
                .map((value, index) => `A${index + 4}: ${value.toFixed(3)}`)
                .join(' · ')}
            </p>
          )}
        </div>
      )}
      <ToolHelp>
        Standard controllers usually map axes 0–1 to the left stick and 2–3 to the right. At rest,
        inspect movement around the center. A small offset alone does not establish a hardware
        fault. Inputs depend on browser and controller support.
      </ToolHelp>
    </>
  );
}
