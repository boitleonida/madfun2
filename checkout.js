/**
 * checkout.js
 * Handles event detail page: ticket selection, totals, checkout modal, and MegaPay / M-Pesa STK push payment.
 * Preserves Firebase Firestore booking persistence and local QR receipt generation.
 */
(function () {
    'use strict';

    // ===== LATEST EVENTS DATA STORE (from madfun.com) =====
    const EVENTS_DB = [
        {
            id: 1,
            title: "Rhema Feast 2026 - Business Forum",
            category: "Other",
            org: "Rhema Feast Kenya",
            date: "Fri 4 Sept, 8:00 am",
            venue: "Uhuru Park, Nairobi",
            image: "images/events/rhema-feast.jpg",
            description: "\"Come Let Us Rebuild!\" East Africa's premier Christian business gathering is back — and this is the forum you don't want to hear about after it happens. The CEOs. The investors. The founders. The marketplace leaders are rebuilding industries with Kingdom purpose. They'll all be in one room - and the conversations that happen will be worth more than the ticket. This isn't another conference. It's where faith meets strategy, where world-class speakers hand you the insight you've been praying for.",
            tiers: [
                { name: "Advance Ticket", price: 10000 },
                { name: "Door Rate", price: 15000 }
            ]
        },
        {
            id: 2,
            title: "Maitu Mukabete 4",
            category: "Arts & theatre",
            org: "Auntie Jemimah Productions",
            date: "Sat 5 Sept, 4:00 pm",
            venue: "KICC, Tsavo Ballroom, Nairobi",
            image: "images/events/maitu-mukabete-4.png",
            description: "Celebrate a decade of laughter with the incomparable Auntie Jemimah! Marking ten years of comedic excellence, Maitu Mukabete 4 brings the quintessential 'Mother from Kabete' back to the stage for her most intimate, hilarious show yet. Blending relatable Gikuyu storytelling with sharp wit, Auntie Jemimah explores motherhood, fame and heritage with unmatched vulnerability. Don't miss this 10th-anniversary extravaganza where cultural pride meets high-energy entertainment.",
            tiers: [
                { name: "Regular Admission", price: 1500 },
                { name: "VIP Experience", price: 3000 }
            ]
        },
        {
            id: 3,
            title: "Waiyaki Wa Hinga",
            category: "Arts & theatre",
            org: "Kenya National Theatre Troupe",
            date: "Fri 16 Oct, 9:00 pm",
            venue: "Kenya National Theatre, Nairobi",
            image: "images/events/waiyaki-wa-hinga.png",
            description: "An epic theatrical rerun exploring the legendary life, triumphs, and sacrifices of Chief Waiyaki Wa Hinga in colonial Kenya. Experience gripping drama, authentic historic costumes, and rich musical performances live on stage.",
            tiers: [
                { name: "Advance Regular", price: 1500 },
                { name: "VIP Seating", price: 2500 }
            ]
        },
        {
            id: 4,
            title: "The Call Experience 2.0",
            category: "Music",
            org: "The Call Ministries",
            date: "Sun 27 Sept, 7:00 pm",
            venue: "Citam Karen, Nairobi",
            image: "images/events/the-call-experience.png",
            description: "An evening of intense worship, gospel music, and spiritual elevation. Connect with celebrated worship ministers and thousands of attendees in a night of praise, faith, and renewal.",
            tiers: [
                { name: "General Admission", price: 1000 },
                { name: "VIP Experience", price: 2500 }
            ]
        },
        {
            id: 5,
            title: "Becoming CEO Live- September Edition",
            category: "Conference",
            org: "Becoming CEO Network",
            date: "Sat 12 Sept, 9:00 am",
            venue: "Nairobi Hospital Convention Centre",
            image: "images/events/becoming-ceo-live.jpg",
            description: "A dynamic live experience bringing together visionaries, entrepreneurs, and aspiring leaders for meaningful conversations, connections, and sustainable career and business growth.",
            tiers: [
                { name: "General Delegate", price: 2500 },
                { name: "Executive VIP", price: 5000 }
            ]
        },
        {
            id: 6,
            title: "MKU Freshers Summit",
            category: "Conference",
            org: "Mount Kenya University",
            date: "Sat 5 Sept, 8:30 am",
            venue: "Mount Kenya University Main Campus",
            image: "images/events/nairobi-freshers-summit.png",
            description: "The official welcome and empowerment summit for incoming university scholars. Featuring industry mentors, digital skills masterclasses, and networking opportunities.",
            tiers: [
                { name: "Free Student Entry", price: 0 },
                { name: "Delegate VIP Package", price: 500 }
            ]
        },
        {
            id: 7,
            title: "Social Night",
            category: "Nightlife",
            org: "Shopable Events",
            date: "Sat 5 Sept, 5:30 pm",
            venue: "Kalamata Restaurant, Nairobi",
            image: "images/events/social-night.png",
            description: "A night of fun, games & good vibes! Get in teams or come solo, play exciting challenges, win amazing prizes and make unforgettable memories. Early bird tickets available now.",
            tiers: [
                { name: "Early Bird", price: 1700 },
                { name: "Regular Admission", price: 2500 },
                { name: "Final Release", price: 3000 }
            ]
        },
        {
            id: 8,
            title: "Shamba Safari Experience",
            category: "Food & drink",
            org: "Wambugu Apples Farms",
            date: "Sat 5 Sept, 7:00 pm",
            venue: "Wambugu Apples Farms, Laikipia County",
            image: "images/events/shamba-safari.jpg",
            description: "Connect with nature on an exclusive organic apple farm safari in scenic Laikipia. Guided orchards tour, organic cider tasting, farm-to-table dinner, and acoustic entertainment around the fire pit.",
            tiers: [
                { name: "Kids Pass", price: 1000 },
                { name: "Adults Experience", price: 3000 }
            ]
        },
        {
            id: 9,
            title: "MEET AND MINGLE",
            category: "Networking",
            org: "Connect Africa",
            date: "Sun 6 Sept, 9:30 am",
            venue: "Hide Out / Kisumu (Naivas Food Market)",
            image: "images/events/meet-and-mingle.jpg",
            description: "Good people, good vibes, great times. Connect with professionals, creative artists, and local food vendors in a vibrant atmosphere.",
            tiers: [
                { name: "Entry Fee", price: 200 }
            ]
        },
        {
            id: 10,
            title: "LINK AND LAUGH",
            category: "Comedy",
            org: "Laugh Factory Kenya",
            date: "Sun 6 Sept, 10:30 am",
            venue: "Uhuru Park, Nairobi",
            image: "images/events/link-and-laugh.png",
            description: "Outdoor picnic, spontaneous comedy games, music, snacks, and shared joy in Uhuru Park. Bring a blanket, pack some food, and enjoy non-stop humor.",
            tiers: [
                { name: "Community Pass", price: 100 }
            ]
        },
        {
            id: 11,
            title: "The Alter Or The Gavel",
            category: "Arts & theatre",
            org: "Emperor's Apex Creatives",
            date: "Sun 6 Sept, 3:00 pm",
            venue: "Kenya National Theatre",
            image: "images/events/altar-or-gavel.jpg",
            description: "Written and directed by Brian Lugadiru, this award-winning production dissects the tension between religious devotion, institutional power, and human ethics in a modern society.",
            tiers: [
                { name: "Regular Seating", price: 1000 },
                { name: "VIP Front Row", price: 2000 }
            ]
        },
        {
            id: 12,
            title: "Ethiopian New Year's Eve",
            category: "Food & drink",
            org: "Gursha Ethiopian Kitchen",
            date: "Thu 10 Sept, 6:00 pm",
            venue: "Gursha Ethiopian Kitchen, 25 Muthithi Road",
            image: "images/events/ethiopian-new-year.jpg",
            description: "Ring in the Ethiopian New Year 2017 with traditional feasts, coffee ceremonies, tej honey wine, authentic music, and cultural hospitality in Westlands.",
            tiers: [
                { name: "Individual Entry", price: 1500 },
                { name: "Table for 4", price: 5500 }
            ]
        },
        {
            id: 13,
            title: "Back 2 School Quiz",
            category: "Festival",
            org: "Trivia Masters Nairobi",
            date: "Fri 11 Sept, 3:00 am",
            venue: "Matteo's Events Hall, Karen",
            image: "images/events/back-2-school-quiz.jpg",
            description: "Relive schoolhouse trivia, pop culture nostalgia, and high-energy pub games. Team up with friends and compete for substantial cash prizes and trophies.",
            tiers: [
                { name: "Single Quizzer", price: 500 },
                { name: "Team Table (4 pax)", price: 1800 }
            ]
        },
        {
            id: 14,
            title: "Rongai Baddie Edition Fest",
            category: "Nightlife",
            org: "Rustic Haven Events",
            date: "Fri 11 Sept, 4:00 pm",
            venue: "Rustic Haven, Rongai",
            image: "images/events/rongai-baddie-fest.jpg",
            description: "The hottest outdoor lifestyle bash south of Nairobi! Top Afrobeat & Amapiano DJs, fashion installations, food trucks, and unforgettable dance parties.",
            tiers: [
                { name: "Early Advance", price: 800 },
                { name: "Gate Admission", price: 1200 }
            ]
        },
        {
            id: 15,
            title: "Inaugural Spicy Awards 2026",
            category: "Arts & theatre",
            org: "Spicy Media Group",
            date: "Sat 12 Sept, 3:00 am",
            venue: "Mageuzi Hub, Hurlingham Nairobi",
            image: "images/events/spicy-awards.jpg",
            description: "Honoring Africa's boldest creators, digital pioneers, podcasters, and cultural trendsetters in a glamorous red-carpet awards celebration.",
            tiers: [
                { name: "Regular Access", price: 1500 },
                { name: "Red Carpet VIP", price: 4000 }
            ]
        },
        {
            id: 16,
            title: "What We Never Said",
            category: "Festival",
            org: "Raw Echoes Spoken Word",
            date: "Sat 12 Sept, 3:00 am",
            venue: "Ole Kule Ranch, Naivasha",
            image: "images/events/what-we-never-said.jpg",
            description: "An intimate weekend retreat of poetry, storytelling, acoustic music, and heartfelt reflections under the Rift Valley night sky.",
            tiers: [
                { name: "Day Pass", price: 1200 },
                { name: "Weekend Camper", price: 2500 }
            ]
        },
        {
            id: 17,
            title: "Chendachenda Festival Nairobi",
            category: "Festival",
            org: "Chendachenda Arts",
            date: "Sat 12 Sept, 3:00 am",
            venue: "Deuts 4 Seasons - Amani Utawala",
            image: "images/events/chendachenda-fest.png",
            description: "A cultural explosion featuring East African indigenous sounds, traditional drumming, craft exhibitions, and authentic street food.",
            tiers: [
                { name: "Standard Ticket", price: 1000 },
                { name: "VIP Experience", price: 2000 }
            ]
        },
        {
            id: 18,
            title: "Wamama Fun Day: The Little Girl In Me Edition",
            category: "Wellness",
            org: "Wamama Wellness Hub",
            date: "Sat 12 Sept, 3:00 am",
            venue: "The Oasis Garden Resort, Embu",
            image: "images/events/wamama-fun-day.jpg",
            description: "A restorative retreat dedicated to celebrating mothers, reconnection, playful games, mental health conversations, and laughter in Embu.",
            tiers: [
                { name: "Full Day Pass", price: 1500 }
            ]
        },
        {
            id: 19,
            title: "Nairobi Freshers Summit",
            category: "Conference",
            org: "KICC Events",
            date: "Sat 12 Sept, 8:30 am",
            venue: "KICC, Nairobi",
            image: "images/events/nairobi-freshers-summit.png",
            description: "Empowering university students with entrepreneurship knowledge, creative economy workshops, and mentorship from Kenya's prominent CEOs.",
            tiers: [
                { name: "Student Delegate", price: 500 },
                { name: "VIP Pass", price: 1500 }
            ]
        },
        {
            id: 20,
            title: "Paint and Sip",
            category: "Arts & theatre",
            org: "Canvas & Corks Nairobi",
            date: "Sat 12 Sept, 2:00 pm",
            venue: "Sweet n PiliPili",
            image: "images/events/paint-and-sip.png",
            description: "No painting experience needed! All art materials, canvas, wine, and gourmet appetizers provided for an artistic weekend escape.",
            tiers: [
                { name: "Solo Painter", price: 2500 },
                { name: "Duo / Couples Pass", price: 4500 }
            ]
        },
        {
            id: 21,
            title: "NEXORA TAKEOVER — MINGLE & HAVE FUN WITH NO LIMITS",
            category: "Nightlife",
            org: "Nexora Social",
            date: "Sat 12 Sept, 5:28 pm",
            venue: "Torati Kitchen, Bandari Plaza, Westlands",
            image: "images/events/nexora-takeover.jpg",
            description: "Westlands' premier party returns with a dynamic mix of Afro-house, hip-hop, and Amapiano across two state-of-the-art sound stages.",
            tiers: [
                { name: "Early Bird", price: 1000 },
                { name: "VIP Table (4 pax)", price: 6000 }
            ]
        },
        {
            id: 22,
            title: "Adonis Runway Night",
            category: "Arts & theatre",
            org: "Adonis Haute Couture",
            date: "Sun 13 Sept, 3:00 am",
            venue: "Padle 254",
            image: "images/events/adonis-runway.jpg",
            description: "High-fashion glamour, bold avant-garde collections, and red carpet elegance featuring top African models and stylists.",
            tiers: [
                { name: "Regular Seating", price: 2000 },
                { name: "Front Row VIP", price: 5000 }
            ]
        },
        {
            id: 23,
            title: "WAKOLOSAI 2ND EDITION",
            category: "Music",
            org: "Front Runners Gospel",
            date: "Sun 13 Sept, 3:00 pm",
            venue: "ICC Front Runners",
            image: "images/events/wakolosai-2nd-edition.png",
            description: "An uplifting session of praise and worship featuring vibrant youth choirs, live instrumentation, and community fellowship.",
            tiers: [
                { name: "Standard Entry", price: 500 }
            ]
        },
        {
            id: 24,
            title: "ZILLENIAL CARIBBEAN SUNDOWNER",
            category: "Music",
            org: "Sundowner Vibez",
            date: "Sat 19 Sept, 2:00 pm",
            venue: "MINTSHACK, MUTHANGARI DRIVE",
            image: "images/events/zillenial-caribbean.png",
            description: "Island riddims, tropical jerk chicken, craft cocktails, and sunset vibes in Muthangari. Caribbean attire encouraged!",
            tiers: [
                { name: "Advance Ticket", price: 1200 },
                { name: "Gate Ticket", price: 1800 }
            ]
        },
        {
            id: 25,
            title: "University of Nairobi Freshers Night",
            category: "Festival",
            org: "UoN Student Council",
            date: "Sat 19 Sept, 6:00 pm",
            venue: "KICC, Nairobi",
            image: "images/events/uon-freshers-night.jpg",
            description: "The mega welcoming concert for all incoming University of Nairobi scholars with guest celebrity artists and celebrity DJs.",
            tiers: [
                { name: "Student Pass (with ID)", price: 500 },
                { name: "VIP Lounge", price: 1500 }
            ]
        },
        {
            id: 26,
            title: "Woman Elevate 03",
            category: "Wellness",
            org: "Woman Elevate Africa",
            date: "Sat 5 Sept, 9:00 am",
            venue: "Pax Manor, Nairobi",
            image: "images/events/woman-elevate-03.jpg",
            description: "Collective wellness event, where executives and founders mingle, ask experts on different curated topics, and interact with brand partners in a relaxing garden setting.",
            tiers: [
                { name: "Wellness Pass", price: 3500 },
                { name: "Executive VIP", price: 7000 }
            ]
        }
    ];

    // Export EVENTS_DB to window so script.js can also access it
    window.MADFUN_EVENTS = EVENTS_DB;

    // ===== STATE =====
    let currentEvent = null;
    let quantities = []; // parallel to currentEvent.tiers

    // ===== INIT =====
    document.addEventListener('DOMContentLoaded', function () {
        // Load username if present
        var userName = localStorage.getItem('madfun_user') || 'Tyler';
        var nameEl = document.getElementById('userNameSpan');
        if (nameEl) nameEl.innerText = userName;

        // User dropdown toggle
        var userMenuBtn = document.getElementById('userMenuBtn');
        var userDropdown = document.getElementById('userDropdown');
        if (userMenuBtn && userDropdown) {
            userMenuBtn.addEventListener('click', function () {
                userDropdown.classList.toggle('open');
            });
            document.addEventListener('click', function (e) {
                if (!e.target.closest('.user-menu')) {
                    userDropdown.classList.remove('open');
                }
            });
        }

        // Parse event ID from URL query parameters
        var params = new URLSearchParams(window.location.search);
        var rawEventId = params.get('id') || '1';
        var numericId = parseInt(rawEventId, 10);

        function setupEventData(ev) {
            currentEvent = ev;
            quantities = (currentEvent.tiers || []).map(function () { return 0; });
            renderEventDetail();
            renderTicketTiers();
            updateSummary();
            bindCheckoutEvents();
        }

        // Look up event: first in local EVENTS_DB, then fallback to Firestore for custom user-created events
        var localMatch = EVENTS_DB.find(function (e) { return e.id === numericId; });
        if (localMatch) {
            setupEventData(localMatch);
        } else if (typeof db !== 'undefined') {
            db.collection('events').doc(String(rawEventId)).get().then(function (doc) {
                if (doc.exists) {
                    setupEventData(doc.data());
                } else {
                    setupEventData(EVENTS_DB[0]);
                }
            }).catch(function () {
                setupEventData(EVENTS_DB[0]);
            });
        } else {
            setupEventData(EVENTS_DB[0]);
        }
    });

    // ===== RENDER EVENT DETAIL =====
    function renderEventDetail() {
        document.title = currentEvent.title + ' · Madfun';
        
        var titleEl = document.getElementById('eventTitle');
        if (titleEl) titleEl.textContent = currentEvent.title;

        var catEl = document.getElementById('eventCategoryBadge');
        if (catEl) catEl.textContent = currentEvent.category || 'Live Event';

        var dateEl = document.getElementById('eventDate');
        if (dateEl) {
            var span = dateEl.querySelector('span');
            if (span) span.textContent = currentEvent.date;
            else dateEl.textContent = currentEvent.date;
        }

        var venueEl = document.getElementById('eventVenue');
        if (venueEl) {
            var spanV = venueEl.querySelector('span');
            if (spanV) spanV.textContent = currentEvent.venue;
            else venueEl.textContent = currentEvent.venue;
        }

        var venueCardName = document.getElementById('venueCardName');
        if (venueCardName) venueCardName.textContent = currentEvent.venue;

        var descEl = document.getElementById('eventDesc');
        if (descEl) descEl.innerHTML = '<p>' + currentEvent.description + '</p>';

        var posterEl = document.getElementById('eventPoster');
        if (posterEl) {
            posterEl.src = currentEvent.image;
            posterEl.alt = currentEvent.title;
        }

        var backdropEl = document.getElementById('eventBackdrop');
        if (backdropEl) {
            backdropEl.style.backgroundImage = 'url(' + currentEvent.image + ')';
        }
    }

    // ===== RENDER TICKET TIERS =====
    function renderTicketTiers() {
        var container = document.getElementById('ticketTiersList');
        if (!container) return;
        container.innerHTML = '';

        currentEvent.tiers.forEach(function (tier, i) {
            var row = document.createElement('div');
            row.className = 'ticket-tier-row';
            row.innerHTML =
                '<div class="tier-info">' +
                    '<div class="tier-name">' + tier.name + '</div>' +
                    '<div class="tier-price">KES ' + Number(tier.price).toLocaleString() + '</div>' +
                '</div>' +
                '<div class="tier-controls">' +
                    '<button type="button" class="tier-btn tier-minus" data-index="' + i + '" aria-label="Decrease quantity">−</button>' +
                    '<span class="tier-qty" id="tierQty' + i + '">0</span>' +
                    '<button type="button" class="tier-btn tier-plus" data-index="' + i + '" aria-label="Increase quantity">+</button>' +
                '</div>';
            container.appendChild(row);
        });

        // Bind +/- buttons
        container.querySelectorAll('.tier-minus').forEach(function (btn) {
            btn.addEventListener('click', function () {
                var idx = parseInt(this.dataset.index, 10);
                if (quantities[idx] > 0) {
                    quantities[idx]--;
                    updateTierDisplay(idx);
                    updateSummary();
                }
            });
        });

        container.querySelectorAll('.tier-plus').forEach(function (btn) {
            btn.addEventListener('click', function () {
                var idx = parseInt(this.dataset.index, 10);
                if (quantities[idx] < 10) {
                    quantities[idx]++;
                    updateTierDisplay(idx);
                    updateSummary();
                }
            });
        });
    }

    function updateTierDisplay(idx) {
        var el = document.getElementById('tierQty' + idx);
        if (el) el.textContent = quantities[idx];
    }

    // ===== UPDATE SUMMARY =====
    function updateSummary() {
        var totalTickets = 0;
        var totalAmount = 0;
        currentEvent.tiers.forEach(function (tier, i) {
            totalTickets += quantities[i];
            totalAmount += quantities[i] * tier.price;
        });

        var countEl = document.getElementById('summaryTicketCount');
        if (countEl) countEl.textContent = totalTickets;

        var totalEl = document.getElementById('summaryTotal');
        if (totalEl) totalEl.textContent = 'KES ' + totalAmount.toLocaleString();

        var purchaseBtn = document.getElementById('purchaseTicketBtn');
        if (purchaseBtn) {
            purchaseBtn.disabled = totalTickets === 0;
            if (totalTickets === 0) {
                purchaseBtn.textContent = 'Select tickets';
            } else {
                purchaseBtn.textContent = 'Buy ' + totalTickets + ' Ticket' + (totalTickets > 1 ? 's' : '') + ' — KES ' + totalAmount.toLocaleString();
            }
        }
    }

    // ===== CHECKOUT MODAL =====
    function bindCheckoutEvents() {
        var overlay = document.getElementById('checkoutOverlay');
        var purchaseBtn = document.getElementById('purchaseTicketBtn');
        var closeBtn = document.getElementById('checkoutCloseBtn');
        var cancelBtn = document.getElementById('checkoutCancelBtn');
        var payBtn = document.getElementById('checkoutPayBtn');
        if (!overlay || !purchaseBtn) return;

        // Open checkout
        purchaseBtn.addEventListener('click', function () {
            if (this.disabled) return;
            populateCheckoutModal();
            overlay.classList.add('open');
            document.body.style.overflow = 'hidden';
        });

        // Close checkout
        function closeCheckout() {
            overlay.classList.remove('open');
            document.body.style.overflow = '';
            var statusEl = document.getElementById('paymentStatusOverlay');
            if (statusEl) statusEl.style.display = 'none';
        }
        if (closeBtn) closeBtn.addEventListener('click', closeCheckout);
        if (cancelBtn) cancelBtn.addEventListener('click', closeCheckout);
        overlay.addEventListener('click', function (e) {
            if (e.target === overlay) closeCheckout();
        });

        // Handle Pay button
        if (payBtn) {
            payBtn.onclick = function (e) {
                e.preventDefault();
                initiatePayment();
            };
        }
    }

    function populateCheckoutModal() {
        var nameEl = document.getElementById('checkoutEventName');
        if (nameEl) nameEl.textContent = currentEvent.title;

        var ticketList = document.getElementById('checkoutTicketList');
        if (ticketList) {
            ticketList.innerHTML = '';
            var totalAmount = 0;
            currentEvent.tiers.forEach(function (tier, i) {
                if (quantities[i] > 0) {
                    var subtotal = quantities[i] * tier.price;
                    totalAmount += subtotal;
                    var item = document.createElement('div');
                    item.className = 'checkout-ticket-item';
                    item.innerHTML = '<span>' + quantities[i] + 'x ' + tier.name + '</span><span>KES ' + subtotal.toLocaleString() + '</span>';
                    ticketList.appendChild(item);
                }
            });

            var totalEl = document.getElementById('checkoutTotalAmount');
            if (totalEl) totalEl.textContent = 'KES ' + totalAmount.toLocaleString();
        }
    }

    // ===== PAYMENT INITIATION =====
    // ===== PAYMENT INITIATION =====
    async function initiatePayment() {
        var phoneInput = document.getElementById('checkoutPhone');
        var nameInput = document.getElementById('checkoutName');
        var emailInput = document.getElementById('checkoutEmail');

        var phone = phoneInput ? phoneInput.value.trim() : '';
        var name = nameInput ? nameInput.value.trim() : 'Guest';
        var email = emailInput ? emailInput.value.trim() : 'guest@madfun.online';

        if (!phone || phone.length < 9) {
            alert('Please enter a valid M-Pesa phone number (e.g. 0712345678)');
            if (phoneInput) phoneInput.focus();
            return;
        }

        var totalAmount = 0;
        var totalQty = 0;
        currentEvent.tiers.forEach(function (tier, i) {
            totalQty += quantities[i];
            totalAmount += quantities[i] * tier.price;
        });

        if (totalAmount <= 0 || totalQty <= 0) {
            alert('Please select at least one ticket before proceeding.');
            return;
        }

        // Generate a unique transaction reference upfront
        var txRef = 'MF-' + Math.floor(100000 + Math.random() * 900000);

        // Show status overlay
        var statusOverlay = document.getElementById('paymentStatusOverlay');
        var statusText = document.getElementById('paymentStatusText');
        if (statusOverlay) statusOverlay.style.display = 'flex';
        if (statusText) statusText.textContent = 'Sending M-Pesa prompt to ' + phone + '...';

        var dbInstance = (typeof db !== 'undefined') ? db : ((typeof firebase !== 'undefined' && firebase.firestore) ? firebase.firestore() : null);
        var txDocRef = null;

        // 1. STORE IN DB IMMEDIATELY WHEN STK PUSH IS INITIATED (Regardless of success/failure)
        if (dbInstance) {
            try {
                var initialTx = {
                    timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                    phone: phone,
                    email: email,
                    amount: totalAmount,
                    reference: txRef,
                    status: 'Pending',
                    errorMessage: '',
                    eventTitle: currentEvent ? currentEvent.title : 'Live Event',
                    eventId: currentEvent ? currentEvent.id : null,
                    customerName: name,
                    quantity: totalQty
                };

                // Add to 'transactions' collection (actively watched by /admin.html)
                txDocRef = await dbInstance.collection('transactions').add(initialTx);
                console.log('STK push transaction recorded in Firestore:', txDocRef.id, 'Reference:', txRef);
            } catch (dbErr) {
                console.error('Error recording initial transaction to Firestore:', dbErr);
            }
        }

        // 2. DISPATCH STK PUSH TO /api/pay
        try {
            const res = await fetch('/api/pay', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    phone: phone,
                    amount: totalAmount,
                    reference: txRef,
                    eventName: currentEvent ? currentEvent.title : 'Live Event',
                    customerName: name,
                    email: email,
                    quantity: totalQty
                })
            });

            let data = null;
            try {
                data = await res.json();
            } catch (jsonErr) {
                data = { error: 'Invalid response from payment server' };
            }

            // Check if response is successful
            const isOk = res.ok && !data.error && data.status !== 'failed' && data.ResponseCode !== '1';

            if (isOk) {
                // Payment API accepted STK Push request
                if (statusText) statusText.textContent = 'Please check your phone and enter your M-Pesa PIN to complete payment.';

                if (txDocRef) {
                    try {
                        await txDocRef.update({
                            status: 'Success',
                            gatewayResponse: data || null
                        });
                    } catch (uErr) {
                        console.warn('Could not update transaction status to Success:', uErr);
                    }
                }

                // Also maintain user bookings record
                if (dbInstance) {
                    try {
                        await dbInstance.collection('bookings').add({
                            eventId: currentEvent ? currentEvent.id : null,
                            eventTitle: currentEvent ? currentEvent.title : 'Live Event',
                            customerName: name,
                            phone: phone,
                            email: email,
                            ticketsCount: totalQty,
                            totalAmount: totalAmount,
                            amount: totalAmount,
                            reference: txRef,
                            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                            status: 'COMPLETED'
                        });
                    } catch (bErr) {
                        console.warn('Could not record booking:', bErr);
                    }
                }

                setTimeout(function () {
                    showSuccessScreen(name, phone, totalQty, totalAmount, txRef);
                }, 3500);

            } else {
                // API returned error or failure
                var errMsg = data.error || data.message || data.errorMessage || ('Payment error (' + res.status + ')');
                console.error('MegaPay API error:', errMsg, data);

                if (txDocRef) {
                    try {
                        await txDocRef.update({
                            status: 'Failed',
                            errorMessage: errMsg,
                            gatewayResponse: data || null
                        });
                    } catch (uErr) {
                        console.warn('Could not update transaction status to Failed:', uErr);
                    }
                }

                // If in demo/unconfigured environment, simulate completion after recording the error
                if (res.status === 500 && errMsg.includes('Payment service not configured')) {
                    if (statusText) statusText.textContent = 'Demo Mode: API keys not configured. Simulating order completion...';
                    setTimeout(function () {
                        showSuccessScreen(name, phone, totalQty, totalAmount, txRef);
                    }, 2500);
                } else {
                    if (statusText) statusText.textContent = 'M-Pesa error: ' + errMsg;
                    setTimeout(function () {
                        if (statusOverlay) statusOverlay.style.display = 'none';
                        alert('Payment failed: ' + errMsg);
                    }, 3000);
                }
            }

        } catch (err) {
            console.error('Network or client exception during STK push:', err);
            var networkErrMsg = err.message || 'Network request failed';

            // Mark transaction as failed in Firestore immediately
            if (txDocRef) {
                try {
                    await txDocRef.update({
                        status: 'Failed',
                        errorMessage: networkErrMsg
                    });
                } catch (uErr) {
                    console.warn('Could not update transaction status to Failed on catch:', uErr);
                }
            }

            // Fallback simulated flow for local/static environments without /api/pay serverless handler
            if (statusText) statusText.textContent = 'Local preview: Order logged to database. Simulating ticket generation...';
            setTimeout(function () {
                showSuccessScreen(name, phone, totalQty, totalAmount, txRef);
            }, 2000);
        }
    }

    function showSuccessScreen(name, phone, count, amount, reference) {
        var statusOverlay = document.getElementById('paymentStatusOverlay');
        if (statusOverlay) statusOverlay.style.display = 'none';

        var successOverlay = document.getElementById('successOverlay');
        if (successOverlay) {
            successOverlay.style.display = 'flex';
            var ref = reference || ('MF-' + Math.floor(100000 + Math.random() * 900000));
            var refEl = document.getElementById('successTicketRef');
            if (refEl) refEl.textContent = ref;
        }
    }

})();
