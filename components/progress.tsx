'use client';
import Link from 'next/link';
import { useState } from 'react';
import { ArrowUpRight, Download, Trophy } from 'lucide-react';
import { findTool, type ToolId } from '@/lib/catalog';
import { useGamer } from './gamer-provider';
import { ToolIcon } from './icons';
import { Metric } from './tool-ui';

export function Progress() {
  const { results, ready } = useGamer();
  const [filter, setFilter] = useState<ToolId>('reaction');
  const [aimMode, setAimMode] = useState('cursor');
  const [aimDuration, setAimDuration] = useState(30);
  const selected = results.filter(
    (result) =>
      result.tool === filter &&
      (filter !== 'aim' || (result.aim?.mode === aimMode && result.aim?.duration === aimDuration)),
  );
  const chart = selected.slice(0, 10).reverse();
  const maximum = Math.max(1, ...chart.map((result) => result.value));
  const best = selected.length
    ? (filter === 'reaction' ? Math.min : Math.max)(...selected.map((result) => result.value))
    : '—';
  const unit =
    filter === 'reaction' ? 'ms' : filter === 'aim' ? 'hits' : filter === 'cps' ? 'CPS' : 'min';
  const exportResults = () => {
    const rows = [
      [
        'Tool',
        'Value',
        'Unit',
        'Date',
        'Duration (seconds)',
        'Aim mode',
        'Accuracy (%)',
        'Shots',
        'Mouse-look sensitivity',
      ],
      ...results.map((result) => [
        findTool(result.tool)?.name || result.tool,
        result.value,
        result.unit,
        result.date,
        result.aim?.duration ?? '',
        result.aim?.mode ?? '',
        result.aim?.accuracy ?? '',
        result.aim?.shots ?? '',
        result.aim?.mode === 'mouse-look' ? result.aim.sensitivity : '',
      ]),
    ];
    const text = rows
      .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(','))
      .join('\r\n');
    const url = URL.createObjectURL(new Blob([text], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'iamgamer-progress.csv';
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">YOU VS. YOUR PERSONAL BEST</div>
          <h1>
            A little better, every session<span className="purple-text">.</span>
          </h1>
          <p>Your results, your milestones, your progress. Saved on this device.</p>
        </div>
        {results.length > 0 && (
          <button className="subtle-button" onClick={exportResults}>
            <Download size={15} />
            Export results
          </button>
        )}
      </div>
      {!ready ? (
        <div className="empty-state">
          <p>Loading your progress…</p>
        </div>
      ) : !results.length ? (
        <div className="empty-state">
          <Trophy size={43} />
          <h2>Your story starts with one session.</h2>
          <p>
            Complete an aim drill, reaction test, click sprint, or focus session. Your results will
            appear here automatically.
          </p>
          <Link href="/tools/reaction" className="primary-button">
            Set your first personal best
            <ArrowUpRight size={15} />
          </Link>
        </div>
      ) : (
        <>
          <div className="category-tabs" role="group" aria-label="Choose progress chart">
            {(['reaction', 'aim', 'cps', 'session'] as const).map((id) => (
              <button
                className={filter === id ? 'selected' : ''}
                key={id}
                onClick={() => setFilter(id)}
                aria-pressed={filter === id}
              >
                {findTool(id)?.name}
              </button>
            ))}
          </div>
          {filter === 'aim' && (
            <div className="form-two-columns section-spacer">
              <label className="field-label">
                Aim mode
                <select value={aimMode} onChange={(event) => setAimMode(event.target.value)}>
                  <option value="cursor">Cursor aim</option>
                  <option value="mouse-look">First-person mouse look</option>
                </select>
              </label>
              <label className="field-label">
                Round duration
                <select
                  value={aimDuration}
                  onChange={(event) => setAimDuration(Number(event.target.value))}
                >
                  {[15, 30, 60].map((value) => (
                    <option key={value} value={value}>
                      {value} seconds
                    </option>
                  ))}
                </select>
              </label>
            </div>
          )}
          <div className="metric-row">
            <Metric label="All sessions" value={results.length} />
            <Metric label="Selected sessions" value={selected.length} />
            <Metric
              label={filter === 'session' ? 'Longest session' : 'Personal best'}
              value={best}
              unit={unit}
            />
          </div>
          <div className="panel">
            <h2>{findTool(filter)?.name} over time</h2>
            <p>
              {filter === 'reaction'
                ? 'Lower is faster. Each result is an average of five rounds.'
                : filter === 'aim'
                  ? 'Only rounds in the selected mode and duration are compared. Keep your mouse sensitivity consistent. Older aim drills remain in history.'
                  : 'Your last ten completed sessions, from oldest to newest.'}
            </p>
            {chart.length ? (
              <div
                className="progress-chart"
                role="img"
                aria-label={chart
                  .map(
                    (result) =>
                      `${new Date(result.date).toLocaleDateString()}: ${result.value} ${result.unit}`,
                  )
                  .join('; ')}
              >
                {chart.map((result, index) => (
                  <div className="chart-column" key={result.id}>
                    <span>
                      {result.value} {result.unit}
                    </span>
                    <div style={{ height: `${(result.value / maximum) * 100}%` }} />
                    <small>#{selected.length - chart.length + index + 1}</small>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state compact">
                <p>No {findTool(filter)?.name.toLowerCase()} results yet.</p>
                <Link href={`/tools/${filter}`} className="text-link">
                  Start a session
                  <ArrowUpRight size={14} />
                </Link>
              </div>
            )}
          </div>
          <div className="panel">
            <h2>Session history</h2>
            <p className="hint">Your latest 100 results are kept on this device.</p>
            <table className="result-table">
              <thead>
                <tr>
                  <th>Tool</th>
                  <th>Result</th>
                  <th>Completed</th>
                </tr>
              </thead>
              <tbody>
                {results.slice(0, 30).map((result) => (
                  <tr key={result.id}>
                    <td>
                      <Link href={`/tools/${result.tool}`}>
                        <ToolIcon name={findTool(result.tool)?.icon || 'crosshair'} size={17} />
                        {findTool(result.tool)?.name}
                      </Link>
                    </td>
                    <td>
                      {result.value} {result.unit}
                      {result.aim && (
                        <small className="result-detail">
                          {result.aim.duration}s ·{' '}
                          {result.aim.mode === 'mouse-look' ? 'Mouse look' : 'Cursor'} ·{' '}
                          {result.aim.accuracy}%
                        </small>
                      )}
                    </td>
                    <td>
                      {new Date(result.date).toLocaleString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {results.length > 30 && (
              <p className="hint section-spacer">
                Showing your latest 30 sessions. Export results to see all {results.length}.
              </p>
            )}
          </div>
          <div className="tool-actions">
            <button className="subtle-button" onClick={exportResults}>
              <Download size={15} />
              Download all results as CSV
            </button>
          </div>
        </>
      )}
    </>
  );
}
