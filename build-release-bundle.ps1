# BridgeContext Production Release Bundle Builder

# 1. Define Paths
$version = "1.4.2"
$releaseDir = "release_bundle"
$zipName = "BridgeContext_Suite_v$version.zip"

if (Test-Path $releaseDir) { Remove-Item $releaseDir -Recurse -Force }
New-Item -ItemType Directory -Path $releaseDir

Write-Host "📦 Creating BridgeContext Suite v$version..." -ForegroundColor Green

# 2. Copy Core Installer Files
Copy-Item "one-click-setup.ps1" "$releaseDir\"
Copy-Item "master-install.js" "$releaseDir\"
Copy-Item "mcp-server.js" "$releaseDir\"
Copy-Item "package.json" "$releaseDir\" # Required for master-install script

# 3. Copy Native Host
Copy-Item "native-host" "$releaseDir\" -Recurse
# Cleanup local exchange files from bundle
if (Test-Path "$releaseDir\native-host\exchange.json") { Remove-Item "$releaseDir\native-host\exchange.json" }

# 4. Copy IDE Extensions
# VS Code
New-Item -ItemType Directory -Path "$releaseDir\vscode-extension"
Copy-Item "bridgecontext-vscode-1.1.0-Latest.vsix" "$releaseDir\"

# Neovim
Copy-Item "neovim-extension" "$releaseDir\" -Recurse

# Sublime
Copy-Item "sublime-extension" "$releaseDir\" -Recurse

# JetBrains
New-Item -ItemType Directory -Path "$releaseDir\jetbrains-extension"
Copy-Item "jetbrains-extension\build\distributions\BridgeContext-1.0.0.zip" "$releaseDir\jetbrains-extension\"

# 5. Create Suite README
$readmeLines = @(
    '# BridgeContext Universal Suite v' + $version,
    '',
    'The Universal AI Memory Proxy. Bridge context between your browser and all your favorite IDEs.',
    '',
    '## 🚀 One-Click Installation (Windows)',
    '1. Right-click "one-click-setup.ps1".',
    '2. Select "Run with PowerShell".',
    '',
    'This will automatically:',
    '- Register the Native Host for Chrome/Edge.',
    '- Install the VS Code / Cursor extension.',
    '- Configure Neovim and Sublime Text plugins.',
    '- **Auto-register MCP Support** for Antigravity IDE, Cursor, and Claude Desktop.',
    '',
    '## 🛠️ Individual IDE Setup',
    '',
    '### Antigravity IDE / Cursor (MCP)',
    'The installer auto-registers this! Just ask your AI: "Sync context from BridgeContext."',
    '',
    '### Neovim',
    'The installer places the plugin in your config folder. Use ":BridgeContext" to view synced data.',
    '',
    '### Sublime Text',
    'Use the Command Palette: "BridgeContext: Inject Context".',
    '',
    '### JetBrains',
    'Manually install the ZIP found in "jetbrains-extension/".'
)

$readmeLines | Out-File -FilePath "$releaseDir\README_FIRST.md" -Encoding utf8

# 6. Zip the Bundle
if (Test-Path $zipName) { Remove-Item $zipName }
Compress-Archive -Path "$releaseDir\*" -DestinationPath $zipName

Write-Host "✅ Release Bundle Created: $zipName" -ForegroundColor Cyan
Write-Host "You can now distribute this single ZIP to your users." -ForegroundColor Yellow
