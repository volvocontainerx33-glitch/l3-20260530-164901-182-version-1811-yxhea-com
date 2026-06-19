(function () {
  var heroTimer = null;

  function initMenu() {
    var button = document.querySelector('.mobile-toggle');
    var panel = document.querySelector('.mobile-panel');
    if (!button || !panel) {
      return;
    }
    button.addEventListener('click', function () {
      var open = panel.hasAttribute('hidden');
      if (open) {
        panel.removeAttribute('hidden');
        document.body.classList.add('menu-open');
      } else {
        panel.setAttribute('hidden', '');
        document.body.classList.remove('menu-open');
      }
      button.setAttribute('aria-expanded', String(open));
    });
  }

  function initHero() {
    var root = document.querySelector('[data-hero]');
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(root.querySelectorAll('[data-hero-dot]'));
    if (slides.length < 2) {
      return;
    }
    var index = 0;
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        restart();
      });
    });
    function restart() {
      window.clearInterval(heroTimer);
      heroTimer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }
    restart();
  }

  function fillFilterSelect(select, values) {
    values.sort(function (a, b) {
      return String(b).localeCompare(String(a), 'zh-CN');
    });
    values.forEach(function (value) {
      var option = document.createElement('option');
      option.value = value;
      option.textContent = value;
      select.appendChild(option);
    });
  }

  function initFilters() {
    var panel = document.querySelector('[data-filter-panel]');
    var list = document.querySelector('[data-card-list]');
    if (!panel || !list) {
      return;
    }
    var cards = Array.prototype.slice.call(list.querySelectorAll('[data-card]'));
    var textInput = panel.querySelector('[data-filter-text]');
    var yearSelect = panel.querySelector('[data-filter-year]');
    var typeSelect = panel.querySelector('[data-filter-type]');
    var regionSelect = panel.querySelector('[data-filter-region]');
    var count = panel.querySelector('[data-filter-count]');
    var years = [];
    var types = [];
    var regions = [];
    cards.forEach(function (card) {
      var year = card.getAttribute('data-year') || '';
      var type = card.getAttribute('data-type') || '';
      var region = card.getAttribute('data-region') || '';
      if (year && years.indexOf(year) === -1) {
        years.push(year);
      }
      if (type && types.indexOf(type) === -1) {
        types.push(type);
      }
      if (region && regions.indexOf(region) === -1) {
        regions.push(region);
      }
    });
    fillFilterSelect(yearSelect, years);
    fillFilterSelect(typeSelect, types);
    fillFilterSelect(regionSelect, regions);
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q') || '';
    if (q && textInput) {
      textInput.value = q;
    }
    function apply() {
      var text = (textInput.value || '').trim().toLowerCase();
      var year = yearSelect.value;
      var type = typeSelect.value;
      var region = regionSelect.value;
      var visible = 0;
      cards.forEach(function (card) {
        var haystack = card.getAttribute('data-search') || '';
        var ok = true;
        if (text && haystack.indexOf(text) === -1) {
          ok = false;
        }
        if (year && card.getAttribute('data-year') !== year) {
          ok = false;
        }
        if (type && card.getAttribute('data-type') !== type) {
          ok = false;
        }
        if (region && card.getAttribute('data-region') !== region) {
          ok = false;
        }
        card.classList.toggle('is-hidden-card', !ok);
        if (ok) {
          visible += 1;
        }
      });
      if (count) {
        count.textContent = visible ? '当前显示 ' + visible + ' 部作品' : '未找到匹配内容';
      }
    }
    [textInput, yearSelect, typeSelect, regionSelect].forEach(function (control) {
      control.addEventListener(control.tagName === 'INPUT' ? 'input' : 'change', apply);
    });
    apply();
  }

  function initPlayer() {
    var shell = document.querySelector('.player-shell');
    if (!shell) {
      return;
    }
    var video = shell.querySelector('video');
    var overlay = shell.querySelector('.player-overlay');
    var source = shell.getAttribute('data-video');
    var hlsInstance = null;
    if (!video || !source) {
      return;
    }
    function attach() {
      if (video.getAttribute('data-ready') === '1') {
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else {
        video.src = source;
      }
      video.setAttribute('data-ready', '1');
    }
    function play() {
      attach();
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
      video.controls = true;
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {
          if (overlay) {
            overlay.classList.remove('is-hidden');
          }
        });
      }
    }
    if (overlay) {
      overlay.addEventListener('click', play);
    }
    video.addEventListener('click', function () {
      if (video.getAttribute('data-ready') !== '1') {
        play();
      }
    });
    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMenu();
    initHero();
    initFilters();
    initPlayer();
  });
})();
