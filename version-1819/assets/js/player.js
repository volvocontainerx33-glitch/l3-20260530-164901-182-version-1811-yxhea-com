import { H as Hls } from "./hls-dru42stk.js";

(function () {
    const shell = document.querySelector(".video-shell[data-stream]");
    if (!shell) {
        return;
    }

    const video = shell.querySelector("video");
    const overlay = shell.querySelector(".player-overlay");
    const stream = shell.getAttribute("data-stream");
    let prepared = false;
    let hls = null;

    function prepare() {
        if (!video || !stream || prepared) {
            return Promise.resolve();
        }
        prepared = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = stream;
            video.load();
            return Promise.resolve();
        }
        if (Hls && Hls.isSupported()) {
            return new Promise(function (resolve) {
                hls = new Hls({ enableWorker: true });
                hls.loadSource(stream);
                hls.attachMedia(video);
                hls.on(Hls.Events.MANIFEST_PARSED, function () {
                    resolve();
                });
                window.setTimeout(resolve, 900);
            });
        }
        video.src = stream;
        video.load();
        return Promise.resolve();
    }

    function startPlayback() {
        prepare().then(function () {
            shell.classList.add("is-playing");
            if (overlay) {
                overlay.hidden = true;
            }
            const attempt = video.play();
            if (attempt && typeof attempt.catch === "function") {
                attempt.catch(function () {
                    shell.classList.remove("is-playing");
                    if (overlay) {
                        overlay.hidden = false;
                    }
                });
            }
        });
    }

    if (overlay) {
        overlay.addEventListener("click", startPlayback);
    }

    if (video) {
        video.addEventListener("click", function () {
            if (video.paused) {
                startPlayback();
            }
        });
        video.addEventListener("play", function () {
            shell.classList.add("is-playing");
            if (overlay) {
                overlay.hidden = true;
            }
        });
        video.addEventListener("pause", function () {
            if (video.currentTime === 0) {
                shell.classList.remove("is-playing");
                if (overlay) {
                    overlay.hidden = false;
                }
            }
        });
    }

    window.addEventListener("pagehide", function () {
        if (hls) {
            hls.destroy();
        }
    });
})();
