param(
  [string]$Root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
)

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

Push-Location $Root
try {
  $json = node -e "const fs=require('fs');const vm=require('vm');const code=fs.readFileSync('data.js','utf8');const sandbox={window:{}};vm.createContext(sandbox);vm.runInContext(code,sandbox);console.log(JSON.stringify({gyms:sandbox.window.GYMS,categories:sandbox.window.CATEGORIES}));"
  $data = $json | ConvertFrom-Json
  $categoryLabels = @{}
  foreach ($cat in $data.categories) {
    $categoryLabels[$cat.key] = $cat.label
  }

  $ogDir = Join-Path $Root 'og'
  if (-not (Test-Path $ogDir)) {
    New-Item -ItemType Directory -Path $ogDir | Out-Null
  }

  function New-Brush($hex) {
    return [System.Drawing.SolidBrush]::new([System.Drawing.ColorTranslator]::FromHtml($hex))
  }

  function Draw-WrappedText($graphics, $text, $font, $brush, $x, $y, $maxWidth, $lineHeight, $maxLines) {
    $words = ([string]$text -split '\s+') | Where-Object { $_ }
    $lines = New-Object System.Collections.Generic.List[string]
    $current = ''
    foreach ($word in $words) {
      $candidate = if ($current) { "$current $word" } else { $word }
      if ($graphics.MeasureString($candidate, $font).Width -le $maxWidth) {
        $current = $candidate
      } else {
        if ($current) { $lines.Add($current) }
        $current = $word
      }
      if ($lines.Count -ge $maxLines) { break }
    }
    if ($current -and $lines.Count -lt $maxLines) { $lines.Add($current) }
    for ($i = 0; $i -lt $lines.Count; $i++) {
      $line = $lines[$i]
      if ($i -eq ($maxLines - 1) -and $words.Count -gt (($lines -join ' ') -split '\s+').Count) {
        $line = $line.TrimEnd('.') + '...'
      }
      $graphics.DrawString($line, $font, $brush, [single]$x, [single]($y + ($i * $lineHeight)))
    }
    return $y + ($lines.Count * $lineHeight)
  }

  function Save-OgImage($title, $subtitle, $pill, $outputPath) {
    $width = 1200
    $height = 630
    $bitmap = [System.Drawing.Bitmap]::new($width, $height)
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $graphics.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit

    $bg = New-Brush '#0b0b0d'
    $card = New-Brush '#151515'
    $accent = New-Brush '#ffb800'
    $text = New-Brush '#f7f2e8'
    $muted = New-Brush '#b9b0a1'
    $borderPen = [System.Drawing.Pen]::new([System.Drawing.ColorTranslator]::FromHtml('#2d2a23'), 2)
    $accentPen = [System.Drawing.Pen]::new([System.Drawing.ColorTranslator]::FromHtml('#ffb800'), 8)

    $graphics.FillRectangle($bg, 0, 0, $width, $height)
    $graphics.DrawLine($accentPen, 0, 0, $width, 0)
    $graphics.DrawLine($accentPen, 0, $height - 4, $width, $height - 4)

    $graphics.FillRectangle($card, 70, 70, 1060, 490)
    $graphics.DrawRectangle($borderPen, 70, 70, 1060, 490)

    $fontBrand = [System.Drawing.Font]::new('Segoe UI', 24, [System.Drawing.FontStyle]::Bold)
    $fontMark = [System.Drawing.Font]::new('Segoe UI', 42, [System.Drawing.FontStyle]::Bold)
    $fontPill = [System.Drawing.Font]::new('Segoe UI', 22, [System.Drawing.FontStyle]::Bold)
    $fontTitle = [System.Drawing.Font]::new('Segoe UI', 54, [System.Drawing.FontStyle]::Bold)
    $fontSubtitle = [System.Drawing.Font]::new('Segoe UI', 25, [System.Drawing.FontStyle]::Regular)
    $fontFoot = [System.Drawing.Font]::new('Segoe UI', 20, [System.Drawing.FontStyle]::Regular)

    $graphics.FillRectangle($accent, 105, 102, 76, 76)
    $graphics.DrawString('P', $fontMark, $bg, 129, 104)
    $graphics.DrawString('PATTAYA GYM', $fontBrand, $text, 202, 113)
    $graphics.DrawString('Every gym and sport in Pattaya', $fontFoot, $muted, 204, 146)

    $pillText = ([string]$pill).ToUpperInvariant()
    $pillWidth = [Math]::Min(760, [Math]::Max(220, [int]$graphics.MeasureString($pillText, $fontPill).Width + 44))
    $graphics.FillRectangle($accent, 104, 218, $pillWidth, 48)
    $graphics.DrawString($pillText, $fontPill, $bg, 126, 224)

    $afterTitle = Draw-WrappedText $graphics $title $fontTitle $text 104 292 980 62 3
    Draw-WrappedText $graphics $subtitle $fontSubtitle $muted 108 ($afterTitle + 16) 950 34 2 | Out-Null

    $graphics.DrawString('pattaya-gym.com', $fontFoot, $accent, 104, 522)

    $bitmap.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $graphics.Dispose()
    $bitmap.Dispose()
  }

  Save-OgImage 'Every Gym & Sport in Pattaya' "$($data.gyms.Count) verified gyms, Muay Thai camps, dive operators, golf courses and sport venues." 'Pattaya Gym Directory' (Join-Path $Root 'og-image.png')

  foreach ($gym in $data.gyms) {
    $label = if ($categoryLabels.ContainsKey($gym.category)) { $categoryLabels[$gym.category] } else { $gym.category }
    $subtitle = if ($gym.area) { "$($gym.area) - Pattaya, Thailand" } else { 'Pattaya, Thailand' }
    Save-OgImage $gym.name $subtitle $label (Join-Path $ogDir "$($gym.id).png")
  }

  Write-Output "Generated $($data.gyms.Count + 1) OG images."
}
finally {
  Pop-Location
}
