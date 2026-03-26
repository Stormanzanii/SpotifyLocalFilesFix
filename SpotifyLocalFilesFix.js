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

    function isLocal(item) {
        const uri = item?.uri ?? item?.metadata?.uri ?? "";
        return uri.startsWith("spotify:local:");
    }

    function getState() {
        return Spicetify.Player.data ?? {};
    }

    function isStuck(state) {
        const pos = state?.positionAsOfTimestamp ?? 0;
        return !state?.isPaused && !!state?.isBuffering && pos === 0;
    }

    function scheduleCheck(delayMs) {
        clearTimeout(fixTimer);
        fixTimer = setTimeout(() => {
            const state = getState();
            const isSameTrack = state?.item?.uri === currentTrackUri;

            if (!isSameTrack) return;

            if (isStuck(state)) {
                log("Track still stuck at 0:00");
                applyFix();
            } else {
                log("Track is fine");
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

    log("Loaded v7 - buffering-based detection");
})();
