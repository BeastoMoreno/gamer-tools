import { test, expect } from '@playwright/test';
import { calibrationStep } from '../lib/aim-calibration';

test('calibration brackets nonlinear settings and rejects inconsistent measurements', () => {
  const lower = { setting: 20, distance: 80 };
  const upper = { setting: 60, distance: 10 };
  expect(calibrationStep(lower, upper, 40)).toEqual({ setting: 40, measured: false });
  expect(calibrationStep(upper, lower, 40)).toEqual({ setting: 40, measured: false });
  expect(calibrationStep(lower, upper, 80)).toEqual({ setting: 20, measured: true });
  expect(calibrationStep(lower, { setting: 40, distance: 30 }, 40)).toEqual({
    setting: 30,
    measured: false,
  });
  expect(calibrationStep(lower, upper, 100).error).toContain('between');
  expect(calibrationStep(lower, { setting: 40, distance: 90 }, 85).error).toContain(
    'Higher sensitivity',
  );
  expect(calibrationStep(lower, upper, NaN).error).toContain('positive');
});

test('15 and 60 second aim rounds exclude countdown shots and retain exact session metadata', async ({
  page,
}) => {
  await page.clock.install();
  await page.goto('/tools/aim');
  for (const duration of [15, 60]) {
    await page.getByRole('button', { name: `${duration} sec`, exact: true }).click();
    await page.getByRole('button', { name: /^(Start training|Play again)$/ }).click();
    await expect(page.locator('.range-countdown strong')).toHaveText('3');
    await page.locator('.aim-stage').click({ position: { x: 200, y: 200 } });
    await page.clock.fastForward(3050);
    await expect(page.locator('.range-go')).toBeVisible();
    await page.getByRole('button', { name: 'Hit target' }).click();
    await page.clock.fastForward(duration * 1000);
    await expect(page.getByText('1 targets. Your next step.')).toBeVisible();
    const latest = await page.evaluate(
      () => JSON.parse(localStorage.getItem('iamgamer.v1')!).results[0],
    );
    expect(latest.aim).toMatchObject({
      duration,
      hits: 1,
      shots: 1,
      accuracy: 100,
      mode: 'cursor',
    });
  }
  const results = await page.evaluate(
    () => JSON.parse(localStorage.getItem('iamgamer.v1')!).results,
  );
  expect(results).toHaveLength(2);
  await page.goto('/progress');
  await page.getByRole('button', { name: 'Aim trainer', exact: true }).click();
  await page.getByLabel('Round duration').selectOption('15');
  await expect(page.locator('.chart-column')).toHaveCount(1);
  await page.getByLabel('Aim mode').selectOption('mouse-look');
  await expect(page.locator('.chart-column')).toHaveCount(0);
});

test('dashboard, filters, favorites, search, and persistence', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /Your next level/ })).toBeVisible();
  await expect(page.locator('.tool-card')).toHaveCount(6);
  await page.getByRole('button', { name: 'Add Aim trainer to favorites' }).click();
  await page.getByRole('button', { name: 'Favorites', exact: true }).click();
  await expect(page.locator('.tool-card')).toHaveCount(1);
  await page.reload();
  await expect(
    page.getByRole('button', { name: 'Remove Aim trainer from favorites' }),
  ).toBeVisible();
  await page.keyboard.press('Control+k');
  await page.getByRole('textbox', { name: 'Search gaming tools' }).fill('sensitivity');
  await page.locator('.command-results a').click();
  await expect(page).toHaveURL(/tools\/sensitivity/);
  await expect(page.locator('dialog[open]')).toHaveCount(0);
  await page.goto('/tools');
  await page.getByRole('textbox', { name: 'Filter tools by name' }).fill('nothing-matches');
  await expect(page.getByText('No tools found.')).toBeVisible();
  await page.getByRole('button', { name: 'Clear filters' }).click();
  await expect(page.locator('.tool-card')).toHaveCount(12);
  expect(errors).toEqual([]);
});

