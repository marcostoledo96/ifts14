import { Page } from '@playwright/test';

/** CSRF de 43 chars (formato backend). Solo para mock e2e. */
export const E2E_CSRF = 'abcdefghijklmnopqrstuvwxyz0123456789ABCDEF_';

const AUTH_OK = {
  data: { authenticated: true, csrfToken: E2E_CSRF },
  meta: { requestId: 'e2e-visual' },
};

/** Mock de sesión admin: permite recorrer el shell sin PHP. */
export async function mockAdminAuth(page: Page): Promise<void> {
  await page.route('**/certificados/api/admin/auth/session', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(AUTH_OK),
    });
  });
  await page.route('**/certificados/api/admin/auth/login', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(AUTH_OK),
    });
  });
  await page.route('**/certificados/api/admin/auth/logout', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: { authenticated: false },
        meta: { requestId: 'e2e-visual' },
      }),
    });
  });
}

/** Login UI real contra endpoints mockeados. */
export async function loginViaUi(page: Page): Promise<void> {
  await mockAdminAuth(page);
  await page.goto('/certificados/admin/login');
  await page.locator('#username, input[autocomplete="username"]').first().fill('bedelia');
  await page.locator('input[autocomplete="current-password"]').fill('password-demo-auth');
  await page.locator('button[type="submit"]').click();
  await page.waitForURL(/\/admin\/(dashboard)?/, { timeout: 15_000 });
}
