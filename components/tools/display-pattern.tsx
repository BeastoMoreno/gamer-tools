'use client';
import { useEffect, useRef, useState } from 'react';
import { fieldColor, gray, type DisplayTestId } from '@/lib/display-tests';

function MotionPattern({
  moving,
  speed,
  variant,
}: {
  moving: boolean;
  speed: number;
  variant: number;
}) {
  const root = useRef<HTMLDivElement>(null);
  const offset = useRef(0);
  useEffect(() => {
    if (!moving) return;
    let frame = 0;
    let last = 0;
    const tick = (now: number) => {
      const node = root.current;
      if (!node) return;
      if (last && !document.hidden) offset.current += (Math.min(now - last, 100) / 1000) * speed;
      last = now;
      const width = node.clientWidth + 180;
      node.querySelectorAll<HTMLElement>('.motion-object').forEach((item, index) => {
        item.style.transform = `translateX(${((offset.current + index * 85) % width) - 170}px)`;
      });
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [moving, speed]);
  return (
    <div
      ref={root}
      className="display-motion-lanes"
      role="img"
      aria-label="Three motion tracks on dark, medium, and light gray"
    >
      {['#161616', '#808080', '#e0e0e0'].map((background, index) => (
        <div key={background} style={{ background }}>
          <span className="motion-track-label">{['DARK', 'MIDTONE', 'LIGHT'][index]}</span>
          <div className="motion-object">
            {variant === 0 ? (
              <>
                <i />
                <b>+</b>
                <i />
              </>
            ) : (
              <strong>TRACK THIS →</strong>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function TouchPattern({ onContacts }: { onContacts: (n: number) => void }) {
  const [visited, setVisited] = useState<Set<number>>(new Set());
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const mark = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== 'touch' || !pointers.current.has(event.pointerId)) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 8;
    const y = ((event.clientY - rect.top) / rect.height) * 6;
    const previous = pointers.current.get(event.pointerId)!;
    const count = Math.max(1, Math.ceil(Math.hypot(x - previous.x, y - previous.y) * 4));
    setVisited((old) => {
      const next = new Set(old);
      for (let i = 0; i <= count; i++) {
        const col = Math.floor(previous.x + ((x - previous.x) * i) / count);
        const row = Math.floor(previous.y + ((y - previous.y) * i) / count);
        if (col >= 0 && col < 8 && row >= 0 && row < 6) next.add(row * 8 + col);
      }
      return next;
    });
    pointers.current.set(event.pointerId, { x, y });
  };
  const release = (event: React.PointerEvent) => {
    pointers.current.delete(event.pointerId);
    onContacts(pointers.current.size);
  };
  useEffect(() => {
    const clear = () => {
      pointers.current.clear();
      onContacts(0);
    };
    window.addEventListener('blur', clear);
    return () => window.removeEventListener('blur', clear);
  }, [onContacts]);
  return (
    <div
      className="display-touch-grid"
      aria-label={`${visited.size} of 48 cells visited by touch`}
      onPointerDown={(event) => {
        if (event.pointerType !== 'touch') return;
        event.preventDefault();
        event.currentTarget.setPointerCapture(event.pointerId);
        const rect = event.currentTarget.getBoundingClientRect();
        pointers.current.set(event.pointerId, {
          x: ((event.clientX - rect.left) / rect.width) * 8,
          y: ((event.clientY - rect.top) / rect.height) * 6,
        });
        onContacts(pointers.current.size);
        mark(event);
      }}
      onPointerMove={mark}
      onPointerUp={release}
      onPointerCancel={release}
      onLostPointerCapture={release}
    >
      {Array.from({ length: 48 }, (_, i) => (
        <span key={i} className={visited.has(i) ? 'visited' : ''}>
          {visited.has(i) ? '✓' : i + 1}
        </span>
      ))}
      <output>{visited.size}/48 cells visited</output>
    </div>
  );
}

export function DisplayPattern({
  id,
  variant,
  moving,
  speed,
  resetKey,
  onContacts,
}: {
  id: DisplayTestId;
  variant: number;
  moving: boolean;
  speed: number;
  resetKey: number;
  onContacts: (n: number) => void;
}) {
  const [position, setPosition] = useState({ x: 50, y: 45 });
  const background = fieldColor(id, variant);
  if (id === 'motion') return <MotionPattern moving={moving} speed={speed} variant={variant} />;
  if (id === 'touch') return <TouchPattern key={resetKey} onContacts={onContacts} />;
  if (id === 'blooming')
    return (
      <div
        className="display-blooming"
        onPointerMove={(event) => {
          const rect = event.currentTarget.getBoundingClientRect();
          setPosition({
            x: Math.max(8, Math.min(92, ((event.clientX - rect.left) / rect.width) * 100)),
            y: Math.max(15, Math.min(85, ((event.clientY - rect.top) / rect.height) * 100)),
          });
        }}
        onPointerDown={(event) => {
          const rect = event.currentTarget.getBoundingClientRect();
          setPosition({
            x: ((event.clientX - rect.left) / rect.width) * 100,
            y: ((event.clientY - rect.top) / rect.height) * 100,
          });
        }}
      >
        <div
          className={`bloom-object bloom-variant-${variant}`}
          style={{ left: `${position.x}%`, top: `${position.y}%` }}
        >
          {variant === 2 ? 'A quiet scene. A bright subtitle.' : ''}
        </div>
      </div>
    );
  if (id === 'gradients')
    return (
      <div
        className="display-gradient"
        style={{
          background: [
            'linear-gradient(90deg,#000,#fff)',
            'linear-gradient(90deg,#000,#303030)',
            'linear-gradient(90deg,#000,#f00)',
            'linear-gradient(90deg,#000,#0f0)',
            'linear-gradient(90deg,#000,#00f)',
            'linear-gradient(90deg,#f00,#ff0,#0f0,#0ff,#00f,#f0f,#f00)',
          ][variant],
        }}
      />
    );
  if (id === 'black' || id === 'white')
    return (
      <div className="display-tonal" style={{ background }}>
        {variant === 0 &&
          Array.from({ length: 17 }, (_, i) => {
            const value = id === 'black' ? i * 2 : 223 + i * 2;
            return (
              <div key={value}>
                <span style={{ background: gray(value) }} />
                <small style={{ color: id === 'black' ? '#b0b0b0' : '#404040' }}>{value}</small>
              </div>
            );
          })}
      </div>
    );
  if (id === 'grayscale') {
    const count = [16, 32, 8][variant];
    return (
      <div className="display-gray-steps" role="img" aria-label={`${count} grayscale steps`}>
        {Array.from({ length: count }, (_, i) => {
          const value = Math.round((i / (count - 1)) * 255);
          return (
            <span
              key={i}
              style={{ background: gray(value), color: i < count / 2 ? '#fff' : '#000' }}
            >
              {count <= 16 && <small>{value}</small>}
            </span>
          );
        })}
      </div>
    );
  }
  if (id === 'sharpness')
    return variant === 1 ? (
      <div className="display-checker" />
    ) : (
      <div className="display-sharpness">
        <div className="display-fine-lines" />
        <div>
          {[12, 16, 24, 36].map((size) => (
            <p key={size} style={{ fontSize: size }}>
              Aim clearly. 0123456789 Aa Bb
            </p>
          ))}
        </div>
        <div className="display-fine-lines vertical" />
      </div>
    );
  return (
    <div className="display-solid" style={{ background }}>
      {id === 'uniformity' && (
        <div className="display-zone-grid" aria-hidden="true">
          {Array.from({ length: 9 }, (_, i) => (
            <span key={i} />
          ))}
        </div>
      )}
    </div>
  );
}
