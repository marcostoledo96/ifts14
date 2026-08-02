/**
 * Paridad estructural Angular vs referencia v0 histórica (v0) en /admin/cursos.
 * Aserta encabezado, filtros, tabla, cards mobile, Vista QA y estados.
 * Divergencia honesta: 4 estados de backend (no binario activo/inactivo de v0);
 * métricas alumnos/certif. muestran "—" sin agregación API.
 */
import { test, expect } from '@playwright/test';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { loginViaUi } from './fixtures/auth';

const OUT = path.join(process.cwd(), 'e2e', 'artifacts', 'parity-cursos');

test('paridad cursos Angular vs v0', async ({ page }) => {
  fs.mkdirSync(OUT, { recursive: true });
  await loginViaUi(page);
  await page.goto('/certificados/admin/cursos');
  await expect(page.locator('#cursos-title')).toBeVisible({ timeout: 15_000 });
  await page.waitForTimeout(600);

  const fp = await page.evaluate(() => {
    const text = (el: Element | null) => (el?.textContent || '').replace(/\s+/g, ' ').trim();
    return {
      kicker: text(document.querySelector('.kicker')),
      title: text(document.querySelector('#cursos-title')),
      subtitle: text(document.querySelector('.subtitle')),
      nuevoCurso: !!document.querySelector('a.btn-primary[href*="nuevo"]'),
      placeholder: (document.querySelector('#buscar-curso') as HTMLInputElement | null)?.placeholder ?? '',
      filtroLabels: Array.from(document.querySelectorAll('.filtro-label')).map((n) => text(n)),
      estadoChips: Array.from(document.querySelectorAll('.chip-estado')).map((n) => text(n)),
      fechasChips: Array.from(document.querySelectorAll('[data-fechas]')).map((n) => text(n)),
      resultsSummary: text(document.querySelector('.results-summary')),
      tableHeaders: Array.from(document.querySelectorAll('.courses-table-wrap th')).map((n) => text(n)),
      captionSrOnly: document.querySelector('.courses-table-wrap caption')?.classList.contains('sr-only') ?? false,
      rowCount: document.querySelectorAll('.curso-row').length,
      mobileCards: document.querySelectorAll('.cards-mobile .card-curso').length,
      hasQaVista: !!document.querySelector('.vista-qa'),
      qaLabels: Array.from(document.querySelectorAll('.vista-qa-btn')).map((n) => text(n)),
      actionHrefs: Array.from(document.querySelectorAll('.actions a')).slice(0, 2).map((a) => a.getAttribute('href')),
      courseCodeUppercase: (() => {
        const code = document.querySelector('.course-code');
        if (!code) return null;
        return getComputedStyle(code).textTransform;
      })(),
    };
  });
  fs.writeFileSync(path.join(OUT, 'angular-cursos-fingerprint.json'), JSON.stringify(fp, null, 2));
  await page.screenshot({ path: path.join(OUT, 'angular-cursos-full.png'), fullPage: true });
  await page.screenshot({ path: path.join(OUT, 'angular-cursos-viewport.png') });

  expect(fp.kicker).toBe('Archivo académico');
  expect(fp.title).toBe('Cursos');
  expect(fp.nuevoCurso).toBeTruthy();
  expect(fp.placeholder).toContain('Desarrollo Web');
  expect(fp.filtroLabels).toEqual(
    expect.arrayContaining(['Filtrar por nombre o código', 'Estado', 'Fechas de cursada']),
  );
  // Contrato backend: 4 estados (v0 solo Activos/Inactivos).
  expect(fp.estadoChips).toEqual(['Borrador', 'Activos', 'Cerrados', 'Archivados']);
  expect(fp.fechasChips).toEqual(['Con fechas', 'Sin fechas']);
  expect(fp.resultsSummary).toMatch(/\d+ cursos en el archivo/);
  expect(fp.tableHeaders).toEqual([
    'Nombre del curso',
    'Fechas',
    'Alumnos presentes',
    'Certificaciones',
    'Estado',
    'Acciones',
  ]);
  expect(fp.captionSrOnly).toBeTruthy();
  expect(fp.rowCount).toBeGreaterThan(0);
  expect(fp.mobileCards).toBe(fp.rowCount);
  expect(fp.hasQaVista).toBeTruthy();
  expect(fp.qaLabels).toEqual(['Con datos', 'Cargando', 'Error', 'Sin cursos']);
  expect(fp.actionHrefs[0]).toMatch(/\/admin\/cursos\/\d+$/);
  expect(fp.actionHrefs[1]).toMatch(/\/admin\/cursos\/\d+\/editar$/);
  expect(fp.courseCodeUppercase).not.toBe('uppercase');

  // Forzar skeleton via Vista QA.
  await page.getByRole('button', { name: 'Cargando', exact: true }).click();
  await expect(page.locator('.tabla-skeleton[aria-busy="true"]')).toBeVisible();
  await page.getByRole('button', { name: 'Sin cursos', exact: true }).click();
  await expect(page.locator('[data-state="empty-total"] .estado-title')).toContainText(
    'Todavía no hay cursos cargados',
  );
  await page.getByRole('button', { name: 'Error', exact: true }).click();
  await expect(page.locator('[role="alert"] .estado-title')).toContainText('No pudimos cargar los cursos');
  await page.getByRole('button', { name: 'Con datos', exact: true }).click();
  // Desktop: filas de tabla; mobile: cards (la tabla está display:none).
  await expect(page.locator('.curso-row, .card-curso').first()).toBeAttached({ timeout: 10_000 });
  await expect(page.locator('.results-summary')).toBeVisible();
});
