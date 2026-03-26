$ErrorActionPreference = "Stop"

$extensionsDir = Join-Path $env:APPDATA "spicetify\Extensions"
$extensionFile = Join-Path $extensionsDir "SpotifyLocalFilesFix.js"

if (-not (Get-Command spicetify -ErrorAction SilentlyContinue)) {
    throw "spicetify is not installed or not available on PATH."
}

if (Test-Path $extensionFile) {
    Remove-Item $extensionFile -Force
}

$configOutput = spicetify config extensions
$currentExtensions = @()

if ($configOutput) {
    $currentExtensions = $configOutput -split "\\|" | ForEach-Object { $_.Trim() } | Where-Object { $_ }
}

$remainingExtensions = @($currentExtensions | Where-Object { $_ -ne "SpotifyLocalFilesFix.js" })
$newExtensions = $remainingExtensions -join "|"

spicetify config extensions $newExtensions | Out-Null
spicetify apply

Write-Host "SpotifyLocalFilesFix removed and Spicetify reapplied."
