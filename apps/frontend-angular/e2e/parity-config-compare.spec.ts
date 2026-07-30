/**
 * Comparación estructural Angular vs muestra_pagina (v0) en /admin/configuracion.
 * Genera fingerprints JSON + screenshots full-page para auditar paridad.
 */
import { test, expect, Page, chromium, Browser } from '@playwright/test';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { loginViaUi, mockAdminAuth, E2E_CSRF } from './fixtures/auth';

const OUT = path.join(process.cwd(), 'e2e', 'artifacts', 'parity-config');
const ANGULAR_URL = process.env['PLAYWRIGHT_BASE_URL'] ?? 'http://127.0.0.1:4200';
const V0_URL = process.env['V0_BASE_URL'] ?? 'http://127.0.0.1:3014';

const CONFIG_SEED = {
  data: {
    institutionName: 'Instituto de Formación Técnica Superior N.° 14',
    certificateText:
      'El Instituto de Formación Técnica Superior N.º 14 (IFTS 14) que integra la Dirección de Educación Técnica Superior, Agencia de Habilidades para el Futuro, certifica que:',
    rectorName: '',
    rectorRole: 'Rectora del IFTS N.° 14',
    advisorName: '',
    advisorRole: 'Asesora Pedagógica del IFTS N.° 14',
    rectorSignaturePresent: false,
    advisorSignaturePresent: true,
    updatedAt: '2026-01-01T00:00:00Z',
  },
  meta: { requestId: 'parity-config' },
};

async function mockConfigApi(page: Page): Promise<void> {
  await page.route('**/certificados/api/admin/configuracion-institucional**', async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(CONFIG_SEED),
      });
      return;
    }
    if (route.request().method() === 'PUT') {
      const body = route.request().postDataJSON() as Record<string, string>;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: { ...CONFIG_SEED.data, ...body, updatedAt: new Date().toISOString() },
          meta: { requestId: 'parity-config-put' },
        }),
      });
      return;
    }
    await route.continue();
  });
}

type Fingerprint = {
  source: string;
  url: string;
  viewport: { width: number; height: number };
  title: string;
  headings: string[];
  sectionIds: string[];
  sectionTitles: string[];
  navAnchors: string[];
  labels: string[];
  enabledControls: string[];
  disabledControls: string[];
  logosCount: number;
  hasSeccionesNav: boolean;
  hasImpactBanner: boolean;
  stickyBarPosition: string | null;
  stickyBarFixed: boolean;
  sidebarFooterVisible: boolean;
  layout: {
    contentMaxWidth: string | null;
    configLayoutColumns: string | null;
    sectionCardCount: number;
  };
};

