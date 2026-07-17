/**
 * Paridad estructural Angular vs muestra_pagina (v0) en /admin/dashboard.
 * Genera fingerprint JSON + screenshots y aserta la estructura v0:
 * acciones (5 tiles), bandeja con iconos/conteos/Revisar, tabla de
 * actividad con columnas Hora/ID/Tipo/Detalle/Autor y resumen operativo.
 * Regla honesta: solo "Cursos sin fechas" tiene conteo real; el resto "—".
 */
import { test, expect } from '@playwright/test';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { loginViaUi } from './fixtures/auth';

const OUT = path.join(process.cwd(), 'e2e', 'artifacts', 'parity-dashboard');

test('paridad dashboard Angular vs v0', async ({ page }) => {
  fs.mkdirSync(OUT, { recursive: true });
  await loginViaUi(page);
  await page.goto('/certificados/admin/dashboard');
  await expect(page.locator('#dash-title')).toBeVisible({ timeout: 15_000 });
  await page.waitForTimeout(500);

  const fp = await page.evaluate(() => {
    const text = (el: Element | null) => (el?.textContent || '').replace(/\s+/g, ' ').trim();
    return {
      headings: Array.from(document.querySelectorAll('h1, h2')).map((h) => text(h)),
      acciones: Array.from(document.querySelectorAll('.acciones-grid > *')).map((a) => ({
        tag: a.tagName,
        label: text(a.querySelector('.accion-label')),
        disabled: (a as HTMLButtonElement).disabled ?? false,
        href: a.getAttribute('href'),
      })),
      pendientes: Array.from(document.querySelectorAll('.pendientes-list li')).map((li) => ({
        label: text(li.querySelector('.pendiente-label')),
        hasIcon: !!li.querySelector('.pendiente-icon svg'),
        href: li.querySelector('a')?.getAttribute('href') ?? null,
        badge: text(li.querySelector('.pendiente-badge')),
        revisar: text(li.querySelector('.pendiente-revisar')),
      })),
      actividadColumnas: Array.from(document.querySelectorAll('.actividad-table th')).map((th) =>
        text(th),
      ),
      actividadVacia: text(document.querySelector('.empty-actividad')),
      verRegistro: text(document.querySelector('.actividad .panel-link')),
      resumen: Array.from(document.querySelectorAll('.resumen-cell')).map((c) => ({
        label: text(c.querySelector('.resumen-label')),
        value: text(c.querySelector('.resumen-value')),
      })),
    };
  });
  fs.writeFileSync(path.join(OUT, 'angular-dashboard-fingerprint.json'), JSON.stringify(fp, null, 2));
  await page.screenshot({ path: path.join(OUT, 'angular-dashboard-full.png'), fullPage: true });
  await page.screenshot({ path: path.join(OUT, 'angular-dashboard-viewport.png') });

  // Estructura v0: encabezados en orden.
  expect(fp.headings).toEqual([
    'Panel de certificaciones',
    'Acciones',
    'Pendientes de resolución',
    'Actividad reciente',
    'Resumen operativo',
  ]);

  // Acciones: 5 tiles, Carga masiva deshabilitada (sin API de importación).
  expect(fp.acciones.map((a) => a.label)).toEqual([
    'Nueva certificación',
    'Nuevo curso',
    'Cargar asistencias',
    'Entrega manual',
    'Carga masiva',
  ]);
  expect(fp.acciones[4].disabled).toBeTruthy();

  // Bandeja: 4 filas con icono tonal y link Revisar a página real.
  expect(fp.pendientes.length).toBe(4);
  for (const p of fp.pendientes) {
    expect(p.hasIcon).toBeTruthy();
    expect(p.href).toBeTruthy();
    expect(p.revisar).toContain('Revisar');
  }
  // Solo sin-fechas tiene conteo real; el resto sin fuente => "—".
  expect(fp.pendientes[0].badge).toMatch(/^\d+$/);
  for (const p of fp.pendientes.slice(1)) {
    expect(p.badge).toBe('—');
  }

  // Actividad: tabla v0 con columnas y estado vacío honesto.
  expect(fp.actividadColumnas).toEqual(['Hora', 'ID', 'Tipo', 'Detalle', 'Autor']);
  expect(fp.actividadVacia).toContain('Sin registro de actividad disponible');
  expect(fp.verRegistro).toContain('Ver registro completo');

  // Resumen operativo: 4 métricas hidratadas.
  expect(fp.resumen.map((r) => r.label)).toEqual([
    'Cursos cargados',
    'Alumnos registrados',
    'Certificaciones emitidas',
    'Certificaciones revocadas',
  ]);
});
