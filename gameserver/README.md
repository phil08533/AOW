# Blork Server

Player-hosted server for Art of War: Setting Sun.

**Windows:** double-click `Host Server.bat`. **Mac/Linux:** run `./host-server.sh`.
The first run installs what it needs; then the server starts and its control panel opens in your browser at http://127.0.0.1:7778 (join code, your addresses with Copy buttons, name, password, rules, locked player settings, kick and ban, log).

    node gameserver/server.js          # manual start; needs the `ws` package

- Config is saved to `server-config.json` next to the script (or `GD_CONFIG`). Passwords are stored as salted scrypt hashes.
- Players: WebSocket on `port` (default 7777). Public `GET /info` for the server preview.
- Server window: admin API on `127.0.0.1:adminPort` (default 7778), header `x-admin-token` from the config.
  `/admin/status`, `/admin/settings`, `/admin/kick`, `/admin/ban`, `/admin/stop`.
- Protections: join timeout, 5 wrong passwords = 60 s lockout per IP, 40 msg/s rate limit, 48 KB message cap, name and chat filter, bans by player id and IP.
