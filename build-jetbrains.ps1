# BridgeContext JetBrains Build Script
Write-Host "Searching for Java and Gradle..."

$javaPath = where.exe java
$gradlePath = where.exe gradle

if (-not $javaPath) {
    Write-Host "Java (JDK) not found. Please install JDK 17+ and add it to your PATH."
    exit
}

if (-not $gradlePath) {
    Write-Host "Gradle not found in PATH. Attempting to use local gradlew..."
    if (Test-Path "gradlew.bat") {
        $gradlePath = ".\gradlew.bat"
    } else {
        Write-Host "Gradle not found. Please install Gradle."
        exit
    }
}

Write-Host "Starting Build..."
cd jetbrains-extension
& $gradlePath buildPlugin

if ($LASTEXITCODE -eq 0) {
    Write-Host "Success! Plugin created in: jetbrains-extension/build/distributions/"
} else {
    Write-Host "Build failed. Please check the errors above."
}
