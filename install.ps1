$ErrorActionPreference = "Stop"

$repoUrl = "https://raw.githubusercontent.com/Stormanzanii/SpotifyLocalFilesFix/main/SpotifyLocalFilesFix.js"
$extensionsDir = Join-Path $env:APPDATA "spicetify\Extensions"
$extensionFile = Join-Path $extensionsDir "SpotifyLocalFilesFix.js"

if (-not (Get-Command spicetify -ErrorAction SilentlyContinue)) {
    throw "spicetify is not installed or not available on PATH."
}

New-Item -ItemType Directory -Force -Path $extensionsDir | Out-Null
Invoke-RestMethod $repoUrl -OutFile $extensionFile

$configOutput = spicetify config extensions
$currentExtensions = @()

if ($configOutput) {
    $currentExtensions = $configOutput -split "\\|" | ForEach-Object { $_.Trim() } | Where-Object { $_ }
}

if ($currentExtensions -notcontains "SpotifyLocalFilesFix.js") {
    $newExtensions = @($currentExtensions + "SpotifyLocalFilesFix.js") -join "|"
    spicetify config extensions $newExtensions | Out-Null
}

spicetify apply

Write-Host "SpotifyLocalFilesFix installed and applied."
