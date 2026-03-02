$ErrorActionPreference = "Stop"

Add-Type -AssemblyName System.Drawing

$iconsDir = Join-Path $PSScriptRoot "..\public\icons"
$sizes = @(72, 96, 128, 144, 152, 192, 384, 512)

function New-MaskableIcon {
  param(
    [Parameter(Mandatory = $true)][string]$InputPath,
    [Parameter(Mandatory = $true)][string]$OutputPath,
    [Parameter(Mandatory = $true)][int]$Size,
    [Parameter(Mandatory = $true)][System.Drawing.Color]$BackgroundColor
  )

  if (!(Test-Path -LiteralPath $InputPath)) {
    throw "Icona sorgente non trovata: $InputPath"
  }

  $src = [System.Drawing.Bitmap]::FromFile($InputPath)
  try {
    $dst = New-Object System.Drawing.Bitmap($Size, $Size, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    try {
      $g = [System.Drawing.Graphics]::FromImage($dst)
      try {
        $g.Clear($BackgroundColor)
        $g.CompositingMode = [System.Drawing.Drawing2D.CompositingMode]::SourceOver
        $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
        $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
        $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
        $g.DrawImage($src, 0, 0, $Size, $Size)
      } finally {
        $g.Dispose()
      }

      $dst.Save($OutputPath, [System.Drawing.Imaging.ImageFormat]::Png)
    } finally {
      $dst.Dispose()
    }
  } finally {
    $src.Dispose()
  }
}

$bg = [System.Drawing.ColorTranslator]::FromHtml("#ffffff")

foreach ($size in $sizes) {
  $inFile = Join-Path $iconsDir ("icon-{0}x{0}.png" -f $size)
  $outFile = Join-Path $iconsDir ("icon-{0}x{0}-maskable.png" -f $size)
  New-MaskableIcon -InputPath $inFile -OutputPath $outFile -Size $size -BackgroundColor $bg
  Write-Host ("Creato: {0}" -f $outFile)
}

