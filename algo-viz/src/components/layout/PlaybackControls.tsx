import { useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  SkipBack, SkipForward, Play, Pause,
  RotateCcw, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { useStore } from '../../store';

const SPEED_OPTIONS = [
  { label: '0.25×', ms: 1600 },
  { label: '0.5×',  ms: 1000 },
  { label: '1×',    ms: 600  },
  { label: '2×',    ms: 300  },
  { label: '4×',    ms: 120  },
] as const;

export default function PlaybackControls() {
  const {
    frames, currentFrameIndex, isPlaying,
    speed, nextFrame, prevFrame, goToFrame,
    setPlaying, setSpeed, reset,
  } = useStore();

  const nextFrameRef = useRef(nextFrame);
  useEffect(() => { nextFrameRef.current = nextFrame; }, [nextFrame]);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => nextFrameRef.current(), speed);
    } else {
      if (intervalRef.current !== null) { clearInterval(intervalRef.current); intervalRef.current = null; }
    }
    return () => { if (intervalRef.current !== null) { clearInterval(intervalRef.current); intervalRef.current = null; } };
  }, [isPlaying, speed]);

  useEffect(() => {
    if (isPlaying && currentFrameIndex >= frames.length - 1) setPlaying(false);
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
    <div className="flex-shrink-0 bg-slate-900 border-t border-slate-800 px-5 py-4">

      {/* Progress bar */}
      <div className="mb-4">
        <div
          role="slider"
          aria-label="Playback progress"
          aria-valuemin={0}
          aria-valuemax={frames.length - 1}
          aria-valuenow={currentFrameIndex}
          tabIndex={0}
          className="w-full h-2 bg-slate-800 rounded-full cursor-pointer relative"
          onClick={handleScrub}
          onKeyDown={(e) => {
            if (e.key === 'ArrowRight') nextFrame();
            if (e.key === 'ArrowLeft')  prevFrame();
          }}
        >
          <motion.div
            className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500 pointer-events-none"
            animate={{ width: `${progress * 100}%` }}
            transition={{ duration: 0.15 }}
          />
          <motion.div
            aria-hidden="true"
            className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white shadow-lg shadow-blue-900/40 pointer-events-none"
            animate={{ left: `calc(${progress * 100}% - 8px)` }}
            transition={{ duration: 0.15 }}
          />
        </div>
        <div className="flex justify-between text-xs text-slate-500 font-mono mt-2">
          <span>Step {currentFrameIndex + 1}</span>
          <span>{frames.length} steps total</span>
        </div>
      </div>

      {/* Controls row */}
      <div className="flex items-center justify-between gap-3">

        {/* Playback buttons */}
        <div className="flex items-center gap-1.5">
          <CtrlBtn onClick={() => goToFrame(0)} aria-label="First step">
            <SkipBack size={16} />
          </CtrlBtn>
          <CtrlBtn onClick={prevFrame} aria-label="Previous step" disabled={currentFrameIndex === 0}>
            <ChevronLeft size={18} />
          </CtrlBtn>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handlePlayPause}
            aria-label={isPlaying ? 'Pause' : 'Play'}
            className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-shadow"
            style={{
              background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
              boxShadow: isPlaying ? '0 0 20px #3b82f660' : '0 4px 12px #00000040',
            }}
          >
            {isPlaying
              ? <Pause size={18} fill="white" color="white" />
              : <Play  size={18} fill="white" color="white" />}
          </motion.button>

          <CtrlBtn onClick={nextFrame} aria-label="Next step" disabled={currentFrameIndex >= frames.length - 1}>
            <ChevronRight size={18} />
          </CtrlBtn>
          <CtrlBtn onClick={() => goToFrame(frames.length - 1)} aria-label="Last step">
            <SkipForward size={16} />
          </CtrlBtn>
          <CtrlBtn onClick={() => { reset(); setPlaying(false); }} aria-label="Reset">
            <RotateCcw size={15} />
          </CtrlBtn>
        </div>

        {/* Speed selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-mono mr-1">Speed</span>
          {SPEED_OPTIONS.map(opt => (
            <button
              key={opt.ms}
              onClick={() => setSpeed(opt.ms)}
              aria-label={`Speed ${opt.label}`}
              aria-pressed={currentSpeed.ms === opt.ms}
              className={`px-3 py-1.5 rounded-lg text-sm font-mono font-medium transition-all ${
                currentSpeed.ms === opt.ms
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-900/40'
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

interface CtrlBtnProps {
  children: React.ReactNode;
  onClick: () => void;
  'aria-label': string;
  disabled?: boolean;
}

function CtrlBtn({ children, onClick, 'aria-label': ariaLabel, disabled }: CtrlBtnProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      aria-label={ariaLabel}
      disabled={disabled}
      className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
        disabled
          ? 'text-slate-700 cursor-not-allowed'
          : 'text-slate-400 hover:text-white hover:bg-slate-700'
      }`}
    >
      {children}
    </motion.button>
  );
}
