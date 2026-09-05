const assert = require('node:assert/strict');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const { pathToFileURL } = require('node:url');
const path = require('node:path');

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  try {
    for (const width of [390, 1440]) {
      const page = await browser.newPage({ viewport: { width, height: 900 } });
      await page.goto(pathToFileURL(path.resolve(__dirname, '../index.html')).href);
      await page.waitForTimeout(1100);
      const canvas = page.locator('#hero-canvas');
      const pixels = await canvas.evaluate(element => new Promise(resolve => {
        requestAnimationFrame(() => {
          const copy = document.createElement('canvas');
          copy.width = element.width; copy.height = element.height;
          const context = copy.getContext('2d');
          context.drawImage(element, 0, 0);
          const data = context.getImageData(0, 0, copy.width, copy.height).data;
          let visible = 0;
          for (let i = 3; i < data.length; i += 4) if (data[i] > 0) visible++;
          resolve(visible);
        });
      }));
      assert.ok(pixels > 1000, `Blank scene at ${width}`);
      const first = await canvas.screenshot();
      await page.waitForTimeout(500);
      assert.ok(!first.equals(await canvas.screenshot()), 'Scene is not moving');
      await page.locator('.motion-toggle').click();
      const paused = await canvas.screenshot();
      await page.waitForTimeout(300);
      assert.ok(paused.equals(await canvas.screenshot()), 'Pause failed');
      await page.locator('.motion-toggle').click();
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.waitForFunction(() => document.querySelector('.motion-toggle').getAttribute('aria-pressed') === 'true');
      assert.equal(await page.locator('.motion-toggle').getAttribute('aria-pressed'), 'true');
      console.log(`PASS ${width}: ${pixels} rendered pixels, animation, pause, reduced motion`);
      await page.close();
    }
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
