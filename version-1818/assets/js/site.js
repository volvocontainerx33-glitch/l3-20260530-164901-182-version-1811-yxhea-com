(function () {
    var menuButton = document.querySelector("[data-menu-toggle]");
    var mobilePanel = document.querySelector("[data-mobile-panel]");

    if (menuButton && mobilePanel) {
        menuButton.addEventListener("click", function () {
            mobilePanel.classList.toggle("open");
        });
    }

    var backTop = document.querySelector("[data-back-top]");

    if (backTop) {
        window.addEventListener("scroll", function () {
            if (window.scrollY > 500) {
                backTop.classList.add("show");
            } else {
                backTop.classList.remove("show");
            }
        });

        backTop.addEventListener("click", function () {
            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        });
    }

    var hero = document.querySelector("[data-hero-carousel]");

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var current = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }

            current = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("active", slideIndex === current);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("active", dotIndex === current);
            });
        }

        function startAuto() {
            stopAuto();
            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 5600);
        }

        function stopAuto() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (prev) {
            prev.addEventListener("click", function () {
                showSlide(current - 1);
                startAuto();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                showSlide(current + 1);
                startAuto();
            });
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                showSlide(index);
                startAuto();
            });
        });

        hero.addEventListener("mouseenter", stopAuto);
        hero.addEventListener("mouseleave", startAuto);
        showSlide(0);
        startAuto();
    }

    var scopes = Array.prototype.slice.call(document.querySelectorAll("[data-filter-scope]"));

    scopes.forEach(function (scope) {
        var pageRoot = scope.parentElement || document;
        var input = scope.querySelector("[data-filter-search]");
        var genre = scope.querySelector("[data-filter-genre]");
        var year = scope.querySelector("[data-filter-year]");
        var sort = scope.querySelector("[data-sort-select]");
        var grid = pageRoot.querySelector("[data-movie-grid]") || document.querySelector("[data-movie-grid]");
        var empty = pageRoot.querySelector("[data-empty-state]") || document.querySelector("[data-empty-state]");

        if (!grid) {
            return;
        }

        var originalCards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));

        function normalize(value) {
            return String(value || "").toLowerCase().trim();
        }

        function applyFilters() {
            var keyword = normalize(input && input.value);
            var genreValue = normalize(genre && genre.value);
            var yearValue = normalize(year && year.value);
            var visibleCount = 0;

            originalCards.forEach(function (card) {
                var text = normalize(card.textContent + " " + card.dataset.title + " " + card.dataset.genre + " " + card.dataset.region);
                var genreText = normalize(card.dataset.genre);
                var yearText = normalize(card.dataset.year);
                var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
                var matchGenre = !genreValue || genreText.indexOf(genreValue) !== -1 || text.indexOf(genreValue) !== -1;
                var matchYear = !yearValue || yearText === yearValue;
                var show = matchKeyword && matchGenre && matchYear;

                card.classList.toggle("hidden", !show);

                if (show) {
                    visibleCount += 1;
                }
            });

            if (empty) {
                empty.classList.toggle("show", visibleCount === 0);
            }
        }

        function applySort() {
            if (!sort) {
                return;
            }

            var mode = sort.value;
            var sorted = originalCards.slice();

            if (mode === "year") {
                sorted.sort(function (a, b) {
                    return Number(b.dataset.year || 0) - Number(a.dataset.year || 0);
                });
            } else if (mode === "hot") {
                sorted.sort(function (a, b) {
                    return Number(b.dataset.hot || 0) - Number(a.dataset.hot || 0);
                });
            } else if (mode === "title") {
                sorted.sort(function (a, b) {
                    return String(a.dataset.title || "").localeCompare(String(b.dataset.title || ""), "zh-Hans-CN");
                });
            } else {
                sorted = originalCards.slice();
            }

            sorted.forEach(function (card) {
                grid.appendChild(card);
            });

            applyFilters();
        }

        [input, genre, year].forEach(function (control) {
            if (control) {
                control.addEventListener("input", applyFilters);
                control.addEventListener("change", applyFilters);
            }
        });

        if (sort) {
            sort.addEventListener("change", applySort);
        }

        applyFilters();
    });
})();
