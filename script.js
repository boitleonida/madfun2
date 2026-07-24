// ===== MOBILE NAV TOGGLE =====
document.addEventListener('DOMContentLoaded', function() {
    const menuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileNavMenu');
    
    if (menuBtn && mobileMenu) {
        menuBtn.addEventListener('click', function() {
            mobileMenu.classList.toggle('open');
        });
    }

    // ===== SWIPER INITIALIZATION =====
    if (typeof Swiper !== 'undefined') {
        // Hero Swiper
        if (document.querySelector('.hero-swiper')) {
            new Swiper('.hero-swiper', {
                loop: true,
                autoplay: {
                    delay: 5000,
                    disableOnInteraction: false,
                },
                effect: 'fade',
                fadeEffect: {
                    crossFade: true,
                },
                speed: 800,
            });
        }

        // Streams Swiper
        if (document.querySelector('.streams-swiper')) {
            new Swiper('.streams-swiper', {
                loop: true,
                autoplay: {
                    delay: 4000,
                    disableOnInteraction: false,
                },
                effect: 'fade',
                fadeEffect: {
                    crossFade: true,
                },
                speed: 1000,
            });
        }
    }

    // ===== EVENT DATA (from gigs.madfun.com API) =====
    const events = [
        {
            id: 1,
            title: "KUTIIT CULTURE",
            price: "KES 899",
            date: "8 Aug",
            image: "https://gigs.madfun.com/images/events/kutiit-culture.jpg",
            link: "event.html?id=1"
        },
        {
            id: 2,
            title: "3RD SERVICE LIFE ON LIFE",
            price: "KES 1,500",
            date: "23 Aug",
            image: "https://gigs.madfun.com/images/events/3rd-service.jpg",
            link: "event.html?id=2"
        },
        {
            id: 3,
            title: "THE CALL EXPERIENCE 2.0",
            price: "KES 1,000",
            date: "27 Sep",
            image: "https://gigs.madfun.com/images/events/call-experience.jpg",
            link: "event.html?id=3"
        },
        {
            id: 4,
            title: "COCKTAIL RUNS WITH RONO 7TH EDITION",
            price: "KES 2,000",
            date: "29 Aug",
            image: "https://gigs.madfun.com/images/events/cocktail-runs.jpg",
            link: "event.html?id=4"
        },
        {
            id: 5,
            title: "WHAT WE NEVER SAID",
            price: "KES 1,200",
            date: "12 Sep",
            image: "https://gigs.madfun.com/images/events/what-we-never-said.jpg",
            link: "event.html?id=5"
        },
        {
            id: 6,
            title: "OAK GROVE CITY - MUD 4 FUN",
            price: "KES 1,500",
            date: "1 Aug",
            image: "https://madfun.com/assets/img/banners/oak-grove-desktop.jpeg",
            link: "event.html?id=6"
        },
        {
            id: 7,
            title: "TTNT6 - NJUGUSH LIVE",
            price: "KES 1,500",
            date: "1 Aug",
            image: "https://madfun.com/assets/img/banners/ttnt6-desktop.webp",
            link: "event.html?id=7"
        },
        {
            id: 8,
            title: "MAITU - A MOTHER'S TALE",
            price: "KES 2,000",
            date: "5 Sep",
            image: "https://madfun.com/assets/img/banners/maitu-desktop.webp",
            link: "event.html?id=8"
        }
    ];

    // Fetch real events from API
    async function fetchEvents() {
        try {
            const response = await fetch('https://gigs.madfun.com/api/events?limit=8');
            if (response.ok) {
                const data = await response.json();
                return data.events || data.data || data;
            }
        } catch (e) {
            // API not accessible, use fallback data
        }
        return null;
    }

    // Render event cards
    function renderEventCard(event) {
        return `
            <div class="event-card">
                <a href="${event.link || '#'}" class="event-card-image">
                    <span class="event-date-badge">${event.date}</span>
                    <img alt="${event.title}" src="${event.image || 'https://madfun.com/assets/img/banners/oak-grove-desktop.jpeg'}" loading="lazy" 
                         onerror="this.src='https://madfun.com/assets/img/banners/oak-grove-desktop.jpeg';" />
                </a>
                <div class="event-card-title">${event.title}</div>
                <div class="event-card-price">${event.price}</div>
                <div class="event-card-footer">
                    <button class="event-share-btn" aria-label="Share">
                        <svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" height="18" width="18"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
                    </button>
                </div>
            </div>
        `;
    }

    // Render skeleton loading cards
    function renderSkeletonCards(count) {
        let html = '';
        for (let i = 0; i < count; i++) {
            html += `
                <div class="event-card">
                    <div class="skeleton skeleton-image"></div>
                    <div class="skeleton skeleton-text"></div>
                    <div class="skeleton skeleton-text-sm"></div>
                </div>
            `;
        }
        return html;
    }

    // Populate homepage events grid
    const eventsGrid = document.getElementById('eventsGrid');
    if (eventsGrid) {
        // Show skeleton first
        eventsGrid.innerHTML = renderSkeletonCards(4);
        
        // Then populate with data
        setTimeout(() => {
            eventsGrid.innerHTML = events.slice(0, 4).map(renderEventCard).join('');
        }, 800);
    }

    // Populate events page grid
    const eventsPageGrid = document.getElementById('eventsPageGrid');
    if (eventsPageGrid) {
        // Show skeleton first
        eventsPageGrid.innerHTML = renderSkeletonCards(8);
        
        // Then populate with data
        setTimeout(() => {
            eventsPageGrid.innerHTML = events.map(renderEventCard).join('');
        }, 800);
    }

    // ===== AUTH FORM =====
    const authForm = document.getElementById('authForm');
    if (authForm) {
        authForm.addEventListener('submit', function(e) {
            e.preventDefault();
            // Redirect to account page after "login"
            window.location.href = 'account.html';
        });
    }

    // ===== NAVBAR DYNAMIC AUTH LINKS =====
    const isLoggedIn = !!localStorage.getItem('madfun_user');
    document.querySelectorAll('.nav-links a, .mobile-nav-menu a').forEach(function(link) {
        const text = link.innerText.trim().toLowerCase();
        if (text === 'travel' || text === 'xperience') {
            link.href = isLoggedIn ? 'account-travels.html' : 'auth.html?redirect=account-travels.html';
        } else if (text === 'hotels') {
            link.href = isLoggedIn ? 'account-hotels.html' : 'auth.html?redirect=account-hotels.html';
        } else if (text === 'streams') {
            link.href = isLoggedIn ? 'account-streams.html' : 'auth.html?redirect=account-streams.html';
        } else if (text === 'events') {
            if (isLoggedIn && link.getAttribute('href') === 'events.html') {
                link.href = 'account-events.html';
            }
        }
    });

    // ===== NAVBAR SCROLL EFFECT =====
    const navbar = document.getElementById('navbar');
    if (navbar) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 50) {
                navbar.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
            } else {
                navbar.style.boxShadow = 'none';
            }
        });
    }
});
