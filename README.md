# SpotifyLocalFilesFix

A Spicetify extension that fixes Spotify local files getting stuck at `0:00`.

## What It Does

When Spotify switches to a local file and playback gets stuck at the start, this extension detects the broken player state and sends a `seekTo(0)` plus `resume()` to recover playback.

## Installation

Place `SpotifyLocalFilesFix.js` in your Spicetify extensions folder:

- Windows: `%APPDATA%\spicetify\Extensions`

Then enable it:

```powershell
spicetify config extensions SpotifyLocalFilesFix.js
spicetify apply
```

## Notes

- The fix runs silently with no popup notification.
- The detection is targeted at local tracks only.
- The extension retries once if the first recovery attempt does not clear the stuck state.
