'use client';
import { useEffect, useRef, useState } from 'react';
import { Camera, Mic, Square, Video } from 'lucide-react';
import { Metric, ToolHelp } from '../tool-ui';

export function MediaTester({ kind }: { kind: 'audio' | 'webcam' }) {
  const video = useRef<HTMLVideoElement>(null);
  const waveform = useRef<HTMLCanvasElement>(null);
  const stream = useRef<MediaStream | null>(null);
  const audioContext = useRef<AudioContext | null>(null);
  const request = useRef(0);
  const frame = useRef(0);
  const mounted = useRef(false);
  const [active, setActive] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [level, setLevel] = useState(0);
  const [peak, setPeak] = useState(0);
  const [device, setDevice] = useState('');
  const [settings, setSettings] = useState<MediaTrackSettings>({});
  const release = () => {
    cancelAnimationFrame(frame.current);
    stream.current?.getTracks().forEach((track) => track.stop());
    stream.current = null;
    if (audioContext.current) void audioContext.current.close().catch(() => {});
    audioContext.current = null;
    if (video.current) video.current.srcObject = null;
  };
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      release();
    };
  }, []);
  const stop = () => {
    request.current++;
    release();
    setActive(false);
    setPending(false);
    setLevel(0);
    setPeak(0);
    setDevice('');
    setSettings({});
  };
  const start = async () => {
    const token = ++request.current;
    setPending(true);
    setError('');
    release();
    setPeak(0);
    try {
      if (!navigator.mediaDevices?.getUserMedia)
        throw new Error('Media access requires HTTPS or localhost and a supported browser.');
      // Create the audio context inside the user gesture for Safari compatibility.
      if (kind === 'audio') {
        audioContext.current = new AudioContext();
        await audioContext.current.resume();
      }
      if (!mounted.current || token !== request.current) return;
      const media = await navigator.mediaDevices.getUserMedia(
        kind === 'audio'
          ? {
              audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
              video: false,
            }
          : {
              video: { width: { ideal: 1920 }, height: { ideal: 1080 }, frameRate: { ideal: 60 } },
              audio: false,
            },
      );
      if (!mounted.current || token !== request.current) {
        media.getTracks().forEach((track) => track.stop());
        return;
      }
      stream.current = media;
      const track = media.getTracks()[0];
      setDevice(track.label);
      setSettings(track.getSettings());
      track.addEventListener('ended', () => {
        if (mounted.current && token === request.current) {
          stop();
          setError(
            'The device disconnected or its permission was revoked. Reconnect it and try again.',
          );
        }
      });
      if (kind === 'webcam' && video.current) {
        video.current.srcObject = media;
        await video.current.play();
      }
      if (kind === 'audio' && audioContext.current) {
        const source = audioContext.current.createMediaStreamSource(media);
        const analyser = audioContext.current.createAnalyser();
        analyser.fftSize = 2048;
        source.connect(analyser);
        const data = new Uint8Array(analyser.fftSize);
        let lastUpdate = 0;
        const draw = (now: number) => {
          if (token !== request.current || !mounted.current) return;
          analyser.getByteTimeDomainData(data);
          let squares = 0;
          let maximum = 0;
          for (const value of data) {
            const sample = (value - 128) / 128;
            squares += sample * sample;
            maximum = Math.max(maximum, Math.abs(sample));
          }
          if (now - lastUpdate > 80) {
            setLevel(Math.sqrt(squares / data.length));
            setPeak(maximum);
            lastUpdate = now;
          }
          const canvas = waveform.current;
          const ctx = canvas?.getContext('2d');
          if (canvas && ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.strokeStyle = '#c4a0ed';
            ctx.lineWidth = 2;
            ctx.beginPath();
            data.forEach((value, index) => {
              const x = (index / data.length) * canvas.width;
              const y = (value / 255) * canvas.height;
              if (!index) ctx.moveTo(x, y);
              else ctx.lineTo(x, y);
            });
            ctx.stroke();
          }
          frame.current = requestAnimationFrame(draw);
        };
        frame.current = requestAnimationFrame(draw);
      }
      if (mounted.current && token === request.current) setActive(true);
    } catch (caught) {
      if (!mounted.current || token !== request.current) return;
      release();
      setActive(false);
      const name = caught instanceof Error ? caught.name : '';
      setError(
        name === 'NotAllowedError'
          ? 'Permission was not granted. Allow access in your browser’s site settings, then try again.'
          : name === 'NotFoundError'
            ? 'No matching device was found. Connect a device and try again.'
            : name === 'NotReadableError'
              ? 'The device is busy or unavailable. Close other apps using it and try again.'
              : caught instanceof Error
                ? caught.message
                : 'Could not start the device. Please try again.',
      );
    } finally {
      if (mounted.current && token === request.current) setPending(false);
    }
  };
  const snapshot = () => {
    if (!video.current?.videoWidth) return;
    const canvas = document.createElement('canvas');
    canvas.width = video.current.videoWidth;
    canvas.height = video.current.videoHeight;
    canvas.getContext('2d')?.drawImage(video.current, 0, 0);
    const link = document.createElement('a');
    link.download = 'iamgamer-camera-check.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };
  return (
    <>
      {error && (
        <div className="error-notice" role="alert">
          {error}
        </div>
      )}
      <div className="panel">
        <div className="section-heading">
          <h2>{kind === 'audio' ? 'Make yourself heard.' : 'Looking game-ready.'}</h2>
          {active && (
            <span className="local-badge">
              <span className="status-dot" />
              LIVE · LOCAL ONLY
            </span>
          )}
        </div>
        <p>
          {kind === 'audio'
            ? 'Speak naturally and watch your input level. Audio is visualized locally and is not recorded.'
            : 'Preview your camera before a call or stream. Your video is never uploaded.'}
        </p>
        {kind === 'webcam' ? (
          <>
            <video
              ref={video}
              className="media-screen section-spacer"
              autoPlay
              playsInline
              muted
              style={{ display: active ? 'block' : 'none' }}
            />
            {!active && (
              <div className="media-placeholder">
                <Video size={50} />
                <p>Your camera is off.</p>
              </div>
            )}
          </>
        ) : (
          <>
            <canvas
              ref={waveform}
              className="media-screen section-spacer"
              width={900}
              height={180}
              style={{ aspectRatio: '5 / 1' }}
              aria-label="Live microphone waveform"
            />
            <div
              className="level-meter"
              role="meter"
              aria-label="Microphone RMS level"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(level * 100)}
            >
              <div style={{ width: `${Math.min(100, level * 100)}%` }} />
            </div>
            <p className="hint">
              {active
                ? peak >= 0.98
                  ? 'Near full scale — try lowering your input gain.'
                  : 'Speak at your usual distance from the microphone.'
                : 'Your microphone is off. Start a check to see your waveform.'}
            </p>
          </>
        )}
        <div className="tool-actions">
          {!active ? (
            <button className="primary-button" disabled={pending} onClick={start}>
              {kind === 'audio' ? <Mic size={16} /> : <Video size={16} />}{' '}
              {pending
                ? 'Waiting for permission…'
                : kind === 'audio'
                  ? 'Start microphone check'
                  : 'Start camera preview'}
            </button>
          ) : (
            <button className="subtle-button" onClick={stop}>
              <Square size={14} />
              Stop {kind === 'audio' ? 'microphone' : 'camera'}
            </button>
          )}
          {pending && (
            <button className="subtle-button" onClick={stop}>
              Cancel request
            </button>
          )}
          {active && kind === 'webcam' && (
            <button className="subtle-button" onClick={snapshot}>
              <Camera size={15} />
              Save snapshot
            </button>
          )}
        </div>
      </div>
      {active && (
        <div className="section-spacer">
          <p className="gamepad-name">{device}</p>
          <div className="metric-row">
            {kind === 'audio' ? (
              <>
                <Metric
                  label="RMS level"
                  value={level > 0 ? (20 * Math.log10(level)).toFixed(1) : '−∞'}
                  unit="dBFS"
                />
                <Metric label="Peak level" value={Math.round(peak * 100)} unit="%" />
                <Metric label="Sample rate" value={settings.sampleRate || '—'} unit="Hz" />
              </>
            ) : (
              <>
                <Metric label="Width" value={settings.width || '—'} unit="px" />
                <Metric label="Height" value={settings.height || '—'} unit="px" />
                <Metric
                  label="Negotiated rate"
                  value={settings.frameRate ? Math.round(settings.frameRate) : '—'}
                  unit="fps"
                />
              </>
            )}
          </div>
        </div>
      )}
      <ToolHelp>
        {kind === 'audio'
          ? 'Microphone levels are digital input levels, not room loudness in decibels. Your browser or device may still apply processing. No audio is sent to your speakers, preventing feedback.'
          : 'Resolution and frame rate come from the active camera track. Negotiated frame rate is not a measurement of delivered frames.'}{' '}
        Access starts only after you allow it and stops when you leave this tool.
      </ToolHelp>
    </>
  );
}
