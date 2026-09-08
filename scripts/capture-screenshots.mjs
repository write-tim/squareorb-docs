import puppeteer from 'puppeteer-core';
import path from 'path';
import fs from 'fs';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const PLAYGROUND_URL = 'https://playground.wordpress.net/?plugin=square-orb&blueprint-url=https%3A%2F%2Fwordpress.org%2Fplugins%2Fwp-json%2Fplugins%2Fv1%2Fplugin%2Fsquare-orb%2Fblueprint.json%3Frev%3D3685831%26lang%3Den_US';
const OUTPUT_DIR = path.resolve('public/images');

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function hideDock(page) {
  await page.addStyleTag({
    content: `
      nav[class*="dock"], [class*="_dock_"], [id*="dock"], [id*="bottom-bar"], [class*="bottom-bar"] {
        display: none !important;
        opacity: 0 !important;
        visibility: hidden !important;
        pointer-events: none !important;
      }
    `
  });
  await page.evaluate(() => {
    document.querySelectorAll('nav[class*="dock"], [class*="_dock_"]').forEach(el => el.remove());
  });
}

async function getWpFrame(page) {
  const startTime = Date.now();
  while (Date.now() - startTime < 120000) {
    for (const f of page.frames()) {
      if (f.url().includes('wp-admin') || f.url().includes('scope:')) {
        try {
          const el = await f.$('#wpadminbar');
          if (el) return f;
        } catch (e) {}
      }
    }
    await sleep(1500);
  }
  throw new Error('WP Frame not found within timeout');
}

async function main() {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  console.log('Launching Chrome with 1600x1100 Retina 2x viewport...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-web-security',
      '--disable-features=IsolateOrigins,site-per-process',
      '--window-size=1600,1100',
    ],
    defaultViewport: { width: 1600, height: 1100, deviceScaleFactor: 2 },
  });

  try {
    const page = await browser.newPage();
    console.log('Navigating to WordPress Playground blueprint...');
    await page.goto(PLAYGROUND_URL, { waitUntil: 'networkidle2', timeout: 90000 });

    console.log('Waiting for interactive WordPress admin...');
    let wpFrame = await getWpFrame(page);
    console.log('Connected to WordPress admin at:', wpFrame.url());

    await hideDock(page);
    await sleep(1000);

    // Helper to navigate frame and take screenshot
    async function capturePage(targetUrl, filename) {
      console.log(`Navigating to ${targetUrl}...`);
      await wpFrame.evaluate((u) => { window.location.href = u; }, targetUrl);
      await sleep(3500);
      wpFrame = await getWpFrame(page);
      await hideDock(page);
      await sleep(1000);
      const filePath = path.join(OUTPUT_DIR, filename);
      await page.screenshot({ path: filePath });
      console.log(`✓ Saved ${filename}`);
    }

    // 1. Global Tab
    await capturePage('admin.php?page=square-orb&tab=sitewide', 'control-panel-global.png');

    // 2. Presentation Defaults Tab
    await capturePage('admin.php?page=square-orb&tab=global', 'control-panel-presentation.png');

    // 3. Authentication Tab
    await capturePage('admin.php?page=square-orb&tab=auth', 'control-panel-auth.png');

    // 4. Import Media Tab
    await capturePage('admin.php?page=square-orb&tab=import', 'control-panel-import.png');

    // 5. Enable telemetry and capture Analytics tab
    console.log('Navigating to Global tab to enable telemetry...');
    await wpFrame.evaluate(() => { window.location.href = 'admin.php?page=square-orb&tab=sitewide'; });
    await sleep(3500);
    wpFrame = await getWpFrame(page);
    
    console.log('Turning on telemetry checkbox and saving...');
    await wpFrame.evaluate(() => {
      const checkbox = document.querySelector('input[name="sorb_enable_telemetry"]');
      if (checkbox && !checkbox.checked) checkbox.click();
      const submit = document.querySelector('#submit, input[type="submit"]');
      if (submit) submit.click();
    });
    await sleep(4000);
    wpFrame = await getWpFrame(page);

    await capturePage('admin.php?page=square-orb&tab=analytics', 'control-panel-analytics.png');

    // 6. Block Editor (post-new.php)
    console.log('Navigating to post-new.php...');
    await wpFrame.evaluate(() => { window.location.href = 'post-new.php'; });
    await sleep(6000);
    wpFrame = await getWpFrame(page);

    // Dismiss welcome tour dialogs
    await wpFrame.evaluate(() => {
      const closeButtons = document.querySelectorAll('button[aria-label="Close dialog"], button[aria-label="Close"]');
      closeButtons.forEach(b => b.click());
    });
    await sleep(1500);

    // Insert block and select
    console.log('Inserting square-orb/gallery block...');
    await wpFrame.evaluate(() => {
      if (window.wp && window.wp.blocks && window.wp.data) {
        const block = window.wp.blocks.createBlock('square-orb/gallery');
        window.wp.data.dispatch('core/block-editor').insertBlock(block);
        window.wp.data.dispatch('core/block-editor').selectBlock(block.clientId);
        try {
          window.wp.data.dispatch('core/edit-post').openGeneralSidebar('edit-post/block');
        } catch (e) {}
      }
    });
    await sleep(3000);
    await hideDock(page);
    await sleep(1000);
    await page.screenshot({ path: path.join(OUTPUT_DIR, 'canvas-block-editor.png') });
    console.log('✓ Saved canvas-block-editor.png');

    console.log('ALL SCREENSHOTS CAPTURED FLAWLESSLY!');
  } catch (err) {
    console.error('Error during capture:', err);
  } finally {
    await browser.close();
  }
}

main();
