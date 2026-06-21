@echo off
title Sachivalayam Connect - Push to GitHub
echo.
echo  ========================================
echo   Pushing changes to GitHub...
echo  ========================================
echo.
cd /d "%~dp0"
git status
echo.
echo Adding changes...
git add .
echo.
echo Committing changes...
git commit -m "Implement structured AP location selector, optimize voice assistant logic, fix blinking/flickering, add geolocation village directory, and fix name-to-village field carry-over"
echo.
echo Pushing to remote...
git push
echo.
echo Done!
pause
