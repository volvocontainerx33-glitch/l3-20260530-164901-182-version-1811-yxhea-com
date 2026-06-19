(function () {
    function selectAll(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function setupMenu() {
        var toggle = document.querySelector('[data-menu-toggle]');
        var panel = document.querySelector('[data-mobile-panel]');
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener('click', function () {
            panel.classList.toggle('is-open');
        });
    }

    function setupHero() {
        var carousel = document.querySelector('[data-hero-carousel]');
        if (!carousel) {
            return;
        }
        var slides = selectAll('[data-hero-slide]', carousel);
        var dots = selectAll('[data-hero-dot]', carousel);
        var prev = carousel.querySelector('[data-hero-prev]');
        var next = carousel.querySelector('[data-hero-next]');
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === current);
            });
        }

        function restart() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5600);
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
                restart();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                show(current - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(current + 1);
                restart();
            });
        }

        show(0);
        restart();
    }

    function setupLocalFilter() {
        selectAll('[data-local-filter]').forEach(function (form) {
            var input = form.querySelector('input');
            var list = document.querySelector('[data-filter-list]');
            if (!input || !list) {
                return;
            }
            input.addEventListener('input', function () {
                var value = input.value.trim().toLowerCase();
                selectAll('.movie-card', list).forEach(function (card) {
                    var haystack = (card.getAttribute('data-keywords') || '').toLowerCase();
                    card.style.display = haystack.indexOf(value) >= 0 ? '' : 'none';
                });
            });
            form.addEventListener('submit', function (event) {
                event.preventDefault();
            });
        });
    }

    function movieCardTemplate(item) {
        return [
            '<article class="movie-card">',
            '<a class="poster-link" href="./' + item.url + '" aria-label="观看 ' + item.title + '">',
            '<img src="' + item.cover + '" alt="' + item.title + '" loading="lazy">',
            '<span class="card-badge">' + item.year + '</span>',
            '</a>',
            '<div class="movie-card-body">',
            '<div class="movie-meta-line"><span>' + item.region + '</span><span>' + item.type + '</span></div>',
            '<h3><a href="./' + item.url + '">' + item.title + '</a></h3>',
            '<p>' + item.oneLine + '</p>',
            '<div class="tag-row"><span>' + item.genre + '</span><span>' + item.category + '</span></div>',
            '</div>',
            '</article>'
        ].join('');
    }

    function setupSearch() {
        var form = document.querySelector('[data-search-form]');
        var results = document.querySelector('[data-search-results]');
        var note = document.querySelector('[data-search-note]');
        if (!form || !results || !window.SEARCH_INDEX) {
            return;
        }
        var input = form.querySelector('input');
        var params = new URLSearchParams(window.location.search);
        var initial = params.get('q') || '';
        input.value = initial;

        function render() {
            var value = input.value.trim().toLowerCase();
            if (!value) {
                results.innerHTML = window.SEARCH_INDEX.slice(0, 36).map(movieCardTemplate).join('');
                if (note) {
                    note.textContent = '推荐浏览';
                }
                return;
            }
            var words = value.split(/\s+/).filter(Boolean);
            var matched = window.SEARCH_INDEX.filter(function (item) {
                var haystack = item.search.toLowerCase();
                return words.every(function (word) {
                    return haystack.indexOf(word) >= 0;
                });
            }).slice(0, 120);
            results.innerHTML = matched.map(movieCardTemplate).join('');
            if (note) {
                note.textContent = matched.length ? '已匹配相关影片' : '未找到匹配影片';
            }
        }

        form.addEventListener('submit', function (event) {
            event.preventDefault();
            render();
        });
        input.addEventListener('input', render);
        render();
    }

    window.initPlayer = function (playerId, source) {
        var player = document.getElementById(playerId);
        if (!player) {
            return;
        }
        var video = player.querySelector('video');
        var cover = player.querySelector('.player-cover');
        var started = false;
        var hls = null;

        function bindSource() {
            if (started) {
                return;
            }
            started = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({ enableWorker: true });
                hls.loadSource(source);
                hls.attachMedia(video);
            } else {
                video.src = source;
            }
        }

        function play() {
            bindSource();
            if (cover) {
                cover.classList.add('is-hidden');
            }
            var promise = video.play();
            if (promise && typeof promise.catch === 'function') {
                promise.catch(function () {
                    video.setAttribute('controls', 'controls');
                });
            }
        }

        if (cover) {
            cover.addEventListener('click', play);
        }
        video.addEventListener('click', function () {
            if (!started) {
                play();
            }
        });
        video.addEventListener('play', function () {
            if (cover) {
                cover.classList.add('is-hidden');
            }
        });
        window.addEventListener('pagehide', function () {
            if (hls) {
                hls.destroy();
            }
        });
    };

    document.addEventListener('DOMContentLoaded', function () {
        setupMenu();
        setupHero();
        setupLocalFilter();
        setupSearch();
    });
}());
