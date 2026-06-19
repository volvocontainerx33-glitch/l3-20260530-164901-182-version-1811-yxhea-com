(function () {
  const menuButton = document.querySelector('.menu-toggle');
  const mobileNav = document.querySelector('.mobile-nav');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      const isOpen = mobileNav.classList.toggle('is-open');
      menuButton.setAttribute('aria-expanded', String(isOpen));
    });
  }

  const slides = Array.from(document.querySelectorAll('.hero-slide'));
  const dots = Array.from(document.querySelectorAll('.hero-dot'));
  let currentSlide = 0;
  let slideTimer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    currentSlide = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === currentSlide);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === currentSlide);
    });
  }

  function startSlider() {
    if (slides.length <= 1) {
      return;
    }

    slideTimer = window.setInterval(function () {
      showSlide(currentSlide + 1);
    }, 5600);
  }

  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      const index = Number(dot.getAttribute('data-slide')) || 0;
      showSlide(index);

      if (slideTimer) {
        window.clearInterval(slideTimer);
        startSlider();
      }
    });
  });

  showSlide(0);
  startSlider();

  const searchInput = document.querySelector('#pageSearch');

  if (searchInput) {
    const items = Array.from(document.querySelectorAll('.movie-card, .rank-row'));

    searchInput.addEventListener('input', function () {
      const keyword = searchInput.value.trim().toLowerCase();

      items.forEach(function (item) {
        const text = [
          item.getAttribute('data-title'),
          item.getAttribute('data-tags'),
          item.getAttribute('data-genre'),
          item.getAttribute('data-year'),
          item.getAttribute('data-region')
        ].join(' ').toLowerCase();

        item.classList.toggle('is-hidden', keyword.length > 0 && !text.includes(keyword));
      });
    });
  }

  const player = document.querySelector('[data-player]');

  if (player) {
    const video = player.querySelector('video');
    const overlay = player.querySelector('.player-overlay');
    let loaded = false;
    let hlsInstance = null;

    function hideOverlay() {
      if (overlay) {
        overlay.hidden = true;
      }
    }

    function showOverlay() {
      if (overlay) {
        overlay.hidden = false;
      }
    }

    function playVideo() {
      if (!video) {
        return;
      }

      const source = video.getAttribute('data-stream');

      if (!source) {
        return;
      }

      if (!loaded) {
        loaded = true;

        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });

          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);

          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
            video.play().then(hideOverlay).catch(showOverlay);
          });

          hlsInstance.on(window.Hls.Events.ERROR, function (eventName, data) {
            if (!data || !data.fatal) {
              return;
            }

            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
              hlsInstance.startLoad();
              return;
            }

            if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
              hlsInstance.recoverMediaError();
              return;
            }

            showOverlay();
          });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
          video.addEventListener('loadedmetadata', function () {
            video.play().then(hideOverlay).catch(showOverlay);
          }, { once: true });
        } else {
          video.src = source;
          video.play().then(hideOverlay).catch(showOverlay);
        }
      } else {
        video.play().then(hideOverlay).catch(showOverlay);
      }
    }

    if (overlay) {
      overlay.addEventListener('click', playVideo);
    }

    video.addEventListener('play', hideOverlay);
    video.addEventListener('pause', function () {
      if (video.currentTime === 0 || video.ended) {
        showOverlay();
      }
    });

    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }
})();
