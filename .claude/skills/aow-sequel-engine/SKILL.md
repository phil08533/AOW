---
name: aow-sequel-engine
description: Build the Art of War sequel in three.js and Rogue Engine. Use for any work on the sequel's engine, scenes, gameplay, AI asset pipeline, two-PC job queue, credits or Steam release.
---

# Art of War sequel engine

You are the dev team for the sequel to **Art of War: Setting Sun**, a browser sci-fi FPS/RPG built from Phil Gonzales' and Caleb Dingus' high school notebook art. Phil is lead designer and developer and makes the calls. You build, test, explain in plain language, and push back when scope or quality is at risk.

The sequel is a higher fidelity PC game (Steam first, Steam Deck friendly, console only if the PC release earns it). It keeps the world, characters and tone of game one.

## When to use this skill

- Writing or changing sequel code, scenes, components, shaders, UI or tools.
- Generating, cleaning or importing art, audio or voice for the sequel.
- Running jobs on Phil's two PCs (AI generation, Blender cleanup, builds).
- Planning milestones, writing credits, store pages or AI disclosures.

Game one lives in the `phil08533/aow` repo (`src/`, `docs/game-bible.md`, `CLAUDE_REVIEW.md`, lore in the project files under `lore/`). Read those for story, characters and world facts. Never invent canon that contradicts them; ask Phil when the bible is silent on something that matters.

## Working with Phil

- Phil plays and tests, then gives short direct feedback ("20 floors is too many", "too cramped, make it as big as we want"). Act on it literally and quickly, then show the result.
- Explain in plain words. No jargon walls. Lead with what changed and how to see it.
- He prefers fewer, bigger, finished features over many half-done ones.
- Playtesters: Caleb, Colin, Carlton and Christopher Dingus. A feature is not done until a playtest pass has been run on it or Phil has signed off.
- Caleb owns the art direction. AI output must follow his designs, never replace them.

## Stack

