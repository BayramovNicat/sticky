export type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export interface StickyNote {
  id: string;
  title: string;
  content: string;
  rarity: Rarity;
  pinned: boolean;
  x: number;
  y: number;
  vx?: number;
  vy?: number;
  rotation: number;
  vrot?: number;
  zIndex: number;
  createdAt: number;
  updatedAt: number;
}

export interface RarityConfig {
  id: Rarity;
  name: string;
  title: string;
  dropRate: number;
  paperBg: string;
  paperBorder: string;
  paperGlow: string;
  paperShadow: string;
  textColor: string;
  accentColor: string;
  tapeBg: string;
  sealBorder: string;
  sealBg: string;
  sealColor: string;
  sigil: string;
}
