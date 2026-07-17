import { test, expect } from '@playwright/test';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { loginViaUi } from './fixtures/auth';

const OUT = path.join(process.cwd(), 'e2e', 'artifacts', 'parity-alumno-detalle');

test('captura Angular /admin/alumnos/1 — paridad ficha', async ({ page }) => {
  fs.mkdirSync(OUT, { recursive: true });
  await loginViaUi(page);
  await page.goto('/certificados/admin/alumnos/1');
  await expect(page.getByRole('heading', { name: /Persona Uno/i })).toBeVisible({ timeout: 15_000 });
  await page.waitForTimeout(600);

  await expect(page.getByText('Legajo', { exact: true })).toBeVisible();
  await expect(page.getByText('#1', { exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: /Ver certificación/i }).first()).toBeVisible();
  await expect(page.getByTestId('cta-nueva-certificacion')).toBeVisible();
  await expect(page.getByTestId('cta-ver-asistencias')).toBeVisible();

  const body = await page.locator('body').innerText();
  expect(body).not.toMatch(/LEG-\d+/i);
  expect(body.toLowerCase()).not.toContain('example.invalid');

  const fp = await page.evaluate(() => {
    const text = (el: Element | null) => (el?.textContent || '').replace(/\s+/g, ' ').trim();
    return {
      breadcrumb: text(document.querySelector('nav[aria-label*="iga"], nav[aria-label*="pan"], .breadcrumb')),
      h1: text(document.querySelector('h1')),
      idChip: text(document.querySelector('.id-chip')),
      fichaText: text(document.querySelector('.ficha-alumno, article')),
      actions: Array.from(document.querySelectorAll('.ficha-acciones a, .ficha-acciones button'))
        .map((n) => text(n))
        .filter(Boolean),
      resumen: Array.from(document.querySelectorAll('.resumen-item, .metric-card')).map((n) => text(n)),
      sectionTitles: Array.from(document.querySelectorAll('h2')).map((n) => text(n)),
      tableHeaders: Array.from(document.querySelectorAll('table th')).map((n) => text(n)),
      courseRows: document.querySelectorAll('tbody tr').length,
      verCertLinks: Array.from(document.querySelectorAll('a')).filter((a) =>
        (a.textContent || '').includes('Ver certificación'),
      ).length,
      hasLegajoCode: /LEG-/i.test(document.body.textContent || ''),
      bodySnippet: (document.body.innerText || '').slice(0, 1400),
    };
  });
  fs.writeFileSync(path.join(OUT, 'angular-alumno-detalle-fingerprint.json'), JSON.stringify(fp, null, 2));
  await page.screenshot({ path: path.join(OUT, 'angular-alumno-detalle-full.png'), fullPage: true });
  expect(fp.hasLegajoCode).toBe(false);
  expect(fp.verCertLinks).toBeGreaterThanOrEqual(2);
  console.log(JSON.stringify(fp, null, 2));
});
