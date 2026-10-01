@echo off
title Winter Arc Tracker
setlocal enabledelayedexpansion

:: Force working directory to the directory where this batch file is located
cd /d "%~dp0"

echo ===================================================
echo             WINTER ARC TRACKER
echo        Lifetime Habit & Progress System
echo ===================================================
echo.
echo [*] Directory: %CD%

:: Verify Python is installed and accessible
where python >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python is not found in your system PATH.
    echo Please ensure Python is installed and added to PATH.
    echo.
    pause
    exit /b 1
)

:: Build frontend if dist is missing
if not exist "frontend\dist\index.html" (
    echo [*] Frontend production bundle not found. Building now...
    cd frontend
    call npm run build
    cd ..
)

echo [*] Starting Winter Arc Tracker Desktop Application...
python desktop\desktop_main.py

if errorlevel 1 (
    echo.
    echo [!] Application exited with an error. Check logs above.
    pause
)

