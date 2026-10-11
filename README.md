# Art of War: Setting Sun

A browser FPS space MMO built from Phil Gonzales' and Caleb Dingus' high-school notebook concept art.
Three.js, one HTML page, no build tools beyond a small Python script.

## Play
- **Live (with cloud saves, multiplayer, leaderboards):** the claude.ai artifact page.
- **Static copy:** `dist/index.html` plus `dist/music/`. It runs on any static host (for example GitHub Pages pointed at `/dist`). Outside claude.ai the game saves to the browser and runs single-player, because accounts, multiplayer and leaderboards come from the artifact runtime.

## Build
```
python3 tools/build.py        # writes dist/index.html from src/
```
`src/game.src.html` is the shell; `tools/build.py` splices the modules in `src/` into it. Module order matters: later modules wrap functions defined by earlier ones.

## Layout
- `src/` game modules (levels, worlds, quests, HUD, music, cutscenes, ...)
- `dist/` the built game and its music
- `docs/RELEASE.md` how to host it on your own server
- `docs/game-bible.md` design bible, story, status log and to-do list
