import type { Rarity, RarityConfig } from './types';

export const RARITY_CONFIGS: Record<Rarity, RarityConfig> = {
  common: {
    id: 'common',
    name: 'Common',
    title: 'Ash Draft',
    dropRate: 60,
    paperBg: 'bg-[#18181b]',
    paperBorder: 'border-zinc-700/60',
    paperGlow: 'hover:shadow-zinc-800/40',
    paperShadow: 'shadow-2xl shadow-black/80',
    textColor: 'text-zinc-200',
    accentColor: 'text-zinc-400',
    tapeBg: 'bg-white/15 border-y border-white/10',
    sealBorder: 'border-zinc-600/70',
    sealBg: 'bg-zinc-800/80',
    sealColor: 'text-zinc-400',
    sigil: '◌',
  },
  uncommon: {
    id: 'uncommon',
    name: 'Uncommon',
    title: 'Verdant Leaf',
    dropRate: 25,
    paperBg: 'bg-[#0b1713]',
    paperBorder: 'border-emerald-600/50',
    paperGlow: 'hover:shadow-emerald-900/30',
    paperShadow: 'shadow-2xl shadow-emerald-950/60',
    textColor: 'text-emerald-100',
    accentColor: 'text-emerald-400',
    tapeBg: 'bg-emerald-500/25 border-y border-emerald-400/20',
    sealBorder: 'border-emerald-500/60',
    sealBg: 'bg-emerald-950/90',
    sealColor: 'text-emerald-300',
    sigil: '✦',
  },
  rare: {
    id: 'rare',
    name: 'Rare',
    title: 'Astral Blueprint',
    dropRate: 10,
    paperBg: 'bg-[#09141e]',
    paperBorder: 'border-cyan-500/60',
    paperGlow: 'hover:shadow-cyan-900/40',
    paperShadow: 'shadow-2xl shadow-cyan-950/70',
    textColor: 'text-cyan-100',
    accentColor: 'text-cyan-400',
    tapeBg: 'bg-cyan-500/25 border-y border-cyan-400/20',
    sealBorder: 'border-cyan-400/70',
    sealBg: 'bg-cyan-950/90',
    sealColor: 'text-cyan-300',
    sigil: '◈',
  },
  epic: {
    id: 'epic',
    name: 'Epic',
    title: 'Void Velvet',
    dropRate: 4,
    paperBg: 'bg-[#150a24]',
    paperBorder: 'border-purple-500/70',
    paperGlow: 'hover:shadow-purple-900/50',
    paperShadow: 'shadow-2xl shadow-purple-950/80',
    textColor: 'text-purple-100',
    accentColor: 'text-purple-400',
    tapeBg: 'bg-purple-500/25 border-y border-purple-400/20',
    sealBorder: 'border-purple-400/80',
    sealBg: 'bg-purple-950/90',
    sealColor: 'text-purple-300',
    sigil: '❖',
  },
  legendary: {
    id: 'legendary',
    name: 'Legendary',
    title: 'Solaris Relic',
    dropRate: 1,
    paperBg: 'bg-[#1e1303]',
    paperBorder: 'border-amber-400/90',
    paperGlow: 'hover:shadow-amber-500/40 shadow-amber-500/20 ring-1 ring-amber-400/50',
    paperShadow: 'shadow-2xl shadow-amber-950/90',
    textColor: 'text-amber-100',
    accentColor: 'text-amber-400',
    tapeBg: 'bg-amber-400/35 border-y border-amber-300/40',
    sealBorder: 'border-amber-400',
    sealBg: 'bg-amber-950',
    sealColor: 'text-amber-300',
    sigil: '✹',
  },
};

export const RARITY_ORDER: Rarity[] = ['common', 'uncommon', 'rare', 'epic', 'legendary'];

export const getNextRarity = (current: Rarity): Rarity => {
  const currentIndex = RARITY_ORDER.indexOf(current);
  const nextIndex = (currentIndex + 1) % RARITY_ORDER.length;
  return RARITY_ORDER[nextIndex];
};

export const rollRarity = (): Rarity => {
  const roll = Math.random() * 100;
  if (roll < 1) return 'legendary';
  if (roll < 5) return 'epic';
  if (roll < 15) return 'rare';
  if (roll < 40) return 'uncommon';
  return 'common';
};
