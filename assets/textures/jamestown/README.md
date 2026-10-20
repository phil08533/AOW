# Jamestown Architectural Texture Pack (Phil's Town Revamp)

This pack contains pixel art tile textures provided by Phil for the New Jamestown architectural revamp.

## Texture Index
- `brick_red.png` (64x64): Traditional warm red brick with dark mortar joints and subtle brick tone variation. Used for building facades, townhouses, and chimneys.
- `brick_weathered.png` (64x64): Darker weathered/burnt brick variant. Used for foundations, alleys, and industrial quarters.
- `roof_slate_grey.png` (64x64): Light grey bevelled slate roof tiles. Used for pitched roofs, mansard roofs, and architectural eaves.
- `stucco_sand.png` (64x64): Neutral speckled sand/stucco plaster. Used for storefront walls, accents, and diner siding.
- `stucco_flecked.png` (64x64): Terrazzo / red-flecked plaster texture. Used for civic interiors, pavers, and decorative banding.

## Usage in Game Engine
Textures are registered in `TEX` within `src/jamestown.js` (with canvas procedural fallbacks so offline/standalone builds run smoothly):
- `TEX.jtBrick`: Standard red brick
- `TEX.jtBrickDark`: Weathered brick
- `TEX.jtSlateRoof`: Slate roof
- `TEX.jtStucco`: Sand stucco
- `TEX.jtTerrazzo`: Flecked plaster

When adding new textures or poster pictures, place the PNG files in this directory and reference them in `pack.json`.
