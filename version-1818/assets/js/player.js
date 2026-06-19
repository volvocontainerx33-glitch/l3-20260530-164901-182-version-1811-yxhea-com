(function () {
    var players = Array.prototype.slice.call(document.querySelectorAll("[data-video-player]"));

    players.forEach(function (player) {
        var video = player.querySelector("video");
        var button = player.querySelector("[data-play-button]");
        var overlay = player.querySelector(".player-overlay");
        var source = video ? video.getAttribute("data-src") : "";
        var prepared = false;
        var hlsInstance = null;

        function preparePlayer() {
            if (!video || !source || prepared) {
                return;
            }

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
                prepared = true;
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
                prepared = true;
                return;
            }

            video.src = source;
            prepared = true;
        }

        function startPlayback() {
            if (!video) {
                return;
            }

            preparePlayer();
            player.classList.add("is-playing");
            video.setAttribute("controls", "controls");

            var playPromise = video.play();

            if (playPromise && typeof playPromise.catch === "function") {
                playPromise.catch(function () {
                    player.classList.remove("is-playing");
                    video.setAttribute("controls", "controls");
                });
            }
        }

        if (button) {
            button.addEventListener("click", function (event) {
                event.preventDefault();
                event.stopPropagation();
                startPlayback();
            });
        }

        if (overlay) {
            overlay.addEventListener("click", function (event) {
                event.preventDefault();
                startPlayback();
            });
        }

        if (video) {
            video.addEventListener("play", function () {
                player.classList.add("is-playing");
            });

            video.addEventListener("pause", function () {
                if (video.currentTime === 0) {
                    player.classList.remove("is-playing");
                }
            });
        }

        window.addEventListener("beforeunload", function () {
            if (hlsInstance && typeof hlsInstance.destroy === "function") {
                hlsInstance.destroy();
            }
        });
    });
})();
