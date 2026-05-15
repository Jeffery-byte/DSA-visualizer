import { create } from 'zustand';
import type { Frame, Algorithm } from '../types';
import { allAlgorithms } from '../algorithms';

interface VisualizationStore {
  // Selected algorithm
  selectedAlgorithm: Algorithm | null;
  frames: Frame[];
  currentFrameIndex: number;

  // Playback state
  isPlaying: boolean;
  speed: number; // ms between frames

  // UI state
  sidebarOpen: boolean;

  // Actions
  selectAlgorithm: (algo: Algorithm) => void;
  setFrames: (frames: Frame[]) => void;
  goToFrame: (index: number) => void;
  nextFrame: () => void;
  prevFrame: () => void;
  setPlaying: (playing: boolean) => void;
  setSpeed: (speed: number) => void;
  reset: () => void;
  toggleSidebar: () => void;
}

export const useStore = create<VisualizationStore>((set, get) => ({
  selectedAlgorithm: allAlgorithms[0],
  frames: allAlgorithms[0]?.generate(allAlgorithms[0].defaultInput ?? {}) ?? [],
  currentFrameIndex: 0,
  isPlaying: false,
  speed: 600,
  sidebarOpen: true,

  selectAlgorithm: (algo) => {
    const frames = algo.generate(algo.defaultInput ?? {});
    set({ selectedAlgorithm: algo, frames, currentFrameIndex: 0, isPlaying: false });
  },

  setFrames: (frames) => set({ frames, currentFrameIndex: 0 }),

  goToFrame: (index) => {
    const { frames } = get();
    const clamped = Math.max(0, Math.min(index, frames.length - 1));
    set({ currentFrameIndex: clamped });
  },

  nextFrame: () => {
    const { currentFrameIndex, frames } = get();
    if (currentFrameIndex >= frames.length - 1) {
      set({ isPlaying: false });
    } else {
      set({ currentFrameIndex: currentFrameIndex + 1 });
    }
  },

  prevFrame: () => {
    const { currentFrameIndex } = get();
    if (currentFrameIndex > 0) set({ currentFrameIndex: currentFrameIndex - 1 });
  },

  setPlaying: (playing) => set({ isPlaying: playing }),

  setSpeed: (speed) => set({ speed }),

  reset: () => set({ currentFrameIndex: 0, isPlaying: false }),

  toggleSidebar: () => set(s => ({ sidebarOpen: !s.sidebarOpen })),
}));
