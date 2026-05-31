# Setup script for Resume Analyzer (Windows PowerShell)
# - Creates Python venv, installs AI requirements
# - Installs npm deps for server and client and root
# - Starts AI, server, and client each in a new PowerShell window

$root = Split-Path -Parent $MyInvocation.MyCommand.Definition
Write-Host "Project root: $root"

# Load .env into environment for this session
$envFile = Join-Path $root '.env'
if (Test-Path $envFile) {
  Get-Content $envFile | ForEach-Object {
    if ($_ -match '^\s*#') { return }
    if ($_ -match '^(\w+)=(.*)$') { $name=$matches[1]; $val=$matches[2]; $env:$name=$val }
  }
  Write-Host ".env loaded into session"
} else {
  Write-Warning ".env not found at $envFile. Please create it with GROQ_API_KEY and ports.";
}

# 1) Setup Python venv in ai
Push-Location (Join-Path $root 'ai')
if (!(Test-Path 'venv')) {
  Write-Host "Creating python venv..."
  python -m venv venv
} else {
  Write-Host "venv already exists"
}
$pyExe = Join-Path (Join-Path (Get-Location) 'venv') 'Scripts\python.exe'
if (!(Test-Path $pyExe)) { Write-Error "Python venv not found or python not installed in PATH."; Pop-Location; exit 1 }
Write-Host "Installing Python requirements..."
& $pyExe -m pip install --upgrade pip
& $pyExe -m pip install -r requirements.txt
Pop-Location

# 2) npm install in server and client and root
Push-Location $root
if (Test-Path 'server/package.json') { Write-Host "Installing server npm deps..."; Push-Location 'server'; npm install; Pop-Location }
if (Test-Path 'client/package.json') { Write-Host "Installing client npm deps..."; Push-Location 'client'; npm install; Pop-Location }
Write-Host "Installing root dev deps (concurrently)..."; npm install
Pop-Location

# 3) Start services in separate PowerShell windows
# AI
$aiCmd = "cd '$root\ai'; .\venv\Scripts\python.exe app.py"
Start-Process powershell -ArgumentList "-NoExit","-Command","$aiCmd"
Start-Sleep -Seconds 2

# Server
$svCmd = "cd '$root\server'; node index.js"
Start-Process powershell -ArgumentList "-NoExit","-Command","$svCmd"
Start-Sleep -Seconds 2

# Client
$clCmd = "cd '$root\client'; npm run dev"
Start-Process powershell -ArgumentList "-NoExit","-Command","$clCmd"

Write-Host "Started AI, server, and client in new PowerShell windows."
Write-Host "Open http://localhost:5173 in your browser once client finishes building."

*** End Patch