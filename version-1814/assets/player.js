
(function () {
    var players = document.querySelectorAll('[data-player]');

    players.forEach(function (box) {
        var video = box.querySelector('video');
        var overlay = box.querySelector('.player-overlay');
        var stream = video ? video.getAttribute('data-stream') : '';
        var attached = false;
        var hls = null;

        if (!video || !stream) {
            return;
        }

        var attach = function () {
            if (attached) {
                return;
            }

            attached = true;

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = stream;
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
                hls.loadSource(stream);
                hls.attachMedia(video);
                return;
            }

            video.src = stream;
        };

        var start = function () {
            attach();

            if (overlay) {
                overlay.classList.add('is-hidden');
            }

            var playPromise = video.play();

            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () {
                    if (overlay) {
                        overlay.classList.remove('is-hidden');
                    }
                });
            }
        };

        if (overlay) {
            overlay.addEventListener('click', start);
        }

        video.addEventListener('click', function () {
            if (video.paused) {
                start();
            }
        });

        video.addEventListener('play', function () {
            if (overlay) {
                overlay.classList.add('is-hidden');
            }
        });

        window.addEventListener('beforeunload', function () {
            if (hls && typeof hls.destroy === 'function') {
                hls.destroy();
            }
        });
    });
})();
