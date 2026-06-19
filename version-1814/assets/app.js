
(function () {
    var toggle = document.querySelector('[data-mobile-toggle]');
    var panel = document.querySelector('[data-mobile-panel]');

    if (toggle && panel) {
        toggle.addEventListener('click', function () {
            panel.classList.toggle('is-open');
        });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var index = 0;

        var show = function (next) {
            index = next % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === index);
            });
        };

        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                show(i);
            });
        });

        if (slides.length > 1) {
            window.setInterval(function () {
                show(index + 1);
            }, 5000);
        }
    }

    var panels = document.querySelectorAll('[data-filter-panel]');

    panels.forEach(function (filterPanel) {
        var input = filterPanel.querySelector('[data-filter-input]');
        var type = filterPanel.querySelector('[data-filter-type]');
        var year = filterPanel.querySelector('[data-filter-year]');
        var list = document.querySelector('[data-card-list]');

        if (!list) {
            return;
        }

        var cards = Array.prototype.slice.call(list.querySelectorAll('[data-card]'));
        var params = new URLSearchParams(window.location.search);
        var query = params.get('q') || '';

        if (input && query) {
            input.value = query;
        }

        var normalize = function (value) {
            return String(value || '').toLowerCase().trim();
        };

        var apply = function () {
            var q = normalize(input ? input.value : '');
            var t = normalize(type ? type.value : '');
            var y = normalize(year ? year.value : '');

            cards.forEach(function (card) {
                var haystack = normalize([
                    card.getAttribute('data-title'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-type'),
                    card.getAttribute('data-year'),
                    card.getAttribute('data-genre'),
                    card.textContent
                ].join(' '));
                var ok = true;

                if (q && haystack.indexOf(q) === -1) {
                    ok = false;
                }
                if (t && normalize(card.getAttribute('data-type')) !== t) {
                    ok = false;
                }
                if (y && normalize(card.getAttribute('data-year')) !== y) {
                    ok = false;
                }

                card.classList.toggle('is-hidden', !ok);
            });
        };

        [input, type, year].forEach(function (control) {
            if (control) {
                control.addEventListener('input', apply);
                control.addEventListener('change', apply);
            }
        });

        apply();
    });
})();
