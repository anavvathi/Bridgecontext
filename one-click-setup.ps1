# BridgeContext One-Click Setup
# This script ensures the user has elevated privileges and then runs the master installer.

$WScript = New-Object -ComObject WScript.Shell

# 1. Check for Admin Privileges
$currentPrincipal = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
if (-not $currentPrincipal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    Write-Host "⚠️  Administrator privileges are required for Native Host registration." -ForegroundColor Yellow
    Write-Host "🔄 Restarting with Admin privileges..." -ForegroundColor Cyan
    Start-Process powershell.exe -ArgumentList "-NoProfile -ExecutionPolicy Bypass -File `"$PSCommandPath`"" -Verb RunAs
    exit
}

Write-Host "-------------------------------------------" -ForegroundColor Green
Write-Host "🌉 BridgeContext Universal Setup" -ForegroundColor Green
Write-Host "-------------------------------------------" -ForegroundColor Green

# 2. Run the Main Installer
if (Get-Command node -ErrorAction SilentlyContinue) {
    node master-install.js
} else {
    Write-Host "❌ Node.js not found. Please install Node.js from https://nodejs.org/" -ForegroundColor Red
    Pause
    exit
}

Write-Host "`n🚀 Setup Complete!" -ForegroundColor Green
Write-Host "-------------------------------------------" -ForegroundColor Green
Write-Host "💡 Pro-Tip: Your AI in Antigravity/Cursor now has a new tool: 'get_current_context'." -ForegroundColor Yellow
Write-Host "Just ask it: 'Synch context from BridgeContext' to start." -ForegroundColor Cyan

Pause
