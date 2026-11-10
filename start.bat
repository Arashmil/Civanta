@echo off
TITLE CIVANTA Prototype Launcher
echo ========================================================
echo    CIVANTA - Smart Grievance Management System
echo    Karnataka State Police (KSP) Demonstration
echo ========================================================
echo.

set PATH=D:\civanta\tools\node-v20.18.0-win-x64;%PATH%
set PYTHON_EXE=C:\Users\Eli\AppData\Roaming\uv\python\cpython-3.12-windows-x86_64-none\python.exe

echo [1/3] Checking Database and Seed Data...
cd /d D:\civanta\backend
%PYTHON_EXE% -m app.seed
if %ERRORLEVEL% NEQ 0 (
    echo [WARNING] Seed script encountered a notice. Continuing...
)

echo.
echo [2/3] Starting FastAPI Backend on http://127.0.0.1:8000 ...
start "CIVANTA Backend (FastAPI)" cmd /k "%PYTHON_EXE% -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"

echo.
echo [3/3] Starting Vite React Frontend on http://localhost:5173 ...
cd /d D:\civanta\civanta
start "CIVANTA Frontend (Vite)" cmd /k "npm run dev"

echo.
echo ========================================================
echo CIVANTA Prototype is launching!
echo - Web Application: http://localhost:5173
echo - Backend API Docs: http://127.0.0.1:8000/docs
echo - Demo Accounts: citizen@demo.com, junior@demo.com, supervisor@demo.com, admin@demo.com (Password: Demo@123)
echo ========================================================
pause