test('sensitivity calculator validates inputs and converts DPI', async ({ page }) => {
  await page.goto('/tools/sensitivity');
  await expect(page.locator('.calculator-result').nth(0)).toContainText('320');
  await expect(page.locator('.calculator-result').nth(1)).toHaveText('0.2');
  await page.getByLabel('New mouse DPI').fill('400');
  await expect(page.locator('.calculator-result').nth(1)).toHaveText('0.8');
  await page.getByLabel('New mouse DPI').fill('0');
  await expect(page.getByText('Enter positive numbers', { exact: false })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Copy sensitivity' })).toBeDisabled();
});

test('keyboard captures combinations and releases on blur', async ({ page }) => {
  await page.goto('/tools/keyboard');
  await page.locator('.keyboard-test').focus();
  await page.keyboard.down('w');
  await page.keyboard.down('a');
  await expect(page.locator('.keyboard-key.pressed')).toHaveCount(2);
  await expect(page.locator('.metric-box').nth(2)).toContainText('2');
  await page.keyboard.up('w');
  await page.keyboard.up('a');
  await expect(page.locator('.keyboard-key.pressed')).toHaveCount(0);
  await expect(page.locator('.keyboard-key.seen')).toHaveCount(2);
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Reset keyboard' }).click();
  await expect(page.locator('.keyboard-key.seen')).toHaveCount(0);
});

test('mouse buttons and scroll are scoped to the test area', async ({ page }) => {
  await page.goto('/tools/mouse');
  const arena = page.locator('.mouse-arena');
  await arena.click();
  await arena.click({ button: 'right' });
  await arena.hover();
  await page.mouse.wheel(0, 180);
  await expect(page.getByText('Left: 1', { exact: true })).toBeVisible();
  await expect(page.getByText('Right: 1', { exact: true })).toBeVisible();
  await expect(page.getByText('Scroll delta: 180')).toBeVisible();
  await page.getByRole('button', { name: 'Reset test' }).click();
  await expect(page.locator('.metric-box').first()).toContainText('0');
});

test('click sprint saves a result once and progress persists', async ({ page }) => {
  await page.clock.install();
  await page.goto('/tools/cps');
  for (let index = 0; index < 10; index++) await page.locator('.training-field').click();
  await page.clock.runFor(5100);
  await expect(page.getByRole('heading', { name: '2.0 clicks per second' })).toBeVisible();
  await page.goto('/progress');
  await expect(page.locator('.result-table tbody tr')).toHaveCount(1);
  await expect(page.locator('.result-table')).toContainText('2 CPS');
  await page.reload();
  await expect(page.locator('.result-table tbody tr')).toHaveCount(1);
  const downloadEvent = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download all results as CSV' }).click();
  expect((await downloadEvent).suggestedFilename()).toBe('iamgamer-progress.csv');
});

test('reaction test rejects early input and saves five-round average', async ({ page }) => {
  await page.clock.install();
  await page.goto('/tools/reaction');
  const field = page.locator('.training-field');
  await field.click();
  await field.click();
  await expect(page.getByText('A little too eager!')).toBeVisible();
  for (let round = 0; round < 5; round++) {
    await field.click();
    await page.clock.runFor(4300);
    await expect(page.getByText('GO! Click now!')).toBeVisible();
    await field.click();
  }
  await expect(page.getByText('Five rounds complete.', { exact: false })).toBeVisible();
  await page.goto('/progress');
  await expect(page.locator('.result-table tbody tr')).toHaveCount(1);
  await expect(page.locator('.result-table')).toContainText('Reaction time');
});

test('aim drill scores hits and misses then saves once', async ({ page }) => {
  await page.clock.install();
  await page.goto('/tools/aim');
  await page.getByRole('button', { name: 'Start training' }).click();
  await expect(page.locator('.range-countdown strong')).toHaveText('3');
  await page.clock.runFor(3100);
  for (let index = 0; index < 3; index++)
    await page.getByRole('button', { name: 'Hit target' }).click();
  await page.locator('.aim-stage').click({ position: { x: 3, y: 160 } });
  await page.clock.fastForward(30_100);
  await expect(page.getByText('3 targets. Your next step.')).toBeVisible();
  await expect(page.locator('.aim-analysis .metric-box').first()).toContainText('75');
  await page.getByLabel('Competitive game').selectOption('PUBG PC');
  await page.getByLabel('Your preferred distance').fill('40');
  await page.getByLabel('Sample 1 sensitivity').fill('20');
  await page.getByLabel('Sample 1 distance').fill('60');
  await page.getByLabel('Sample 2 sensitivity').fill('60');
  await page.getByLabel('Sample 2 distance').fill('20');
  await page.getByRole('button', { name: 'Find next setting to test' }).click();
  await expect(page.locator('.calibration-result strong')).toHaveText('40');
  await page.getByLabel('Your preferred distance').fill('80');
  await expect(page.locator('.calibration-panel [role="alert"]')).toContainText('between');
  await page.goto('/progress');
  await expect(page.locator('.result-table tbody tr')).toHaveCount(1);
});

test('mouse side buttons light up without navigating, and navigation resumes after leaving', async ({
  page,
  context,
}) => {
  await page.goto('/tools');
  await page.locator('.card-link[href="/tools/mouse"]').click();
  await expect(page.locator('.gaming-mouse-model')).toBeVisible();
  const cdp = await context.newCDPSession(page);
  const box = (await page.locator('.mouse-arena').boundingBox())!;
  const point = { x: box.x + box.width / 2, y: box.y + box.height / 2 };
  for (const [button, mask, name] of [
    ['back', 8, 'Back'],
    ['forward', 16, 'Forward'],
  ] as const) {
    await cdp.send('Input.dispatchMouseEvent', {
      type: 'mousePressed',
      button,
      buttons: mask,
      clickCount: 1,
      ...point,
    });
    await expect(page.locator('.button-indicators .active')).toHaveText(`${name}: 1`);
    await expect(page.locator('path.mouse-button-surface[fill="#d5dde9"]')).toHaveCount(1);
    await cdp.send('Input.dispatchMouseEvent', {
      type: 'mouseReleased',
      button,
      buttons: 0,
      clickCount: 1,
      ...point,
    });
    await expect(page).toHaveURL(/\/tools\/mouse$/);
  }
  await page.getByRole('link', { name: 'Back to your toolkit' }).click();
  await expect(page).toHaveURL(/\/tools$/);
  await cdp.send('Input.dispatchMouseEvent', {
    type: 'mousePressed',
    button: 'back',
    buttons: 8,
    clickCount: 1,
    x: 800,
    y: 400,
  });
  await cdp.send('Input.dispatchMouseEvent', {
    type: 'mouseReleased',
    button: 'back',
    buttons: 0,
    clickCount: 1,
    x: 800,
    y: 400,
  });
  await expect(page).toHaveURL(/\/tools\/mouse$/);
});

test('fullscreen range locks the mouse and cancels cleanly on exit', async ({ page }) => {
  await page.goto('/tools/aim');
  await page.getByRole('button', { name: '15 sec', exact: true }).click();
  await page.getByRole('checkbox', { name: /Fullscreen mouse look/ }).check();
  await page.getByRole('button', { name: 'Start training' }).click();
  await expect
    .poll(() =>
      page.evaluate(() => Boolean(document.fullscreenElement && document.pointerLockElement)),
    )
    .toBe(true);
  await expect(page.locator('.range-countdown')).toBeVisible();
  await page.evaluate(() => document.exitPointerLock());
  await expect(page.getByRole('button', { name: 'Start training' })).toBeVisible();
  await expect.poll(() => page.evaluate(() => document.fullscreenElement === null)).toBe(true);
  expect(
    await page.evaluate(() => JSON.parse(localStorage.getItem('iamgamer.v1')!).results),
  ).toHaveLength(0);
});

test('account routes explain setup, validate reset links, and fit mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const path of [
    '/sign-in',
    '/sign-up',
    '/forgot-password',
    '/reset-password',
    '/profile',
    '/tools/mouse',
    '/tools/aim',
  ]) {
    await page.goto(path);
    await expect(page.locator('h1')).toBeVisible();
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      path,
    ).toBe(true);
  }
  await page.goto('/sign-in');
  await expect(page.getByText('Accounts aren’t connected', { exact: false })).toBeVisible();
  for (const provider of ['Google', 'Facebook', 'Apple'])
    await expect(
      page.getByRole('button', { name: `Continue with ${provider} (not enabled)` }),
    ).toBeDisabled();
  await page.goto('/auth/callback?code=invalid&next=https://example.com');
  await expect(page).toHaveURL(/\/sign-in\?error=callback$/);
  await expect(page.getByRole('alert')).toContainText('could not be verified');
  await page.goto('/profile');
  await expect(page.getByText('Your player card is waiting.')).toBeVisible();
});

