import type { Rarity } from './types';

let audioCtx: AudioContext | null = null;

const getAudioContext = (): AudioContext | null => {
  if (typeof window === 'undefined') return null;
  const AudioContextClass =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextClass) return null;
  if (!audioCtx) {
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
};

export const playRarityChime = (rarity: Rarity, enabled = true) => {
  if (!enabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  const playTone = (
    freq: number,
    start: number,
    duration: number,
    type: OscillatorType = 'sine',
    gainVal = 0.08,
  ) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, start);

    gain.gain.setValueAtTime(0.001, start);
    gain.gain.exponentialRampToValueAtTime(gainVal, start + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(start);
    osc.stop(start + duration);
  };

  switch (rarity) {
    case 'common':
      playTone(440, now, 0.12, 'sine', 0.05);
      break;
    case 'uncommon':
      playTone(523.25, now, 0.14, 'sine', 0.06);
      playTone(659.25, now + 0.07, 0.18, 'sine', 0.06);
      break;
    case 'rare':
      playTone(587.33, now, 0.16, 'triangle', 0.07);
      playTone(739.99, now + 0.08, 0.18, 'triangle', 0.07);
      playTone(880.0, now + 0.16, 0.25, 'sine', 0.08);
      break;
    case 'epic':
      playTone(523.25, now, 0.22, 'sine', 0.08);
      playTone(659.25, now + 0.08, 0.24, 'triangle', 0.08);
      playTone(783.99, now + 0.16, 0.26, 'sine', 0.09);
      playTone(1046.5, now + 0.24, 0.35, 'triangle', 0.09);
      break;
    case 'legendary':
      [523.25, 659.25, 783.99, 1046.5, 1318.51].forEach((freq, i) => {
        playTone(freq, now + i * 0.065, 0.35 + i * 0.05, i % 2 === 0 ? 'sine' : 'triangle', 0.09);
      });
      break;
  }
};

export const playDisappearSound = (rarity: Rarity, enabled = true) => {
  if (!enabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  switch (rarity) {
    case 'common': {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(40, now + 0.25);
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.25);
      break;
    }
    case 'uncommon': {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, now);
      osc.frequency.exponentialRampToValueAtTime(261.63, now + 0.35);
      gain.gain.setValueAtTime(0.07, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.35);
      break;
    }
    case 'rare': {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(1200, now);
      osc.frequency.exponentialRampToValueAtTime(120, now + 0.35);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.35);
      break;
    }
    case 'epic': {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(280, now);
      osc.frequency.exponentialRampToValueAtTime(35, now + 0.45);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.45);
      break;
    }
    case 'legendary': {
      [880, 1108.73, 1318.51, 1760].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.04);
        osc.frequency.exponentialRampToValueAtTime(freq * 1.5, now + 0.5);
        gain.gain.setValueAtTime(0.08, now + idx * 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.55);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.04);
        osc.stop(now + 0.55);
      });
      break;
    }
  }
};

export const playTapSound = (enabled = true) => {
  if (!enabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(800, now);
  gain.gain.setValueAtTime(0.04, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.04);
};
