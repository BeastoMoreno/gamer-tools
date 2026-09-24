import { chromium } from '@playwright/test';
const browser = await chromium.launch({ channel: 'msedge' });
const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });
const errors = [];
page.on('pageerror', (error) => errors.push(error.message));
for (const [slug, ready] of [
  ['sign-in', '.social-signin'],
  ['tools/mouse', '.gaming-mouse-model'],
  ['tools/aim', '.aim-viewport canvas'],
]) {
  await page.goto(`http://127.0.0.1:3000/${slug}`);
  await page.locator(ready).waitFor();
  await page
    .getByRole('button', { name: 'Add to favorites' })
    .isVisible()
    .then(async (visible) => {
      if (visible) await page.getByRole('button', { name: 'Add to favorites' }).waitFor();
    });
  await page.screenshot({
    path: `test-results/${slug.replace('/', '-')}-desktop.png`,
    fullPage: true,
  });
  if (slug === 'tools/aim') {
    await page.getByRole('button', { name: 'Start training' }).click();
    await page.getByRole('button', { name: 'Hit target' }).waitFor();
    await page.screenshot({ path: 'test-results/aim-active.png', fullPage: true });
    await page.keyboard.press('Escape');
  }
}
await page.setViewportSize({ width: 390, height: 844 });
await page.goto('http://127.0.0.1:3000/sign-up');
await page.locator('.account-notice').waitFor();
await page.screenshot({ path: 'test-results/signup-mobile.png', fullPage: true });
console.log(JSON.stringify({ errors }));
await browser.close();
