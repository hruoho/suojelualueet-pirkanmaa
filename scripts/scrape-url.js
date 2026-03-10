#!/usr/bin/env node
// Fetch text content from a URL using headless Chromium (handles SPAs).
// Usage: node scripts/scrape-url.js <url> [<url2> ...]
const { chromium } = require('playwright');

async function scrape(url) {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 20000 });
    const text = await page.evaluate(() => {
      const el = document.querySelector('main') || document.querySelector('article') || document.body;
      return el.innerText;
    });
    return text.trim();
  } finally {
    await browser.close();
  }
}

(async () => {
  const urls = process.argv.slice(2);
  if (!urls.length) {
    console.error('Usage: node scripts/scrape-url.js <url> [<url2> ...]');
    process.exit(1);
  }
  for (const url of urls) {
    if (urls.length > 1) console.log(`\n=== ${url} ===\n`);
    console.log(await scrape(url));
  }
})();
