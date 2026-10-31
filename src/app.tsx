import './style.css';
import { AbnormalNote } from './components/AbnormalNote';
import { SoundGlyph } from './icons';
import { getNextRarity, rollRarity } from './rarity';
import {
  loadNotes,
  loadSoundPreference,
  saveNotes,
  saveSoundPreference,
} from './storage';
import { playDisappearSound, playRarityChime, playTapSound } from './sound';
import { setActiveDrag, setPhysicsNotes } from './physics';
import type { StickyNote } from './types';

const root = document.querySelector('#app') as HTMLElement;

const state = {
  notes: loadNotes(),
  soundEnabled: loadSoundPreference(),
  maxZ: 20,
};

setPhysicsNotes(state.notes);

const handleUpdateTitle = (id: string, title: string) => {
  const note = state.notes.find((n) => n.id === id);
  if (note) {
    note.title = title;
    note.updatedAt = Date.now();
    saveNotes(state.notes);
  }
};

const handleUpdateContent = (id: string, content: string) => {
  const note = state.notes.find((n) => n.id === id);
  if (note) {
    note.content = content;
    note.updatedAt = Date.now();
    saveNotes(state.notes);
  }
};

const handleTogglePin = (id: string) => {
  const note = state.notes.find((n) => n.id === id);
  if (note) {
    note.pinned = !note.pinned;
    note.updatedAt = Date.now();
    saveNotes(state.notes);
    playTapSound(state.soundEnabled);
    render();
  }
};

const handleDeleteNote = (id: string) => {
  const note = state.notes.find((n) => n.id === id);
  if (!note) return;

  const article = document.querySelector(`[data-note-id="${id}"]`) as HTMLElement | null;
  playDisappearSound(note.rarity, state.soundEnabled);

  if (article) {
    const currentTransform = `translate3d(${note.x}px, ${note.y}px, 0) rotate(${note.rotation}deg)`;
    article.style.setProperty('--current-transform', currentTransform);
    article.style.pointerEvents = 'none';

    let animName = 'crumble-common';
    let duration = 350;

    switch (note.rarity) {
      case 'common':
        animName = 'crumble-common';
        duration = 350;
        break;
      case 'uncommon':
        animName = 'wind-uncommon';
        duration = 420;
        break;
      case 'rare':
        animName = 'glitch-rare';
        duration = 420;
        break;
      case 'epic':
        animName = 'vortex-epic';
        duration = 500;
        break;
      case 'legendary':
        animName = 'supernova-legendary';
        duration = 600;
        break;
    }

    article.style.animation = `${animName} ${duration}ms cubic-bezier(0.25, 1, 0.5, 1) forwards`;

    setTimeout(() => {
      state.notes = state.notes.filter((n) => n.id !== id);
      saveNotes(state.notes);
      setPhysicsNotes(state.notes);
      render();
    }, duration);
  } else {
    state.notes = state.notes.filter((n) => n.id !== id);
    saveNotes(state.notes);
    setPhysicsNotes(state.notes);
    render();
  }
};

const handleRerollRarity = (id: string) => {
  const note = state.notes.find((n) => n.id === id);
  if (note) {
    const newRarity = getNextRarity(note.rarity);
    note.rarity = newRarity;
    note.updatedAt = Date.now();
    saveNotes(state.notes);
    playRarityChime(newRarity, state.soundEnabled);
    render();
  }
};

const handleBringToFront = (id: string) => {
  const note = state.notes.find((n) => n.id === id);
  if (note) {
    state.maxZ += 1;
    note.zIndex = state.maxZ;
    const article = document.querySelector(`[data-note-id="${id}"]`) as HTMLElement | null;
    if (article) {
      article.style.zIndex = String(state.maxZ);
    }
    saveNotes(state.notes);
  }
};

const handleMoveNote = (id: string, x: number, y: number) => {
  setActiveDrag(null);
  const note = state.notes.find((n) => n.id === id);
  if (note) {
    note.x = x;
    note.y = y;
    saveNotes(state.notes);
  }
};

