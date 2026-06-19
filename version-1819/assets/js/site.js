(function () {
    const menuButton = document.querySelector(".menu-button");
    const mobilePanel = document.querySelector(".mobile-panel");

    if (menuButton && mobilePanel) {
        menuButton.addEventListener("click", function () {
            const open = mobilePanel.classList.toggle("open");
            menuButton.setAttribute("aria-expanded", String(open));
        });
    }

    const slides = Array.from(document.querySelectorAll(".hero-slide"));
    const dots = Array.from(document.querySelectorAll("[data-hero-dot]"));
    const prev = document.querySelector("[data-hero-prev]");
    const next = document.querySelector("[data-hero-next]");
    let current = 0;
    let timer = null;

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

    function restartTimer() {
        if (!slides.length) {
            return;
        }
        window.clearInterval(timer);
        timer = window.setInterval(function () {
            showSlide(current + 1);
        }, 5800);
    }

    if (slides.length) {
        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                showSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
                restartTimer();
            });
        });
        if (prev) {
            prev.addEventListener("click", function () {
                showSlide(current - 1);
                restartTimer();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                showSlide(current + 1);
                restartTimer();
            });
        }
        restartTimer();
    }

    function bindSearchBox(input) {
        const holder = input.parentElement.querySelector(".search-results");
        const data = Array.isArray(window.SEARCH_INDEX) ? window.SEARCH_INDEX : [];
        if (!holder || !data.length) {
            return;
        }

        function renderResults() {
            const query = input.value.trim().toLowerCase();
            if (!query) {
                holder.classList.remove("open");
                holder.innerHTML = "";
                return;
            }
            const matches = data.filter(function (item) {
                return [item.title, item.category, item.year, item.type, item.keywords].join(" ").toLowerCase().includes(query);
            }).slice(0, 10);
            holder.innerHTML = matches.map(function (item) {
                return '<a href="' + item.url + '"><strong>' + escapeHtml(item.title) + '</strong><small>' + escapeHtml(item.year + ' · ' + item.category + ' · ' + item.type) + '</small></a>';
            }).join("");
            holder.classList.toggle("open", matches.length > 0);
        }

        input.addEventListener("input", renderResults);
        input.addEventListener("focus", renderResults);
        document.addEventListener("click", function (event) {
            if (!input.parentElement.contains(event.target)) {
                holder.classList.remove("open");
            }
        });
    }

    document.querySelectorAll(".site-search-input").forEach(bindSearchBox);

    function escapeHtml(value) {
        return String(value)
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    }

    const categorySearch = document.querySelector(".category-search-input");
    const categoryCards = Array.from(document.querySelectorAll(".category-grid .movie-card"));
    const filterButtons = Array.from(document.querySelectorAll(".filter-button"));
    const state = {
        year: "all",
        type: "all"
    };

    function applyCategoryFilter() {
        const query = categorySearch ? categorySearch.value.trim().toLowerCase() : "";
        categoryCards.forEach(function (card) {
            const text = (card.getAttribute("data-search") || "").toLowerCase();
            const year = card.getAttribute("data-year") || "";
            const type = card.getAttribute("data-type") || "";
            const byYear = state.year === "all" || year === state.year;
            const byType = state.type === "all" || type === state.type;
            const byQuery = !query || text.includes(query);
            card.style.display = byYear && byType && byQuery ? "" : "none";
        });
    }

    if (categorySearch && categoryCards.length) {
        categorySearch.addEventListener("input", applyCategoryFilter);
    }

    filterButtons.forEach(function (button) {
        button.addEventListener("click", function () {
            const kind = button.getAttribute("data-filter-kind");
            const value = button.getAttribute("data-filter-value") || "all";
            if (kind === "all") {
                state.year = "all";
                state.type = "all";
                filterButtons.forEach(function (item) {
                    item.classList.toggle("active", item === button);
                });
            } else {
                state[kind] = state[kind] === value ? "all" : value;
                filterButtons.forEach(function (item) {
                    const itemKind = item.getAttribute("data-filter-kind");
                    const itemValue = item.getAttribute("data-filter-value") || "all";
                    if (itemKind === "all") {
                        item.classList.toggle("active", state.year === "all" && state.type === "all");
                    } else {
                        item.classList.toggle("active", state[itemKind] === itemValue);
                    }
                });
            }
            applyCategoryFilter();
        });
    });
})();
