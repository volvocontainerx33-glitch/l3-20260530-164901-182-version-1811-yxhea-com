(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var toggle = document.querySelector("[data-nav-toggle]");
    var mobileNav = document.querySelector("[data-mobile-nav]");

    if (toggle && mobileNav) {
      toggle.addEventListener("click", function () {
        mobileNav.classList.toggle("is-open");
      });
    }

    var slider = document.querySelector("[data-hero-slider]");

    if (slider) {
      var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
      var previous = slider.querySelector("[data-hero-prev]");
      var next = slider.querySelector("[data-hero-next]");
      var activeIndex = 0;
      var timer = null;

      function showSlide(index) {
        if (!slides.length) {
          return;
        }

        activeIndex = (index + slides.length) % slides.length;

        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("is-active", slideIndex === activeIndex);
        });

        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("is-active", dotIndex === activeIndex);
        });
      }

      function start() {
        stop();
        timer = setInterval(function () {
          showSlide(activeIndex + 1);
        }, 5800);
      }

      function stop() {
        if (timer) {
          clearInterval(timer);
        }
      }

      dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
          showSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
          start();
        });
      });

      if (previous) {
        previous.addEventListener("click", function () {
          showSlide(activeIndex - 1);
          start();
        });
      }

      if (next) {
        next.addEventListener("click", function () {
          showSlide(activeIndex + 1);
          start();
        });
      }

      slider.addEventListener("mouseenter", stop);
      slider.addEventListener("mouseleave", start);
      showSlide(0);
      start();
    }

    Array.prototype.slice.call(document.querySelectorAll("[data-filter-scope]")).forEach(function (scope) {
      var searchInput = scope.querySelector("[data-search-input]");
      var yearFilter = scope.querySelector('[data-filter="year"]');
      var typeFilter = scope.querySelector('[data-filter="type"]');
      var items = Array.prototype.slice.call(scope.querySelectorAll(".movie-card, .rank-row"));

      function applyFilters() {
        var query = searchInput ? searchInput.value.trim().toLowerCase() : "";
        var year = yearFilter ? yearFilter.value : "";
        var type = typeFilter ? typeFilter.value : "";

        items.forEach(function (item) {
          var text = item.getAttribute("data-search") || "";
          var itemYear = item.getAttribute("data-year") || "";
          var itemType = item.getAttribute("data-type") || "";
          var matched = true;

          if (query && text.indexOf(query) === -1) {
            matched = false;
          }

          if (year && itemYear !== year) {
            matched = false;
          }

          if (type && itemType.indexOf(type) === -1) {
            matched = false;
          }

          item.classList.toggle("is-hidden", !matched);
        });
      }

      [searchInput, yearFilter, typeFilter].forEach(function (control) {
        if (control) {
          control.addEventListener("input", applyFilters);
          control.addEventListener("change", applyFilters);
        }
      });
    });

    var shell = document.querySelector(".player-shell");

    if (shell) {
      var video = shell.querySelector("video");
      var button = shell.querySelector(".play-overlay");
      var hlsInstance = null;
      var attached = false;

      function attachStream() {
        if (!video || attached) {
          return;
        }

        var streamUrl = video.getAttribute("data-stream");

        if (!streamUrl) {
          return;
        }

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = streamUrl;
          attached = true;
          return;
        }

        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(streamUrl);
          hlsInstance.attachMedia(video);
          attached = true;
          return;
        }

        video.src = streamUrl;
        attached = true;
      }

      function playVideo() {
        attachStream();

        if (button) {
          button.classList.add("is-hidden");
        }

        var promise = video.play();

        if (promise && typeof promise.catch === "function") {
          promise.catch(function () {
            if (button) {
              button.classList.remove("is-hidden");
            }
          });
        }
      }

      if (button) {
        button.addEventListener("click", playVideo);
      }

      if (video) {
        video.addEventListener("play", function () {
          if (button) {
            button.classList.add("is-hidden");
          }
        });

        video.addEventListener("click", function () {
          if (!attached) {
            playVideo();
          }
        });
      }

      window.addEventListener("beforeunload", function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    }
  });
})();
