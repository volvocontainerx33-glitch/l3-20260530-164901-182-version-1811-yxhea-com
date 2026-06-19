(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var players = Array.prototype.slice.call(document.querySelectorAll('.watch-player'));

    players.forEach(function (box) {
      var video = box.querySelector('video');
      var overlay = box.querySelector('.play-overlay');
      var button = box.querySelector('.play-button');
      var streamUrl = video ? video.getAttribute('data-stream') : '';
      var hlsInstance = null;

      function connect() {
        if (!video || !streamUrl) {
          return;
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          if (video.getAttribute('src') !== streamUrl) {
            video.setAttribute('src', streamUrl);
          }
          return;
        }

        if (window.Hls && window.Hls.isSupported() && !hlsInstance) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(streamUrl);
          hlsInstance.attachMedia(video);
        }
      }

      function begin(event) {
        if (event) {
          event.stopPropagation();
        }

        connect();

        if (overlay) {
          overlay.hidden = true;
        }

        if (video) {
          video.controls = true;
          var attempt = video.play();
          if (attempt && typeof attempt.catch === 'function') {
            attempt.catch(function () {
              if (overlay) {
                overlay.hidden = false;
              }
            });
          }
        }
      }

      connect();

      if (button) {
        button.addEventListener('click', begin);
      }

      box.addEventListener('click', function (event) {
        if (event.target === video && !video.paused) {
          return;
        }
        begin(event);
      });

      if (video) {
        video.addEventListener('play', function () {
          if (overlay) {
            overlay.hidden = true;
          }
        });
      }
    });
  });
})();
