(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var toggle = document.querySelector('[data-menu-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (toggle && mobileNav) {
      toggle.addEventListener('click', function () {
        mobileNav.classList.toggle('open');
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var active = 0;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      active = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === active);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === active);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
      });
    });

    if (slides.length > 1) {
      setInterval(function () {
        showSlide(active + 1);
      }, 5200);
    }

    var filterInputs = Array.prototype.slice.call(document.querySelectorAll('[data-card-search]'));

    filterInputs.forEach(function (input) {
      input.addEventListener('input', function () {
        var scope = document.querySelector(input.getAttribute('data-card-search')) || document;
        var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-card]'));
        var keyword = input.value.trim().toLowerCase();

        cards.forEach(function (card) {
          var haystack = (card.getAttribute('data-title') + ' ' + card.getAttribute('data-tags')).toLowerCase();
          card.classList.toggle('hide-card', keyword && haystack.indexOf(keyword) === -1);
        });
      });
    });
  });
})();
