'use client';
import { useEffect, useRef, useState } from 'react';
import { Activity, Ruler } from 'lucide-react';
import { frameSummary, panelDimensions } from '@/lib/display-tests';

export type ScreenReading = {
  screenCss: string;
  viewportCss: string;
  dpr: number;
  colorDepth: number;
  gamut: string;
  highDynamicRange: boolean;
};
export function readScreen(): ScreenReading {
  return {
    screenCss: `${screen.width} × ${screen.height}`,
    viewportCss: `${innerWidth} × ${innerHeight}`,
    dpr: devicePixelRatio,
    colorDepth: screen.colorDepth,
    gamut: matchMedia('(color-gamut: rec2020)').matches
      ? 'Rec. 2020'
      : matchMedia('(color-gamut: p3)').matches
        ? 'Display P3'
        : matchMedia('(color-gamut: srgb)').matches
          ? 'sRGB'
          : 'Not reported',
    highDynamicRange: matchMedia('(dynamic-range: high)').matches,
  };
}
export type TimingReading = NonNullable<ReturnType<typeof frameSummary>> & {
  measuredAt: string;
  intervals: number[];
};
export function DisplayDiagnostics({ onTiming }: { onTiming: (reading: TimingReading) => void }) {
  const [screenInfo, setScreenInfo] = useState<ScreenReading | null>(null);
  const [timing, setTiming] = useState<TimingReading | null>(null);
  const [sampling, setSampling] = useState(false);
  const [notice, setNotice] = useState('');
  const frame = useRef(0);
  const samplingRef = useRef(false);
  const [dimensions, setDimensions] = useState({ width: '2560', height: '1440', diagonal: '27' });
  const physical = panelDimensions(
    Number(dimensions.width),
    Number(dimensions.height),
    Number(dimensions.diagonal),
  );
  useEffect(() => {
    const update = () => setScreenInfo(readScreen());
    const initial = requestAnimationFrame(update);
    const queries = [
      matchMedia('(color-gamut: p3)'),
      matchMedia('(color-gamut: rec2020)'),
      matchMedia('(dynamic-range: high)'),
    ];
    window.addEventListener('resize', update);
    window.addEventListener('focus', update);
    queries.forEach((query) => query.addEventListener('change', update));
    const hidden = () => {
      if (document.hidden && samplingRef.current) {
        cancelAnimationFrame(frame.current);
        samplingRef.current = false;
        setSampling(false);
        setNotice(
          'Measurement canceled because the tab was hidden. Keep this page visible and try again.',
        );
      }
    };
    document.addEventListener('visibilitychange', hidden);
    return () => {
      cancelAnimationFrame(initial);
      cancelAnimationFrame(frame.current);
      window.removeEventListener('resize', update);
      window.removeEventListener('focus', update);
      queries.forEach((query) => query.removeEventListener('change', update));
      document.removeEventListener('visibilitychange', hidden);
    };
  }, []);
  const measure = () => {
    cancelAnimationFrame(frame.current);
    setSampling(true);
    samplingRef.current = true;
    setNotice('');
    setTiming(null);
    let started = 0;
    let last = 0;
    const intervals: number[] = [];
    const tick = (now: number) => {
      if (!samplingRef.current) return;
      if (!started) {
        started = now;
        last = now;
      } else {
        const delta = now - last;
        if (delta > 0) intervals.push(delta);
        last = now;
      }
      if (now - started < 5000) {
        frame.current = requestAnimationFrame(tick);
        return;
      }
      samplingRef.current = false;
      setSampling(false);
      const summary = frameSummary(intervals);
      if (summary) {
        const result = { ...summary, intervals, measuredAt: new Date().toISOString() };
        setTiming(result);
        onTiming(result);
      } else setNotice('No usable timing samples were collected. Try again.');
    };
    frame.current = requestAnimationFrame(tick);
  };
  return (
    <div className="display-diagnostics">
      <section className="panel display-timing">
        <div className="display-section-title">
          <Activity size={21} />
          <h2>Frame pacing</h2>
          <span className="display-tag">BROWSER ESTIMATE</span>
        </div>
        <p>
          Sample five seconds of animation frames. Keep the tab visible and close other heavy tasks
          for a more consistent comparison.
        </p>
        <div className="timing-result">
          <strong>{sampling ? '…' : (timing?.fps ?? '—')}</strong>
          <span>frames / second</span>
          <button className="primary-button" disabled={sampling} onClick={measure}>
            {sampling ? 'Sampling for 5 seconds…' : 'Measure frame rate'}
          </button>
        </div>
        {timing && (
          <>
            <div className="timing-metrics">
              <span>
                Median interval<strong>{timing.medianMs} ms</strong>
              </span>
              <span>
                95th percentile<strong>{timing.p95Ms} ms</strong>
              </span>
              <span>
                Longest interval<strong>{timing.longestMs} ms</strong>
              </span>
              <span>
                Long intervals<strong>{timing.longIntervals}</strong>
              </span>
            </div>
            <svg
              className="frame-time-chart"
              viewBox="0 0 600 100"
              preserveAspectRatio="none"
              role="img"
              aria-label={`Frame interval chart. Median ${timing.medianMs} milliseconds, longest ${timing.longestMs} milliseconds.`}
            >
              <line x1="0" y1="90" x2="600" y2="90" stroke="#44364f" />
              <polyline
                points={timing.intervals
                  .map(
                    (value, index) =>
                      `${(index / Math.max(1, timing.intervals.length - 1)) * 600},${90 - (value / Math.max(1, ...timing.intervals)) * 80}`,
                  )
                  .join(' ')}
                fill="none"
                stroke="#bba0f5"
                strokeWidth="1.5"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
            <p className="hint">
              {timing.samples} intervals collected. “Long” means over 1.5× this run’s median; these
              are not confirmed dropped display frames.
            </p>
          </>
        )}
        {notice && (
          <p className="account-notice section-spacer" role="status">
            {notice}
          </p>
        )}
        <p className="display-limit">
          Browser frame timing can be limited by load, power saving, or compositing. It does not
          certify your monitor’s refresh rate, response time, or VRR support.
        </p>
      </section>
      <section className="panel">
        <div className="display-section-title">
          <h2>Your browser’s display report</h2>
        </div>
        <dl className="screen-info">
          <div>
            <dt>Screen size · CSS pixels</dt>
            <dd>{screenInfo?.screenCss ?? '—'}</dd>
          </div>
          <div>
            <dt>Window viewport · CSS pixels</dt>
            <dd>{screenInfo?.viewportCss ?? '—'}</dd>
          </div>
          <div>
            <dt>Device pixel ratio</dt>
            <dd>{screenInfo?.dpr ?? '—'}</dd>
          </div>
          <div>
            <dt>Reported color depth</dt>
            <dd>{screenInfo ? `${screenInfo.colorDepth} bits per pixel` : '—'}</dd>
          </div>
          <div>
            <dt>Reported color gamut</dt>
            <dd>{screenInfo?.gamut ?? '—'}</dd>
          </div>
          <div>
            <dt>High dynamic range capability</dt>
            <dd>
              {screenInfo
                ? screenInfo.highDynamicRange
                  ? 'Reported by browser'
                  : 'Not reported'
                : '—'}
            </dd>
          </div>
        </dl>
        <p className="display-limit">
          CSS dimensions are affected by scaling. Color depth is a browser value, not the panel’s
          per-channel bit depth. Gamut/HDR flags do not measure coverage, peak brightness, or
          certify an HDR grade.
        </p>
      </section>
      <section className="panel display-size">
        <div className="display-section-title">
          <Ruler size={21} />
          <h2>Pixel density & screen size</h2>
        </div>
        <p>
          Enter the panel’s native resolution and diagonal from its specifications. These inputs are
          manual; the example starts at 27-inch 1440p.
        </p>
        <div className="display-size-inputs">
          {(
            [
              ['width', 'Native width (pixels)'],
              ['height', 'Native height (pixels)'],
              ['diagonal', 'Diagonal (inches)'],
            ] as const
          ).map(([key, label]) => (
            <label key={key} className="field-label">
              {label}
              <input
                type="number"
                min={1}
                max={key === 'diagonal' ? 300 : 100000}
                step={key === 'diagonal' ? 'any' : 1}
                value={dimensions[key]}
                onChange={(event) =>
                  setDimensions((old) => ({ ...old, [key]: event.target.value }))
                }
              />
            </label>
          ))}
        </div>
        {physical ? (
          <div className="display-size-results">
            <strong>
              {physical.ppi.toFixed(1)} <small>PPI</small>
            </strong>
            <span>
              Visible rectangle: {physical.widthCm.toFixed(1)} × {physical.heightCm.toFixed(1)} cm
            </span>
          </div>
        ) : (
          <p className="error-notice" role="alert">
            Use whole-number pixel dimensions from 1 to 100,000 and a diagonal from 1 to 300 inches.
          </p>
        )}
        <p className="hint">
          Calculated for a flat rectangular screen; bezels are excluded. Curved-panel physical
          dimensions can differ.
        </p>
      </section>
    </div>
  );
}
