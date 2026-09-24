'use client';
import { useEffect, useRef, useState } from 'react';
import { MousePointerClick, RotateCcw, Trophy, Zap } from 'lucide-react';
import { useGamer } from '../gamer-provider';
import { Metric, ToolHelp } from '../tool-ui';

export function ReactionTest() {
  const { addResult } = useGamer();
  const [phase, setPhase] = useState<'idle' | 'waiting' | 'ready' | 'too-soon' | 'round' | 'done'>(
    'idle',
  );
  const [rounds, setRounds] = useState<number[]>([]);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const frame = useRef(0);
  const started = useRef(0);
  const phaseRef = useRef(phase);
  const changePhase = (next: typeof phase) => {
    phaseRef.current = next;
    setPhase(next);
  };
  const clear = () => {
    if (timer.current) clearTimeout(timer.current);
    cancelAnimationFrame(frame.current);
  };
  useEffect(() => {
    const visibility = () => {
      if (document.hidden) {
        clear();
        phaseRef.current = 'idle';
        setPhase('idle');
        setRounds([]);
      }
    };
    document.addEventListener('visibilitychange', visibility);
    return () => {
      clear();
      document.removeEventListener('visibilitychange', visibility);
    };
  }, []);
  const act = () => {
    if (phaseRef.current === 'waiting') {
      clear();
      changePhase('too-soon');
      return;
    }
    if (phaseRef.current === 'ready') {
      const value = Math.round(performance.now() - started.current);
      const next = [...rounds, value];
      setRounds(next);
      if (next.length === 5) {
        changePhase('done');
        addResult('reaction', Math.round(next.reduce((a, b) => a + b, 0) / 5), 'ms');
      } else changePhase('round');
      return;
    }
    if (phaseRef.current === 'done') setRounds([]);
    changePhase('waiting');
    timer.current = setTimeout(
      () => {
        frame.current = requestAnimationFrame(() => {
          started.current = performance.now();
          changePhase('ready');
        });
      },
      1400 + Math.random() * 2700,
    );
  };
  const average = rounds.length
    ? Math.round(rounds.reduce((a, b) => a + b, 0) / rounds.length)
    : '—';
  return (
    <>
      <div className="metric-row">
        <Metric label="Round" value={`${Math.min(rounds.length + 1, 5)} / 5`} />
        <Metric label="Average" value={average} unit="ms" />
        <Metric label="Best round" value={rounds.length ? Math.min(...rounds) : '—'} unit="ms" />
      </div>
      <button
        className={`training-field ${phase}`}
        onPointerDown={(event) => {
          if (event.button === 0) {
            event.preventDefault();
            act();
          }
        }}
        onKeyDown={(event) => {
          if ([' ', 'Enter'].includes(event.key)) {
            event.preventDefault();
            if (!event.repeat) act();
          }
        }}
        aria-label={phase === 'ready' ? 'Click now!' : 'Reaction test area'}
      >
        {phase === 'done' ? <Trophy size={42} /> : <Zap size={42} />}
        <h2 className={phase === 'done' || phase === 'round' ? 'big-result' : ''}>
          {phase === 'idle'
            ? 'Ready to test your reflexes?'
            : phase === 'waiting'
              ? 'Wait for green…'
              : phase === 'ready'
                ? 'GO! Click now!'
                : phase === 'too-soon'
                  ? 'A little too eager!'
                  : phase === 'round'
                    ? `${rounds[rounds.length - 1]} ms`
                    : `${average} ms`}
        </h2>
        <p>
          {phase === 'idle'
            ? 'Click here or press Space to start five rounds.'
            : phase === 'waiting'
              ? 'Hold steady. The signal is coming.'
              : phase === 'ready'
                ? 'This is your moment.'
                : phase === 'too-soon'
                  ? 'That one doesn’t count. Click to retry this round.'
                  : phase === 'done'
                    ? 'Five rounds complete. Average saved! Click to play again.'
                    : 'Nice. Click to start the next round.'}
        </p>
      </button>
      <div className="round-dots" aria-label={`${rounds.length} of 5 rounds completed`}>
        {[0, 1, 2, 3, 4].map((index) => (
          <span key={index} className={index < rounds.length ? 'done' : ''} />
        ))}
      </div>
      <ToolHelp>
        React when the area turns green and says GO. Use the same device and input method to compare
        attempts. Display and browser delays affect results. Switching tabs cancels the current run.
      </ToolHelp>
    </>
  );
}

