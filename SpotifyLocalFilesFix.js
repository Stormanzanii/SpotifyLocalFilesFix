// START METADATA
// NAME: Local Files Fixup
// AUTHOR: claude
// DESCRIPTION: Fixes Spotify's local file playback bug where tracks stop at 0:00.
//              Root cause: Spotify's internal positionAsOfTimestamp desyncs when a
//              local file auto-advances. A pause/play nudge doesn't fix this —
//              we must force an explicit seekTo(0) to re-anchor the timestamp, then play.
// VERSION: 2.1.0
// END METADATA

(function LocalFilesFixup() {
    if (
        !Spicetify?.Player?.addEventListener ||
        !Spicetify?.Player?.getProgress ||
        !Spicetify?.Platform?.PlayerAPI?.seekTo ||
        !Spicetify?.Platform?.PlayerAPI?.resume
    ) {
        setTimeout(LocalFilesFixup, 300);
        return;
    }

    const INITIAL_DELAY_MS = 2000; // wait longer before checking
    const MAX_ATTEMPTS = 2;

    let attempts = 0;
    let currentTrackUri = null;
    let fixTimer = null;

    function log(msg) {
        console.log(`[LocalFilesFixup] ${msg}`);
    }

    function sleep(ms) {
        return new Promise(r => setTimeout(r, ms));
    }

    function notify(msg) {
        Spicetify.showNotification?.(msg, false, 2500);
    }

    function isLocal(item) {
        const uri = item?.uri ?? item?.metadata?.uri ?? "";
        return uri.startsWith("spotify:local:");
    }

    function getState() {
        return Spicetify.Player.data ?? {};
    }

    function getProgressMs() {
        return Spicetify.Player.getProgress?.() ?? 0;
    }

    function scheduleCheck(delayMs) {
        clearTimeout(fixTimer);
        fixTimer = setTimeout(() => {
            const state = getState();
            const isSameTrack = state?.item?.uri === currentTrackUri;
            const progressMs = getProgressMs();

            if (!isSameTrack) return;

            if (!state?.isPaused && progressMs < 1000) {
                log(`Track still stuck at ${progressMs}ms`);
                applyFix();
            } else {
                log(`Track is fine at ${progressMs}ms`);
                attempts = 0;
            }
        }, delayMs);
    }

    async function applyFix() {
        const state = getState();
        const uri = state?.item?.uri ?? "";

        if (uri !== currentTrackUri) return;

        attempts++;
        log(`Fix attempt ${attempts}`);

        try {
            await Spicetify.Platform.PlayerAPI.seekTo(0);
            await sleep(200);

            if (getState()?.isPaused) {
                await Spicetify.Platform.PlayerAPI.resume();
            }

            notify("▶ Playback stabilized");
        } catch (e) {
            log("Fix error: " + e);
        }

        if (attempts >= MAX_ATTEMPTS) {
            log("Giving up on track");
            attempts = 0;
            return;
        }

        scheduleCheck(800);
    }

    Spicetify.Player.addEventListener("songchange", (event) => {
        clearTimeout(fixTimer);
        attempts = 0;

        const item = event?.data?.item ?? getState()?.item;

        if (!isLocal(item)) {
            currentTrackUri = null;
            return;
        }

        currentTrackUri = item?.uri ?? null;
        log(`Local file detected`);

        scheduleCheck(INITIAL_DELAY_MS);
    });

    log("Loaded v6 - progress-based detection");
})();
