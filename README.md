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

## Script Studio (B.U.R.P. lines, cutscene captions, voice packs)

Run the server on your computer (`node server.js`), then open **http://localhost:8080/script** in a browser on that same computer (or the 🎙 Script Studio button in the Asset Studio). Like the Asset Studio, it only opens from the machine the server runs on, not through a tunnel.

- **B.U.R.P. triggers:** every situation that makes B.U.R.P. talk, what sets it off, and the lines he picks from. Add, edit or delete lines.
- **Other lines:** his one-off story lines, every cutscene's captions and the Greater Maw battle radio. Reword any of them; ↺ puts the original back.
- **Voice packs:** pick a voice (Kokoro: 54 voices, and two can be blended; Piper: 100+ voices), set the speed and effects (pitch, robot ring, metal echo, radio, big room, doubler, bit crush), preview, then Generate missing or Regenerate all. Packs can be duplicated, and the ★ pack is the default. Players can switch packs in Settings → Sound.
- Edits are saved to `src/script.json`, layered over the lines in the code, so a mistake can't break the game. Saving rebuilds the game.
- Voice generation runs on your computer and needs Python 3 (on Ubuntu or Mint also `sudo apt install python3-venv`). Press **Install voice tools** once: it makes a private Python environment in `tools/voice_models/venv`. The voice models download the first time you generate, into `tools/voice_models/`, which git ignores.
- New clips land in `dist/voice/<pack>/`. Push them to GitHub (or tell Claude) so they get uploaded with the live game.
