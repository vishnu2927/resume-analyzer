@echo off
REM Setup.bat — creates venv, installs deps, and starts AI, server, and client in separate cmd windows.

echo Starting full setup for Resume Analyzer...

SET ROOT=%~dp0

echo Starting AI (create venv, install, run)...
start "AI" /D "%~dp0ai" cmd /k "if not exist venv\Scripts\activate.bat ( python -m venv venv ) && call venv\Scripts\activate.bat && python -m pip install --upgrade pip && pip install -r requirements.txt && python app.py"

echo Starting Server (npm install, run)...
start "Server" /D "%~dp0server" cmd /k "npm install && node index.js"

echo Starting Client (npm install, dev)...
start "Client" /D "%~dp0client" cmd /k "npm install && npm run dev"

echo Setup windows launched. Check each window for progress and errors.
pause
