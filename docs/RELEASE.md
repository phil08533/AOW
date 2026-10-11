# Art of War: Setting Sun — Release Guide

Copy and paste when you're ready. For now the official game stays live on Claude (the artifact link).

---

## What runs where

| | Claude artifact (today) | Your own server, Step 1 (ready now) | Your own server, Step 2 (needs building) |
|---|---|---|---|
| Play in any browser, full screen | Inside Claude | ✅ | ✅ |
| Accounts and cloud saves | ✅ | ❌ saves stay on each device | ✅ |
| See other players, chat, raids, leaderboards | ✅ | ❌ | ✅ |
| **Shared enemies** (everyone fights the same monsters) | ❌ each player has their own | ❌ | ✅ |
| **Several worlds/servers** (Earth-1, Earth-2…) | ❌ | ❌ | ✅ |

Step 1 is a plain website, and it works today. Step 2 is a real game server. **Step 2 hasn't been written yet**, so its section below is the plan, not commands to run.

---

## Step 1: Host the game yourself (static website)

Tested target: **Ubuntu 22.04 or 24.04** server (any $5–6/month VPS works), with a domain name pointed at the server's IP.

### 1a. Quick test (no domain needed)
```bash
sudo apt update && sudo apt install -y git python3
git clone https://github.com/phil08533/AOW ~/aow
cd ~/aow/dist && python3 -m http.server 8080
```
Then open `http://YOUR_SERVER_IP:8080` in a browser. Press Ctrl+C to stop it.

### 1b. Real install (HTTPS on your domain, starts on boot)
Replace `play.example.com` with your domain first.
```bash
# Caddy web server (automatic HTTPS)
sudo apt update && sudo apt install -y git debian-keyring debian-archive-keyring apt-transport-https curl
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update && sudo apt install -y caddy

# The game
sudo git clone https://github.com/phil08533/AOW /opt/aow

# Serve it
sudo tee /etc/caddy/Caddyfile >/dev/null <<'EOF'
play.example.com {
	root * /opt/aow/dist
	encode gzip
	file_server
}
EOF
sudo systemctl reload caddy
```
Open `https://play.example.com`.

### Updating to the newest release
```bash
cd /opt/aow && sudo git pull
```
No restart needed.

### Rebuilding from source (only if you edit `src/`)
```bash
cd /opt/aow && python3 tools/build.py
```

---

## Step 2: Dedicated game server (shared enemies, several worlds)

> **Not built yet.** This is the plan. Exact install commands will be added here when the server exists.

What it will do:
- **One authoritative server per world instance.** Each planet runs as a "room" (Earth-1, Earth-2, Mezar-1…), capped at about 40–60 players each. When one fills up, a new copy opens automatically, and players can pick a world from a server list.
- **Shared enemies.** The server owns every enemy: where it spawns, where it moves, its health, what it drops. Everyone sees and fights the same monsters, bosses and raids. Players send "I fired here" and the server decides what got hit (this also stops cheating).
- **Accounts and saves on the server**, in a database, instead of in Claude.
- **Chat, parties, leaderboards and raids**, all run by the server.

Planned tech (picked because it's the easiest stack to keep building with AI):
- **Node.js 20** and **Colyseus** (a game-server framework with rooms built in) over WebSockets
- **PostgreSQL** for accounts and saves (SQLite to start)
- **Caddy** in front for HTTPS (the same setup as Step 1)
- Runs as a `systemd` service, or with **Docker Compose** for a one-command start

Server size: 2 vCPU and 4 GB RAM is enough for roughly 100–200 players to start.

Work involved: moving enemy behaviour, spawning, loot and combat checks out of the browser and into the server, then making the browser show what the server says. The browser game already runs on a "room" for multiplayer, so the move is mostly on the server side.

---

## Checklist before going public
- [ ] Domain name bought and pointed at the server (an A record to the server IP)
- [ ] Step 1 working at your domain
- [ ] Decide: stay on Claude for accounts and multiplayer, or build Step 2
- [ ] Music: you own all 13 tracks, or have the rights to them
