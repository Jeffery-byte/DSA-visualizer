import { useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { SkipBack, SkipForward, Play, Pause, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';
import { useStore } from '../../store';

const SPEED_OPTIONS = [
  { label: '0.25×', ms: 1600 },
  { label: '0.5×', ms: 1000 },
  { label: '1×', ms: 600 },
  { label: '2×', ms: 300 },
  { label: '4×', ms: 120 },
] as const;

export default function PlaybackControls() {
  const {
    frames, currentFrameIndex, isPlaying,
    speed, nextFrame, prevFrame, goToFrame,
    setPlaying, setSpeed, reset,
  } = useStore();

  // Use a ref so the interval callback always sees the latest nextFrame
  // without needing to be re-created (avoids stale-closure bug with
  // useStore.getState() and prevents interval restart on every frame change).
  const nextFrameRef = useRef(nextFrame);
  useEffect(() => { nextFrameRef.current = nextFrame; }, [nextFrame]);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => nextFrameRef.current(), speed);
    } else {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isPlaying, speed]);

  // Auto-stop when the last frame is reached.
  // setPlaying is a stable Zustand action reference — safe in deps.
  useEffect(() => {
    if (isPlaying && currentFrameIndex >= frames.length - 1) {
      setPlaying(false);
    }
  }, [currentFrameIndex, frames.length, isPlaying, setPlaying]);

  const progress = frames.length > 1 ? currentFrameIndex / (frames.length - 1) : 0;
  const currentSpeed = SPEED_OPTIONS.find(s => s.ms === speed) ?? SPEED_OPTIONS[2];

  const handleScrub = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    goToFrame(Math.round(ratio * (frames.length - 1)));
  }, [goToFrame, frames.length]);

  const handlePlayPause = useCallback(() => {
    if (currentFrameIndex >= frames.length - 1) reset();
    setPlaying(!isPlaying);
  }, [currentFrameIndex, frames.length, isPlaying, reset, setPlaying]);

  return (
    <div className="flex-shrink-0 bg-slate-900/90 border-t border-slate-800 px-4 py-3">
      {/* Progress bar */}
      <div className="mb-3">
        <div
          role="slider"
          aria-label="Playback progress"
          aria-valuemin={0}
          aria-valuemax={frames.length - 1}
          aria-valuenow={currentFrameIndex}
          tabIndex={0}
          className="w-full h-1.5 bg-slate-800 rounded-full cursor-pointer relative"
          onClick={handleScrub}
          onKeyDown={(e) => {
            if (e.key === 'ArrowRight') nextFrame();
            if (e.key === 'ArrowLeft') prevFrame();
          }}
        >
          <motion.div
            className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500 pointer-events-none"
            animate={{ width: `${progress * 100}%` }}
            transition={{ duration: 0.15 }}
          />
          <motion.div
            aria-hidden="true"
            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white shadow-lg pointer-events-none"
            animate={{ left: `calc(${progress * 100}% - 6px)` }}
            transition={{ duration: 0.15 }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-slate-600 font-mono mt-1">
          <span>Step {currentFrameIndex + 1}</span>
          <span>{frames.length} total</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          <ControlButton onClick={() => goToFrame(0)} aria-label="Go to first step">
            <SkipBack size={14} />
          </ControlButton>
          <ControlButton onClick={prevFrame} aria-label="Previous step" disabled={currentFrameIndex === 0}>
            <ChevronLeft size={16} />
          </ControlButton>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handlePlayPause}
            aria-label={isPlaying ? 'Pause' : 'Play'}
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
              boxShadow: isPlaying ? '0 0 16px #3b82f640' : 'none',
            }}
          >
            {isPlaying
              ? <Pause size={16} fill="white" color="white" />
              : <Play  size={16} fill="white" color="white" />}
          </motion.button>

          <ControlButton onClick={nextFrame} aria-label="Next step" disabled={currentFrameIndex >= frames.length - 1}>
            <ChevronRight size={16} />
          </ControlButton>
          <ControlButton onClick={() => goToFrame(frames.length - 1)} aria-label="Go to last step">
            <SkipForward size={14} />
          </ControlButton>
          <ControlButton onClick={() => { reset(); setPlaying(false); }} aria-label="Reset">
            <RotateCcw size={13} />
          </ControlButton>
        </div>

        <div className="flex items-center gap-1">
          <span className="text-[10px] text-slate-500 mr-1" id="speed-label">Speed</span>
          {SPEED_OPTIONS.map(opt => (
            <button
              key={opt.ms}
              onClick={() => setSpeed(opt.ms)}
              aria-label={`Set speed to ${opt.label}`}
              aria-pressed={currentSpeed.ms === opt.ms}
              className={`px-2 py-1 rounded text-[10px] font-mono transition-all ${
                currentSpeed.ms === opt.ms
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

interface ControlButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  'aria-label': string;
  disabled?: boolean;
}

function ControlButton({ children, onClick, 'aria-label': ariaLabel, disabled }: ControlButtonProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      aria-label={ariaLabel}
      disabled={disabled}
      className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
        disabled
          ? 'text-slate-700 cursor-not-allowed'
          : 'text-slate-400 hover:text-white hover:bg-slate-700'
      }`}
    >
      {children}
    </motion.button>
  );
}
