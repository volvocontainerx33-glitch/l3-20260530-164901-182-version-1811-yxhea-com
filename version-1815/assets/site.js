(function () {
    function ready(callback) {
        if (document.readyState !== "loading") {
            callback();
            return;
        }
        document.addEventListener("DOMContentLoaded", callback);
    }

    function initMenu() {
        var toggle = document.querySelector(".mobile-toggle");
        var topbar = document.querySelector(".topbar");
        if (!toggle || !topbar) {
            return;
        }
        toggle.addEventListener("click", function () {
            topbar.classList.toggle("menu-open");
        });
    }

    function initHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        if (slides.length < 2) {
            return;
        }
        var index = 0;
        var timer = null;
        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === index);
            });
        }
        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5000);
        }
        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }
        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                show(i);
                start();
            });
        });
        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        start();
    }

    function initFilters() {
        var inputs = Array.prototype.slice.call(document.querySelectorAll("[data-filter-input]"));
        inputs.forEach(function (input) {
            var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
            function apply(value) {
                var keyword = String(value || "").trim().toLowerCase();
                cards.forEach(function (card) {
                    var haystack = String(card.getAttribute("data-keywords") || "").toLowerCase();
                    card.classList.toggle("hidden", keyword && haystack.indexOf(keyword) === -1);
                });
            }
            var params = new URLSearchParams(window.location.search);
            var q = params.get("q") || "";
            if (q && !input.value) {
                input.value = q;
            }
            apply(input.value);
            input.addEventListener("input", function () {
                apply(input.value);
            });
        });
    }

    function initPlayers() {
        var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
        players.forEach(function (box) {
            var video = box.querySelector("video");
            var cover = box.querySelector(".player-cover");
            var button = box.querySelector(".play-action");
            if (!video || !cover) {
                return;
            }
            var source = video.getAttribute("data-stream") || "";
            var started = false;
            function attach() {
                if (started) {
                    return;
                }
                started = true;
                video.controls = true;
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = source;
                } else if (window.Hls && window.Hls.isSupported()) {
                    var hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(source);
                    hls.attachMedia(video);
                    video.hlsInstance = hls;
                } else {
                    video.src = source;
                }
            }
            function play() {
                attach();
                box.classList.add("is-playing");
                var request = video.play();
                if (request && typeof request.catch === "function") {
                    request.catch(function () {
                        box.classList.remove("is-playing");
                    });
                }
            }
            cover.addEventListener("click", play);
            if (button) {
                button.addEventListener("click", function (event) {
                    event.preventDefault();
                    event.stopPropagation();
                    play();
                });
            }
            video.addEventListener("click", function () {
                if (video.paused) {
                    play();
                }
            });
            video.addEventListener("play", function () {
                box.classList.add("is-playing");
            });
        });
    }

    ready(function () {
        initMenu();
        initHero();
        initFilters();
        initPlayers();
    });
})();
