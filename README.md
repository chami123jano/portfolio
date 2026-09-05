# C. J. Ambawatta - Portfolio

Open `index.html` in a browser. No installation, build step, API keys, or
backend is needed. Fonts, icons, portrait, and project previews are local.
External project links and email applications need their own connectivity.

## Updating the site

- Edit portfolio content and destination links in `index.html`.
- Edit the responsive design in `style.css`.
- Replace `assets/cv.pdf` to update every CV link.
- Project previews show JARVIS's test console and Lanka One's initial home
  screen. They are screenshots, not interactive demos.
- `scene3d.js` renders the interactive hero sculpture with a locally bundled
  Three.js build. Motion pauses offscreen, in background tabs, or with the
  pause control. Reduced-motion preferences are respected.
- Three.js is distributed under `assets/three-LICENSE`.
- Lucide icons are distributed under the license in `assets/lucide-LICENSE`.

The existing GitHub Pages workflow publishes changes pushed to `main`.

## Browser checks

With Playwright and Google Chrome installed:

```powershell
node tests/portfolio.cjs
node tests/scene.cjs
```

When reusing a Playwright installation from another project, set
`PLAYWRIGHT_MODULE` to its absolute module directory first. Tests cover five
viewport sizes, local images, anchors, mobile navigation, clipboard success
and failure states, the CV download over HTTP, and the no-JavaScript fallback.
Screenshots are written to the system temporary folder under `portfolio-review`.
