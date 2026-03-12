@echo off
echo ===================================
echo PipelineIQ - Full Stack Launcher
echo ===================================

REM Check backend .env
echo.
echo [1/6] Checking Backend Configuration...
if not exist "backend\.env" (
    echo Error: backend\.env not found
    echo Please run setup.bat first
    pause
    exit /b 1
)

REM Check frontend .env
echo.
echo [2/6] Checking Frontend Configuration...
if not exist "frontend\.env" (
    echo Creating frontend\.env...
    echo VITE_API_URL=http://localhost:8001 > "frontend\.env"
)

REM Install backend dependencies
echo.
echo [3/6] Installing Backend Dependencies...
cd backend
if not exist "venv" (
    python -m venv venv
)
call venv\Scripts\activate
pip install -r requirements.txt --quiet
cd ..

REM Install frontend dependencies
echo.
echo [4/6] Installing Frontend Dependencies...
cd frontend
call npm install --silent
cd ..

REM Start backend
echo.
echo [5/6] Starting Backend Server...
cd backend
start "Backend Server" cmd /k "venv\Scripts\activate && python main.py"
cd ..

REM Wait for backend
timeout /t 5 /nobreak >nul

REM Start frontend
echo.
echo [6/6] Starting Frontend Server...
cd frontend
start "Frontend Server" cmd /k "npm run dev"
cd ..

echo.
echo ===================================
echo Services Started Successfully!
echo ===================================
echo.
echo Frontend: http://localhost:5173
echo Backend:  http://localhost:8001
echo API Docs: http://localhost:8001/docs
echo.
echo Press any key to stop all services...
pause >nul

REM Cleanup
taskkill /FI "WindowTitle eq Backend Server*" /T /F 2>nul
taskkill /FI "WindowTitle eq Frontend Server*" /T /F 2>nul
echo Services stopped
