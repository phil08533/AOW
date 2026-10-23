#!/bin/sh
# Blork Server launcher for Mac/Linux: installs what it needs once, then starts the server and opens the control panel.
cd "$(dirname "$0")"
command -v node >/dev/null || { echo "Node.js is needed to host: https://nodejs.org"; exit 1; }
[ -d node_modules/ws ] || npm install ws --no-audit --no-fund --silent
exec node server.js
