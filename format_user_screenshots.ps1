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

$img1 = "C:\Users\anves\.gemini\antigravity\brain\5df32427-6bc6-4d75-9777-b07874f1410b\uploaded_media_1_1770242256287.png"

Resize-Screenshot -sourcePath $img1 -destPath "c:\Users\anves\Downloads\Develop\ContextAI\store_screenshot_v1.4.1.png" -width 1280 -height 800

Write-Host "Additional screenshots formatted and saved successfully."
