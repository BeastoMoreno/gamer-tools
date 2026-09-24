import { test, expect } from '@playwright/test';

test('email sign-in, profile persistence, duplicate handle recovery, and sign-out through the SDK', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/sign-in');
  await page.getByLabel('Email address').fill('player@example.test');
  await page.getByLabel('Password', { exact: true }).fill('wrong-password');
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(page.locator('.error-notice[role="alert"]')).toContainText('Sign-in failed');
  await page.getByLabel('Password', { exact: true }).fill('correct-test-password');
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(page).toHaveURL('/profile');
  await expect(page.getByLabel('Display name')).toHaveValue('Test Player');
  await page.getByLabel('Display name').fill('Neon Ranger');
  await page.getByLabel('Handle', { exact: false }).fill('neon_ranger');
  await page.getByLabel('Bio', { exact: false }).fill('One clean shot at a time.');
  await page.getByLabel('Region').fill('Southeast Asia');
  await page.getByRole('checkbox', { name: 'VALORANT', exact: true }).check();
  await page.getByRole('combobox', { name: /^Main game/ }).selectOption('VALORANT');
  await page.getByLabel('Mouse DPI').fill('800');
  await page.getByLabel('Main-game sensitivity').fill('0.32');
  await page.getByRole('button', { name: 'mint avatar' }).click();
  await page.getByRole('button', { name: 'Save profile' }).click();
  await expect(page.getByRole('status')).toContainText('Profile saved');
  await page.reload();
  await expect(page.getByLabel('Display name')).toHaveValue('Neon Ranger');
  await expect(page.getByLabel('Mouse DPI')).toHaveValue('800');
  await expect(page.getByRole('button', { name: 'mint avatar' })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await page.getByLabel('Handle', { exact: false }).fill('taken_handle');
  await page.getByRole('button', { name: 'Save profile' }).click();
  await expect(page.locator('.error-notice[role="alert"]')).toContainText('already taken');
  await expect(page.getByLabel('Handle', { exact: false })).toHaveValue('taken_handle');
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: 'test-results/profile-mobile.png', fullPage: true });
  await page.getByRole('button', { name: 'Sign out on this device' }).click();
  await expect(page.getByText('Your player card is waiting.')).toBeVisible();
  expect(errors).toEqual([]);
});

test('signup confirmation, password mismatch, recovery request, and provider redirects', async ({
  page,
}) => {
  await page.goto('/sign-up');
  await page.getByLabel('Display name').fill('Test Player');
  await page.getByLabel('Email address').fill('player@example.test');
  await page.getByLabel('Password', { exact: true }).fill('first-long-password');
  await page.getByLabel('Confirm password').fill('second-long-password');
  await page.getByRole('button', { name: 'Create account', exact: true }).click();
  await expect(page.locator('.error-notice[role="alert"]')).toContainText('both passwords match');
  await page.getByLabel('Confirm password').fill('first-long-password');
  await page.getByRole('button', { name: 'Create account', exact: true }).click();
  await expect(
    page.getByText('Check your inbox for a confirmation link.', { exact: false }),
  ).toBeVisible();
  await page.goto('/forgot-password');
  await page.getByLabel('Email address').fill('player@example.test');
  await page.getByRole('button', { name: 'Send reset link' }).click();
  await expect(page.getByText('If an account uses that address', { exact: false })).toBeVisible();
  for (const provider of ['google', 'facebook', 'apple']) {
    await page.goto('/sign-in');
    const request = page.waitForRequest((req) => req.url().includes('/auth/v1/authorize'));
    await page.route('**/auth/v1/authorize**', (route) =>
      route.fulfill({ status: 200, contentType: 'text/html', body: 'Provider redirect reached' }),
    );
    await page.getByRole('button', { name: `Continue with ${provider}`, exact: false }).click();
    const url = new URL((await request).url());
    expect(url.searchParams.get('provider')).toBe(provider);
    expect(url.searchParams.get('redirect_to')).toBe('http://127.0.0.1:3100/auth/callback');
    expect(url.searchParams.get('code_challenge')).toBeTruthy();
    await expect(page.getByText('Provider redirect reached')).toBeVisible();
  }
});
