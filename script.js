/**
 * script.js
 * Controls dynamic interactions on Madfun website:
 * - Rotating Promo Strip with progress bar & live counter
 * - Widescreen Hero Carousel with auto-play and dot controls
 * - Dynamic card population with local image paths
 * - Events page filtering (Category, Time, Price, Live Search)
 * - Newsletter subscription handling
 */
document.addEventListener('DOMContentLoaded', function () {
    'use strict';

    // ===== 1. PROMO STRIP ROTATOR =====
    const promoItems = document.querySelectorAll('.promo-item');
    const promoProgress = document.getElementById('promoProgress');
    const promoCounter = document.getElementById('promoCounterCurrent');
    let currentPromoIdx = 0;
    const promoDuration = 4000; // 4 seconds per promo item

    if (promoItems.length > 0) {
        function resetPromoProgress() {
            if (promoProgress) {
                promoProgress.style.transition = 'none';
                promoProgress.style.width = '0%';
                setTimeout(() => {
                    promoProgress.style.transition = `width ${promoDuration}ms linear`;
                    promoProgress.style.width = '100%';
                }, 50);
            }
        }

        function switchPromo(nextIdx) {
            const currentEl = promoItems[currentPromoIdx];
            const nextEl = promoItems[nextIdx];

            if (currentEl) {
                currentEl.classList.remove('is-active');
                currentEl.classList.add('is-leaving');
                setTimeout(() => {
                    currentEl.classList.remove('is-leaving');
                }, 500);
            }

            if (nextEl) {
                nextEl.classList.add('is-active');
            }

            currentPromoIdx = nextIdx;
            if (promoCounter) {
                promoCounter.textContent = (currentPromoIdx + 1);
            }
            resetPromoProgress();
        }

        resetPromoProgress();
        setInterval(() => {
            const nextIdx = (currentPromoIdx + 1) % promoItems.length;
            switchPromo(nextIdx);
        }, promoDuration);
    }

    // ===== 2. HERO CAROUSEL CONTROLLER =====
    const heroSlides = document.querySelectorAll('.hero-slide');
    const heroDots = document.querySelectorAll('.hero-dot');
    let currentHeroSlide = 0;
    let heroInterval = null;
    const heroDuration = 5500; // 5.5 seconds per hero slide

    if (heroSlides.length > 0) {
        function showHeroSlide(idx) {
            heroSlides.forEach((slide, i) => {
                slide.classList.toggle('active', i === idx);
            });
            heroDots.forEach((dot, i) => {
                dot.classList.toggle('active', i === idx);
            });
            currentHeroSlide = idx;
        }

        function startHeroAutoplay() {
            stopHeroAutoplay();
            heroInterval = setInterval(() => {
                const next = (currentHeroSlide + 1) % heroSlides.length;
                showHeroSlide(next);
            }, heroDuration);
        }

        function stopHeroAutoplay() {
            if (heroInterval) clearInterval(heroInterval);
        }

        heroDots.forEach((dot) => {
            dot.addEventListener('click', function () {
                const slideIdx = parseInt(this.dataset.slide, 10);
                showHeroSlide(slideIdx);
                startHeroAutoplay();
            });
        });

        const heroCarousel = document.getElementById('heroCarousel');
        if (heroCarousel) {
            heroCarousel.addEventListener('mouseenter', stopHeroAutoplay);
            heroCarousel.addEventListener('mouseleave', startHeroAutoplay);
        }

        startHeroAutoplay();
    }

    // ===== 3. DATA REPOSITORY (Local Assets from madfun.com) =====
    const LOCAL_EVENTS = window.MADFUN_EVENTS || [
        { id: 1, title: "Rhema Feast 2026 - Business Forum", date: "Fri 4 Sept, 8:00 am", venue: "Uhuru Park", category: "Other", price: 10000, priceDisplay: "KES 10,000", image: "images/events/rhema-feast.jpg" },
        { id: 2, title: "Maitu Mukabete 4", date: "Sat 5 Sept, 4:00 pm", venue: "KICC, Tsavo Ballroom", category: "Arts & theatre", price: 1500, priceDisplay: "KES 1,500", image: "images/events/maitu-mukabete-4.png" },
        { id: 3, title: "Waiyaki Wa Hinga", date: "Fri 16 Oct, 9:00 pm", venue: "Kenya National Theatre", category: "Arts & theatre", price: 1500, priceDisplay: "KES 1,500", image: "images/events/waiyaki-wa-hinga.png" },
        { id: 4, title: "The Call Experience 2.0", date: "Sun 27 Sept, 7:00 pm", venue: "Citam Karen", category: "Music", price: 1000, priceDisplay: "KES 1,000", image: "images/events/the-call-experience.png" },
        { id: 5, title: "Becoming CEO Live- September Edition", date: "Sat 12 Sept, 9:00 am", venue: "Nairobi Hospital Convention Centre", category: "Conference", price: 2500, priceDisplay: "KES 2,500", image: "images/events/becoming-ceo-live.jpg" },
        { id: 6, title: "MKU Freshers Summit", date: "Sat 5 Sept, 8:30 am", venue: "Mount Kenya University Main Campus", category: "Conference", price: 0, priceDisplay: "Free", image: "images/events/nairobi-freshers-summit.png" },
        { id: 7, title: "Social Night", date: "Sat 5 Sept, 5:30 pm", venue: "Kalamata Restaurant", category: "Nightlife", price: 1700, priceDisplay: "KES 1,700", image: "images/events/social-night.png" },
        { id: 8, title: "Shamba Safari Experience", date: "Sat 5 Sept, 7:00 pm", venue: "Wambugu Apples Farms, Laikipia County", category: "Food & drink", price: 1000, priceDisplay: "KES 1,000", image: "images/events/shamba-safari.jpg" },
        { id: 9, title: "MEET AND MINGLE", date: "Sun 6 Sept, 9:30 am", venue: "Venue TBA", category: "Networking", price: 200, priceDisplay: "KES 200", image: "images/events/meet-and-mingle.jpg" },
        { id: 10, title: "LINK AND LAUGH", date: "Sun 6 Sept, 10:30 am", venue: "Uhuru Park", category: "Comedy", price: 100, priceDisplay: "KES 100", image: "images/events/link-and-laugh.png" },
        { id: 11, title: "The Alter Or The Gavel", date: "Sun 6 Sept, 3:00 pm", venue: "Kenya National Theatre", category: "Arts & theatre", price: 1000, priceDisplay: "KES 1,000", image: "images/events/altar-or-gavel.jpg" },
        { id: 12, title: "Ethiopian New Year's Eve", date: "Thu 10 Sept, 6:00 pm", venue: "Gursha Ethiopian Kitchen, 25 Muthithi Road", category: "Food & drink", price: 1500, priceDisplay: "KES 1,500", image: "images/events/ethiopian-new-year.jpg" },
        { id: 13, title: "Back 2 School Quiz", date: "Fri 11 Sept, 3:00 am", venue: "Matteo's Events Hall", category: "Festival", price: 500, priceDisplay: "KES 500", image: "images/events/back-2-school-quiz.jpg" },
        { id: 14, title: "Rongai Baddie Edition Fest", date: "Fri 11 Sept, 4:00 pm", venue: "Rustic Haven, Rongai", category: "Festival", price: 800, priceDisplay: "KES 800", image: "images/events/rongai-baddie-fest.jpg" },
        { id: 15, title: "Inaugural Spicy Awards 2026", date: "Sat 12 Sept, 3:00 am", venue: "Mageuzi Hub, Hurlingham Nairobi", category: "Arts & theatre", price: 1500, priceDisplay: "KES 1,500", image: "images/events/spicy-awards.jpg" },
        { id: 16, title: "What We Never Said", date: "Sat 12 Sept, 3:00 am", venue: "Ole Kule Ranch", category: "Festival", price: 1200, priceDisplay: "KES 1,200", image: "images/events/what-we-never-said.jpg" },
        { id: 17, title: "Chendachenda Festival Nairobi", date: "Sat 12 Sept, 3:00 am", venue: "Deuts 4 Seasons - Amani Utawala", category: "Festival", price: 1000, priceDisplay: "KES 1,000", image: "images/events/chendachenda-fest.png" },
        { id: 18, title: "Wamama Fun Day: The Little Girl In Me Edition", date: "Sat 12 Sept, 3:00 am", venue: "The Oasis Garden Resort, Embu", category: "Wellness", price: 1500, priceDisplay: "KES 1,500", image: "images/events/wamama-fun-day.jpg" },
        { id: 19, title: "Nairobi Freshers Summit", date: "Sat 12 Sept, 8:30 am", venue: "KICC", category: "Conference", price: 500, priceDisplay: "KES 500", image: "images/events/nairobi-freshers-summit.png" },
        { id: 20, title: "Paint and Sip", date: "Sat 12 Sept, 2:00 pm", venue: "Sweet n PiliPili", category: "Arts & theatre", price: 2500, priceDisplay: "KES 2,500", image: "images/events/paint-and-sip.png" },
        { id: 21, title: "NEXORA TAKEOVER — MINGLE & HAVE FUN WITH NO LIMITS", date: "Sat 12 Sept, 5:28 pm", venue: "Torati Kitchen, Bandari Plaza, Westlands", category: "Nightlife", price: 1000, priceDisplay: "KES 1,000", image: "images/events/nexora-takeover.jpg" },
        { id: 22, title: "Adonis Runway Night", date: "Sun 13 Sept, 3:00 am", venue: "Padle 254", category: "Arts & theatre", price: 2000, priceDisplay: "KES 2,000", image: "images/events/adonis-runway.jpg" },
        { id: 23, title: "WAKOLOSAI 2ND EDITION", date: "Sun 13 Sept, 3:00 pm", venue: "ICC Front Runners", category: "Music", price: 500, priceDisplay: "KES 500", image: "images/events/wakolosai-2nd-edition.png" },
        { id: 24, title: "ZILLENIAL CARIBBEAN SUNDOWNER", date: "Sat 19 Sept, 2:00 pm", venue: "MINTSHACK, MUTHANGARI DRIVE", category: "Music", price: 1200, priceDisplay: "KES 1,200", image: "images/events/zillenial-caribbean.png" },
        { id: 25, title: "University of Nairobi Freshers Night", date: "Sat 19 Sept, 6:00 pm", venue: "KICC", category: "Festival", price: 500, priceDisplay: "KES 500", image: "images/events/uon-freshers-night.jpg" },
        { id: 26, title: "Woman Elevate 03", date: "Sat 5 Sept, 9:00 am", venue: "Pax Manor", category: "Wellness", price: 3500, priceDisplay: "KES 3,500", image: "images/events/woman-elevate-03.jpg" }
    ];

    function createEventCardHTML(event) {
        return `
            <a href="event.html?id=${event.id}" class="event-card card-lift" aria-label="${event.title}">
                <div class="event-card-poster">
                    <img src="${event.image}" alt="${event.title}" loading="lazy" onerror="this.src='images/events/rhema-feast.jpg';" />
                </div>
                <div class="event-card-meta">
                    <div class="event-card-date">${event.date}</div>
                    <div class="event-card-title">${event.title}</div>
                    <div class="event-card-venue">${event.venue}</div>
                </div>
            </a>
        `;
    }

    // ===== 4. POPULATE HOMEPAGE "HAPPENING NEAR YOU" =====
    const homeEventsGrid = document.getElementById('eventsGrid');
    if (homeEventsGrid) {
        // Display top 10 latest events matching madfun.com
        const top10 = LOCAL_EVENTS.slice(0, 10);
        homeEventsGrid.innerHTML = top10.map(createEventCardHTML).join('');
    }

    // ===== 5. POPULATE & FILTER EVENTS DIRECTORY (events.html) =====
    const directoryGrid = document.getElementById('eventsPageGrid');
    const eventCountEl = document.getElementById('eventsTotalCount');
    let currentCategory = 'all';
    let currentPriceFilter = 'all';
    let currentSearchTerm = '';
    let currentTimeFilter = 'all';

    function renderFilteredEvents() {
        if (!directoryGrid) return;

        let filtered = LOCAL_EVENTS.filter(event => {
            // Category filter
            if (currentCategory !== 'all') {
                const evCat = (event.category || '').toLowerCase();
                if (!evCat.includes(currentCategory.toLowerCase())) return false;
            }

            // Price filter
            if (currentPriceFilter === 'free' && event.price > 0) return false;
            if (currentPriceFilter === 'under2000' && event.price >= 2000) return false;
            if (currentPriceFilter === '2000to5000' && (event.price < 2000 || event.price > 5000)) return false;
            if (currentPriceFilter === '5000plus' && event.price < 5000) return false;

            // Search term
            if (currentSearchTerm) {
                const q = currentSearchTerm.toLowerCase();
                const matchTitle = event.title.toLowerCase().includes(q);
                const matchVenue = event.venue.toLowerCase().includes(q);
                if (!matchTitle && !matchVenue) return false;
            }

            return true;
        });

        if (eventCountEl) {
            eventCountEl.textContent = filtered.length;
        }

        if (filtered.length === 0) {
            directoryGrid.innerHTML = `
                <div style="grid-column: 1 / -1; padding: 3rem 0; text-align: center; color: var(--muted);">
                    <p style="font-size: 1.125rem; font-weight: 600; color: var(--ink);">No events found</p>
                    <p style="font-size: 0.875rem; margin-top: 0.25rem;">Try adjusting your filters or search query.</p>
                </div>
            `;
        } else {
            directoryGrid.innerHTML = filtered.map(createEventCardHTML).join('');
        }
    }

    // Initialize directory page if present
    if (directoryGrid) {
        renderFilteredEvents();

        // Category radios
        document.querySelectorAll('input[name="category"]').forEach(radio => {
            radio.addEventListener('change', function () {
                currentCategory = this.value;
                renderFilteredEvents();
            });
        });

        // Price radios
        document.querySelectorAll('input[name="price"]').forEach(radio => {
            radio.addEventListener('change', function () {
                currentPriceFilter = this.value;
                renderFilteredEvents();
            });
        });

        // Time quick filter pills
        document.querySelectorAll('.time-pill-btn').forEach(btn => {
            btn.addEventListener('click', function () {
                document.querySelectorAll('.time-pill-btn').forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                currentTimeFilter = this.dataset.time || 'all';
                renderFilteredEvents();
            });
        });

        // Search inputs
        const searchInput = document.getElementById('headerSearchInput');
        if (searchInput) {
            searchInput.addEventListener('input', function () {
                currentSearchTerm = this.value.trim();
                renderFilteredEvents();
            });
        }
    }

    // ===== 6. NEWSLETTER SUBSCRIPTION FORMS =====
    document.querySelectorAll('.newsletter-form').forEach(form => {
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            const input = this.querySelector('input[type="email"]');
            if (input && input.value) {
                const btn = this.querySelector('button[type="submit"]');
                const origText = btn.textContent;
                btn.textContent = 'Subscribed!';
                btn.style.backgroundColor = '#10b981';
                btn.style.color = '#ffffff';
                input.value = '';
                setTimeout(() => {
                    btn.textContent = origText;
                    btn.style.backgroundColor = '';
                    btn.style.color = '';
                }, 3000);
            }
        });
    });

    // ===== 7. GLOBAL SEARCH INPUT REDIRECT =====
    const globalSearchInput = document.getElementById('globalSearchInput');
    if (globalSearchInput) {
        globalSearchInput.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') {
                const q = encodeURIComponent(this.value.trim());
                window.location.href = 'events.html?q=' + q;
            }
        });
    }

});
