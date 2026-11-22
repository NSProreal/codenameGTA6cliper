@echo off
title CLIP STUDIO / VI - GTA 6 AI Clipping Tool
cd /d "%~dp0"
echo Checking if port 8000 is already in use...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":8000" ^| findstr "LISTENING"') do (
    echo Stopping previous server instance on port 8000 ^(PID %%a^)...
    taskkill /F /PID %%a >nul 2>&1
)
echo Starting CLIP STUDIO / VI on http://127.0.0.1:8000 ...
start "" "http://127.0.0.1:8000"
python app.py
pause
