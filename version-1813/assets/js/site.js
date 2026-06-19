(function () {
  function toggleMobileMenu() {
    var button = document.querySelector('.menu-toggle');
    var panel = document.querySelector('.mobile-panel');
    if (!button || !panel) {
      return;
    }
    button.addEventListener('click', function () {
      var isOpen = !panel.hasAttribute('hidden');
      if (isOpen) {
        panel.setAttribute('hidden', '');
        button.setAttribute('aria-expanded', 'false');
      } else {
        panel.removeAttribute('hidden');
        button.setAttribute('aria-expanded', 'true');
      }
    });
  }

  function initCarousel() {
    var carousel = document.querySelector('[data-carousel]');
    if (!carousel) {
      return;
    }
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('.hero-dot'));
    var prev = carousel.querySelector('.hero-control.prev');
    var next = carousel.querySelector('.hero-control.next');
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

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-slide') || 0));
        start();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        start();
      });
    }

    carousel.addEventListener('mouseenter', stop);
    carousel.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function initPlayers() {
    var shells = Array.prototype.slice.call(document.querySelectorAll('.player-shell'));
    shells.forEach(function (shell) {
      var video = shell.querySelector('video');
      var overlay = shell.querySelector('.play-overlay');
      var message = shell.querySelector('.player-message');
      var stream = shell.getAttribute('data-stream');
      var loaded = false;
      var hls = null;

      if (!video || !stream) {
        return;
      }

      function setMessage(text) {
        if (message) {
          message.textContent = text || '';
        }
      }

      function playVideo() {
        var result = video.play();
        if (result && typeof result.catch === 'function') {
          result.catch(function () {
            setMessage('点击播放器继续播放');
          });
        }
      }

      function loadStream() {
        if (loaded) {
          playVideo();
          return;
        }
        loaded = true;
        setMessage('');

        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(stream);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            playVideo();
          });
          hls.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              setMessage('视频加载失败，请稍后再试');
            }
          });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = stream;
          video.addEventListener('loadedmetadata', playVideo, { once: true });
          video.load();
        } else {
          setMessage('此浏览器暂不支持该视频格式');
        }
      }

      function startPlayback() {
        if (overlay) {
          overlay.setAttribute('hidden', '');
        }
        loadStream();
      }

      if (overlay) {
        overlay.addEventListener('click', startPlayback);
      }

      video.addEventListener('click', function () {
        if (video.paused) {
          startPlayback();
        }
      });

      window.addEventListener('pagehide', function () {
        if (hls && typeof hls.destroy === 'function') {
          hls.destroy();
        }
      });
    });
  }

  function initSearchPage() {
    var results = document.getElementById('searchResults');
    var input = document.getElementById('searchInput');
    var title = document.getElementById('searchTitle');
    if (!results || !window.catalogData) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var keyword = (params.get('q') || '').trim();
    if (input) {
      input.value = keyword;
    }

    function contains(movie, words) {
      var haystack = [
        movie.title,
        movie.year,
        movie.region,
        movie.type,
        movie.genre,
        movie.oneLine,
        (movie.tags || []).join(' ')
      ].join(' ').toLowerCase();
      return words.every(function (word) {
        return haystack.indexOf(word) !== -1;
      });
    }

    function render(list) {
      results.innerHTML = list.slice(0, 120).map(function (movie) {
        return [
          '<article class="movie-card">',
          '  <a class="poster-link" href="' + movie.url + '">',
          '    <img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
          '    <span class="score">' + movie.score + '</span>',
          '  </a>',
          '  <div class="movie-card-body">',
          '    <h3><a href="' + movie.url + '">' + escapeHtml(movie.title) + '</a></h3>',
          '    <p class="meta-line">' + escapeHtml(movie.year + ' · ' + movie.region + ' · ' + movie.type) + '</p>',
          '    <p class="movie-desc">' + escapeHtml(movie.oneLine) + '</p>',
          '    <div class="tag-row">' + (movie.tags || []).slice(0, 3).map(function (tag) { return '<span>' + escapeHtml(tag) + '</span>'; }).join('') + '</div>',
          '  </div>',
          '</article>'
        ].join('');
      }).join('');
    }

    function escapeHtml(value) {
      return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    }

    var list = window.catalogData;
    if (keyword) {
      var words = keyword.toLowerCase().split(/\s+/).filter(Boolean);
      list = list.filter(function (movie) {
        return contains(movie, words);
      });
      if (title) {
        title.textContent = '“' + keyword + '”的搜索结果';
      }
    } else if (title) {
      title.textContent = '热门内容';
    }
    render(list);
  }

  toggleMobileMenu();
  initCarousel();
  initPlayers();
  initSearchPage();
})();
