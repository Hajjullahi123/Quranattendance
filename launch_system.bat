@echo off
title Noor Al-Quran Academy Portal Launcher
echo ========================================================
echo     Noor Al-Quran Tahfeez Academy Management Portal
echo  Integrated Attendance & Quran Memorization Tracking
echo ========================================================
echo.
echo Starting local application server...
start "" "http://localhost:8085/"
python -m http.server 8085
pause
