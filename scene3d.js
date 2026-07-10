/* ==========================================================================
   scene3d.js — Three.js background for the portfolio hero
   --------------------------------------------------------------------------
   Renders into #particle-canvas (transparent, sits at z-index:-2 behind the
   page). Three layers:
     #1  A depth particle field (replaces the old 2D canvas particles)
     #2  An interactive wireframe "core" that reacts to the mouse
     #3  A scroll-driven camera that dollies + pans through the scene,
         plus mouse parallax
   Loaded as an ES module via an import map (see index.html). No build step.
   ========================================================================== */

import * as THREE from 'three';

const canvas = document.getElementById('particle-canvas');
if (canvas) init(canvas);

function init(canvas) {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* Palette — mirrors the CSS custom properties in style.css */
    const COL = {
        bg:        0x050816,
        primary:   0xa855f7, // purple
        secondary: 0x06b6d4, // cyan
        accent:    0xf472b6, // pink
    };

    /* ---- Renderer ---------------------------------------------------------- */
    let renderer;
    try {
        renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    } catch (e) {
        // WebGL unavailable — leave the dark body background in place and bail.
        return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(COL.bg, 0.022);

    const camera = new THREE.PerspectiveCamera(
        60, window.innerWidth / window.innerHeight, 0.1, 200
    );
    camera.position.set(0, 0, 14);

    /* ---- #1  Particle field ------------------------------------------------ */
    const COUNT = window.innerWidth < 768 ? 1600 : 4200;
    const positions = new Float32Array(COUNT * 3);
    const colors    = new Float32Array(COUNT * 3);
    const palette   = [
        new THREE.Color(COL.primary),
        new THREE.Color(COL.secondary),
        new THREE.Color(COL.accent),
    ];
    for (let i = 0; i < COUNT; i++) {
        positions[i * 3]     = (Math.random() - 0.5) * 70;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 70;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 50 - 10;
        const c = palette[(Math.random() * palette.length) | 0];
        colors[i * 3]     = c.r;
        colors[i * 3 + 1] = c.g;
        colors[i * 3 + 2] = c.b;
    }
    const fieldGeo = new THREE.BufferGeometry();
    fieldGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    fieldGeo.setAttribute('color',    new THREE.BufferAttribute(colors, 3));
    const fieldMat = new THREE.PointsMaterial({
        size: 0.13,
        vertexColors: true,
        transparent: true,
        opacity: 0.9,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true,
    });
    const field = new THREE.Points(fieldGeo, fieldMat);
    scene.add(field);

    /* ---- #2  Interactive core --------------------------------------------- */
    const core = new THREE.Group();
    scene.add(core);

    const shellMat = new THREE.MeshBasicMaterial({
        color: COL.primary, wireframe: true, transparent: true, opacity: 0.55,
    });
    const shell = new THREE.Mesh(new THREE.IcosahedronGeometry(2.6, 1), shellMat);
    core.add(shell);

    const innerMat = new THREE.MeshBasicMaterial({
        color: COL.secondary, wireframe: true, transparent: true, opacity: 0.35,
    });
    const inner = new THREE.Mesh(new THREE.IcosahedronGeometry(1.5, 0), innerMat);
    core.add(inner);

    /* ---- Interaction state ------------------------------------------------- */
    const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
    if (window.matchMedia('(pointer: fine)').matches) {
        window.addEventListener('pointermove', (e) => {
            pointer.tx = e.clientX / window.innerWidth - 0.5;
            pointer.ty = e.clientY / window.innerHeight - 0.5;
        }, { passive: true });
    }

    let scrollProgress = 0; // 0 at top → 1 at bottom of page
    function onScroll() {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        scrollProgress = max > 0 ? Math.min(window.scrollY / max, 1) : 0;
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    /* ---- Resize ------------------------------------------------------------ */
    function onResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(window.innerWidth, window.innerHeight);
    }
    window.addEventListener('resize', onResize, { passive: true });

    /* ---- Animation loop (pauses when the tab is hidden) -------------------- */
    const clock = new THREE.Clock();
    let rafId = null;

    function frame() {
        rafId = requestAnimationFrame(frame);
        const t = clock.getElapsedTime();

        // ease the pointer toward its target for smooth parallax
        pointer.x += (pointer.tx - pointer.x) * 0.05;
        pointer.y += (pointer.ty - pointer.y) * 0.05;

        // #1 — slow drift of the whole field
        field.rotation.y = t * 0.02;
        field.rotation.x = t * 0.008;

        // #2 — core spins and leans toward the cursor, gentle pulse
        core.rotation.x = t * 0.15 + pointer.y * 0.6;
        core.rotation.y = t * 0.20 + pointer.x * 0.6;
        inner.rotation.x = -t * 0.28;
        inner.rotation.y = -t * 0.22;
        core.scale.setScalar(1 + Math.sin(t * 1.4) * 0.04);
        // fade the core out as you scroll past the hero
        shellMat.opacity = 0.55 * (1 - scrollProgress * 0.9);
        innerMat.opacity = 0.35 * (1 - scrollProgress * 0.9);

        // #3 — scroll-driven camera: dolly in + pan down through the scene
        const targetZ = 14 - scrollProgress * 9;
        const targetY = -scrollProgress * 7;
        camera.position.z += (targetZ - camera.position.z) * 0.06;
        camera.position.y += (targetY - camera.position.y) * 0.06;
        camera.position.x += (pointer.x * 3 - camera.position.x) * 0.05; // mouse parallax
        camera.lookAt(0, camera.position.y * 0.35, 0);

        renderer.render(scene, camera);
    }

    function start() { if (rafId === null) { clock.start(); frame(); } }
    function stop()  { if (rafId !== null) { cancelAnimationFrame(rafId); rafId = null; } }

    document.addEventListener('visibilitychange', () => {
        document.hidden ? stop() : start();
    });

    if (reduceMotion) {
        renderer.render(scene, camera); // one static frame, no loop
    } else {
        start();
    }
}
