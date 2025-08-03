# Development Startup Script for ri.gym.pro
# This script starts all necessary services for development

Write-Host "🏋️ ri.gym.pro Development Startup" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan

# Add Docker to PATH
$env:PATH += ";C:\Program Files\Docker\Docker\resources\bin"

# Check if Docker is running
try {
    docker --version | Out-Null
    Write-Host "✅ Docker is available" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker is not available. Please start Docker Desktop first." -ForegroundColor Red
    Write-Host "💡 You can run Docker Desktop manually or install it from: https://www.docker.com/products/docker-desktop" -ForegroundColor Yellow
    exit 1
}

# Start Redis if not running
$redisRunning = docker ps --filter "name=ri-gym-pro-redis" --format "{{.Names}}" 2>$null
if ($redisRunning -eq "ri-gym-pro-redis") {
    Write-Host "✅ Redis container is already running" -ForegroundColor Green
} else {
    Write-Host "🚀 Starting Redis container..." -ForegroundColor Yellow
    docker-compose up -d redis
    Start-Sleep 3
    
    # Verify Redis is working
    $redisTest = docker exec ri-gym-pro-redis redis-cli ping 2>$null
    if ($redisTest -eq "PONG") {
        Write-Host "✅ Redis started successfully" -ForegroundColor Green
    } else {
        Write-Host "❌ Redis failed to start" -ForegroundColor Red
        exit 1
    }
}

# Check if Node.js server is running
$nodeRunning = Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object { $_.ProcessName -eq "node" }
if ($nodeRunning) {
    Write-Host "⚠️  Node.js server appears to be running. Stopping existing processes..." -ForegroundColor Yellow
    taskkill /F /IM node.exe 2>$null
    Start-Sleep 2
}

# Start the development server
Write-Host "🚀 Starting ri.gym.pro API server..." -ForegroundColor Yellow
Write-Host "📍 Server will be available at: http://localhost:3001" -ForegroundColor Cyan
Write-Host "🏥 Health check: http://localhost:3001/health" -ForegroundColor Cyan
Write-Host "📚 API docs: http://localhost:3001/api" -ForegroundColor Cyan
Write-Host "" -ForegroundColor White
Write-Host "💡 To stop the server, press Ctrl+C" -ForegroundColor Yellow
Write-Host "💡 To restart automatically when files change, nodemon is watching for changes" -ForegroundColor Yellow
Write-Host "" -ForegroundColor White

# Start npm dev server
npm run dev
