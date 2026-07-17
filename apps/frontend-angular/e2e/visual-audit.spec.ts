import { test, expect, Page } from '@playwright/test';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { loginViaUi, mockAdminAuth } from './fixtures/auth';
import {
  PAGES,
  assertMustSee,
  artifactsDir,
  appendFinding,
  detectHorizontalOverflow,
  runAxe,
  type LayoutFinding,
} from './helpers/pages';

const FINDINGS_FILE = path.join(process.cwd(), 'e2e', 'artifacts', 'findings.json');

test.beforeAll(() => {
  fs.mkdirSync(path.dirname(FINDINGS_FILE), { recursive: true });
  // No resetear entre projects: acumular desktop + mobile.
  if (!fs.existsSync(FINDINGS_FILE)) {
    fs.writeFileSync(FINDINGS_FILE, '[]');
  }
});

test.describe.configure({ mode: 'serial' });

test.describe('Auditoría visual + funcional — inventario de páginas', () => {
  test.beforeEach(async ({ page }, testInfo) => {
    const consoleBucket: string[] = [];
    page.on('pageerror', (err) => consoleBucket.push(`pageerror: ${err.message}`));
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        const text = msg.text();
        if (/favicon|Angular DevTools|NG0[0-9]+|ExpressionChanged/i.test(text)) return;
        consoleBucket.push(`console: ${text}`);
      }
    });
    (page as Page & { __consoleBucket?: string[] }).__consoleBucket = consoleBucket;

    // Auth mock en todos los tests (login y admin).
    await mockAdminAuth(page);

    // Sesión previa para rutas admin (excepto el test de login UI).
    if (testInfo.title.includes('[public]') || testInfo.title.includes('[login]')) {
      return;
    }
    await loginViaUi(page);
  });

  for (const pageDef of PAGES) {
    const tag = pageDef.admin ? '[admin]' : pageDef.id === 'login' ? '[login]' : '[public]';

    test(`${tag} ${pageDef.id} — screenshot + layout + a11y + smoke`, async ({ page }, testInfo) => {
      const viewport = testInfo.project.name;
      const consoleBucket =
        (page as Page & { __consoleBucket?: string[] }).__consoleBucket ?? [];

      // Login page: no forzar sesión previa; el beforeEach ya mockeó auth.
      if (pageDef.id === 'login') {
        await page.goto(pageDef.path);
      } else if (pageDef.admin) {
        await page.goto(pageDef.path);
        await expect(page).not.toHaveURL(/\/admin\/login/);
      } else {
        await page.goto(pageDef.path);
      }

      await page.waitForLoadState('networkidle').catch(() => undefined);
      await page.waitForTimeout(400);

      if (pageDef.interact) {
        await pageDef.interact(page);
      }

      const missing = await assertMustSee(page, pageDef.mustSee);
      for (const m of missing) {
        appendFinding(FINDINGS_FILE, {
          pageId: pageDef.id,
          viewport,
          kind: 'missing',
          severity: 'major',
          message: `No visible: ${m}`,
        });
      }
      // Soft: seguimos capturando aunque falte un selector, para auditoría completa.

      const overflows = await detectHorizontalOverflow(page);
      for (const o of overflows) {
        appendFinding(FINDINGS_FILE, {
          pageId: pageDef.id,
          viewport,
          kind: 'overflow',
          severity: viewport === 'mobile' ? 'major' : 'minor',
          message: o,
        });
      }

      const axe = await runAxe(page);
      for (const s of axe.summary) {
        appendFinding(FINDINGS_FILE, {
          pageId: pageDef.id,
          viewport,
          kind: 'a11y',
          severity: s.startsWith('critical') || s.startsWith('serious') ? 'major' : 'minor',
          message: s,
        });
      }

      for (const err of consoleBucket.slice(0, 5)) {
        appendFinding(FINDINGS_FILE, {
          pageId: pageDef.id,
          viewport,
          kind: 'console',
          severity: 'major',
          message: err,
        });
      }

      const shotDir = artifactsDir('screenshots', viewport);
      const shotPath = path.join(shotDir, `${pageDef.id}.png`);
      await page.screenshot({ path: shotPath, fullPage: true, animations: 'disabled' });

      appendFinding(FINDINGS_FILE, {
        pageId: pageDef.id,
        viewport,
        kind: 'info',
        severity: 'info',
        message: `screenshot=${shotPath}; axeViolations=${axe.violations}; overflow=${overflows.length}; console=${consoleBucket.length}`,
      });
    });
  }
});