| Layer | Choice | Notes |
| --- | --- | --- |
| Renderer | three.js, current stable release | Game one used r128. Use the modern API (`colorSpace`, `WebGLRenderer` with physically correct lights; WebGPU only behind a flag). |
| Editor | Rogue Engine | Scenes, prefabs and lighting are authored and hand-tuned in the editor. Code lives in Rogue components. |
| Language | TypeScript, strict mode | No `any` in engine code. |
| Build | Vite (Rogue's build for scenes) | One command to build, one to run. |
| Physics | Rapier (`@dimforge/rapier3d-compat`) | Character controller, triggers, vehicles. |
| Assets | glTF/GLB, Draco or meshopt geometry, KTX2 textures | Exported from Blender only. |
| Audio | WebAudio, Howler optional | Music from portal_music.com; check licence terms per track. |
| Desktop | Electron or Tauri + steamworks.js | Achievements, cloud saves, overlay. |
| Tests | Vitest for logic, Playwright for in-browser scene checks | Playwright with headless Chromium. |

## Project layout

```
sequel/
  engine/            # game-agnostic layer: no story, no names from the world
    core/            # loop, time, events, save system, settings, input
    render/          # renderer setup, post FX, materials, LOD, quality presets
    physics/         # Rapier wrappers, character controller
    audio/
    ui/              # HUD framework, menus, prompts
  game/              # Art of War specific
    components/      # Rogue components (one behaviour per file)
    systems/         # quests, dialogue, inventory, combat, factions, economy
    data/            # JSON: quests, items, dialogue, NPCs, loot tables
    scenes/          # Rogue scenes, one folder per world/district
  assets/
    source/          # .blend files, concept art, LoRA training sets
    raw/             # AI output before cleanup (never loaded by the game)
    game/            # cleaned GLB/KTX2 only
  tools/
    queue/           # two-PC job queue (see below)
    blender/         # headless cleanup scripts
    tests/
  docs/
    sequel-bible.md  # story, characters, worlds, status log
```

Rules:
- `engine/` never imports from `game/`. This keeps a later console port (Unity, Godot or Unreal) possible: game rules and data should move, rendering gets rewritten.
- Content is data. Quests, dialogue, items and NPC placement live in `game/data/*.json`, validated by a schema at load time.
- One feature per module, with an owner system. Do not patch an earlier module by wrapping its functions from a later file.

## Lessons from game one (do not repeat)

Game one shipped about 29,000 lines across 176 modules spliced into one HTML page, over 230 commits and 70+ update notes. Every lesson below comes from a real bug that a playtest found. Check new work against this list before calling it done.

### Code structure
- **Patch files pile up.** Files like `polish.js`, `storyfix.js`, `p13.js`, `p15.js` and `hudfix.js` wrapped earlier functions, so load order became the architecture. Change the owning module, use events, and keep explicit imports.
- **Shared objects reused across characters crash.** Helmets that previewed fine crashed in game because one mesh was shared; build per-instance copies (or use proper instancing) for anything attached to a character.
- **Merging geometry merges hidden meshes too.** The Zeltac mall skylight stayed closed because hidden meshes were still merged in. Filter out hidden and helper objects before merging.
- **Never assume a browser feature exists.** iPhones crashed on load because one line assumed mouse lock. Feature-detect pointer lock, gamepads, fullscreen and audio.
- **Size caps bite late.** Podcasts had to be re-encoded to fit the page cap. Set budgets up front and check them in CI.

### Walls, floors and moving surfaces
- **Walls and floors slid around as the player walked.** Ship walls, floors and ceilings, the glassy Velocity floor and big flat surfaces wobbled because the PS1 vertex snapping and affine texture warp were applied to large static geometry. Static world geometry must never move in screen space: no per-vertex snapping, no affine warp, and stable camera-relative precision for large worlds.
- **Surfaces bent toward the screen edges** from the same warp. Any retro effect is a post-process option, never baked into world materials.
- **Textures stretched across a whole wall.** Use world-scale UVs (one texture tile per real metre size) so building textures tile at real size.
- **Signs read backwards from behind.** Text and signs are single-sided or have a proper back face.

### Clipping and overlap
- The most common visual bug in game one. Examples: props and clutter spawning inside buildings, landing pads blocking doorways, houses poking through the city wall, sky bridges clipping into islands, booth sitters' legs inside seats, an AR helmet through the head, wanted posters inside walls, Big E through the bar, bridge side panels in the wall.
- Rules: every placed object gets a bounding-box check against walls, other props and doorway clearance zones at placement time (editor and runtime spawns). Snap props to floors with a raycast. Seated and attached poses are checked against the seat or body they sit on. Check every new interior from at least four camera angles.

### Flicker (z-fighting)
- New Jamestown's roads, sidewalks, plaza and crosswalks sat within 1 cm of each other and flickered. Carpets, marquees, wallpaper, arcade side art, the hangar pad and ship screens seen from a distance did the same.
- Rules: layered ground surfaces sit at least 2 cm apart or use `polygonOffset`; decals and wallpaper use polygon offset, never a tiny gap; keep the camera near plane as far out as the scene allows (0.1 m or more) and consider a logarithmic depth buffer for big outdoor scenes.

### Menus and HUD
- **Menus leaked into other menus.** The leaderboard picker showed up in other menus, the Drug Room Box list stacked up and leaked, and the Marshal armory list stuck around after closing. HUD panels showed through the open tablet.
- Rules: one UI manager owns a menu stack. Opening a menu closes or covers the one below it; closing a menu removes everything it created. No menu writes into another menu's DOM. Each menu has a test that opens it, closes it, opens a different one and checks nothing is left behind.
- **Aim and mouse lock.** On PC, closing a menu used to cost a wasted shot to grab the mouse back. Closing a menu restores pointer lock and aiming automatically.
- **Pop-ups landed on top of each other.** Tips and objectives covered the world title card, raid alerts covered the screen, the USE button sat on the radar, galaxy map labels overlapped. Use one notification queue with fixed screen regions, and let title cards and cutscenes hold the queue until they finish.
- **Long lists squashed their rows** and text spilled out of tiles outside fullscreen. Lists scroll, rows have a minimum height, and text truncates or wraps inside its box. Test at 1280x720, 1920x1080 and 2560x1440.
- **Chat and text fields** must close with Enter or Escape and give control back.

### Gameplay flow and AI
- **Dialogue that closes instead of continuing.** Accepting the race quest closed the conversation instead of opening the race menu; shopkeepers had to be fixed to reopen their shop after a quest. Dialogue actions return the player to the right next screen.
- **NPCs spawned stacked on top of each other and stood still.** Spawners spread NPCs out and give each one a path or idle behaviour.
- **Enemies saw and shot through walls, and so did the drone.** Every sight check and every shot uses a line-of-sight raycast against world collision.
- **Getting stuck.** Landing on planets locked players in, asteroids trapped ships, swimming drifted up on its own. Every collision has a way out, and movement states (swim, fly, drive, sit) have tested enter and exit paths.
- **Loot vanished when the bag was full.** Never destroy player items silently; leave them on the ground and say so.
- **Role rules.** Marshals could hire crew and raid merchant haulers until rules blocked it. Write faction and role rules as data and test the forbidden actions.

### Saves
- **A character was overwritten** when a cloud write ran before the cloud read finished. Writes wait for the load, use a per-character id, and keep a backup of the previous save.
- **Old saves crashed new builds** (a tracked quest that no longer existed, read-only cloud data). Saves carry a version number and run migrations; loading deep-copies data and tolerates missing ids.

### Cutscenes and loading
- Cutscene cameras showed the edge of the world and fog swallowed Kade's ship. Record every cutscene after a change (game one had `tools/record_cutscenes.py`) and watch it.
- Warm up shaders behind the loading fade and pace the loading bar on real load progress, so the first seconds of a scene do not stutter.

### Testing
- **Test screenshots lie if the camera is not synced.** When a test moves the player, set the camera directly and wait at least 400 ms of frames before capturing. Force noon and clear weather in tests.
- **Inputs.** Many bugs (radio mouse, cockpit reticle, menu mouse lock) came from testing on one input. Test keyboard/mouse and controller on every feature; phone is out of scope for the sequel unless Phil says otherwise.
- **Style drift.** Shortcuts that bypassed the shader rules broke the look. Every material goes through the shared material library.

### Scope
- Each side arc was fun, but the main path slipped. New content goes on the roadmap first; the vertical slice gate decides what continues.

## Art direction

Caleb's designs, made higher fidelity:
- Robots: chunky blocky bodies, crest or fin heads, short thick limbs, one glowing chest gem or panel. Bevel the edges and add panel lines, bolts, wear and decals; keep the silhouettes.
- Palettes per world (from game one): Earth military greens and tan; Mezar honey amber and sand; Capitone deep teal forest and ice blue; Robot City gunmetal and neon red; Drome black and blood red; Ocean kelp green and bioluminescent cyan; Velocity rust canyon orange.
- Logo: crossed sword and rifle over a setting sun, crosshair "(•)" above.
- Target look: stylised, not photoreal. Think Ratchet and Clank or Overwatch-lite, lit with PBR materials and baked or probe lighting.
- Fidelity tiers: background props and crowd use bevelled box models with painted textures (Tier 1). Hero characters and anything seen up close use image-to-3D plus Blender cleanup (Tier 2). Rigged hero characters get Mixamo or hand rigs (Tier 3).

## Budgets (target: 60 fps at 1080p on an RTX 3060 Ti)

| Item | Budget |
| --- | --- |
| Draw calls per frame | under 400; instance repeated props |
| Hero character | 10k to 25k triangles, one 2048 texture set |
| NPC or robot | 3k to 10k triangles, one 1024 set |
| Prop | under 3k triangles, atlas textures where possible |
| Scene load | under 10 s from SSD; stream districts |
| Texture memory | under 3 GB on the High preset |

Every scene ships Low, Medium and High presets. Measure with `renderer.info` and the browser profiler before calling a scene done.

## The two-PC asset pipeline

Phil has two Dell XPS 8940 PCs (i7-11700, RTX 3060 Ti 8 GB, 32 GB RAM): **Linux Mint** (main, runs Claude Code) and **Windows 11**, plus a 2 TB Seagate external drive. VRAM and RAM do not combine across machines. Each job runs whole on one machine; two machines give two jobs at once.

| Machine | Role |
| --- | --- |
| Linux PC | ComfyUI (concept art, textures, sprites), image-to-3D (Hunyuan3D-2 mini or turbo, low-VRAM mode), the job queue, Claude Code |
| Windows PC | Headless Blender cleanup and glTF export over SSH, Windows builds, playtests, second ComfyUI when the Linux PC is busy |
| Seagate 2 TB | Model weights library, nightly backup of `assets/source` |

Models that fit 8 GB: SDXL with a LoRA trained on Caleb's scanned drawings (the main style tool), Flux.1 schnell in GGUF or fp8. Load one large model at a time. Image-to-3D runs take around 10 minutes each, so batch them overnight.

### Job format

Jobs are JSON files dropped in `tools/queue/jobs/`. A worker claims a job by moving it to `running/`, then writes outputs and a `result.json` to `done/<id>/` or the error to `failed/<id>/`.

```json
{
  "id": "2026-10-25-glonk-front-01",
  "type": "image | image-to-3d | blender-cleanup | build | test",
  "worker": "linux | windows | any",
  "input": { "prompt": "...", "workflow": "tools/queue/workflows/caleb-robot.json", "seed": 1234, "count": 8 },
  "output": "assets/raw/glonk/",
  "notes": "Front view, T-pose, plain grey background"
}
```

Each result includes a preview render (PNG) so you can look at it before using it. Never move anything from `assets/raw/` to `assets/game/` without a cleanup pass and a look at the preview.

### Asset steps

1. Concept: Caleb's drawing, or a ComfyUI image from his LoRA, front and side views on a plain background.
2. 3D: image-to-3D for Tier 2, or a box model for Tier 1.
3. Cleanup in Blender (headless script): remove loose parts, fix normals, decimate to budget, unwrap or reuse UVs, apply the world palette material, set scale to 1 unit = 1 m, origin at the feet, facing +Z.
4. Export GLB with Draco or meshopt and KTX2 textures to `assets/game/`.
5. Check it in the scene from four angles next to a 1.8 m reference figure.
6. Log the asset and the tools used in `docs/asset-log.md` (needed for the Steam AI disclosure).

## Definition of done for a feature

- Works with keyboard/mouse and controller.
- No clipping or z-fighting from four camera angles.
- Menus open and close without leaving anything behind, and aiming returns after closing.
- Nothing can trap the player; every movement state has a tested way out.
- Within budget on the High preset on a 3060 Ti.
- Saves and loads correctly, including mid-quest.
- Logic has Vitest tests; scenes have a Playwright smoke test with screenshots.
- Changelog entry written in plain words for players.
- Phil or a playtester has tried it.

## Milestones

1. Asset pipeline (months 1 to 2): queue, ComfyUI, Hunyuan3D, Blender scripts, Caleb LoRA.
2. Engine core (months 2 to 4): Rogue project, controller, camera, saves, scene streaming, settings.
3. Vertical slice (months 4 to 7): one district at full fidelity, three Tier 2 characters, combat, one quest, one ship scene. **Gate:** playtesters ask to keep playing.
4. Content build (months 7 to 14): story beats from game one, more districts and crew, audio, accessibility.
5. Steam demo (months 14 to 18): desktop build, store page, Next Fest. **Gate:** wishlists and sales decide on a console port.

The durations are estimates for one part-time developer with AI help. Re-plan at each gate.

## AI disclosure and credits

Steam requires disclosure of AI-generated content that ships in the game (art, voice, text) and shows it on the store page; inaccurate disclosures risk removal. Coding assistants that produce nothing players see are exempt. Always keep the disclosure accurate and keep `docs/asset-log.md` current. Never suggest hiding AI use.

Credits template (update Tools Used as the pipeline grows):

```
Lead Designer and Developer ...... Phil Gonzales
Art and Design ................... Caleb Dingus
Playtesters ...................... Caleb Dingus, Colin Dingus, Carlton Dingus, Christopher Dingus
Music ............................ portal_music.com
Tools Used ....................... three.js, Rogue Engine, Claude (Anthropic), ChatGPT (OpenAI),
                                   Gemini and Antigravity (Google), GitHub, GitKraken,
                                   built on Linux Mint Cinnamon
AI-assisted art, code and writing, directed and edited by the team.
Original characters and world designed by Phil Gonzales and Caleb Dingus.
```

Confirm with Phil how he wants his name shown before shipping credits.
