@echo off
TITLE RIPPLE - Bengaluru Resilience Twin Launcher
COLOR 0A
echo ========================================================
echo   RIPPLE - Bengaluru Resilience Twin Local Launcher
echo ========================================================
echo.
cd /d %~dp0
echo [1/3] Checking dependencies...
if not exist node_modules (
    echo Node modules not found. Running npm install...
    call npm install --legacy-peer-deps
)
echo.
echo [2/3] Starting RIPPLE API Server and Web Command Center...
echo.
start cmd /k npm run dev
echo Waiting for servers to initialize...
timeout /t 5 /nobreak >nul
echo [3/3] Opening RIPPLE Command Center in browser...
start http://localhost:5173
echo.
echo ========================================================
echo   RIPPLE is now running!
echo   - App: http://localhost:5173
echo   - API: http://localhost:3001/api
echo ========================================================
echo.
pause