# CIVANTA Prototype Launcher for PowerShell
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "   CIVANTA - Smart Grievance Management System" -ForegroundColor Yellow
Write-Host "   Karnataka State Police (KSP) Demonstration" -ForegroundColor White
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""

$env:PATH = "D:\civanta\tools\node-v20.18.0-win-x64;" + $env:PATH
$pythonExe = "C:\Users\Eli\AppData\Roaming\uv\python\cpython-3.12-windows-x86_64-none\python.exe"

Write-Host "[1/3] Ensuring Database Seed Data..." -ForegroundColor Green
Set-Location "D:\civanta\backend"
& $pythonExe -m app.seed

Write-Host ""
Write-Host "[2/3] Starting FastAPI Backend on http://127.0.0.1:8000 ..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd D:\civanta\backend; & '$pythonExe' -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"

Write-Host ""
Write-Host "[3/3] Starting Vite React Frontend on http://localhost:5173 ..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "`$env:PATH = 'D:\civanta\tools\node-v20.18.0-win-x64;' + `$env:PATH; cd D:\civanta\civanta; npm run dev"

Write-Host ""
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "CIVANTA Prototype is active!" -ForegroundColor Green
Write-Host "- Frontend Web App: http://localhost:5173" -ForegroundColor White
Write-Host "- Backend Swagger:  http://127.0.0.1:8000/docs" -ForegroundColor White
Write-Host "- Demo Logins: citizen@demo.com, junior@demo.com, supervisor@demo.com, admin@demo.com" -ForegroundColor White
Write-Host "- Password:    Demo@123" -ForegroundColor Yellow
Write-Host "========================================================" -ForegroundColor Cyan
