@echo off
REM fix_flask.bat - Uninstall incompatible Flask and install Flask 3.1.0, then run app.py
cd /d "%~dp0"

echo Uninstalling any existing Flask...
python -m pip uninstall flask -y

echo Installing Flask 3.1.0...
python -m pip install Flask==3.1.0

echo Installing other requirements from requirements.txt...
python -m pip install -r requirements.txt

echo Starting app.py
python app.py

pause
