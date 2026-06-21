@echo off
title Sachivalayam Connect - UI Preview
echo.
echo  =====================================
echo   Starting UI Preview (Frontend only)
echo   Open: http://localhost:5173
echo  =====================================
echo.
cd /d "%~dp0"
npx vite
pause