function useDrill(kind: 'aim' | 'cps', duration: number) {
  const { addResult } = useGamer();
  const [phase, setPhase] = useState<'idle' | 'running' | 'done'>('idle');
  const [remaining, setRemaining] = useState(duration);
  const [hits, setHits] = useState(0);
  const [misses, setMisses] = useState(0);
  const [interrupted, setInterrupted] = useState(false);
  const state = useRef({ running: false, deadline: 0, hits: 0, misses: 0 });
  const interval = useRef<ReturnType<typeof setInterval> | null>(null);
  const stopInterval = () => {
    if (interval.current) clearInterval(interval.current);
  };
  useEffect(() => {
    const visibility = () => {
      if (document.hidden && state.current.running) {
        state.current.running = false;
        stopInterval();
        setPhase('idle');
        setInterrupted(true);
      }
    };
    document.addEventListener('visibilitychange', visibility);
    return () => {
      stopInterval();
      document.removeEventListener('visibilitychange', visibility);
    };
  }, []);
  const finish = () => {
    if (!state.current.running) return;
    state.current.running = false;
    stopInterval();
    setPhase('done');
    setRemaining(0);
    addResult(
      kind,
      kind === 'cps' ? Number((state.current.hits / duration).toFixed(1)) : state.current.hits,
      kind === 'cps' ? 'CPS' : 'hits',
    );
  };
  const start = () => {
    stopInterval();
    state.current = {
      running: true,
      deadline: performance.now() + duration * 1000,
      hits: 0,
      misses: 0,
    };
    setHits(0);
    setMisses(0);
    setRemaining(duration);
    setPhase('running');
    setInterrupted(false);
    interval.current = setInterval(() => {
      const left = Math.max(0, (state.current.deadline - performance.now()) / 1000);
      setRemaining(left);
      if (!left) finish();
    }, 50);
  };
  const hit = (success: boolean) => {
    if (!state.current.running) return false;
    if (performance.now() >= state.current.deadline) {
      finish();
      return false;
    }
    if (success) {
      state.current.hits++;
      setHits(state.current.hits);
    } else {
      state.current.misses++;
      setMisses(state.current.misses);
    }
    return true;
  };
  return { phase, remaining, hits, misses, interrupted, start, hit };
}

export function ClickSpeed() {
  const drill = useDrill('cps', 5);
  const cps =
    drill.phase === 'done'
      ? (drill.hits / 5).toFixed(1)
      : drill.hits
        ? (drill.hits / Math.max(0.1, 5 - drill.remaining)).toFixed(1)
        : '0.0';
  return (
    <>
      <div className="metric-row">
        <Metric label="Time left" value={drill.remaining.toFixed(1)} unit="sec" />
        <Metric label="Clicks" value={drill.hits} />
        <Metric label="Click speed" value={cps} unit="CPS" />
      </div>
      {drill.interrupted && (
        <p className="error-notice">Run canceled because the tab was hidden.</p>
      )}
      <button
        className="training-field"
        disabled={drill.phase === 'done'}
        onPointerDown={(event) => {
          if (event.button !== 0) return;
          event.preventDefault();
          if (drill.phase === 'idle') drill.start();
          drill.hit(true);
        }}
        onContextMenu={(event) => event.preventDefault()}
      >
        <MousePointerClick size={45} />
        <h2>
          {drill.phase === 'idle'
            ? 'Ready, set, click.'
            : drill.phase === 'done'
              ? `${cps} clicks per second`
              : 'Keep clicking!'}
        </h2>
        <p>
          {drill.phase === 'idle'
            ? 'Your first click starts a five-second sprint.'
            : drill.phase === 'done'
              ? 'Result saved to your progress.'
              : 'Every click counts. Find your rhythm.'}
        </p>
      </button>
      {drill.phase === 'done' && (
        <div className="tool-actions centered">
          <button className="primary-button" onClick={drill.start}>
            <RotateCcw size={15} />
            Try again
          </button>
        </div>
      )}
      <ToolHelp>
        A pointer-only exercise: click or tap within the area. Keep your hand relaxed and stop if
        you feel discomfort. Your score is total clicks divided by five seconds.
      </ToolHelp>
    </>
  );
}
