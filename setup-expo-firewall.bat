@echo off
REM Expo Metro Bundler Firewall Configuration Batch Script
REM Right-click this file and select "Run as Administrator"

echo ===================================================
echo Expo Metro Bundler Firewall Configuration
echo ===================================================
echo.

REM Check for admin privileges
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo ERROR: This script must be run as Administrator!
    echo.
    echo Please:
    echo   1. Right-click this file
    echo   2. Select "Run as Administrator"
    echo.
    pause
    exit /b 1
)

echo Running PowerShell setup script...
echo.

PowerShell -NoProfile -ExecutionPolicy Bypass -File "%~dp0setup-expo-firewall.ps1"

echo.
echo ===================================================
pause
