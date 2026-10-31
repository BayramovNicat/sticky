import type { StickyNote } from './types';

const STORAGE_KEY = 'sticky_notes_abnormal_v2';
const SOUND_KEY = 'sticky_notes_sound_v1';

export const INITIAL_NOTES: StickyNote[] = [
  {
    id: 'note-legendary-1',
    title: 'The Golden Spark',
    content: '1% Solaris Relic. Draggable, freeform, tactile. Tap the solar seal to reroll reality. Pull notes from the stack or double-click the desk void.',
    rarity: 'legendary',
    pinned: true,
    x: 180,
    y: 110,
    rotation: -2.5,
    zIndex: 10,
    createdAt: Date.now() - 1000 * 60 * 60 * 4,
    updatedAt: Date.now() - 1000 * 60 * 60 * 4,
  },
  {
    id: 'note-epic-1',
    title: 'Cosmic Vision',
    content: '4% Void Velvet. No rigid grids, no cold button toolbars. Just living parchment, tape, pins, and scattered thoughts.',
    rarity: 'epic',
    pinned: false,
    x: 520,
    y: 90,
    rotation: 1.8,
    zIndex: 5,
    createdAt: Date.now() - 1000 * 60 * 60 * 3,
    updatedAt: Date.now() - 1000 * 60 * 60 * 3,
  },
  {
    id: 'note-rare-1',
    title: 'Astral Cipher',
    content: '10% Blueprint foil. Click the pushpin to pin to the board. Click the dog-ear corner to burn into ash.',
    rarity: 'rare',
    pinned: false,
    x: 230,
    y: 430,
    rotation: 3.2,
    zIndex: 6,
    createdAt: Date.now() - 1000 * 60 * 60 * 2,
    updatedAt: Date.now() - 1000 * 60 * 60 * 2,
  },
  {
    id: 'note-uncommon-1',
    title: 'Verdant Spore',
    content: '25% Pressed botanic. Drag anywhere. Tap wax seals to test your luck against the drop rates.',
    rarity: 'uncommon',
    pinned: false,
    x: 580,
    y: 410,
    rotation: -1.2,
    zIndex: 7,
    createdAt: Date.now() - 1000 * 60 * 60 * 1,
    updatedAt: Date.now() - 1000 * 60 * 60 * 1,
  },
  {
    id: 'note-common-1',
    title: 'Ash Draft',
    content: '60% Ordinary scrap. Clean, minimal, zero noise. Type directly into the paper without distraction.',
    rarity: 'common',
    pinned: false,
    x: 880,
    y: 220,
    rotation: -3.5,
    zIndex: 8,
    createdAt: Date.now() - 1000 * 60 * 30,
    updatedAt: Date.now() - 1000 * 60 * 30,
  },
];

export const loadNotes = (): StickyNote[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_NOTES;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_NOTES;
  } catch {
    return INITIAL_NOTES;
  }
};

export const saveNotes = (notes: StickyNote[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  } catch {
    // LocalStorage quota or access blocked
  }
};

export const loadSoundPreference = (): boolean => {
  try {
    const raw = localStorage.getItem(SOUND_KEY);
    return raw !== null ? raw === 'true' : true;
  } catch {
    return true;
  }
};

export const saveSoundPreference = (enabled: boolean) => {
  try {
    localStorage.setItem(SOUND_KEY, String(enabled));
  } catch {
    // LocalStorage quota or access blocked
  }
};
