import { test, expect } from '@playwright/test';
import { setup, noOverflow } from './support/fixtures';

for (const teacher of [false, true]) {
  test(`homepage keeps a long ${teacher ? 'teacher' : 'student'} name and avatar accessible at every size`, async ({ page }) => {
    const name = 'Synthetic Visitor With A Very Long Full Name';
    await page.addInitScript(() => localStorage.setItem('px-home-music-muted', 'true'));
    await setup(page, { teacher });
    await page.route('**/rest/v1/profiles?*', route => {
      if (route.request().method() === 'HEAD') return route.fallback();
      return route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({
          id: '00000000-0000-4000-8000-000000000001',
          full_name: name,
          role: teacher ? 'teacher' : 'student',
        }),
      });
    });
    await page.goto('/');
    const account = page.getByRole('link', { name: `${name} — Open your dashboard`, exact: true });
    await expect(account).toBeVisible();
    await expect(account).toHaveAttribute('href', teacher ? '/TeacherDashboard' : '/Dashboard');
    await expect(account).toHaveAttribute('title', name);
    await expect(page.getByRole('img', { name: `${name} avatar`, exact: true })).toBeVisible();
    await expect(page.locator('.home-profile')).toHaveCount(1);
    await expect(page.getByText('Enter Portal', { exact: true })).toHaveCount(0);
    await expect(page.getByText('Worlds & Missions', { exact: true })).toHaveCount(0);
    for (const [width, height] of [[1440, 900], [768, 1024], [375, 667], [354, 740]]) {
      await page.setViewportSize({ width, height });
      await noOverflow(page);
      const label = page.locator('.home-profile-name');
      await expect(label).toBeVisible();
      await expect(label).toHaveText(name);
      const textBox = await label.boundingBox();
      expect(textBox.width).toBeGreaterThan(20);
      const avatarBox = await page.locator('.home-profile .px-avatar').boundingBox();
      expect(avatarBox.width).toBe(34);
      const box = await account.boundingBox();
      const header = await page.locator('.home-nav').boundingBox();
      expect(box.x + box.width).toBeLessThanOrEqual(header.x + header.width);
      expect(box.y + box.height).toBeLessThanOrEqual(header.y + header.height);
      await page.screenshot({ path: `test-results/homepage-account/${teacher ? 'teacher' : 'student'}-${width}.png` });
    }
  });
}
