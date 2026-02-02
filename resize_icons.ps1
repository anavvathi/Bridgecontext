Add-Type -AssemblyName System.Drawing

function Resize-Image {
    param (
        [string]$sourcePath,
        [string]$destPath,
        [int]$width,
        [int]$height
    )
    $src = [System.Drawing.Image]::FromFile($sourcePath)
    $dest = New-Object System.Drawing.Bitmap($width, $height)
    $g = [System.Drawing.Graphics]::FromImage($dest)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.DrawImage($src, 0, 0, $width, $height)
    $dest.Save($destPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $src.Dispose()
    $dest.Dispose()
    $g.Dispose()
}

$source = "C:\Users\anves\.gemini\antigravity\brain\29a9dc14-89b1-477b-a485-de26c8b6fcc7\bridge_context_icon_128_1770060461073.png"

Resize-Image -sourcePath $source -destPath "c:\Users\anves\Downloads\Develop\ContextAI\icons\icon128.png" -width 128 -height 128
Resize-Image -sourcePath $source -destPath "c:\Users\anves\Downloads\Develop\ContextAI\icons\icon48.png" -width 48 -height 48
Resize-Image -sourcePath $source -destPath "c:\Users\anves\Downloads\Develop\ContextAI\icons\icon16.png" -width 16 -height 16

Write-Host "Icons resized and saved successfully."
