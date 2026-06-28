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
git commit -m "Fix white screen crash on Analytics & Reports tab due to undefined maxMonthVal variable"
echo.
echo Pushing to remote...
git push
echo.
echo Done!
pause
