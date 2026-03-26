# SpotifyLocalFilesFix

A Spicetify extension that fixes Spotify local files getting stuck at `0:00`.

## What It Does

When Spotify switches to a local file and playback gets stuck at the start, this extension detects the broken player state and sends a `seekTo(0)` plus `resume()` to recover playback.

## Installation

### One-Line Automatic PowerShell Install

```powershell
irm https://raw.githubusercontent.com/Stormanzanii/SpotifyLocalFilesFix/main/install.ps1 | iex
```

### Uninstall

```powershell
irm https://raw.githubusercontent.com/Stormanzanii/SpotifyLocalFilesFix/main/uninstall.ps1 | iex
```

### Manual

Place `SpotifyLocalFilesFix.js` in your Spicetify extensions folder:

- Windows: `%APPDATA%\spicetify\Extensions`

Then enable it:

```powershell
spicetify config extensions SpotifyLocalFilesFix.js
spicetify apply
```
