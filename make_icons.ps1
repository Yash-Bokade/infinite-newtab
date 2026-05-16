Add-Type -AssemblyName System.Drawing

$src    = "C:\Users\ADMIN\.gemini\antigravity\brain\e8ce371c-3f33-4326-b715-9ae996124fb3\home_canvas_icon_1778923439022.png"
$outDir = "D:\Cursed\home-canvas\public\icons"

New-Item -ItemType Directory -Force -Path $outDir | Out-Null

$original = [System.Drawing.Image]::FromFile($src)

foreach ($size in @(16, 32, 48, 128)) {
    $bmp = New-Object System.Drawing.Bitmap($size, $size)
    $g   = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode     = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode   = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.DrawImage($original, 0, 0, $size, $size)
    $g.Dispose()

    $outPath = Join-Path $outDir "icon$size.png"
    $bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()

    Write-Host "Saved icon$size.png"
}

$original.Dispose()
Write-Host "All icons generated!"
