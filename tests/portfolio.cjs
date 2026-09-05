const assert = require('node:assert/strict');
const path = require('node:path');
const os = require('node:os');
const fs = require('node:fs');
const http = require('node:http');
const { pathToFileURL } = require('node:url');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');

const root = path.resolve(__dirname, '..');
const url = pathToFileURL(path.join(root, 'index.html')).href;
const output = path.join(os.tmpdir(), 'portfolio-review');
fs.mkdirSync(output, { recursive: true });

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const server = http.createServer((request, response) => {
    const routes = { '/': 'index.html', '/style.css': 'style.css', '/script.js': 'script.js', '/assets/cv.pdf': 'assets/cv.pdf' };
    const file = routes[request.url];
    if (!file) { response.writeHead(404); response.end(); return; }
    const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.pdf': 'application/pdf' };
    response.setHeader('Content-Type', types[path.extname(file)]);
    fs.createReadStream(path.join(root, file)).pipe(response);
  });
  try {
    const page = await browser.newPage({ reducedMotion: 'reduce' });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    for (const [width, height] of [[320, 700], [390, 844], [768, 1024], [1440, 900], [1920, 1080]]) {
      await page.setViewportSize({ width, height });
      await page.goto(url);
      await page.evaluate(async () => {
        await Promise.all([...document.images].map(image => image.decode()));
      });
      const checks = await page.evaluate(() => ({
        overflow: document.documentElement.scrollWidth > innerWidth,
        images: [...document.images].every(image => image.naturalWidth > 0),
        brokenAnchors: [...document.querySelectorAll('a[href^="#"]')].filter(link => !document.querySelector(link.hash)).length,
        ctaBottom: document.querySelector('.actions').getBoundingClientRect().bottom,
      }));
      assert.equal(checks.overflow, false, `Overflow at ${width}`);
      assert.equal(checks.images, true);
      assert.equal(checks.brokenAnchors, 0);
      assert.ok(checks.ctaBottom < height, `Hero actions below viewport at ${width}`);
      await page.screenshot({ path: path.join(output, `home-${width}.png`) });
      await page.screenshot({ path: path.join(output, `full-${width}.png`), fullPage: true });
      if (width < 701) {
        const toggle = page.locator('.menu-toggle');
        await toggle.click();
        assert.equal(await toggle.getAttribute('aria-expanded'), 'true');
        await page.keyboard.press('Escape');
        assert.equal(await toggle.getAttribute('aria-expanded'), 'false');
        assert.equal(await toggle.evaluate(element => document.activeElement === element), true);
        await toggle.click();
        await page.locator('#navigation a[href="#contact"]').click();
        assert.equal(await toggle.getAttribute('aria-expanded'), 'false');
        assert.equal(await page.locator('#navigation').isVisible(), false);
      }
      console.log(`PASS layout, images, links, hero actions: ${width}x${height}`);
    }
    await page.evaluate(() => {
      Object.defineProperty(navigator, 'clipboard', { configurable: true, value: {
        writeText: async text => { window.copiedText = text; },
      } });
    });
    await page.locator('.copy-email').click();
    assert.equal(await page.evaluate(() => window.copiedText), 'ambawattaj@gmail.com');
    assert.equal(await page.locator('.copy-status').textContent(), 'Email address copied.');
    await page.evaluate(() => { navigator.clipboard.writeText = async () => { throw new Error('Denied'); }; });
    await page.locator('.copy-email').click();
    assert.match(await page.locator('.copy-status').textContent(), /Select the email/);
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    await page.goto(`http://127.0.0.1:${server.address().port}`);
    const download = page.waitForEvent('download');
    await page.locator('.nav-cv').click();
    assert.equal((await download).suggestedFilename(), 'C_J_Ambawatta_CV.pdf');
    const cv = fs.readFileSync(path.join(root, 'assets/cv.pdf'));
    assert.equal(cv.subarray(0, 4).toString(), '%PDF');
    assert.deepEqual(errors, []);
    const noJS = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
    const fallback = await noJS.newPage();
    await fallback.goto(url);
    assert.equal(await fallback.locator('#navigation').isVisible(), true);
    assert.equal(await fallback.locator('#projects').isVisible(), true);
    await noJS.close();
    console.log('PASS email copy/fallback, CV download, no-JS navigation, no script errors');
    console.log(`Screenshots: ${output}`);
  } finally {
    await browser.close();
    if (server.listening) await new Promise(resolve => server.close(resolve));
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
