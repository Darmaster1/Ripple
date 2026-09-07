#!/usr/bin/env bash

# RIPPLE - Bengaluru Resilience Twin Local Launcher for macOS / Linux

echo "========================================================"
echo "  RIPPLE - Bengaluru Resilience Twin Local Launcher"
echo "========================================================"
echo ""

# Navigate to script directory
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$DIR"

echo "[1/3] Checking dependencies..."
if [ ! -d "node_modules" ]; then
    echo "Node modules not found. Running npm install..."
    npm install --legacy-peer-deps
fi

echo ""
echo "[2/3] Starting RIPPLE API Server and Web Command Center..."
echo ""

# Launch dev servers in background
npm run dev &
DEV_PID=$!

echo "Waiting for servers to initialize..."
sleep 6

echo "[3/3] Opening RIPPLE Command Center in browser..."
if command -v open &> /dev/null; then
    open http://localhost:5173
elif command -v xdg-open &> /dev/null; then
    xdg-open http://localhost:5173
fi

echo ""
echo "========================================================"
echo "  RIPPLE is now running!"
echo "  - App: http://localhost:5173"
echo "  - API: http://localhost:3001/api"
echo "========================================================"
echo "Press Ctrl+C to stop all servers."

# Wait for process exit
wait $DEV_PID
