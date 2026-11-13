@echo off
cd /d "%~dp0"
title SDE-Mastery 40 - Study Portal & Quiz App

echo ======================================================================
echo    SDE-Mastery 40: MERN to Senior Full-Stack & AI Engineer
echo    Starting Local Study Portal & Interactive Quiz Application...
echo ======================================================================
echo.

:: Check Node.js installation
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not found in your PATH!
    echo Please install Node.js from https://nodejs.org/ to run the local server.
    pause
    exit /b 1
)

echo [1/2] Launching server on http://localhost:5000...
start "SDE-Mastery Server" /min cmd /c "node server.js"

:: Give the server a moment to bind port
timeout /t 2 /nobreak >nul

echo [2/2] Opening application in your default browser...
start http://localhost:5000

echo.
echo ======================================================================
echo    Study Portal is active! 
echo    If your browser did not open automatically, visit:
echo    http://localhost:5000
echo ======================================================================
echo.