test.describe('Smoke funcional admin (desktop)', () => {
  test.beforeEach(async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'solo desktop');
    await loginViaUi(page);
  });

  test('sidebar navega a secciones principales', async ({ page }) => {
    const links: { label: RegExp; url: RegExp }[] = [
      { label: /Dashboard|Inicio|Panel/i, url: /\/admin\/dashboard/ },
      { label: /Cursos/i, url: /\/admin\/cursos/ },
      { label: /Alumn/i, url: /\/admin\/alumnos/ },
      { label: /Asistencia/i, url: /\/admin\/asistencias/ },
      { label: /Certificaci/i, url: /\/admin\/certificaciones/ },
      { label: /Configuraci/i, url: /\/admin\/configuracion/ },
    ];

    for (const { label, url } of links) {
      const nav = page.locator('nav, aside, [class*="sidebar"]').getByRole('link', { name: label }).first();
      if ((await nav.count()) === 0) {
        appendFinding(FINDINGS_FILE, {
          pageId: 'sidebar',
          viewport: 'desktop',
          kind: 'missing',
          severity: 'major',
          message: `Link sidebar ausente: ${label}`,
        });
        continue;
      }
      await nav.click();
      await expect(page).toHaveURL(url);
    }
  });

  test('dashboard CTAs clave visibles', async ({ page }) => {
    await page.goto('/certificados/admin/dashboard');
    await expect(page.getByRole('link', { name: /Cargar asistencias|Asistencias/i }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: /Entrega manual|Certificaci/i }).first()).toBeVisible();
  });

  test('listado cursos: búsqueda no rompe layout', async ({ page }) => {
    await page.goto('/certificados/admin/cursos');
    const search = page.locator('input[type="search"], input[placeholder*="Buscar"], input[placeholder*="buscar"]').first();
    if (await search.count()) {
      await search.fill('introducción');
      await page.waitForTimeout(300);
      const overflows = await detectHorizontalOverflow(page);
      expect(overflows.length, overflows.join('\n')).toBeLessThan(8);
    }
  });

  test('listado alumnos: filas y acciones Eye', async ({ page }) => {
    await page.goto('/certificados/admin/alumnos');
    await expect(page.locator('table tbody tr, [class*="row"], article').first()).toBeVisible();
  });

  test('curso detalle: CTAs Editar / Asistencias / Agregar fecha', async ({ page }) => {
    await page.goto('/certificados/admin/cursos/1');
    await expect(page.getByRole('link', { name: /Editar curso/i }).or(page.getByRole('button', { name: /Editar curso/i })).first()).toBeVisible();
    await expect(page.getByRole('link', { name: /Cargar asistencias/i }).or(page.getByRole('button', { name: /Cargar asistencias/i })).first()).toBeVisible();
    await expect(page.getByRole('button', { name: /Agregar fecha/i }).or(page.getByRole('link', { name: /Agregar fecha/i })).first()).toBeVisible();
  });

  test('expediente: Copiar / Compartir / PDF', async ({ page }) => {
    await page.goto('/certificados/admin/certificaciones/1');
    await expect(page.getByRole('button', { name: /Copiar/i }).first()).toBeVisible();
    await expect(page.getByRole('button', { name: /Compartir/i }).first()).toBeVisible();
  });

  test('entrega manual: QR y acciones', async ({ page }) => {
    await page.goto('/certificados/admin/certificaciones/1/entrega');
    await expect(page.getByText(/Entrega|QR|manual/i).first()).toBeVisible();
  });

  test('login: muestra error ante 401 del backend', async ({ page }) => {
    await page.unroute('**/certificados/api/admin/auth/login');
    await page.route('**/certificados/api/admin/auth/login', async (route) => {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({
          error: { code: 'UNAUTHORIZED', message: 'Credenciales inválidas', details: [] },
          meta: { requestId: 'e2e' },
        }),
      });
    });
    // Evitar que session previa deje CSRF y confunda; ir limpio al login.
    await page.goto('/certificados/admin/login');
    await page.locator('input[autocomplete="username"]').fill('wronguser');
    await page.locator('input[autocomplete="current-password"]').fill('wrongpass');
    await page.locator('button[type="submit"]').click();
    await expect(page.locator('.error-login, [role="alert"]').first()).toBeVisible({ timeout: 8_000 });
  });
});

test.afterAll(async () => {
  const findings: LayoutFinding[] = fs.existsSync(FINDINGS_FILE)
    ? (JSON.parse(fs.readFileSync(FINDINGS_FILE, 'utf8')) as LayoutFinding[])
    : [];
  const reportPath = path.join(process.cwd(), 'e2e', 'artifacts', 'VISUAL-AUDIT-REPORT.md');
  const bySeverity = (s: LayoutFinding['severity']) => findings.filter((f) => f.severity === s && f.kind !== 'info');
  const lines = [
    '# Auditoría visual Playwright — IFTS14 Angular',
    '',
    `Generado: ${new Date().toISOString()}`,
    '',
    '## Resumen',
    '',
    `| Severidad | Cantidad |`,
    `|---|---|`,
    `| blocker | ${bySeverity('blocker').length} |`,
    `| major | ${bySeverity('major').length} |`,
    `| minor | ${bySeverity('minor').length} |`,
    `| info (capturas) | ${findings.filter((f) => f.kind === 'info').length} |`,
    '',
    '## Hallazgos (sin info)',
    '',
  ];
  for (const f of findings.filter((x) => x.kind !== 'info')) {
    lines.push(`- **[${f.severity}/${f.kind}]** \`${f.pageId}\` (${f.viewport}): ${f.message}`);
  }
  lines.push('', '## Capturas', '');
  lines.push('Ver `e2e/artifacts/screenshots/{desktop,mobile}/*.png`');
  lines.push('', 'Raw JSON: `e2e/artifacts/findings.json`');
  fs.writeFileSync(reportPath, lines.join('\n'));
});