async function fingerprint(page: Page, source: string): Promise<Fingerprint> {
  return page.evaluate((src) => {
    const text = (el: Element | null) => (el?.textContent || '').replace(/\s+/g, ' ').trim();
    const headings = Array.from(document.querySelectorAll('h1, h2')).map((h) => text(h));
    const sectionEls = Array.from(
      document.querySelectorAll('section[id], [id="identidad"], [id="certificados"], [id="autoridades"], [id="contacto"], [id="validacion"]'),
    );
    const sectionIds = [...new Set(sectionEls.map((s) => s.id).filter(Boolean))];
    const sectionTitles = sectionEls.map((s) => {
      const h = s.querySelector('h2');
      return `${s.id}:${text(h)}`;
    });
    const nav = document.querySelector('nav[aria-label*="Secciones" i], nav[aria-label*="configuración" i]');
    const navAnchors = nav
      ? Array.from(nav.querySelectorAll('a')).map((a) => `${a.getAttribute('href')}|${text(a)}`)
      : [];
    const labels = Array.from(document.querySelectorAll('label, .cfg-label, label[class*="uppercase"]'))
      .map((l) => text(l))
      .filter(Boolean)
      .slice(0, 80);
    const controls = Array.from(document.querySelectorAll('input, textarea, select'));
    const enabledControls = controls
      .filter((c) => !(c as HTMLInputElement).disabled)
      .map((c) => `${(c as HTMLInputElement).tagName.toLowerCase()}#${c.id || c.getAttribute('name') || ''}`);
    const disabledControls = controls
      .filter((c) => (c as HTMLInputElement).disabled)
      .map((c) => `${(c as HTMLInputElement).tagName.toLowerCase()}#${c.id || ''}`);
    const logosCount =
      document.querySelectorAll('.logos-grid > li, [class*="logo"] button, ul.grid li').length ||
      document.querySelectorAll('button:has-text("Subir logo"), button:has-text("Reemplazar")').length;
    // logos count fallback without :has-text
    const logoButtons = Array.from(document.querySelectorAll('button')).filter((b) =>
      /subir logo|reemplazar/i.test(b.textContent || ''),
    ).length;
    const sticky =
      document.querySelector('.sticky-bar, [class*="fixed"][class*="bottom"]') ||
      Array.from(document.querySelectorAll('div')).find((d) =>
        /Guardar configuración/i.test(d.textContent || '') && /Descartar/i.test(d.textContent || ''),
      );
    const stickyCs = sticky ? getComputedStyle(sticky) : null;
    const sidebarFooter =
      Array.from(document.querySelectorAll('a, button')).find((el) => /Cerrar sesi[oó]n/i.test(el.textContent || '')) ||
      null;
    const footerBox = sidebarFooter?.getBoundingClientRect();
    const sidebarFooterVisible = !!footerBox && footerBox.top >= 0 && footerBox.bottom <= window.innerHeight + 1;
    const layoutEl = document.querySelector('.config-layout, form .grid, main form > div');
    const content = document.querySelector('main#contenido, main');
    const cards = document.querySelectorAll('.cfg-section, section[id].scroll-mt-24, section.rounded-md');
    return {
      source: src,
      url: location.href,
      viewport: { width: window.innerWidth, height: window.innerHeight },
      title: document.title,
      headings,
      sectionIds,
      sectionTitles,
      navAnchors,
      labels,
      enabledControls,
      disabledControls,
      logosCount: Math.max(logoButtons, document.querySelectorAll('.logos-grid > li').length),
      hasSeccionesNav: !!nav && getComputedStyle(nav).display !== 'none',
      hasImpactBanner: /Cómo impactan estos cambios/i.test(document.body.innerText),
      stickyBarPosition: stickyCs?.position ?? null,
      stickyBarFixed: stickyCs?.position === 'fixed',
      sidebarFooterVisible,
      layout: {
        contentMaxWidth: content ? getComputedStyle(content).maxWidth : null,
        configLayoutColumns: layoutEl ? getComputedStyle(layoutEl).gridTemplateColumns : null,
        sectionCardCount: cards.length,
      },
    };
  }, source);
}

function writeJson(name: string, data: unknown): void {
  fs.mkdirSync(OUT, { recursive: true });
  fs.writeFileSync(path.join(OUT, name), JSON.stringify(data, null, 2));
}

