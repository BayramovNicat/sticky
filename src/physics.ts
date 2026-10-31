import type { StickyNote } from './types';
import { saveNotes } from './storage';

const CARD_W = 270;
const CARD_H = 230;
const FRICTION = 0.90;
const ANGULAR_FRICTION = 0.86;
const MIN_VELOCITY = 0.08;

let activeDragId: string | null = null;
let dragTargetX = 0;
let dragTargetY = 0;
let animFrameId: number | null = null;
let notesRef: StickyNote[] = [];

const elementCache = new Map<string, HTMLElement>();

export const getNoteElement = (id: string): HTMLElement | null => {
  let el = elementCache.get(id);
  if (!el || !el.isConnected) {
    const found = document.querySelector(`[data-note-id="${id}"]`) as HTMLElement | null;
    if (found) {
      elementCache.set(id, found);
      el = found;
    }
  }
  return el ?? null;
};

export const setPhysicsNotes = (notes: StickyNote[]) => {
  notesRef = notes;
  elementCache.clear();
};

export const setActiveDrag = (id: string | null, x = 0, y = 0) => {
  activeDragId = id;
  dragTargetX = x;
  dragTargetY = y;
  if (id) {
    startPhysicsLoop();
  }
};

export const updateDragTarget = (id: string, x: number, y: number) => {
  activeDragId = id;
  dragTargetX = x;
  dragTargetY = y;
  startPhysicsLoop();
};

export const flingNote = (id: string, vx: number, vy: number) => {
  activeDragId = null;
  const note = notesRef.find((n) => n.id === id);
  if (!note || note.pinned) return;

  note.vx = Math.max(-20, Math.min(20, vx * 0.85));
  note.vy = Math.max(-20, Math.min(20, vy * 0.85));
  note.vrot = Math.max(-4, Math.min(4, vx * 0.12 - vy * 0.04));

  startPhysicsLoop();
};

export const startPhysicsLoop = () => {
  if (animFrameId !== null) return;

  const tick = () => {
    let hasMotion = false;
    const maxX = window.innerWidth - CARD_W - 10;
    const maxY = window.innerHeight - CARD_H - 10;

    if (activeDragId !== null) {
      const active = notesRef.find((n) => n.id === activeDragId);
      if (active && !active.pinned) {
        active.x = Math.max(10, Math.min(maxX, dragTargetX));
        active.y = Math.max(20, Math.min(maxY, dragTargetY));
        active.vx = 0;
        active.vy = 0;
        active.vrot = 0;
        hasMotion = true;

        const el = getNoteElement(active.id);
        if (el) {
          el.style.transform = `translate3d(${active.x}px, ${active.y}px, 0) rotate(${active.rotation}deg)`;
        }
      }
    }

    const n = notesRef.length;
    for (let i = 0; i < n; i++) {
      const note = notesRef[i];
      if (note.pinned || note.id === activeDragId) continue;

      const vx = note.vx || 0;
      const vy = note.vy || 0;
      const vrot = note.vrot || 0;

      if (Math.abs(vx) > MIN_VELOCITY || Math.abs(vy) > MIN_VELOCITY || Math.abs(vrot) > MIN_VELOCITY) {
        hasMotion = true;

        note.x += vx;
        note.y += vy;
        note.rotation += vrot;

        if (note.x < 10) {
          note.x = 10;
          note.vx = -vx * 0.25;
        } else if (note.x > maxX) {
          note.x = maxX;
          note.vx = -vx * 0.25;
        }

        if (note.y < 20) {
          note.y = 20;
          note.vy = -vy * 0.25;
        } else if (note.y > maxY) {
          note.y = maxY;
          note.vy = -vy * 0.25;
        }

        note.vx = vx * FRICTION;
        note.vy = vy * FRICTION;
        note.vrot = vrot * ANGULAR_FRICTION;
        note.rotation = Math.max(-10, Math.min(10, note.rotation));

        const el = getNoteElement(note.id);
        if (el) {
          el.style.transform = `translate3d(${note.x}px, ${note.y}px, 0) rotate(${note.rotation}deg)`;
        }
      } else {
        note.vx = 0;
        note.vy = 0;
        note.vrot = 0;
      }
    }

    for (let i = 0; i < n; i++) {
      const a = notesRef[i];
      const cxA = a.x + CARD_W / 2;
      const cyA = a.y + CARD_H / 2;

      for (let j = i + 1; j < n; j++) {
        const b = notesRef[j];
        if (a.pinned && b.pinned) continue;

        const cxB = b.x + CARD_W / 2;
        const cyB = b.y + CARD_H / 2;

        const dx = cxB - cxA;
        const dy = cyB - cyA;

        const overlapX = CARD_W - Math.abs(dx);
        const overlapY = CARD_H - Math.abs(dy);

        if (overlapX > 0 && overlapY > 0) {
          const dist = Math.hypot(dx, dy) || 1;
          const nx = dx / dist;
          const ny = dy / dist;
          const overlap = Math.min(overlapX, overlapY);

          if (a.pinned && !b.pinned) {
            b.x = Math.max(10, Math.min(maxX, b.x + nx * overlap * 0.7));
            b.y = Math.max(20, Math.min(maxY, b.y + ny * overlap * 0.7));
            b.vx = (b.vx || 0) + nx * 2.5;
            b.vy = (b.vy || 0) + ny * 2.5;
            b.vrot = (b.vrot || 0) + nx * 0.4;
            hasMotion = true;

            const elB = getNoteElement(b.id);
            if (elB) {
              elB.style.transform = `translate3d(${b.x}px, ${b.y}px, 0) rotate(${b.rotation}deg)`;
            }
          } else if (!a.pinned && b.pinned) {
            a.x = Math.max(10, Math.min(maxX, a.x - nx * overlap * 0.7));
            a.y = Math.max(20, Math.min(maxY, a.y - ny * overlap * 0.7));
            a.vx = (a.vx || 0) - nx * 2.5;
            a.vy = (a.vy || 0) - ny * 2.5;
            a.vrot = (a.vrot || 0) - nx * 0.4;
            hasMotion = true;

            const elA = getNoteElement(a.id);
            if (elA) {
              elA.style.transform = `translate3d(${a.x}px, ${a.y}px, 0) rotate(${a.rotation}deg)`;
            }
          } else if (!a.pinned && !b.pinned) {
            const push = overlap * 0.4;
            a.x = Math.max(10, Math.min(maxX, a.x - nx * push));
            a.y = Math.max(20, Math.min(maxY, a.y - ny * push));
            b.x = Math.max(10, Math.min(maxX, b.x + nx * push));
            b.y = Math.max(20, Math.min(maxY, b.y + ny * push));

            b.vx = (b.vx || 0) + nx * 1.5;
            b.vy = (b.vy || 0) + ny * 1.5;
            b.vrot = (b.vrot || 0) + nx * 0.3;

            hasMotion = true;

            const elA = getNoteElement(a.id);
            if (elA && a.id !== activeDragId) {
              elA.style.transform = `translate3d(${a.x}px, ${a.y}px, 0) rotate(${a.rotation}deg)`;
            }
            const elB = getNoteElement(b.id);
            if (elB && b.id !== activeDragId) {
              elB.style.transform = `translate3d(${b.x}px, ${b.y}px, 0) rotate(${b.rotation}deg)`;
            }
          }
        }
      }
    }

    if (hasMotion || activeDragId !== null) {
      animFrameId = requestAnimationFrame(tick);
    } else {
      animFrameId = null;
      saveNotes(notesRef);
    }
  };

  animFrameId = requestAnimationFrame(tick);
};
