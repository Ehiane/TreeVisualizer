import { create } from 'zustand';
import { TreeNode, Step } from '../types';

export type TreeType = 'binary' | 'avl' | 'b-tree' | 'b-plus-tree' | 'red-black' | 'trie';

interface TreeState {
  treeType: TreeType | null;
  root: TreeNode | null;
  steps: Step[];
  index: number;
  playing: boolean;
  playIntervalId: number | null;
  playbackSpeed: number; // milliseconds per step
  activeAction: string | null; // Track which action button is active
}

interface TreeActions {
  setTreeType: (type: TreeType) => void;
  setRoot: (root: TreeNode | null) => void;
  setSteps: (steps: Step[], actionType?: string) => void;
  goto: (i: number) => void;
  next: () => void;
  prev: () => void;
  play: () => void;
  pause: () => void;
  reset: () => void;
  clear: () => void;
  setPlaybackSpeed: (speed: number) => void;
}

export const useTreeStore = create<TreeState & TreeActions>((set, get) => ({
  // State
  treeType: null,
  root: null,
  steps: [],
  index: -1,
  playing: false,
  playIntervalId: null,
  playbackSpeed: 1000, // 1 second default
  activeAction: null,

  // Actions
  setTreeType: (type) => set({ treeType: type }),

  setRoot: (root) => set({ root }),

  setSteps: (steps, actionType) => set({ steps, index: -1, activeAction: actionType || null }),

  goto: (i) => {
    const { steps } = get();
    if (i >= -1 && i < steps.length) {
      set({ index: i });
    }
  },

  next: () => {
    const { index, steps, playing } = get();
    if (index < steps.length - 1) {
      set({ index: index + 1 });
    } else if (playing) {
      // Auto-pause when reaching the end and clear active action
      get().pause();
      set({ activeAction: null });
    }
  },

  prev: () => {
    const { index } = get();
    if (index > -1) {
      set({ index: index - 1 });
    }
  },

  play: () => {
    const { playing, playIntervalId, playbackSpeed } = get();
    if (playing) return;

    const intervalId = window.setInterval(() => {
      get().next();
    }, playbackSpeed);

    set({ playing: true, playIntervalId: intervalId });
  },

  pause: () => {
    const { playIntervalId } = get();
    if (playIntervalId !== null) {
      clearInterval(playIntervalId);
    }
    set({ playing: false, playIntervalId: null });
  },

  reset: () => {
    get().pause();
    set({ index: -1 });
  },

  clear: () => {
    get().pause();
    set({ root: null, steps: [], index: -1, activeAction: null });
  },

  setPlaybackSpeed: (speed) => {
    const { playing } = get();
    set({ playbackSpeed: speed });

    // Restart playback with new speed if currently playing
    if (playing) {
      get().pause();
      setTimeout(() => get().play(), 0);
    }
  },
}));