test('timer pauses, resets, and completes exactly once', async ({ page }) => {
  await page.clock.install();
  await page.goto('/tools/session');
  await page.getByRole('button', { name: 'Start timer' }).click();
  await page.clock.runFor(2100);
  await page.getByRole('button', { name: 'Pause', exact: true }).click();
  const value = await page.getByRole('timer').textContent();
  await page.clock.runFor(3000);
  await expect(page.getByRole('timer')).toHaveText(value!);
  await page.getByRole('button', { name: 'Reset', exact: true }).click();
  await expect(page.getByRole('timer')).toHaveText('25:00');
  await page.getByRole('button', { name: 'Start timer' }).click();
  await page.clock.fastForward(25 * 60 * 1000 + 500);
  await expect(page.getByText('Focus session saved to your progress.')).toBeVisible();
  await page.clock.runFor(1000);
  await page.goto('/progress');
  await expect(page.locator('.result-table tbody tr')).toHaveCount(1);
});

test('display colors, crosshair download, and controller empty state', async ({ page }) => {
  await page.goto('/tools/display');
  await page.getByRole('button', { name: 'Inspect red pixels' }).click();
  await expect(page.locator('.pixel-overlay')).toBeVisible();
  await page.getByRole('button', { name: 'Next color' }).click();
  await expect(page.locator('.pixel-overlay')).toHaveCSS('background-color', 'rgb(0, 255, 0)');
  await page.getByRole('button', { name: 'Exit', exact: true }).click();
  await expect(page.locator('.pixel-overlay')).not.toBeVisible();
  await page.goto('/tools/crosshair');
  const downloadEvent = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export PNG' }).click();
  expect((await downloadEvent).suggestedFilename()).toBe('iamgamer-crosshair.png');
  await page.goto('/tools/gamepad');
  await expect(page.getByText('Your controller goes here.')).toBeVisible();
});

