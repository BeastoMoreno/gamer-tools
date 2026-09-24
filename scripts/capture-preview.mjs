import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
await mkdir('test-results', { recursive: true });
const browser = await chromium.launch({ channel: 'msedge' });
const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });
page.on('pageerror', (error) => console.error('PAGE ERROR:', error.message));
page.on('console', (message) => {
  if (message.type() === 'error') console.error('CONSOLE ERROR:', message.text());
});
await page.goto('http://127.0.0.1:3000');
await page.getByRole('button', { name: 'Add Aim trainer to favorites' }).waitFor();
await page.waitForFunction(
  () => !document.querySelector('.favorite-button')?.hasAttribute('disabled'),
);
await page.evaluate(() => document.fonts.ready);
await page.screenshot({
  path: 'test-results/dashboard-desktop.png',
  fullPage: true,
  animations: 'disabled',
});
await page.setViewportSize({ width: 390, height: 844 });
await page.screenshot({
  path: 'test-results/dashboard-mobile.png',
  fullPage: true,
  animations: 'disabled',
});
console.log('Desktop and mobile previews saved in test-results.');
await browser.close();
