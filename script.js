document.addEventListener('DOMContentLoaded', () => {

    /* ==========================================================
       1. LOADING SCREEN
       ========================================================== */
    const loader = document.getElementById('loader');

    window.addEventListener('load', () => {
        setTimeout(() => loader.classList.add('hidden'), 1600);
    });

    /* ==========================================================
       2. SCROLL PROGRESS BAR
       ========================================================== */
    const scrollBar = document.getElementById('scrollProgress');

    window.addEventListener('scroll', () => {
        const total = document.documentElement.scrollHeight - window.innerHeight;
        scrollBar.style.width = ((window.scrollY / total) * 100) + '%';
    }, { passive: true });

    /* ==========================================================
       3. PARTICLE BACKGROUND
       ========================================================== */
    const canvas = document.getElementById('particle-canvas');
    const ctx = canvas.getContext('2d');
    let W, H;

    function resizeCanvas() {
        W = canvas.width = window.innerWidth;
        H = canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resizeCanvas, { passive: true });
    resizeCanvas();

    class Particle {
        constructor() { this.reset(true); }

        reset(randomY = false) {
            this.x = Math.random() * W;
            this.y = randomY ? Math.random() * H : Math.random() * H;
            this.size = Math.random() * 1.5 + 0.3;
            this.vx = (Math.random() - 0.5) * 0.25;
            this.vy = (Math.random() - 0.5) * 0.25;
            this.opacity = Math.random() * 0.35 + 0.05;
            const r = Math.random();
            this.color = r > 0.65
                ? `rgba(168,85,247,${this.opacity})`
                : r > 0.35
                    ? `rgba(6,182,212,${this.opacity})`
                    : `rgba(244,114,182,${this.opacity})`;
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;
            if (this.x < 0 || this.x > W) this.vx *= -1;
            if (this.y < 0 || this.y > H) this.vy *= -1;
        }

        draw() {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    const PARTICLE_COUNT = window.innerWidth < 768 ? 50 : 110;
    const particles = Array.from({ length: PARTICLE_COUNT }, () => new Particle());

    function drawBackground() {
        const g = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, Math.max(W, H) * 0.7);
        g.addColorStop(0, '#0d1224');
        g.addColorStop(1, '#050816');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, H);
    }

    function animateParticles() {
        drawBackground();

        for (let i = 0; i < particles.length; i++) {
            particles[i].update();
            particles[i].draw();

            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 110) {
                    ctx.beginPath();
                    ctx.strokeStyle = `rgba(168,85,247,${0.05 * (1 - dist / 110)})`;
                    ctx.lineWidth = 0.5;
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }
        }

        requestAnimationFrame(animateParticles);
    }

    animateParticles();

    /* ==========================================================
       4. NAVBAR — SCROLL STATE & ACTIVE LINK TRACKING
       ========================================================== */
    const navbar   = document.getElementById('navbar');
    const sections = document.querySelectorAll('section[id]');
    const navAnchors = document.querySelectorAll('.nav-links a');

    window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 60);

        let current = '';
        sections.forEach(sec => {
            if (window.scrollY >= sec.offsetTop - 220) current = sec.id;
        });
        navAnchors.forEach(a => {
            a.classList.toggle('active', a.getAttribute('href') === `#${current}`);
        });
    }, { passive: true });

    /* ==========================================================
       5. MOBILE MENU
       ========================================================== */
    const hamburger  = document.getElementById('hamburger');
    const mobileMenu = document.getElementById('mobileMenu');

    hamburger.addEventListener('click', () => {
        const open = mobileMenu.classList.toggle('open');
        hamburger.classList.toggle('active', open);
        document.body.style.overflow = open ? 'hidden' : '';
    });

    document.querySelectorAll('.mobile-menu a').forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.remove('open');
            hamburger.classList.remove('active');
            document.body.style.overflow = '';
        });
    });

    /* ==========================================================
       6. TYPEWRITER EFFECT
       ========================================================== */
    const typeEl = document.getElementById('typewriter');
    const words  = ['Software Engineer.', 'AI Developer.', 'Game Developer.', 'Problem Solver.'];
    let wIdx = 0, cIdx = 0, deleting = false;

    function typeEffect() {
        const word = words[wIdx];
        typeEl.textContent = deleting
            ? word.substring(0, cIdx - 1)
            : word.substring(0, cIdx + 1);

        deleting ? cIdx-- : cIdx++;

        let speed = deleting ? 40 : 90;
        if (!deleting && cIdx === word.length) { speed = 2000; deleting = true; }
        else if (deleting && cIdx === 0) { deleting = false; wIdx = (wIdx + 1) % words.length; speed = 400; }

        setTimeout(typeEffect, speed);
    }
    setTimeout(typeEffect, 900);

    /* ==========================================================
       7. SCROLL REVEAL
       ========================================================== */
    const revealEls = document.querySelectorAll('.reveal-section');
    const barFills  = document.querySelectorAll('.bar-fill');

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('visible');
            if (entry.target.id === 'skills') {
                barFills.forEach(fill => { fill.style.width = fill.getAttribute('data-width'); });
            }
        });
    }, { threshold: 0.1 });

    revealEls.forEach(el => revealObserver.observe(el));

    /* ==========================================================
       8. ANIMATED STAT COUNTERS
       ========================================================== */
    const statNums = document.querySelectorAll('.stat-num');

    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting || entry.target.dataset.counted) return;
            entry.target.dataset.counted = '1';
            const target = parseInt(entry.target.getAttribute('data-target'), 10);
            const start  = performance.now();

            function tick(now) {
                const p = Math.min((now - start) / 1400, 1);
                const eased = 1 - Math.pow(1 - p, 3);
                entry.target.textContent = Math.floor(eased * target);
                if (p < 1) requestAnimationFrame(tick);
            }
            requestAnimationFrame(tick);
        });
    }, { threshold: 0.6 });

    statNums.forEach(el => counterObserver.observe(el));

    /* ==========================================================
       9. 3D CARD TILT
       ========================================================== */
    if (window.matchMedia('(pointer: fine)').matches) {
        document.querySelectorAll('.tilt-card').forEach(card => {
            const wrap = card.closest('.perspective-wrap') || card;

            wrap.addEventListener('mousemove', e => {
                const r  = card.getBoundingClientRect();
                const rx = ((e.clientY - r.top  - r.height / 2) / (r.height / 2)) * -5;
                const ry = ((e.clientX - r.left  - r.width  / 2) / (r.width  / 2)) *  5;
                card.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg) scale3d(1.015,1.015,1.015)`;
            });

            wrap.addEventListener('mouseleave', () => {
                card.style.transform = 'rotateX(0deg) rotateY(0deg) scale3d(1,1,1)';
            });
        });
    }

    /* ==========================================================
       10. BACK TO TOP
       ========================================================== */
    const backToTop = document.getElementById('backToTop');

    window.addEventListener('scroll', () => {
        backToTop.classList.toggle('visible', window.scrollY > 500);
    }, { passive: true });

    backToTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
});