test('media handles denied permission and cleans up camera streams', async ({ page }) => {
  await page.addInitScript(() => {
    const original = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
    navigator.mediaDevices.getUserMedia = async (constraints) => {
      if (constraints?.audio) throw new DOMException('Denied', 'NotAllowedError');
      const stream = await original(constraints);
      (window as unknown as { testMediaStream: MediaStream }).testMediaStream = stream;
      return stream;
    };
  });
  await page.goto('/tools/audio');
  await page.getByRole('button', { name: 'Start microphone check' }).click();
  await expect(page.locator('.error-notice[role="alert"]')).toContainText(
    'Permission was not granted',
  );
  await page.goto('/tools/webcam');
  await page.getByRole('button', { name: 'Start camera preview' }).click();
  await expect(page.getByRole('button', { name: 'Stop camera' })).toBeVisible();
  await page.getByRole('link', { name: 'Back to your toolkit' }).click();
  await expect(page).toHaveURL('/tools');
  await expect
    .poll(() =>
      page.evaluate(() =>
        (window as unknown as { testMediaStream: MediaStream }).testMediaStream
          .getTracks()
          .every((track) => track.readyState === 'ended'),
      ),
    )
    .toBe(true);
});

test('mobile layout, navigation, reduced motion, and confirmed data reset', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
  await page.getByRole('button', { name: 'Open navigation' }).click();
  await page.locator('.mobile-drawer').getByRole('link', { name: 'Preferences' }).click();
  await expect(page.locator('.mobile-drawer')).not.toBeVisible();
  await page.getByRole('checkbox', { name: 'Reduce animation' }).check();
  await expect(page.locator('html')).toHaveAttribute('data-motion', 'reduced');
  await page.reload();
  await expect(page.getByRole('checkbox', { name: 'Reduce animation' })).toBeChecked();
  await page.getByRole('button', { name: 'Clear local data' }).click();
  await page.getByRole('button', { name: 'Cancel', exact: true }).click();
  await expect(page.getByRole('checkbox', { name: 'Reduce animation' })).toBeChecked();
  await page.getByRole('button', { name: 'Clear local data' }).click();
  await page.getByRole('button', { name: 'Yes, clear my data' }).click();
  await expect(page.getByRole('checkbox', { name: 'Reduce animation' })).not.toBeChecked();
});

