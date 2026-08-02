/**
 * Paridad estructural Angular vs referencia v0 histórica (v0) en /admin/alumnos.
 * Divergencias honestas: sin legajo ni emails en texto (API no los expone);
 * Contacto como badge; Documento enmascarado.
 */
import { test, expect } from '@playwright/test';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { loginViaUi } from './fixtures/auth';

const OUT = path.join(process.cwd(), 'e2e', 'artifacts', 'parity-alumnos');

test('paridad alumnos Angular vs v0', async ({ page }) => {
  fs.mkdirSync(OUT, { recursive: true });
  await loginViaUi(page);
  await page.goto('/certificados/admin/alumnos');
  await expect(page.locator('#students-title')).toBeVisible({ timeout: 15_000 });
  await page.waitForTimeout(600);

  const fp = await page.evaluate(() => {
    const text = (el: Element | null) => (el?.textContent || '').replace(/\s+/g, ' ').trim();
    return {
      kicker: text(document.querySelector('.kicker')),
      title: text(document.querySelector('#students-title')),
      intro: text(document.querySelector('.intro')),
      nuevoAlumno: !!document.querySelector('[data-testid="cta-nuevo-alumno"]'),
      searchLabel: text(document.querySelector('label[for="buscar-alumno"]')),
      placeholder: (document.querySelector('#buscar-alumno') as HTMLInputElement | null)?.placeholder ?? '',
      chips: Array.from(document.querySelectorAll('.chips .chip')).map((n) => text(n)),
      resultsSummary: text(document.querySelector('.results-summary')),
      qaLabels: Array.from(document.querySelectorAll('.vista-qa-btn')).map((n) => text(n)),
      tableHeaders: Array.from(document.querySelectorAll('.alumnos-tabla th')).map((n) => text(n)),
      captionSrOnly: document.querySelector('.alumnos-tabla caption')?.classList.contains('sr-only') ?? false,
      rowCount: document.querySelectorAll('.alumnos-tabla tbody tr').length,
      hasPager: !!document.querySelector('.pager'),
      noLegajo: !document.body.textContent?.includes('LEG-'),
    };
  });
  fs.writeFileSync(path.join(OUT, 'angular-alumnos-fingerprint.json'), JSON.stringify(fp, null, 2));
  await page.screenshot({ path: path.join(OUT, 'angular-alumnos-full.png'), fullPage: true });

  expect(fp.kicker).toBe('Registro académico');
  expect(fp.title).toBe('Alumnos');
  expect(fp.intro).toContain('Legajos de estudiantes');
  expect(fp.nuevoAlumno).toBeTruthy();
  expect(fp.searchLabel).toBe('Buscar alumno');
  expect(fp.placeholder).toContain('Nombre, apellido o documento');
  expect(fp.chips).toEqual(['Con certificaciones', 'Sin certificaciones', 'Sin email']);
  expect(fp.resultsSummary).toMatch(/\d+ alumnos en el registro/);
  expect(fp.qaLabels).toEqual(['Con datos', 'Cargando', 'Error', 'Sin registros']);
  expect(fp.tableHeaders).toEqual([
    'Apellido y nombre',
    'Documento',
    'Contacto',
    'Cursos c/ asist.',
    'Cert. válidas',
    'Acción',
  ]);
  expect(fp.captionSrOnly).toBeTruthy();
  expect(fp.rowCount).toBeGreaterThan(0);
  expect(fp.hasPager).toBeTruthy();
  expect(fp.noLegajo).toBeTruthy();

  await page.getByRole('button', { name: 'Cargando', exact: true }).click();
  await expect(page.locator('.tabla-skeleton[aria-busy="true"]')).toBeVisible();
  await page.getByRole('button', { name: 'Sin registros', exact: true }).click();
  await expect(page.locator('[data-state="empty-total"] .estado-title')).toContainText(
    'Todavía no hay alumnos cargados',
  );
  await page.getByRole('button', { name: 'Error', exact: true }).click();
  await expect(page.locator('[role="alert"] .estado-title')).toContainText('No pudimos cargar el registro');
  await page.getByRole('button', { name: 'Con datos', exact: true }).click();
  await expect(page.locator('.results-summary')).toBeVisible({ timeout: 10_000 });
});
