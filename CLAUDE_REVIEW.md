# Comprehensive Review & Handoff for Claude

**Date**: October 17, 2026  
**Latest Version**: `2.19.3` (`dist/index.html` ~2.51 MB)  
**Dev Server**: `node server.js` listening on `http://localhost:8080/` (static build + multiplayer websocket)  
**Primary Build Command**: `python3 tools/build.py`

This document provides a complete, line-item audit and architectural overview of all changes, features, bug fixes, and asset integrations introduced in Updates **2.19**, **2.19.1**, **2.19.2**, and **2.19.3** so you can easily review, test, and continue development.

---

## 1. Quick Overview of Releases

| Version | Release Title | Key Highlights |
|---|---|---|
| **2.19.3** | *Fort Ironrock Armored Perimeter Walls* | Custom 64×64 pixel art riveted iron plate texture (`TEX.ironwall`) applied to Fort Ironrock's perimeter walls with PS1 shaders and coping caps. |
| **2.19.2** | *New Jamestown Town Life & Outlaw Economy* | Arthur Vance stimulant dealing (2× Focus Fizz bonus), playable *Space Snake* & *Space Rocks* arcade cabinets + Pixel Pete, Municipal Notice Board, Barnaby fish feeding (Full Heal + Cat's Grace buff), Cookie's Diner cafe patio & specials. |
| **2.19.1** | *The Roxy Cinema & Dual-Channel Movies* | The Roxy Cinema walk-in movie theatre on Earth, stadium seating auditorium, silver screen, dual-channel synchronized movie feeds (*Night of the Living Dead* & *Santa Claus Conquers the Martians*), seat inactivity auto-hide, popcorn concessions, ship fishing room TV channel switching. |
| **2.19.0** | *New Jamestown Revamp & Aranus Man* | Architectural city layout (civic, commercial, entertainment, residential, park), Arthur Vance 10-page comic reader, first-person animated drug inhaler, shady street runners, Bobby's BBQ grill. |

---

## 2. Detailed Feature Breakdown & Implementation

### 2.1 Fort Ironrock Armored Perimeter Walls (Update 2.19.3)
- **User Request**: *"use this for the perimeter walls inside the fort iron whatever on the plant."* with an uploaded 64×64 pixel art PNG of 4 steel plates with rivets and seam lines.
- **Source Assets**: Saved to `assets/textures/fort_wall_iron.png` and mirrored in `dist/textures/fort_wall_iron.png`.
- **Texture Registry (`src/retro.js`)**:
  - Registered `TEX.ironwall` using canvas texture with `THREE.NearestFilter`, repeat wrapping, and sRGB encoding.
  - Embedded base64 Data URI fallback (`FORT_WALL_PNG`) for self-contained single-page execution.
  - Added `ironwall: [0.6, 0.35]` to standard material roughness/metalness table for non-retro fallback modes.
- **Geometry & Shaders (`src/army.js`)**:
  - Compound wall segments at radius 23.5m around `FORT = [0, -10]` now use `toon('#ffffff', 'ironwall')` which is automatically wrapped with `psx()` for 320×240 vertex grid snapping and affine texture coordinate interpolation.
  - Added dark gunmetal coping caps (`#3a3d44`, height 0.12m, width 3.85m, depth 0.9m) on top of each wall segment to neatly anchor the bolted panels.

### 2.2 Retro Graphics & PS1 Shader Pipeline Alignment
- **Aesthetic Constraint**: All graphics must match the authentic AOW PS1 pipeline (`toon()` quantized 4-step discrete palette lighting, `psx()` vertex snapping and affine mapping, procedural canvas textures from `src/retro.js`).
- **Texture Cleanup (`src/jamestown.js`)**:
  - Removed temporary base64 PNG texture overrides that were bypassing vertex shaders and lighting.
  - Restored original building palettes in `JT_BUILDINGS`: Roxy Cinema (`#8a2a3a` burgundy stone with `#ffd36a` gold trim), Neon Arcade (`#5a2a6a` purple with `#ff6aa8` hot pink accents), Cookie's Diner (`#d8a878` sand masonry with `#c8402f` crimson roof), Notice Board (`#4a3522` cedar wood), Town Hall (`#d8c8a8`).
  - Wrapped all signs, notice board flyers, arcade marquees, reader boards, movie posters, and water geometries (central plaza fountain & park pond) in `psx()`.

### 2.3 The Roxy Cinema & Dual-Channel Movies (Update 2.19.1)
- **New Module**: [`src/theatre.js`](file:///home/phil/Documents/GitHub%20Projects/AOW/src/theatre.js) bundled into `dist/index.html` via `tools/build.py`.
- **Cinema Exterior (`[-28, 12]` on Earth)**:
  - Art-deco lighted marquee canopy with animated chaser lights, reader board, double entrance doors with glowing panels, red carpet runner, and interaction trigger (`Enter The Roxy Cinema [E]`).
- **Cinema Interior (`LEVELS.theatre`)**:
  - Sloped stadium seating with 18 red velvet folding armchairs across 3 tiers.
  - Giant 14.4m × 8.1m curved silver screen with proscenium arch, velvet curtain valence, and exit signs.
  - Projector booth window with volumetric light cone shining through dust particles.
  - Concession stand selling Buttered Popcorn (`5 cr`, heals 35 HP).
- **Dual-Channel Video Feeds**:
  - Channel 1: *Night of the Living Dead* (1968, George A. Romero).
  - Channel 2: *Santa Claus Conquers the Martians* (1964, Nicholas Webster).
  - Global `TV_CHANNELS` registry in `src/tvden.js` keeps track of active channels, titles, and video source paths.
  - Pressing `[C]` or using the on-screen prompt toggles channels seamlessly.
  - Synchronized across the Roxy Cinema screen and the player's ship TV Den (`src/tvden.js`).
- **Inactivity Auto-Hide**:
  - While seated in the cinema (`SEAT.on`), keyboard and mouse activity listeners monitor interaction.
  - If no input occurs for 2.8 seconds, UI buttons and interaction prompts smoothly fade away (`opacity: 0`, `pointerEvents: 'none'`).
  - Any keypress or mouse movement immediately restores the UI.

### 2.4 New Jamestown Town Life & Outlaw Economy (Update 2.19.2)
- **Arthur Vance Stimulant Dealing (`src/jamestown.js`)**:
  - Arthur at `[-28, 0]` purchases stimulants (Focus Fizz, Stim Patches, Void Spice, Neon Dust, Glimmer, Red Haze, Blackout).
  - Focus Fizz pays a **2× premium** (120 cr) to fuel his writing of *The Astonishing Aranus Man Issue #2*.
  - Grants Outlaw reputation (`crime(...)`), plays cash SFX, and spawns coin particles.
- **Playable Retro Arcade Cabinets (`src/jamestown.js`)**:
  - 3D coin-op cabinets for *Space Snake* (`#50ff60`) and *Space Rocks* (`#4fe0d0`) placed outside the Neon Arcade at `[-28, -12]`.
  - Pressing `[E]` launches the full canvas retro minigames.
  - Added NPC **Pixel Pete** (`id: 'petep'`) who shares arcade gameplay advice.
- **Municipal Notice Board (`src/jamestown.js`)**:
  - 3D timber kiosk in Civic Plaza (`[0, -20]`) with Gazette header and pinned flyers.
  - Reading the board (`[E]`) opens an interactive municipal bulletin listing showtimes, bounties, lost & found, arcade leaderboards, and live Outlaw standing.
- **Barnaby the Cat Fish Feeding (`src/jamestown.js`)**:
  - Players carrying fresh fish (`fish1`–`fish5`) can select **"🐟 Feed fresh fish"** when talking to Barnaby.
  - Consumes 1 fish, heals player to 100% HP, awards +50 XP, and grants the **10-minute *Cat's Grace*** (+15% move speed) buff.
- **Cookie's Diner Cafe Patio & Specials (`src/jamestown.js`)**:
  - Outdoor checkered cafe tables with condiment sets and retro diner chairs.
  - Custom diner specials menu offering *Space Meatloaf* (+10% damage buff), *Black Diner Coffee* (+15% speed buff), and *Warm Cherry Pie* (full heal).

---

## 3. File Modification & Creation Audit

| File | Type | What Changed |
|---|---|---|
| [`src/retro.js`](file:///home/phil/Documents/GitHub%20Projects/AOW/src/retro.js) | MODIFIED | Added `FORT_WALL_PNG` base64 data URI, registered `TEX.ironwall`, and wired `ironwall` into `toon()` and `psx()`. |
| [`src/army.js`](file:///home/phil/Documents/GitHub%20Projects/AOW/src/army.js) | MODIFIED | Updated Fort Ironrock compound wall segments to use `toon('#ffffff', 'ironwall')` and added coping caps (`#3a3d44`). |
| [`src/jamestown.js`](file:///home/phil/Documents/GitHub%20Projects/AOW/src/jamestown.js) | MODIFIED | Restored original retro building palettes, wrapped all signage/water in `psx()`, added Notice Board, Arthur stimulant dealing, arcade cabinets, Barnaby fish feeding, and Cookie's diner menu. |
| [`src/theatre.js`](file:///home/phil/Documents/GitHub%20Projects/AOW/src/theatre.js) | NEW | Complete Roxy Cinema module: exterior marquee, interior stadium auditorium, silver screen, seating, concessions, inactivity timer. |
| [`src/tvden.js`](file:///home/phil/Documents/GitHub%20Projects/AOW/src/tvden.js) | MODIFIED | Added multi-channel registry (`TV_CHANNELS`), Channel 2 (*Santa Claus Conquers the Martians*), and channel switching logic. |
| [`src/substances.js`](file:///home/phil/Documents/GitHub%20Projects/AOW/src/substances.js) | MODIFIED | Wrapped first-person inhaler `glassMat` in `psx()` to align with retro pipeline. |
| [`src/updates.js`](file:///home/phil/Documents/GitHub%20Projects/AOW/src/updates.js) | MODIFIED | Added in-game changelog entries for `2.19.1`, `2.19.2`, and `2.19.3`. |
| [`src/game.src.html`](file:///home/phil/Documents/GitHub%20Projects/AOW/src/game.src.html) | MODIFIED | Exposed `camera` and `scene` on `window.__game` for debugging and automated camera synchronization. |
| [`tools/build.py`](file:///home/phil/Documents/GitHub%20Projects/AOW/tools/build.py) | MODIFIED | Added `'theatre.js'` to `FEATURES` module bundle list. |
| [`assets/textures/fort_wall_iron.png`](file:///home/phil/Documents/GitHub%20Projects/AOW/assets/textures/fort_wall_iron.png) | NEW | Saved source 64×64 pixel art riveted iron texture uploaded by user. |
| [`dist/textures/fort_wall_iron.png`](file:///home/phil/Documents/GitHub%20Projects/AOW/dist/textures/fort_wall_iron.png) | NEW | Static public asset copy for web serving. |
| [`tools/test_fort_wall.js`](file:///home/phil/Documents/GitHub%20Projects/AOW/tools/test_fort_wall.js) | NEW | Headless Chrome CDP test verifying Fort Ironrock perimeter wall texturing from multiple camera angles. |
| [`tools/test_theatre.js`](file:///home/phil/Documents/GitHub%20Projects/AOW/tools/test_theatre.js) | NEW | Headless Chrome CDP test verifying theatre entry, auditorium, seating, dual-channel movies, auto-hide, and ship TV den. |
| [`tools/test_town_life.js`](file:///home/phil/Documents/GitHub%20Projects/AOW/tools/test_town_life.js) | NEW | Headless Chrome CDP test verifying notice board, Arthur dealing, arcade cabinets, Barnaby fish feeding, and diner patio. |
| [`tools/test_jamestown_revamp.js`](file:///home/phil/Documents/GitHub%20Projects/AOW/tools/test_jamestown_revamp.js) | NEW | Headless Chrome CDP test verifying 20/20 NPCs, comic reader, runner networks, and Bobby's BBQ. |

---

## 4. How to Verify & Run Tests

### 4.1 Rebuilding the Game
```bash
python3 tools/build.py
# Expected output: built dist/index.html 2518899 bytes
```

### 4.2 Running the Automated Test Suites
Make sure the server is running on port 8080 (`node server.js`):

```bash
# 1. Fort Ironrock Perimeter Wall Texturing
node tools/test_fort_wall.js

# 2. The Roxy Cinema & Dual-Channel Video
node tools/test_theatre.js

# 3. New Jamestown Town Life, Stimulants & Arcades
node tools/test_town_life.js

# 4. Jamestown Base Overhaul & Comic Reader
node tools/test_jamestown_revamp.js
```

All 4 test suites execute against headless Chrome via Chrome DevTools Protocol (CDP), reposition the player, simulate player interactions, verify game state and inventory, and capture artifacts into the brain directory.

---

## 5. Architectural & Pipeline Rules to Preserve

1. **PS1 Retro Shader Consistency**:
   - Always wrap custom textured materials in `psx(new THREE.MeshLambertMaterial(...))` or `psx(new THREE.MeshBasicMaterial(...))`.
   - Always use `toon(hex, textureKey)` for architectural surfaces so they undergo 4-step discrete quantization via `TOON_RAMP`.
   - Never use un-shaded flat white textures or raw `MeshStandardMaterial` for retro surfaces unless explicitly targeting `RSTYLE === 'real'`.
2. **Build Order in `tools/build.py`**:
   - When adding new modules in `src/`, append them to `FEATURES` in `tools/build.py` in dependency order.
3. **Headless Chrome CDP Camera Sync**:
   - In automated tests, whenever setting `G.player.pos.set(...)` and `G.player.yaw`, always update `G.camera.position.set(...)` and `G.camera.rotation.set(...)` directly and wait at least 400ms for requestAnimationFrame to render before taking a CDP screenshot.
   - Always clear weather flashes in test scripts with `G.ENV.forceHour = 12; G.ENV.forceWx = 'clear'; G.ENV.flash = 0;` to avoid overexposure from lightning strikes.
