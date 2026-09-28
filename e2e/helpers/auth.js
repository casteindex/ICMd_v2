const { expect } = require('@playwright/test');

const ADMIN_CREDENTIALS = {
  email: process.env.ADMIN_EMAIL || 'admin@unitec.edu',
  password: process.env.ADMIN_PASSWORD || 'Unitec2026!',
};

/**
 * Logs in as Admin via UI form
 */
async function loginAsAdmin(page) {
  await page.goto('/login');
  await page.fill('input#email', ADMIN_CREDENTIALS.email);
  await page.fill('input#password', ADMIN_CREDENTIALS.password);
  await page.click('button.login-submit');

  // Wait for navigation to dashboard
  await expect(page).toHaveURL(/.*dashboard/);
  await expect(page.locator('section.monitor-stats')).toBeVisible();
}

module.exports = {
  ADMIN_CREDENTIALS,
  loginAsAdmin,
};
