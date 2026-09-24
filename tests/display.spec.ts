import { test, expect } from '@playwright/test';
import { frameSummary, panelDimensions } from '../lib/display-tests';

test('display calculations preserve timing outliers and validate physical inputs', () => {
  expect(frameSummary([10, 10, 10, 10, 40])).toMatchObject({
    fps: 63,
    medianMs: 10,
    p95Ms: 40,
    longestMs: 40,
    longIntervals: 1,
    samples: 5,
  });
  expect(frameSummary([])).toBeNull();
  expect(frameSummary([0, 16])).toBeNull();
  expect(panelDimensions(2560, 1440, 27)?.ppi).toBeCloseTo(108.79, 1);
  expect(panelDimensions(0, 1440, 27)).toBeNull();
  expect(panelDimensions(2560, 1440, NaN)).toBeNull();
});

test('display library switches every check, retains notes, filters, and exports observations', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/tools/display');
  await expect(page.locator('.display-test-card')).toHaveCount(12);
  const names = await page.locator('.display-test-card strong').allTextContents();
  for (const name of names) {
    await page
      .getByRole('button', { name: new RegExp(`^${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`) })
      .click();
    await expect(page.locator('.display-preview-panel h2')).toHaveText(name);
    await expect(page.locator('.display-instructions li')).toHaveCount(3);
  }
  await page.getByRole('button', { name: /^Shadow detail/ }).click();
  await page.getByLabel('Inspection finding', { exact: true }).selectOption('check-again');
  await page.getByLabel('Inspection notes', { exact: true }).fill('Dark steps merge in preset A.');
  await page.getByRole('button', { name: /^Highlight detail/ }).click();
  await page.getByRole('button', { name: /^Shadow detail/ }).click();
  await expect(page.getByLabel('Inspection notes', { exact: true })).toHaveValue(
    'Dark steps merge in preset A.',
  );
  await expect(page.locator('.display-reviewed')).toHaveText('1/12 reviewed');
  await page
    .getByRole('group', { name: 'Display test category' })
    .getByRole('button', { name: 'Motion', exact: true })
    .click();
  await expect(page.locator('.display-test-card')).toHaveCount(1);
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export inspection' }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe('iamgamer-display-report.json');
  const stream = await download.createReadStream();
  let text = '';
  for await (const chunk of stream!) text += chunk;
  const report = JSON.parse(text);
  expect(report.checks).toHaveLength(12);
  expect(report.checks.find((item: { id: string }) => item.id === 'black')).toMatchObject({
    finding: 'check-again',
    notes: 'Dark steps merge in preset A.',
  });
  expect(report.screen.dpr).toBeGreaterThan(0);
  expect(report.frameTiming).toBeNull();
  expect(errors).toEqual([]);
});

test('display fullscreen fills the viewport, hides controls, cycles colors, and restores focus', async ({
  page,
}) => {
  await page.goto('/tools/display');
  await page.getByRole('button', { name: 'Inspect red pixels' }).click();
  const dialog = page.getByRole('dialog', { name: 'Dead & stuck pixels viewer' });
  await expect(dialog.locator('.display-solid')).toHaveCSS('background-color', 'rgb(255, 0, 0)');
  await dialog.getByRole('button', { name: 'Fullscreen', exact: true }).click();
  await expect.poll(() => page.evaluate(() => Boolean(document.fullscreenElement))).toBe(true);
  const bounds = await dialog.locator('.display-solid').boundingBox();
  const size = await page.evaluate(() => ({ width: innerWidth, height: innerHeight }));
  expect(bounds?.x).toBe(0);
  expect(bounds?.y).toBe(0);
  expect(bounds?.width).toBe(size.width);
  expect(bounds?.height).toBe(size.height);
  await dialog.getByRole('button', { name: 'Hide controls' }).click();
  await expect(dialog.locator('.display-viewer-toolbar')).toBeHidden();
  await page.keyboard.press('ArrowRight');
  await expect(dialog.locator('.display-solid')).toHaveCSS('background-color', 'rgb(0, 255, 0)');
  await page.keyboard.press('h');
  await expect(dialog.locator('.display-viewer-toolbar')).toBeVisible();
  await dialog.getByRole('button', { name: 'Exit', exact: true }).click();
  await expect(dialog).not.toBeVisible();
  await expect.poll(() => page.evaluate(() => document.fullscreenElement === null)).toBe(true);
  await expect(page.getByRole('button', { name: 'Inspect red pixels' })).toBeFocused();
});

