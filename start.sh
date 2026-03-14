#!/bin/bash

echo "==================================="
echo "PipelineIQ - Full Stack Test Script"
echo "==================================="

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check if backend .env exists
echo -e "\n${YELLOW}[1/6] Checking Backend Configuration...${NC}"
if [ ! -f "backend/.env" ]; then
    echo -e "${RED}Error: backend/.env not found${NC}"
    echo "Creating from .env.example..."
    cp backend/.env.example backend/.env
    echo -e "${YELLOW}Please edit backend/.env with your API keys${NC}"
    exit 1
fi

# Check if frontend .env exists
echo -e "\n${YELLOW}[2/6] Checking Frontend Configuration...${NC}"
if [ ! -f "frontend/.env" ]; then
    echo "Creating frontend/.env..."
    echo "VITE_API_URL=http://localhost:8000" > frontend/.env
fi

# Install backend dependencies
echo -e "\n${YELLOW}[3/6] Installing Backend Dependencies...${NC}"
cd backend
if [ ! -d "venv" ]; then
    python -m venv venv
fi
source venv/bin/activate || source venv/Scripts/activate
pip install -r requirements.txt
cd ..

# Install frontend dependencies
echo -e "\n${YELLOW}[4/6] Installing Frontend Dependencies...${NC}"
cd frontend
npm install
cd ..

# Start backend
echo -e "\n${YELLOW}[5/6] Starting Backend Server...${NC}"
cd backend
source venv/bin/activate || source venv/Scripts/activate
uvicorn main:app --reload --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!
cd ..

# Wait for backend to start
echo "Waiting for backend to start..."
sleep 5

# Start frontend
echo -e "\n${YELLOW}[6/6] Starting Frontend Server...${NC}"
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo -e "\n${GREEN}==================================="
echo "✓ Services Started Successfully!"
echo "===================================${NC}"
echo ""
echo "Frontend: http://localhost:5173"
echo "Backend:  http://localhost:8000"
echo "API Docs: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop all services"

# Cleanup function
cleanup() {
    echo -e "\n${YELLOW}Stopping services...${NC}"
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo -e "${GREEN}Services stopped${NC}"
    exit 0
}

trap cleanup INT TERM

# Keep script running
wait
