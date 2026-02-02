Add-Type -AssemblyName System.Drawing

function Resize-Screenshot {
    param (
        [string]$sourcePath,
        [string]$destPath,
        [int]$width,
        [int]$height
    )
    $src = [System.Drawing.Image]::FromFile($sourcePath)
    $dest = New-Object System.Drawing.Bitmap($width, $height)
    $g = [System.Drawing.Graphics]::FromImage($dest)
    
    # Fill with a nice background color in case of aspect ratio mismatch
    $brush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(31, 31, 31))
    $g.FillRectangle($brush, 0, 0, $width, $height)
    
    # Calculate best fit (center crop/fit)
    $ratio = [Math]::Min($width / $src.Width, $height / $src.Height)
    $newWidth = [int]($src.Width * $ratio)
    $newHeight = [int]($src.Height * $ratio)
    $posX = [int](($width - $newWidth) / 2)
    $posY = [int](($height - $newHeight) / 2)

    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.DrawImage($src, $posX, $posY, $newWidth, $newHeight)
    
    $dest.Save($destPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $src.Dispose()
    $dest.Dispose()
    $g.Dispose()
}

$source = "C:\Users\anves\.gemini\antigravity\brain\29a9dc14-89b1-477b-a485-de26c8b6fcc7\bridge_context_screenshot_mockup_1770061466407.png"
$destination = "C:\Users\anves\Downloads\Develop\ContextAI\store_screenshot.png"

Resize-Screenshot -sourcePath $source -destPath $destination -width 1280 -height 800

Write-Host "Screenshot formatted and saved successfully."
