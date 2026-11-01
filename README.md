# Sticky

A tactile, abnormal, freeform sticky note canvas with collectible rarity tiers, real-time paper physics, and distinct disappearance effects.

Built with **Bun**, **TypeScript (zero-virtual-DOM via jsx-dom)**, and **Tailwind CSS v4**.

---

## Features

- **Freeform Spatial Desk**: No rigid grids, filter bars, or generic CRUD buttons. Notes live as physical sheets scattered naturally with organic rotation angles and spatial coordinates.
- **Realistic Paper Physics**:
  - **Velocity Fling**: Drag and release with speed to fling notes across the desk with surface friction damping.
  - **Collision & Momentum**: Moving notes smoothly bump and push neighboring unpinned papers away with angular torque.
  - **Anchored Pushpins**: Pinned notes act as rigid, immovable obstacles that cannot be pushed or displaced.
  - **Dynamic Tilt**: Notes flex aerodynamically in response to drag velocity.
- **Collectible Rarity System**:
  - **Ash Draft** *(Common)*: Raw graphite newsprint with chalk circle seal (`◌`).
  - **Verdant Leaf** *(Uncommon)*: Pressed botanical drafting sheet with emerald seal (`✦`).
  - **Astral Blueprint** *(Rare)*: Midnight celestial blueprint with prism seal (`◈`).
  - **Void Velvet** *(Epic)*: Royal obsidian-violet paper with cosmic eye seal (`❖`).
  - **Solaris Relic** *(Legendary)*: Gilded noir parchment with radiant golden embers and solar seal (`✹`).
- **1-Click Rarity Cycle**: Tap any note's circular wax seal to advance it directly to the next rarity tier with custom Web Audio synthesized chimes.
- **Rarity Disappearance Effects**:
  - **Ash Draft**: Scrunches into a tight ball and dissolves into gray ash dust.
  - **Verdant Leaf**: Swirls away like leaves caught in a gust of wind.
  - **Astral Blueprint**: Inverts into a cyan laser line and quantum glimmers away.
  - **Void Velvet**: Twists into a 540° event-horizon black hole vortex and implodes.
  - **Solaris Relic**: Radiates a blinding golden solar supernova and evaporates into light.
- **Tactile Gestures**:
  - **Peel from Pad**: Click the 3D sticky pad stack in the top corner to peel fresh notes.
  - **Double-Click Desk**: Double-click anywhere on the void canvas to manifest a note directly under your cursor.
  - **Quill Inscription**: Click the quill icon on any note to copy its text to the clipboard.
  - **Hover & Focus Z-Index**: Hovering or focusing into any note pulls it above overlapping sheets.
- **Persistence**: All coordinates, content, and pinned statuses automatically persist to `localStorage`.

---

## Quickstart

```bash
bun install
bun run dev
```

Open `http://localhost:5173` to explore the canvas.

### Production Build

```bash
bun run build
bun run preview
```

### Native macOS App (.app)

Build a self-contained, native macOS application bundle with dark titlebar, keyboard shortcuts, and `cmd+w` support:

```bash
# Build Sticky.app into dist-app/Sticky.app
bun run build:app

# Build and copy directly to /Applications
bun run install:app
```

Alternatively, copy manually:

```bash
cp -R dist-app/Sticky.app /Applications/
```

### Tests & Verification

```bash
bun run check
```
