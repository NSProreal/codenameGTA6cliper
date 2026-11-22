@echo off
title CLIP STUDIO / VI - GTA 6 AI Clipping Tool
cd /d "%~dp0"
echo Starting CLIP STUDIO / VI on http://127.0.0.1:8000 ...
start "" "http://127.0.0.1:8000"
python app.py
pause
