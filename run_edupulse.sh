#!/bin/bash

# Kill any existing processes on ports 8000 and 5173
echo "Stopping existing servers..."
lsof -ti:8000 | xargs kill -9 2>/dev/null
lsof -ti:5173 | xargs kill -9 2>/dev/null

echo "Starting EduPulse Backend..."
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt > /dev/null 2>&1
nohup uvicorn main:app --reload --port 8000 > ../backend.log 2>&1 &
BACKEND_PID=$!
echo "Backend running (PID: $BACKEND_PID)"

echo "Starting EduPulse Frontend..."
cd ../frontend
# Ensure dependencies are installed (in case of timeout)
if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies (this may take a moment)..."
    npm install
fi

echo "Launching Vite Server..."
nohup npm run dev -- --port 5173 > ../frontend.log 2>&1 &
FRONTEND_PID=$!
echo "Frontend running (PID: $FRONTEND_PID)"

echo "------------------------------------------------"
echo "EduPulse is live!"
echo "Backend: http://localhost:8000"
echo "Frontend: http://localhost:5173"
echo "Logs are being written to backend.log and frontend.log"
echo "------------------------------------------------"
