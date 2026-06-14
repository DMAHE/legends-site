/* =========================================================================
   LEGENDS IT — Vanilla JavaScript
   Features: sticky header, mobile menu, reveal-on-scroll, carousel
   (button + drag), hero particle animation, dynamic year.
   No external libraries.
   ========================================================================= */
(function () {
    'use strict';

    /* ----------------------------- Sticky header ----------------------------- */
    const header = document.getElementById('siteHeader');
    const onScroll = () => {
        if (window.scrollY > 20) header.classList.add('scrolled');
        else header.classList.remove('scrolled');
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    /* ----------------------------- Mobile menu toggle ----------------------------- */
    const hamburger = document.getElementById('hamburger');
    const nav = document.getElementById('mainNav');

    const closeMenu = () => {
        hamburger.classList.remove('active');
        nav.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
    };

    hamburger.addEventListener('click', () => {
        const isOpen = nav.classList.toggle('open');
        hamburger.classList.toggle('active', isOpen);
        hamburger.setAttribute('aria-expanded', String(isOpen));
    });

    // Close the menu when a nav link is clicked (mobile)
    nav.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', closeMenu);
    });

    // Close on Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeMenu();
    });

    /* ----------------------------- Reveal on scroll ----------------------------- */
    const revealEls = document.querySelectorAll('.reveal');
    if ('IntersectionObserver' in window) {
        const io = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    io.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
        revealEls.forEach((el) => io.observe(el));
    } else {
        revealEls.forEach((el) => el.classList.add('visible'));
    }

    /* ----------------------------- Carousel (button + drag) ----------------------------- */
    const viewport = document.getElementById('carouselViewport');
    const track = document.getElementById('carouselTrack');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');

    if (viewport && track) {
        const getStep = () => {
            const card = track.querySelector('.story-card');
            if (!card) return 380;
            const gap = parseInt(getComputedStyle(track).gap, 10) || 28;
            return card.getBoundingClientRect().width + gap;
        };

        const maxScroll = () => track.scrollWidth - viewport.clientWidth;

        let position = 0;
        const apply = () => {
            position = Math.max(0, Math.min(position, maxScroll()));
            track.style.transform = `translateX(${-position}px)`;
            updateButtons();
        };
        const updateButtons = () => {
            if (prevBtn) prevBtn.disabled = position <= 0;
            if (nextBtn) nextBtn.disabled = position >= maxScroll() - 1;
        };

        nextBtn && nextBtn.addEventListener('click', () => { position += getStep(); apply(); });
        prevBtn && prevBtn.addEventListener('click', () => { position -= getStep(); apply(); });

        // Drag / swipe support
        let isDown = false, startX = 0, startPos = 0, moved = false;
        const pointerDown = (x) => { isDown = true; moved = false; startX = x; startPos = position; viewport.classList.add('dragging'); track.style.transition = 'none'; };
        const pointerMove = (x) => {
            if (!isDown) return;
            const delta = x - startX;
            if (Math.abs(delta) > 4) moved = true;
            position = startPos - delta;
            track.style.transform = `translateX(${-Math.max(0, Math.min(position, maxScroll()))}px)`;
        };
        const pointerUp = () => {
            if (!isDown) return;
            isDown = false;
            viewport.classList.remove('dragging');
            track.style.transition = '';
            apply();
        };

        viewport.addEventListener('mousedown', (e) => pointerDown(e.clientX));
        window.addEventListener('mousemove', (e) => pointerMove(e.clientX));
        window.addEventListener('mouseup', pointerUp);

        viewport.addEventListener('touchstart', (e) => pointerDown(e.touches[0].clientX), { passive: true });
        viewport.addEventListener('touchmove', (e) => pointerMove(e.touches[0].clientX), { passive: true });
        viewport.addEventListener('touchend', pointerUp);

        // Prevent click navigation right after a drag
        track.addEventListener('click', (e) => { if (moved) e.preventDefault(); }, true);

        window.addEventListener('resize', apply);
        apply();
    }

    /* ----------------------------- Dynamic year ----------------------------- */
    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    /* ----------------------------- Hero particle animation ----------------------------- */
    const canvas = document.getElementById('heroParticles');
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (canvas && canvas.getContext && !prefersReduced) {
        const ctx = canvas.getContext('2d');
        let width, height, particles, raf;
        const COUNT = 60;
        const LINK_DIST = 130;

        const resize = () => {
            width = canvas.width = canvas.offsetWidth;
            height = canvas.height = canvas.offsetHeight;
        };

        const init = () => {
            particles = Array.from({ length: COUNT }, () => ({
                x: Math.random() * width,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                r: Math.random() * 1.8 + 0.6
            }));
        };

        const draw = () => {
            ctx.clearRect(0, 0, width, height);

            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];
                p.x += p.vx; p.y += p.vy;
                if (p.x < 0 || p.x > width) p.vx *= -1;
                if (p.y < 0 || p.y > height) p.vy *= -1;

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(37, 99, 255, 0.5)';
                ctx.fill();

                for (let j = i + 1; j < particles.length; j++) {
                    const q = particles[j];
                    const dx = p.x - q.x, dy = p.y - q.y;
                    const dist = Math.hypot(dx, dy);
                    if (dist < LINK_DIST) {
                        ctx.beginPath();
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(q.x, q.y);
                        ctx.strokeStyle = `rgba(37, 99, 255, ${0.12 * (1 - dist / LINK_DIST)})`;
                        ctx.lineWidth = 1;
                        ctx.stroke();
                    }
                }
            }
            raf = requestAnimationFrame(draw);
        };

        const start = () => { resize(); init(); cancelAnimationFrame(raf); draw(); };
        window.addEventListener('resize', start);
        start();
    }
})();
