#!/bin/bash
set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )/.." && pwd )"

echo "=========================================================="
echo "          MOSAIC-9 — DEEP SPACE HEALTH OPERATIONS        "
echo "              TESSERA FLIGHT LAB (NASA 2026)              "
echo "=========================================================="

echo "[1/3] Starting Python Intelligence Microservice (Port 8100)..."
cd "$DIR/intelligence"
source venv/bin/activate
uvicorn app.main:app --host 127.0.0.1 --port 8100 &
PID_INTELLIGENCE=$!

echo "[2/3] Starting Laravel Backend API (Port 8000)..."
cd "$DIR/backend"
php artisan serve --port=8000 &
PID_BACKEND=$!

echo "[3/3] Starting Frontend Vite Development Server (Port 5173)..."
cd "$DIR/frontend"
npm run dev -- --host 127.0.0.1 --port 5173 &
PID_FRONTEND=$!

echo ""
echo ">> All MOSAIC-9 services active!"
echo ">> Frontend UI:   http://127.0.0.1:5173"
echo ">> Backend API:   http://127.0.0.1:8000/api/mission"
echo ">> Intelligence:  http://127.0.0.1:8100"
echo ""
echo "Press Ctrl+C to terminate all services."

trap "kill $PID_INTELLIGENCE $PID_BACKEND $PID_FRONTEND 2>/dev/null" EXIT
wait