test('display motion is opt-in, pauses, and stops on tab hiding; pacing samples export', async ({
  page,
}) => {
  await page.clock.install();
  await page.goto('/tools/display');
  await page.getByRole('button', { name: /^Motion & ghosting/ }).click();
  const marker = page.locator('.motion-object').first();
  const initial = await marker.evaluate((node) => getComputedStyle(node).transform);
  await page.clock.runFor(250);
  expect(await marker.evaluate((node) => getComputedStyle(node).transform)).toBe(initial);
  await page.getByRole('button', { name: 'Start motion', exact: true }).click();
  await page.clock.runFor(300);
  expect(await marker.evaluate((node) => getComputedStyle(node).transform)).not.toBe(initial);
  await page.getByRole('button', { name: 'Pause motion', exact: true }).click();
  const paused = await marker.evaluate((node) => getComputedStyle(node).transform);
  await page.clock.runFor(300);
  expect(await marker.evaluate((node) => getComputedStyle(node).transform)).toBe(paused);
  await page.getByRole('button', { name: 'Measure frame rate' }).click();
  await page.clock.runFor(5150);
  await expect(page.locator('.timing-result > strong')).toHaveText(/\d+/);
  await expect(page.locator('.frame-time-chart')).toBeVisible();
  await page.getByRole('button', { name: 'Measure frame rate' }).click();
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, get: () => true });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await expect(
    page.getByText('Measurement canceled because the tab was hidden.', { exact: false }),
  ).toBeVisible();
  await expect(page.getByRole('button', { name: 'Measure frame rate' })).toBeEnabled();
});

test('display touch coverage ignores mouse clicks and tracks multiple touch contacts', async ({
  browser,
}) => {
  const context = await browser.newContext({
    hasTouch: true,
    viewport: { width: 1100, height: 900 },
  });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:3000/tools/display');
  await page.getByRole('button', { name: /^Touch coverage/ }).click();
  const grid = page.locator('.display-touch-grid');
  await grid.scrollIntoViewIfNeeded();
  await grid.click();
  await expect(grid.locator('.visited')).toHaveCount(0);
  const box = (await grid.boundingBox())!;
  const cdp = await context.newCDPSession(page);
  const a = { x: box.x + box.width / 16, y: box.y + box.height / 12, id: 1 };
  const b = { x: box.x + (box.width * 15) / 16, y: box.y + (box.height * 11) / 12, id: 2 };
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [a, b] });
  await expect(page.locator('.display-contact-count')).toHaveText('2 active contacts');
  await expect(grid.locator('.visited')).toHaveCount(2);
  await cdp.send('Input.dispatchTouchEvent', {
    type: 'touchMove',
    touchPoints: [{ ...a, x: box.x + (box.width * 15) / 16 }, b],
  });
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await expect(page.locator('.display-contact-count')).toHaveText('0 active contacts');
  expect(await grid.locator('.visited').count()).toBeGreaterThan(2);
  await page.getByRole('button', { name: 'Reset coverage' }).click();
  await expect(grid.locator('.visited')).toHaveCount(0);
  await context.close();
});

test('display lab fits mobile and validates the manual density calculator', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/tools/display');
  await expect(page.locator('.display-test-card')).toHaveCount(12);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await expect(page.locator('.display-size-results')).toContainText('108.8');
  await page.getByLabel('Native width (pixels)').fill('0');
  await expect(page.locator('.display-size [role="alert"]')).toBeVisible();
  await page.getByLabel('Native width (pixels)').fill('3840');
  await page.getByLabel('Native height (pixels)').fill('2160');
  await expect(page.locator('.display-size-results')).toContainText('163.2');
  await page.getByRole('button', { name: /^Shadow detail/ }).click();
  await page.getByRole('button', { name: 'Open test viewer' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByRole('button', { name: 'Exit', exact: true }).click();
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await page.screenshot({ path: 'test-results/display-mobile.png', fullPage: true });
});
