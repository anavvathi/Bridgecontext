# BridgeContext Extension Packager
$version = (Get-Content manifest.json | ConvertFrom-Json).version
$zipName = "BridgeContext_v$($version)_Ready.zip"
$outputPath = Join-Path (Get-Location) $zipName

Write-Host "Packaging BridgeContext v$version..."

# Define files and folders to include
$includeList = @(
    "manifest.json",
    "background.js",
    "content.js",
    "content.css",
    "popup.js",
    "popup.html",
    "popup.css",
    "scraper.js",
    "sanitizer.js",
    "compressor.js",
    "storage.js",
    "icons",
    "native-host"
)

# Define exclusions for native-host
$excludeList = @(
    "native-host\exchange.json",
    "native-host\exchange.json.tmp",
    "native-host\stress-test.js",
    "native-host\test-browser-sim.js"
)

# Create a clean temporary directory
$tempDir = New-Item -Path "temp_package" -ItemType Directory -Force

foreach ($item in $includeList) {
    if (Test-Path $item) {
        Copy-Item -Path $item -Destination $tempDir -Recurse -Force
    }
}

# Remove excluded items
foreach ($exclude in $excludeList) {
    $target = Join-Path $tempDir $exclude
    if (Test-Path $target) {
        Remove-Item -Path $target -Force
    }
}

# Zip it up
if (Test-Path $outputPath) { Remove-Item $outputPath -Force }
Compress-Archive -Path "$tempDir\*" -DestinationPath $outputPath

# Cleanup
Remove-Item $tempDir -Recurse -Force

Write-Host "Production ZIP created: $zipName"
Write-Host "Next Step: Upload to Chrome Web Store Console."
