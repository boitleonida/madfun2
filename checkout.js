/**
 * checkout.js
 * Handles event detail page: ticket selection, totals, checkout modal, and MegaPay STK push payment.
 */
(function () {
    'use strict';

    // ===== EVENT DATA STORE =====
    const EVENTS_DB = [
        {
            id: 1,
            title: "Nakuru Kids Festival Season 3",
            org: "Destiny Mentors Events",
            date: "25 Jul, 2026",
            venue: "Kunste Hotels Gardens, Nakuru",
            image: "https://gigs.madfun.com/images/events/kutiit-culture.jpg",
            description: "Get ready for the biggest kids festival in Nakuru! An action-packed day of games, talent showcases, face painting, bouncing castles, and live performances. Fun for the whole family!",
            tiers: [
                { name: "Advance", price: 500 },
                { name: "Gate", price: 800 },
                { name: "Group of 5", price: 2000 }
            ]
        },
        {
            id: 2,
            title: "Nexora Social Club - Tropical Beach Experience",
            org: "Nexora Social Club",
            date: "26 Jul, 2026",
            venue: "Tropical Beach, Ruiru",
            image: "https://gigs.madfun.com/images/events/3rd-service.jpg",
            description: "Join the ultimate tropical beach experience at Ruiru. Live DJs, cocktails, beach games and good vibes all day long. Dress code: Shades of Pink & Yellow.",
            tiers: [
                { name: "Ruiru Residents", price: 1000 },
                { name: "General Advance", price: 1500 },
                { name: "Gate", price: 2000 },
                { name: "VIP", price: 3000 }
            ]
        },
        {
            id: 3,
            title: "African Twist: The Soundtrack Of Kenya's Independence",
            org: "Ketebul Music",
            date: "30 Jul, 2026",
            venue: "Alliance Francaise Nairobi",
            image: "https://gigs.madfun.com/images/events/call-experience.jpg",
            description: "A musical journey celebrating Kenya's independence through the sounds that shaped a nation. Featuring legendary Kenyan artists and new voices in a night of unforgettable performances.",
            tiers: [
                { name: "Regular", price: 1000 },
                { name: "VIP", price: 3000 }
            ]
        },
        {
            id: 4,
            title: "The Bloom Experience Kenya 2026",
            org: "Our Bloom Nation",
            date: "01 Aug, 2026",
            venue: "Hilton Building, CBD Nairobi",
            image: "https://gigs.madfun.com/images/events/cocktail-runs.jpg",
            description: "The Bloom Experience is a premier networking and lifestyle event bringing together Kenya's brightest minds, creators, and entrepreneurs under one roof.",
            tiers: [
                { name: "Early Bird", price: 1500 },
                { name: "Regular", price: 2500 },
                { name: "VIP", price: 5000 }
            ]
        },
        {
            id: 5,
            title: "Kikuyu Comedy Night (Nairobi Edition)",
            org: "Kymly Creatives",
            date: "25 Jul, 2026",
            venue: "Sarakasi Dome, Nairobi",
            image: "https://gigs.madfun.com/images/events/what-we-never-said.jpg",
            description: "A hilarious night of Kikuyu stand-up comedy featuring the best comedians from the central region. Come laugh, enjoy great food, and celebrate our culture.",
            tiers: [
                { name: "Regular", price: 500 },
                { name: "VIP", price: 1500 }
            ]
        },
        {
            id: 6,
            title: "Mugithi & Rhumba Night",
            org: "Vibanda Village",
            date: "25 Jul, 2026",
            venue: "Vibanda Village",
            image: "https://madfun.com/assets/img/banners/oak-grove-desktop.jpeg",
            description: "An electrifying night of Mugithi and Rhumba music at the heart of Vibanda Village. Enjoy live bands, great food, and an unforgettable atmosphere.",
            tiers: [
                { name: "Advance", price: 300 },
                { name: "Gate", price: 500 }
            ]
        },
        {
            id: 7,
            title: "Ollin Youth Summit",
            org: "Ollin Youth Summit",
            date: "25 Jul, 2026",
            venue: "Kerugoya Stadium",
            image: "https://madfun.com/assets/img/banners/ttnt6-desktop.webp",
            description: "A dynamic youth summit bringing together young leaders for interactive sessions, networking, worship, and more. Featuring speakers, workshops, and live music.",
            tiers: [
                { name: "Standard", price: 200 },
                { name: "Premium", price: 500 }
            ]
        },
        {
            id: 8,
            title: "Rhythm And Rhumba Festival",
            org: "Signature Events",
            date: "26 Jul, 2026",
            venue: "Avery Lounge, Athi River",
            image: "https://madfun.com/assets/img/banners/maitu-desktop.webp",
            description: "The biggest Rhumba festival in Athi River! Featuring top Congolese and Kenyan Rhumba bands in one epic night of music, dance, and celebration.",
            tiers: [
                { name: "Advance", price: 1000 },
                { name: "Gate", price: 1500 },
                { name: "VIP Table (4 pax)", price: 8000 }
            ]
        }
    ];

    // ===== STATE =====
    let currentEvent = null;
    let quantities = []; // parallel to currentEvent.tiers

    // ===== INIT =====
    document.addEventListener('DOMContentLoaded', function () {
        // Load username
        var userName = localStorage.getItem('madfun_user') || 'Tyler';
        var nameEl = document.getElementById('userNameSpan');
        if (nameEl) nameEl.innerText = userName;

        // User dropdown
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

        // Parse event ID from URL
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

        // Try fetching from Firestore first
        if (typeof db !== 'undefined') {
            db.collection('events').doc(String(rawEventId)).get().then(function(doc) {
                if (doc.exists) {
                    setupEventData(doc.data());
                } else {
                    // Try by string match in collection
                    db.collection('events').get().then(function(snapshot) {
                        var found = null;
                        snapshot.forEach(function(d) {
                            if (d.id === rawEventId || d.data().title === rawEventId) {
                                found = d.data();
                            }
                        });
                        if (found) {
                            setupEventData(found);
                        } else {
                            fallbackLocal();
                        }
                    }).catch(fallbackLocal);
                }
            }).catch(fallbackLocal);
        } else {
            fallbackLocal();
        }

        function fallbackLocal() {
            var fallback = EVENTS_DB.find(function (e) { return e.id === numericId; }) || EVENTS_DB[0];
            setupEventData(fallback);
        }
    });

    // ===== RENDER EVENT DETAIL =====
    function renderEventDetail() {
        document.title = currentEvent.title + ' - Madfun';
        document.getElementById('eventTitle').textContent = currentEvent.title;
        document.getElementById('eventDate').querySelector('span').textContent = currentEvent.date;
        document.getElementById('eventVenue').querySelector('span').textContent = currentEvent.venue;
        document.getElementById('eventDesc').innerHTML = '<p>' + currentEvent.description + '</p>';
        var posterEl = document.getElementById('eventPoster');
        posterEl.src = currentEvent.image || 'https://madfun.com/assets/img/banners/oak-grove-desktop.jpeg';
        posterEl.onerror = function() { this.src = 'https://madfun.com/assets/img/banners/oak-grove-desktop.jpeg'; };
        posterEl.alt = currentEvent.title;
    }

    // ===== RENDER TICKET TIERS =====
    function renderTicketTiers() {
        var container = document.getElementById('ticketTiersList');
        container.innerHTML = '';

        currentEvent.tiers.forEach(function (tier, i) {
            var row = document.createElement('div');
            row.className = 'ticket-tier-row';
            row.innerHTML =
                '<div class="tier-info">' +
                    '<h3 class="tier-name">' + tier.name + '</h3>' +
                    '<p class="tier-price">KES ' + tier.price.toLocaleString() + '</p>' +
                '</div>' +
                '<div class="tier-controls">' +
                    '<button class="tier-btn tier-minus" data-index="' + i + '">-</button>' +
                    '<span class="tier-qty" id="tierQty' + i + '">0</span>' +
                    '<button class="tier-btn tier-plus" data-index="' + i + '">+</button>' +
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
        document.getElementById('tierQty' + idx).textContent = quantities[idx];
    }

    // ===== UPDATE SUMMARY =====
    function updateSummary() {
        var totalTickets = 0;
        var totalAmount = 0;
        currentEvent.tiers.forEach(function (tier, i) {
            totalTickets += quantities[i];
            totalAmount += quantities[i] * tier.price;
        });

        document.getElementById('summaryTicketCount').textContent = totalTickets;
        document.getElementById('summaryTotal').textContent = 'KES. ' + totalAmount.toLocaleString();

        var purchaseBtn = document.getElementById('purchaseTicketBtn');
        purchaseBtn.disabled = totalTickets === 0;
    }

    // ===== CHECKOUT MODAL =====
    function bindCheckoutEvents() {
        var overlay = document.getElementById('checkoutOverlay');
        var purchaseBtn = document.getElementById('purchaseTicketBtn');
        var closeBtn = document.getElementById('checkoutCloseBtn');
        var cancelBtn = document.getElementById('checkoutCancelBtn');
        var payBtn = document.getElementById('checkoutPayBtn');
        var mpesaOption = document.getElementById('mpesaOption');
        var visaOption = document.getElementById('visaOption');
        var visaTag = document.getElementById('visaUnavailableTag');

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
            // Reset payment status
            document.getElementById('paymentStatusOverlay').style.display = 'none';
            document.getElementById('paymentSpinner').style.display = '';
            document.getElementById('paymentResult').style.display = 'none';
        }
        closeBtn.addEventListener('click', closeCheckout);
        cancelBtn.addEventListener('click', closeCheckout);
        overlay.addEventListener('click', function (e) {
            if (e.target === overlay) closeCheckout();
        });

        // Payment method selection
        mpesaOption.addEventListener('click', function () {
            mpesaOption.classList.add('selected');
            visaOption.classList.remove('selected');
            visaTag.style.display = 'none';
        });

        visaOption.addEventListener('click', function () {
            // Show unavailable message
            visaTag.style.display = 'inline';
            // Animate it
            visaTag.classList.remove('shake');
            void visaTag.offsetWidth; // trigger reflow
            visaTag.classList.add('shake');
        });

        // Pay button
        payBtn.addEventListener('click', function () {
            handlePayment();
        });

        // Done button on payment result
        document.getElementById('paymentDoneBtn').addEventListener('click', function () {
            closeCheckout();
        });
    }

    function populateCheckoutModal() {
        document.getElementById('checkoutEventName').textContent = currentEvent.title;

        // Ticket list
        var listEl = document.getElementById('checkoutTicketList');
        listEl.innerHTML = '';
        var totalAmount = 0;

        currentEvent.tiers.forEach(function (tier, i) {
            if (quantities[i] > 0) {
                var cost = quantities[i] * tier.price;
                totalAmount += cost;
                var row = document.createElement('div');
                row.className = 'checkout-ticket-row';
                row.innerHTML =
                    '<span>' + quantities[i] + ' x ' + tier.name + '</span>' +
                    '<span>KES ' + cost.toLocaleString() + '</span>';
                listEl.appendChild(row);
            }
        });

        document.getElementById('checkoutTotal').textContent = 'KES. ' + totalAmount.toLocaleString();

        // Pre-fill phone from localStorage
        var storedPhone = localStorage.getItem('madfun_phone') || '';
        document.getElementById('checkoutPhone').value = storedPhone;

        // Pre-fill email from localStorage
        var storedEmail = localStorage.getItem('madfun_email') || '';
        document.getElementById('checkoutEmail').value = storedEmail;
    }

    // ===== HANDLE PAYMENT =====
    function handlePayment() {
        var phone = document.getElementById('checkoutPhone').value.trim();
        var email = document.getElementById('checkoutEmail').value.trim();

        // Validate phone
        if (!phone) {
            alert('Please enter your M-Pesa phone number.');
            document.getElementById('checkoutPhone').focus();
            return;
        }

        // Calculate total
        var totalAmount = 0;
        currentEvent.tiers.forEach(function (tier, i) {
            totalAmount += quantities[i] * tier.price;
        });

        if (totalAmount <= 0) return;

        // Save contact for next time
        localStorage.setItem('madfun_phone', phone);
        if (email) localStorage.setItem('madfun_email', email);

        // Show loading overlay
        var statusOverlay = document.getElementById('paymentStatusOverlay');
        var spinner = document.getElementById('paymentSpinner');
        var result = document.getElementById('paymentResult');

        statusOverlay.style.display = 'flex';
        spinner.style.display = 'flex';
        result.style.display = 'none';

        // Build reference
        var reference = 'MADFUN-' + Date.now();

        // Call our serverless API
        fetch('/api/pay', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                phone: phone,
                amount: totalAmount,
                reference: reference
            })
        })
        .then(function (res) { return res.json(); })
        .then(function (data) {
            spinner.style.display = 'none';
            result.style.display = 'flex';

            var txData = {
                phone: phone,
                email: email,
                amount: totalAmount,
                reference: reference,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            };

            if (data.error) {
                txData.status = 'Failed';
                txData.errorMessage = data.error;
                db.collection('transactions').add(txData).catch(function(e) { console.error('Error logging to Firestore', e); });

                showPaymentResult(false, 'Payment Failed', data.error);
            } else {
                txData.status = 'Pending'; // Typically STK push is pending until callback, but we consider it successfully pushed
                db.collection('transactions').add(txData).catch(function(e) { console.error('Error logging to Firestore', e); });

                showPaymentResult(
                    true,
                    'STK Push Sent!',
                    'Please check your phone and enter your M-Pesa PIN to complete the payment of KES ' + totalAmount.toLocaleString() + '.'
                );
            }
        })
        .catch(function (err) {
            spinner.style.display = 'none';
            result.style.display = 'flex';
            
            db.collection('transactions').add({
                phone: phone,
                email: email,
                amount: totalAmount,
                reference: reference,
                status: 'Failed',
                errorMessage: 'Connection Error',
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            }).catch(function(e) { console.error('Error logging to Firestore', e); });

            showPaymentResult(false, 'Connection Error', 'Could not reach the payment server. Please try again.');
        });
    }

    function showPaymentResult(success, title, message) {
        var iconEl = document.getElementById('paymentResultIcon');
        var titleEl = document.getElementById('paymentResultTitle');
        var msgEl = document.getElementById('paymentResultMessage');

        if (success) {
            iconEl.innerHTML = '<svg viewBox="0 0 24 24" width="64" height="64" fill="#22c55e"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>';
            iconEl.className = 'payment-result-icon success';
        } else {
            iconEl.innerHTML = '<svg viewBox="0 0 24 24" width="64" height="64" fill="#ef4444"><path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"/></svg>';
            iconEl.className = 'payment-result-icon error';
        }
        titleEl.textContent = title;
        msgEl.textContent = message;
    }

})();
