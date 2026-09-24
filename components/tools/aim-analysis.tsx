'use client';
import { useState } from 'react';
import { Crosshair, SlidersHorizontal } from 'lucide-react';
import type { AimDetails } from '@/lib/aim-engine';
import { calibrationStep } from '@/lib/aim-calibration';
import { gameOptions } from '@/lib/profile';
import { Metric } from '../tool-ui';

export function AimAnalysis({ result }: { result: AimDetails }) {
  const [game, setGame] = useState<string>('VALORANT');
  const [dpi, setDpi] = useState('800');
  const [target, setTarget] = useState('');
  const [samples, setSamples] = useState(['', '', '', '']);
  const [showCalibration, setShowCalibration] = useState(false);
  const step = calibrationStep(
    { setting: Number(samples[0]), distance: Number(samples[1]) },
    { setting: Number(samples[2]), distance: Number(samples[3]) },
    Number(target),
  );
  const validDpi = Number.isInteger(Number(dpi)) && Number(dpi) >= 100 && Number(dpi) <= 100000;
  const changeSample = (index: number, value: string) =>
    setSamples((old) => old.map((item, i) => (i === index ? value : item)));
  return (
    <section className="aim-analysis" aria-label="Training analysis">
      <div className="section-heading">
        <div>
          <div className="eyebrow">ROUND COMPLETE</div>
          <h2>{result.hits} targets. Your next step.</h2>
          <p>
            {result.duration} seconds ·{' '}
            {result.mode === 'mouse-look' ? 'First-person mouse look' : 'Cursor aim'} · Saved on
            this device
          </p>
        </div>
        <Crosshair size={32} />
      </div>
      <div className="metric-row">
        <Metric label="Accuracy" value={result.accuracy} unit="%" />
        <Metric label="Missed shots" value={result.shots - result.hits} />
        <Metric
          label="Average time to hit"
          value={result.hits ? result.averageHitMs : '—'}
          unit="ms"
        />
        <Metric
          label="Pace"
          value={Math.round((result.hits / result.duration) * 60)}
          unit="hits/min"
        />
      </div>
      <div className="panel analysis-coach">
        <h3>
          {!result.shots
            ? 'Take a practice round first.'
            : result.accuracy < 80
              ? 'Build control before adding speed.'
              : 'Keep your baseline. Test one change at a time.'}
        </h3>
        <p>
          {!result.shots
            ? 'No shots were fired, so this round cannot tell us about your control.'
            : result.accuracy < 80
              ? 'You missed more than one in five shots. Slow your next round down and settle onto each target before firing. A miss alone does not tell us whether your sensitivity is too high or too low.'
              : 'Repeat three rounds with the same duration, mode, and sensitivity. Compare accuracy as well as pace before deciding that a different setting helps.'}
        </p>
        <p className="hint">
          Average time to hit includes time spent missing between hits; it is not a reaction-time
          measurement. This browser exercise cannot identify your ideal in-game sensitivity, DPI,
          ADS, or field of view.
        </p>
      </div>
      <div className="panel calibration-panel">
        <div className="section-heading">
          <div>
            <span className="eyebrow">TAKE IT INTO YOUR GAME</span>
            <h2>Calibrate your own settings</h2>
          </div>
          <SlidersHorizontal size={24} />
        </div>
        <p>
          Match a physical turning distance you already find comfortable. Measure in your game, then
          narrow down its sensitivity setting without relying on guessed conversion factors.
        </p>
        <div className="form-two-columns section-spacer">
          <label className="field-label">
            Competitive game
            <select
              value={game}
              onChange={(event) => {
                setGame(event.target.value);
                setSamples(['', '', '', '']);
                setShowCalibration(false);
              }}
            >
              {gameOptions.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
          <label className="field-label">
            Mouse DPI for these measurements
            <input
              type="number"
              min={100}
              max={100000}
              step={1}
              value={dpi}
              onChange={(event) => {
                setDpi(event.target.value);
                setSamples(['', '', '', '']);
                setShowCalibration(false);
              }}
            />
          </label>
        </div>
        <div className="game-calibration-note">
          <strong>{game} · hip-fire calibration</strong>
          <p>
            {game === 'PUBG PC'
              ? 'Use the same camera perspective and general camera setting for both samples. PUBG’s scoped, aiming, and ADS controls need separate measurements; its slider must not be treated as a linear multiplier.'
              : game === 'Other'
                ? 'This method works when increasing the game’s sensitivity consistently reduces the mouse travel needed for a full turn. Use a practice area that allows a full horizontal rotation.'
                : 'Enter the game’s practice area. Keep the same hip-fire camera, DPI, FOV, and input options for both samples. Calibrate ADS and each scope separately if you use them.'}
          </p>
        </div>
        <ol className="calibration-steps">
          <li>
            Choose a familiar turning distance from your existing setup. Measure mouse travel for
            one complete 360° turn using a ruler; repeat three times and use the average.
          </li>
          <li>
            In {game}, measure at two different sensitivity settings: one requiring more travel than
            your target, one requiring less. Keep acceleration off and use the same movement speed.
          </li>
          <li>
            Try the setting below, measure again, and replace the sample on the same side of your
            target. Repeat until close enough for you. Round to a value the game accepts.
          </li>
        </ol>
        <label className="field-label">
          Your preferred distance (cm per 360° turn)
          <input
            type="number"
            min={0.1}
            step="any"
            value={target}
            onChange={(event) => setTarget(event.target.value)}
            placeholder="Your measured preference, e.g. 40"
          />
        </label>
        <div className="calibration-samples">
          {[0, 1].map((index) => (
            <fieldset key={index}>
              <legend>Measurement {index + 1}</legend>
              <label className="field-label">
                {`Sample ${index + 1} sensitivity`}
                <input
                  type="number"
                  min={0.000001}
                  step="any"
                  value={samples[index * 2]}
                  onChange={(event) => changeSample(index * 2, event.target.value)}
                />
              </label>
              <label className="field-label">
                {`Sample ${index + 1} distance (cm)`}
                <input
                  type="number"
                  min={0.1}
                  step="any"
                  value={samples[index * 2 + 1]}
                  onChange={(event) => changeSample(index * 2 + 1, event.target.value)}
                />
              </label>
            </fieldset>
          ))}
        </div>
        <button className="subtle-button" onClick={() => setShowCalibration(true)}>
          Find next setting to test
        </button>
        {showCalibration &&
          (!validDpi || step.error ? (
            <p className="error-notice section-spacer" role="alert">
              {!validDpi ? 'Enter a whole-number DPI between 100 and 100,000.' : step.error}
            </p>
          ) : (
            <div className="calibration-result section-spacer" role="status">
              <span>
                {step.measured ? 'Your measured match' : 'Next trial setting'} · {game}
              </span>
              <strong>{Number(step.setting!.toPrecision(6))}</strong>
              <p>
                At {Number(dpi).toLocaleString()} DPI · Target {target} cm/360
              </p>
              <p>
                {step.measured
                  ? 'One of your measurements matches your chosen distance. Repeat to confirm it.'
                  : 'This is the midpoint of your two tested settings, not a verified match or an optimal sensitivity. Measure it in-game and narrow the bracket again.'}
              </p>
            </div>
          ))}
        <p className="hint section-spacer">
          DPI is recorded as a measurement condition, not inferred from your score. Browser
          mouse-look sensitivity has separate units and is not a game sensitivity conversion.
        </p>
      </div>
    </section>
  );
}