test('all tool and guide pages load, legacy routes redirect, unknown tools return 404', async ({
  page,
}) => {
  for (const slug of [
    'aim',
    'reaction',
    'cps',
    'keyboard',
    'mouse',
    'display',
    'gamepad',
    'sensitivity',
    'crosshair',
    'session',
    'audio',
    'webcam',
  ]) {
    const response = await page.goto(`/tools/${slug}`);
    expect(response?.status()).toBe(200);
    await expect(page.locator('h1')).toBeVisible();
  }
  for (const slug of ['warmup', 'gear', 'sensitivity'])
    expect((await page.goto(`/guides/${slug}`))?.status()).toBe(200);
  await page.goto('/keyboard');
  await expect(page).toHaveURL(/\/tools\/keyboard/);
  const response = await page.goto('/tools/not-a-real-tool');
  expect(response?.status()).toBe(404);
  await expect(page.getByText('Let’s get you back in the game.')).toBeVisible();
});

test('microphone starts with a simulated device and stops every track', async ({ page }) => {
  await page.addInitScript(() => {
    const original = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
    navigator.mediaDevices.getUserMedia = async (constraints) => {
      const stream = await original(constraints);
      (window as unknown as { testAudioStream: MediaStream }).testAudioStream = stream;
      return stream;
    };
  });
  await page.goto('/tools/audio');
  await page.getByRole('button', { name: 'Start microphone check' }).click();
  await expect(page.getByRole('button', { name: 'Stop microphone' })).toBeVisible();
  await expect(page.getByRole('meter')).toBeVisible();
  await page.getByRole('button', { name: 'Stop microphone' }).click();
  await expect(page.getByRole('button', { name: 'Start microphone check' })).toBeVisible();
  expect(
    await page.evaluate(() =>
      (window as unknown as { testAudioStream: MediaStream }).testAudioStream
        .getTracks()
        .every((track) => track.readyState === 'ended'),
    ),
  ).toBe(true);
});

test('gamepad inputs update and a disconnect returns to the waiting state', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'getGamepads', {
      configurable: true,
      value: () => [
        {
          connected: true,
          id: 'Test controller',
          axes: [0.15, -0.2, 0, 0],
          buttons: [
            { pressed: true, value: 0.75 },
            { pressed: false, value: 0 },
          ],
        },
      ],
    });
  });
  await page.goto('/tools/gamepad');
  await expect(page.getByText('Test controller', { exact: true })).toBeVisible();
  await expect(page.locator('.gamepad-buttons .pressed')).toHaveCount(1);
  await expect(page.locator('.sticks')).toContainText('0.150, -0.200');
  await page.evaluate(() => Object.defineProperty(navigator, 'getGamepads', { value: () => [] }));
  await expect(page.getByText('Your controller goes here.')).toBeVisible();
});

test('tool workspaces fit a small phone and a tablet without page overflow', async ({ page }) => {
  test.setTimeout(90_000);
  for (const width of [360, 768]) {
    await page.setViewportSize({ width, height: 900 });
    for (const path of [
      '/',
      '/tools',
      '/tools/keyboard',
      '/tools/sensitivity',
      '/tools/crosshair',
      '/tools/gamepad',
      '/tools/session',
      '/settings',
    ]) {
      await page.goto(path);
      await expect(page.locator('h1')).toBeVisible();
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
        `${path} at ${width}px`,
      ).toBe(true);
    }
  }
});

test('blocked local storage keeps the toolkit usable and reports session-only storage', async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'localStorage', {
      get() {
        throw new DOMException('Blocked', 'SecurityError');
      },
    });
  });
  await page.goto('/');
  await page.getByRole('button', { name: 'Add Aim trainer to favorites' }).click();
  await expect(
    page.getByRole('button', { name: 'Remove Aim trainer from favorites' }),
  ).toBeVisible();
  await page.goto('/settings');
  await expect(page.getByText('Browser storage is unavailable.', { exact: false })).toBeVisible();
});
