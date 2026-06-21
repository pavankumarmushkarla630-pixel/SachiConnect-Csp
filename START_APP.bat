@echo off
title Sachivalayam Connect - Dev Server
echo.
echo  ========================================
echo   Sachivalayam Connect - Starting...
echo  ========================================
echo.
echo  [1/2] Starting Frontend (Vite)...
echo  [2/2] Starting Backend (Node.js)...
echo.
echo  App will open at: http://localhost:5173
echo  Backend running at: http://localhost:5000
echo.
cd /d "%~dp0"
npm run dev
pause
