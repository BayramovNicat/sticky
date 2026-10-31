import { FlameIcon, QuillIcon, RealisticPin } from '../icons';
import { RARITY_CONFIGS } from '../rarity';
import { flingNote, setActiveDrag, updateDragTarget } from '../physics';
import type { StickyNote } from '../types';

interface AbnormalNoteProps {
  note: StickyNote;
  onUpdateTitle: (id: string, title: string) => void;
  onUpdateContent: (id: string, content: string) => void;
  onTogglePin: (id: string) => void;
  onDelete: (id: string) => void;
  onRerollRarity: (id: string) => void;
  onBringToFront: (id: string) => void;
  onMoveNote: (id: string, x: number, y: number) => void;
}

export const AbnormalNote = ({
  note,
  onUpdateTitle,
  onUpdateContent,
  onTogglePin,
  onDelete,
  onRerollRarity,
  onBringToFront,
  onMoveNote,
}: AbnormalNoteProps) => {
  const cfg = RARITY_CONFIGS[note.rarity];

  const handlePointerDown = (e: PointerEvent) => {
    const target = e.target as HTMLElement;
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.tagName === 'BUTTON' ||
      target.closest('button') ||
      target.closest('input') ||
      target.closest('textarea')
    ) {
      onBringToFront(note.id);
      return;
    }

    onBringToFront(note.id);

    const article = (e.currentTarget as HTMLElement).closest('article');
    if (!article) return;

    if (note.pinned) {
      article.style.transition = 'transform 0.15s ease-out';
      article.style.transform = `translate3d(${note.x}px, ${note.y}px, 0) rotate(${note.rotation + (Math.random() > 0.5 ? 1 : -1) * 1.5}deg) scale(1.01)`;
      setTimeout(() => {
        article.style.transform = `translate3d(${note.x}px, ${note.y}px, 0) rotate(${note.rotation}deg) scale(1)`;
      }, 150);
      return;
    }

    article.setPointerCapture?.(e.pointerId);

    const startX = e.clientX;
    const startY = e.clientY;
    const origX = note.x;
    const origY = note.y;
    let currentX = origX;
    let currentY = origY;
    let lastX = e.clientX;
    let lastY = e.clientY;
    let vx = 0;
    let vy = 0;

    article.style.cursor = 'grabbing';
    setActiveDrag(note.id, origX, origY);

    const onPointerMove = (moveEv: PointerEvent) => {
      const dx = moveEv.clientX - startX;
      const dy = moveEv.clientY - startY;

      vx = (moveEv.clientX - lastX) * 0.4 + vx * 0.6;
      vy = (moveEv.clientY - lastY) * 0.4 + vy * 0.6;
      lastX = moveEv.clientX;
      lastY = moveEv.clientY;

      currentX = Math.max(10, Math.min(window.innerWidth - 270, origX + dx));
      currentY = Math.max(20, Math.min(window.innerHeight - 240, origY + dy));
      updateDragTarget(note.id, currentX, currentY);
    };

    const onPointerUp = () => {
      article.releasePointerCapture?.(e.pointerId);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      article.style.cursor = '';
      onMoveNote(note.id, currentX, currentY);
      flingNote(note.id, vx, vy);
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  };

  const handleCopy = (btn: HTMLElement) => {
    const text = note.title ? `${note.title}\n\n${note.content}` : note.content;
    navigator.clipboard?.writeText(text).catch(() => {});
    btn.classList.add('text-emerald-400', 'scale-125');
    setTimeout(() => {
      btn.classList.remove('text-emerald-400', 'scale-125');
    }, 1000);
  };

  return (
    <article
      data-note-id={note.id}
      onPointerDown={handlePointerDown}
      onPointerEnter={(e) => {
        (e.currentTarget as HTMLElement).style.zIndex = '1000';
      }}
      onPointerLeave={(e) => {
        const article = e.currentTarget as HTMLElement;
        if (!article.contains(document.activeElement)) {
          article.style.zIndex = String(note.zIndex);
        }
      }}
      onFocus={(e) => {
        onBringToFront(note.id);
        (e.currentTarget as HTMLElement).style.zIndex = '1000';
      }}
      onBlur={(e) => {
        const article = e.currentTarget as HTMLElement;
        requestAnimationFrame(() => {
          if (!article.contains(document.activeElement)) {
            article.style.zIndex = String(note.zIndex);
          }
        });
      }}
      style={{
        transform: `translate3d(${note.x}px, ${note.y}px, 0) rotate(${note.rotation}deg)`,
        zIndex: String(note.zIndex),
      }}
      class={`absolute top-0 left-0 w-64 sm:w-72 select-none rounded-xs border p-5 will-change-transform ${
        note.pinned ? 'cursor-default ring-2 ring-amber-400/40 shadow-amber-500/10' : 'cursor-grab'
      } ${cfg.paperBg} ${cfg.paperBorder} ${cfg.paperShadow} ${cfg.paperGlow}`}
    >
      <div
        class={`absolute -top-3 left-1/2 -translate-x-1/2 h-5 w-24 rounded-xs pointer-events-none rotate-[-1deg] ${cfg.tapeBg} shadow-xs`}
      />

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onTogglePin(note.id);
        }}
        class="absolute -top-4 left-6 p-1 cursor-pointer hover:scale-110 active:scale-95 transition-transform"
        title={note.pinned ? 'Impaled to desk (Unpin)' : 'Impale to desk (Pin)'}
      >
        <RealisticPin class="size-6 drop-shadow-md" pinned={note.pinned} />
      </button>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onRerollRarity(note.id);
        }}
        class={`absolute -top-3 -right-3 size-9 rounded-full border flex items-center justify-center text-sm font-serif shadow-lg cursor-pointer hover:scale-115 active:rotate-45 transition-all ${cfg.sealBg} ${cfg.sealBorder} ${cfg.sealColor}`}
        title={`Rarity: ${cfg.name}\nClick to advance to next rarity`}
      >
        <span class="select-none text-base">{cfg.sigil}</span>
      </button>

      <div class="pt-3">
        <input
          type="text"
          value={note.title}
          placeholder="Untitled note..."
          onFocus={() => onBringToFront(note.id)}
          onInput={(e) => onUpdateTitle(note.id, (e.currentTarget as HTMLInputElement).value)}
          class={`w-full bg-transparent text-sm font-serif font-bold tracking-wide placeholder:text-zinc-600 focus:outline-none mb-2 border-b border-transparent focus:border-zinc-700/60 pb-1 ${cfg.textColor}`}
        />

        <textarea
          placeholder="Inscribe thought..."
          rows={5}
          onFocus={() => onBringToFront(note.id)}
          onInput={(e) =>
            onUpdateContent(note.id, (e.currentTarget as HTMLTextAreaElement).value)
          }
          class={`w-full bg-transparent text-xs sm:text-sm placeholder:text-zinc-600 resize-none focus:outline-none leading-relaxed min-h-24 font-mono ${cfg.textColor} opacity-90`}
        >
          {note.content}
        </textarea>
      </div>

      <div class="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between text-[10px] text-zinc-500 font-mono">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleCopy(e.currentTarget);
          }}
          class="flex items-center gap-1 hover:text-zinc-300 transition-all cursor-pointer p-0.5"
          title="Inscribe to clipboard"
        >
          <QuillIcon class="size-3" />
          <span>copy</span>
        </button>

        <span class={`font-mono text-[9px] uppercase tracking-widest ${cfg.accentColor}`}>
          {cfg.title}
        </span>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(note.id);
          }}
          class="hover:text-red-400 transition-colors cursor-pointer p-0.5"
          title="Burn note into ash"
        >
          <FlameIcon class="size-3" />
        </button>
      </div>
    </article>
  );
};
