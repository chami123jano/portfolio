(() => {
  const canvas = document.querySelector('#hero-canvas');
  if (!canvas || !window.THREE) return;
  const hero = document.querySelector('.hero');
  const button = document.querySelector('.motion-toggle');
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true }); }
  catch { return; }
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, .1, 100);
  camera.position.z = 11;
  scene.add(new THREE.HemisphereLight(0xd9fff0, 0x283045, 2.8));
  const key = new THREE.DirectionalLight(0xffffff, 2.4);
  key.position.set(3, 5, 5);
  scene.add(key);
  const fill = new THREE.DirectionalLight(0xffa788, 1.6);
  fill.position.set(-4, -2, 3);
  scene.add(fill);
  const sculpture = new THREE.Group();
  const geometry = new THREE.TorusKnotGeometry(1.35, .34, 180, 24, 2, 3);
  const material = new THREE.MeshStandardMaterial({ color: 0x94dfc5, metalness: .4, roughness: .4 });
  const knot = new THREE.Mesh(geometry, material);
  sculpture.add(knot);
  const wire = new THREE.LineSegments(new THREE.WireframeGeometry(new THREE.TorusKnotGeometry(1.36, .36, 85, 8, 2, 3)), new THREE.LineBasicMaterial({color:0xddfff3,transparent:true,opacity:.11}));
  sculpture.add(wire);
  scene.add(sculpture);
  let frame = 0, angle = 0, previous = 0, visible = true;
  let paused = preference.matches;
  const pointer = { x: 0, y: 0 };
  function render(now = 0) {
    frame = 0;
    const dt = previous ? Math.min((now - previous) / 1000, .05) : 0;
    previous = now;
    if (!paused) angle += dt * .32;
    sculpture.rotation.set(.4 + Math.sin(angle * .6) * .22 + pointer.y, angle + pointer.x, -.3);
    renderer.render(scene, camera);
    if (!paused && visible && !document.hidden) frame = requestAnimationFrame(render);
  }
  function sync() {
    cancelAnimationFrame(frame); frame = 0; previous = 0;
    button.setAttribute('aria-pressed', String(paused));
    button.setAttribute('aria-label', paused ? 'Play animation' : 'Pause animation');
    button.title = paused ? 'Play animation' : 'Pause animation';
    button.textContent = paused ? '\u25b6' : '\u275a\u275a';
    hero.classList.toggle('motion-paused', paused);
    render();
  }
  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
    const mobile = hero.clientWidth <= 700;
    const viewWidth = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z * camera.aspect;
    sculpture.position.set(mobile ? 0 : viewWidth * .25, mobile ? 0 : .15, 0);
    sculpture.scale.setScalar(mobile ? 1.25 : Math.min(.82, viewWidth * .055));
    sync();
  }
  hero.addEventListener('pointermove', event => {
    if (paused || event.pointerType === 'touch') return;
    const bounds = hero.getBoundingClientRect();
    pointer.x = (event.clientX - bounds.left - bounds.width / 2) / bounds.width * .4;
    pointer.y = (event.clientY - bounds.top - bounds.height / 2) / bounds.height * .3;
  });
  hero.addEventListener('pointerleave', () => { pointer.x = pointer.y = 0; });
  button.hidden = false;
  button.addEventListener('click', () => { paused = !paused; sync(); });
  preference.addEventListener('change', () => { paused = preference.matches; sync(); });
  document.addEventListener('visibilitychange', sync);
  new IntersectionObserver(entries => { visible = entries[0].isIntersecting; sync(); }).observe(hero);
  new ResizeObserver(resize).observe(hero);
  resize();
})();
