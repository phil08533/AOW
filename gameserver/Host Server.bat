@echo off
title Blork Server
cd /d "%~dp0"
where node >nul 2>nul || (echo Node.js is needed to host. Opening the download page... & start "" https://nodejs.org & pause & exit /b)
if not exist "node_modules\ws" (echo First run: installing... & call npm install ws --no-audit --no-fund --silent)
echo Starting Blork Server. The control panel opens in your browser. Close this window to stop the server.
node server.js
pause
