const puppeteer = require('puppeteer');

(async () => {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
    page.on('pageerror', error => console.log('BROWSER ERROR:', error.message));
    page.on('requestfailed', request => console.log('NETWORK ERROR:', request.url(), request.failure().errorText));

    console.log('Navigating to vercel app...');
    await page.goto('https://dayflow-peach-xi.vercel.app/', { waitUntil: 'networkidle0' });
    console.log('Done loading. Checking root content...');
    
    const rootHtml = await page.$eval('#root', el => el.innerHTML);
    console.log('ROOT HTML:', rootHtml.trim() ? 'Has Content' : 'Empty');
    
    await browser.close();
  } catch (err) {
    console.error('SCRIPT ERROR:', err);
  }
})();
