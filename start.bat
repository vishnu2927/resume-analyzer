@echo off
REM Start.bat — starts AI, server, and client (skips installs) in separate cmd windows.

echo Starting services for Resume Analyzer...

start "AI" /D "%~dp0ai" cmd /k "if exist venv\Scripts\activate.bat ( call venv\Scripts\activate.bat ) && python app.py"
start "Server" /D "%~dp0server" cmd /k "node index.js"
start "Client" /D "%~dp0client" cmd /k "npm run dev"

echo Started AI, Server, and Client windows.
pause