test.describe('parity config Angular vs v0', () => {
  test('captura Angular /admin/configuracion', async ({ page }) => {
    fs.mkdirSync(OUT, { recursive: true });
    await mockAdminAuth(page);
    await mockConfigApi(page);
    await loginViaUi(page);
    await page.goto('/certificados/admin/configuracion');
    await expect(page.getByRole('heading', { name: /Configuración institucional/i })).toBeVisible({
      timeout: 15_000,
    });
    await page.waitForTimeout(500);
    const fp = await fingerprint(page, 'angular');
    writeJson('angular-fingerprint.json', fp);
    await page.screenshot({
      path: path.join(OUT, 'angular-full.png'),
      fullPage: true,
    });
    await page.screenshot({
      path: path.join(OUT, 'angular-viewport.png'),
      fullPage: false,
    });
    // Expectaciones mínimas de paridad estructural
    expect(fp.sectionIds).toEqual(
      expect.arrayContaining(['identidad', 'certificados', 'autoridades', 'contacto', 'validacion']),
    );
    expect(fp.hasImpactBanner).toBeTruthy();
    // La nav SECCIONES solo existe en desktop (>= 64rem), igual que en v0.
    const esDesktop = (page.viewportSize()?.width ?? 0) >= 1024;
    expect(fp.hasSeccionesNav).toBe(esDesktop);
    expect(fp.stickyBarFixed).toBeTruthy();
    expect(fp.logosCount).toBeGreaterThanOrEqual(4);
    expect(fp.enabledControls.some((c) => c.includes('institution-name'))).toBeTruthy();
    expect(fp.enabledControls.some((c) => c.includes('certificate-text'))).toBeTruthy();
  });

  test('captura v0 muestra_pagina /admin/configuracion', async () => {
    fs.mkdirSync(OUT, { recursive: true });
    let browser: Browser | null = null;
    try {
      browser = await chromium.launch();
      const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
      const res = await page.goto(`${V0_URL}/admin/configuracion`, {
        waitUntil: 'domcontentloaded',
        timeout: 20_000,
      });
      if (!res || res.status() >= 400) {
        test.skip(true, `v0 no disponible en ${V0_URL} (status=${res?.status()})`);
        return;
      }
      await expect(page.getByRole('heading', { name: /Configuración institucional/i })).toBeVisible({
        timeout: 15_000,
      });
      await page.waitForTimeout(500);
      const fp = await fingerprint(page, 'v0');
      writeJson('v0-fingerprint.json', fp);
      await page.screenshot({ path: path.join(OUT, 'v0-full.png'), fullPage: true });
      await page.screenshot({ path: path.join(OUT, 'v0-viewport.png'), fullPage: false });
    } catch (err) {
      writeJson('v0-error.json', { message: String(err), v0Url: V0_URL });
      test.skip(true, `v0 no alcanzable: ${String(err)}`);
    } finally {
      await browser?.close();
    }
  });

  test('diff fingerprints si ambos existen', async () => {
    const aPath = path.join(OUT, 'angular-fingerprint.json');
    const vPath = path.join(OUT, 'v0-fingerprint.json');
    if (!fs.existsSync(aPath) || !fs.existsSync(vPath)) {
      test.skip(true, 'Falta angular o v0 fingerprint');
      return;
    }
    const a = JSON.parse(fs.readFileSync(aPath, 'utf8')) as Fingerprint;
    const v = JSON.parse(fs.readFileSync(vPath, 'utf8')) as Fingerprint;
    const diff = {
      sectionIds: { angular: a.sectionIds, v0: v.sectionIds },
      navAnchors: { angular: a.navAnchors, v0: v.navAnchors },
      logosCount: { angular: a.logosCount, v0: v.logosCount },
      stickyBarFixed: { angular: a.stickyBarFixed, v0: v.stickyBarFixed },
      stickyBarPosition: { angular: a.stickyBarPosition, v0: v.stickyBarPosition },
      hasSeccionesNav: { angular: a.hasSeccionesNav, v0: v.hasSeccionesNav },
      sidebarFooterVisible: { angular: a.sidebarFooterVisible, v0: v.sidebarFooterVisible },
      enabledControls: {
        angular: a.enabledControls,
        v0: v.enabledControls,
        onlyAngular: a.enabledControls.filter((x) => !v.enabledControls.includes(x)),
        onlyV0: v.enabledControls.filter((x) => !a.enabledControls.includes(x)),
      },
      labelsSample: { angular: a.labels.slice(0, 30), v0: v.labels.slice(0, 30) },
      headings: { angular: a.headings, v0: v.headings },
    };
    writeJson('diff.json', diff);
    // Paridad fuerte en anclas y logos
    expect(a.sectionIds.sort()).toEqual(v.sectionIds.sort());
    expect(a.hasSeccionesNav).toBe(v.hasSeccionesNav);
    expect(a.logosCount).toBe(v.logosCount);
    expect(a.stickyBarFixed).toBe(true);
    expect(v.stickyBarFixed).toBe(true);
  });
});
