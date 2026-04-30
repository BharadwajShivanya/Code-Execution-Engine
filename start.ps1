Write-Host "Starting Code Execution Engine..." -ForegroundColor Cyan

# 1. Start Redis
Write-Host "Starting Redis..." -ForegroundColor Yellow
docker run -d -p 6379:6379 redis

# 2. Build Docker Sandbox Images
Write-Host "Ensuring Docker Sandbox Images exist..." -ForegroundColor Yellow
docker build -t judge-python dockerfiles/python/ -q
docker build -t judge-cpp dockerfiles/cpp/ -q

# 3. Start API Server
Write-Host "Starting Go API Server (Port 8090)..." -ForegroundColor Yellow
Start-Process -NoNewWindow -FilePath "go" -ArgumentList "run ./cmd/api" -RedirectStandardOutput "api.log" -RedirectStandardError "api_error.log"

# 4. Start Worker
Write-Host "Starting Go Worker..." -ForegroundColor Yellow
Start-Process -NoNewWindow -FilePath "go" -ArgumentList "run ./cmd/worker/main.go" -RedirectStandardOutput "worker.log" -RedirectStandardError "worker_error.log"

# 5. Start Frontend
Write-Host "Starting Frontend (Judge Companion)..." -ForegroundColor Yellow
Set-Location -Path "judge-companion/judge-companion"
npm install
Start-Process -NoNewWindow -FilePath "npm.cmd" -ArgumentList "run dev" -RedirectStandardOutput "../../frontend.log" -RedirectStandardError "../../frontend_error.log"

Set-Location -Path "../../"

Write-Host "=========================================" -ForegroundColor Green
Write-Host "🚀 All services are up and running in the background!" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green
Write-Host "API Server: http://localhost:8090"
Write-Host "Frontend:   http://localhost:8081"
Write-Host "Logs are being written to your workspace directory."