const spawnNoteAt = (x?: number, y?: number) => {
  const rarity = rollRarity();
  state.maxZ += 1;

  const targetX = x !== undefined ? Math.max(20, Math.min(window.innerWidth - 300, x - 120)) : 100 + Math.random() * (window.innerWidth - 420);
  const targetY = y !== undefined ? Math.max(40, Math.min(window.innerHeight - 300, y - 40)) : 80 + Math.random() * (window.innerHeight - 380);
  const rotation = (Math.random() - 0.5) * 8;

  const newNote: StickyNote = {
    id: `note-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    title: '',
    content: '',
    rarity,
    pinned: false,
    x: targetX,
    y: targetY,
    rotation,
    zIndex: state.maxZ,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  state.notes.push(newNote);
  saveNotes(state.notes);
  playRarityChime(rarity, state.soundEnabled);
  render();

  requestAnimationFrame(() => {
    const article = document.querySelector(`[data-note-id="${newNote.id}"]`);
    const input = article?.querySelector('input');
    input?.focus();
  });
};

const handleToggleSound = () => {
  state.soundEnabled = !state.soundEnabled;
  saveSoundPreference(state.soundEnabled);
  render();
};

const handleDeskDoubleClick = (e: MouseEvent) => {
  const target = e.target as HTMLElement;
  if (target === e.currentTarget || target.id === 'desk-void' || target.id === 'desk-mat') {
    spawnNoteAt(e.clientX, e.clientY);
  }
};

window.addEventListener('keydown', (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'n') {
    e.preventDefault();
    spawnNoteAt();
  }
});

const render = () => {
  setPhysicsNotes(state.notes);
  root.replaceChildren(
    <main
      id="desk-void"
      onDblClick={handleDeskDoubleClick}
      class="relative h-dvh w-dvw overflow-hidden bg-[#090a0d] text-zinc-100 select-none cursor-default font-sans"
    >
      <div
        id="desk-mat"
        class="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:24px_24px]"
      />

      <div class="absolute top-4 left-5 z-20 flex items-center gap-3 pointer-events-auto">
        <div
          id="pad-stack"
          onClick={() => spawnNoteAt()}
          class="group relative size-11 rounded-xs bg-[#fef08a] border border-[#fde047] shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer flex flex-col items-center justify-center -rotate-3"
          title="Peel a fresh sticky note (or double-click the desk)"
        >
          <div class="absolute -bottom-1 -right-1 size-11 rounded-xs bg-[#fde047] -z-10 rotate-2 border border-[#eab308]/50" />
          <div class="absolute -bottom-2 -right-2 size-11 rounded-xs bg-[#facc15] -z-20 rotate-4 border border-[#ca8a04]/40" />
          <span class="text-[9px] font-mono font-black text-amber-950 uppercase tracking-tighter group-hover:scale-110 transition-transform">
            PEEL
          </span>
        </div>

        <div class="hidden sm:block">
          <p class="text-[11px] font-mono text-zinc-400 font-medium">Sticky Void</p>
          <p class="text-[10px] font-mono text-zinc-600">Double-click desk to spawn</p>
        </div>
      </div>

      <div class="absolute top-4 right-5 z-20 flex items-center gap-3 pointer-events-auto text-[11px] font-mono text-zinc-500">
        <button
          type="button"
          onClick={handleToggleSound}
          class="p-1 hover:text-zinc-300 transition-colors cursor-pointer"
          title={state.soundEnabled ? 'Mute chimes' : 'Unmute chimes'}
        >
          <SoundGlyph class="size-3.5" muted={!state.soundEnabled} />
        </button>
      </div>

      <div id="notes-container" class="size-full">
        {state.notes.map((note) => (
          <AbnormalNote
            key={note.id}
            note={note}
            onUpdateTitle={handleUpdateTitle}
            onUpdateContent={handleUpdateContent}
            onTogglePin={handleTogglePin}
            onDelete={handleDeleteNote}
            onRerollRarity={handleRerollRarity}
            onBringToFront={handleBringToFront}
            onMoveNote={handleMoveNote}
          />
        ))}
      </div>
    </main>,
  );
};

render();
