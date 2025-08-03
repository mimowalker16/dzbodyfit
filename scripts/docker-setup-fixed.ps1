# Docker Setup Script for ri.gym.pro
# This script sets up Docker path and manages containers

param(
    [string]$Action = "status"
)

# Add Docker to PATH
$env:PATH += ";C:\Program Files\Docker\Docker\resources\bin"

Write-Host "🐳 ri.gym.pro Docker Management Script" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan

# Function to check Docker status
function Test-Docker {
    try {
        docker --version | Out-Null
        return $true
    } catch {
        return $false
    }
}

# Function to start Redis
function Start-Redis {
    Write-Host "🚀 Starting Redis container..." -ForegroundColor Yellow
    docker-compose up -d redis
    Start-Sleep 2
    
    # Test Redis connection
    $redisTest = docker exec ri-gym-pro-redis redis-cli ping 2>$null
    if ($redisTest -eq "PONG") {
        Write-Host "✅ Redis is running and responding" -ForegroundColor Green
    } else {
        Write-Host "❌ Redis failed to start properly" -ForegroundColor Red
    }
}

# Function to stop Redis
function Stop-Redis {
    Write-Host "🛑 Stopping Redis container..." -ForegroundColor Yellow
    docker-compose down
}

# Function to show container status
function Show-Status {
    Write-Host "📊 Container Status:" -ForegroundColor Cyan
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
}

# Main script
if (-not (Test-Docker)) {
    Write-Host "❌ Docker is not available. Please start Docker Desktop." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Docker is available" -ForegroundColor Green

switch ($Action.ToLower()) {
    "start" { Start-Redis }
    "stop" { Stop-Redis }
    "restart" { 
        Stop-Redis
        Start-Sleep 2
        Start-Redis
    }
    "status" { Show-Status }
    default {
        Write-Host "Usage: .\docker-setup.ps1 [start|stop|restart|status]" -ForegroundColor Yellow
        Write-Host "  start   - Start Redis container"
        Write-Host "  stop    - Stop all containers"
        Write-Host "  restart - Restart Redis container"
        Write-Host "  status  - Show container status (default)"
    }
}
