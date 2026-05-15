import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { SkipBack, SkipForward, Play, Pause, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';
import { useStore } from '../../store';

const SPEED_OPTIONS = [
  { label: '0.25×', ms: 1600 },
  { label: '0.5×', ms: 1000 },
  { label: '1×', ms: 600 },
  { label: '2×', ms: 300 },
  { label: '4×', ms: 120 },
];

export default function PlaybackControls() {
  const {
    frames, currentFrameIndex, isPlaying,
    speed, nextFrame, prevFrame, goToFrame,
    setPlaying, setSpeed, reset,
  } = useStore();

  const intervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        useStore.getState().nextFrame();
      }, speed);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isPlaying, speed]);

  // Auto-stop at end
  useEffect(() => {
    if (currentFrameIndex >= frames.length - 1 && isPlaying) {
      setPlaying(false);
    }
  }, [currentFrameIndex, frames.length, isPlaying, setPlaying]);

  const progress = frames.length > 1 ? currentFrameIndex / (frames.length - 1) : 0;
  const currentSpeed = SPEED_OPTIONS.find(s => s.ms === speed) ?? SPEED_OPTIONS[2];

  return (
    <div className="flex-shrink-0 bg-slate-900/90 border-t border-slate-800 px-4 py-3">
      {/* Progress bar */}
      <div className="mb-3 relative">
        <div
          className="w-full h-1.5 bg-slate-800 rounded-full cursor-pointer relative"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const ratio = (e.clientX - rect.left) / rect.width;
            goToFrame(Math.round(ratio * (frames.length - 1)));
          }}
        >
          <motion.div
            className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
            animate={{ width: `${progress * 100}%` }}
            transition={{ duration: 0.15 }}
          />
          {/* Thumb */}
          <motion.div
            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white shadow-lg"
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
        {/* Left: playback */}
        <div className="flex items-center gap-1">
          <ControlButton onClick={() => goToFrame(0)} title="First step">
            <SkipBack size={14} />
          </ControlButton>
          <ControlButton onClick={prevFrame} title="Previous step" disabled={currentFrameIndex === 0}>
            <ChevronLeft size={16} />
          </ControlButton>

          {/* Play/Pause */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              if (currentFrameIndex >= frames.length - 1) { reset(); }
              setPlaying(!isPlaying);
            }}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-all"
            style={{
              background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
              boxShadow: isPlaying ? '0 0 16px #3b82f640' : 'none',
            }}
          >
            {isPlaying ? <Pause size={16} fill="white" color="white" /> : <Play size={16} fill="white" color="white" />}
          </motion.button>

          <ControlButton onClick={nextFrame} title="Next step" disabled={currentFrameIndex >= frames.length - 1}>
            <ChevronRight size={16} />
          </ControlButton>
          <ControlButton onClick={() => goToFrame(frames.length - 1)} title="Last step">
            <SkipForward size={14} />
          </ControlButton>
          <ControlButton onClick={() => { reset(); setPlaying(false); }} title="Reset">
            <RotateCcw size={13} />
          </ControlButton>
        </div>

        {/* Right: speed */}
        <div className="flex items-center gap-1">
          <span className="text-[10px] text-slate-500 mr-1">Speed</span>
          {SPEED_OPTIONS.map(opt => (
            <button
              key={opt.ms}
              onClick={() => setSpeed(opt.ms)}
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

function ControlButton({ children, onClick, title, disabled }: {
  children: React.ReactNode;
  onClick: () => void;
  title?: string;
  disabled?: boolean;
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      title={title}
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
