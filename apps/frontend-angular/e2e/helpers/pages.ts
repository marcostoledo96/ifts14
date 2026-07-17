import { Page, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import * as fs from 'node:fs';
import * as path from 'node:path';

export interface PageDef {
  id: string;
  path: string;
  /** Si true, requiere sesión admin. */
  admin: boolean;
  /** Selectores que deben existir (smoke funcional mínimo). */
  mustSee?: string[];
  /** Interactúes opcionales antes del screenshot. */
  interact?: (page: Page) => Promise<void>;
}

/** Inventario completo de pantallas (datos mock in-memory). */
export const PAGES: PageDef[] = [
  { id: 'home', path: '/certificados/', admin: false, mustSee: ['body'] },
  {
    id: 'validar-vigente',
    path: '/certificados/validar/demo-valido',
    admin: false,
    mustSee: ['text=/ACTA|válid|Válid|certific/i'],
  },
  {
    id: 'validar-revocado',
    path: '/certificados/validar/demo-revocado',
    admin: false,
    mustSee: ['text=/revocad/i'],
  },
  {
    id: 'validar-expirado',
    path: '/certificados/validar/demo-expirado',
    admin: false,
    mustSee: ['body'],
  },
  {
    id: 'validar-inexistente',
    path: '/certificados/validar/demo-inexistente',
    admin: false,
    mustSee: ['body'],
  },
  {
    id: 'validar-error',
    path: '/certificados/validar/demo-error-tecnico',
    admin: false,
    mustSee: ['body'],
  },
  {
    id: 'login',
    path: '/certificados/admin/login',
    admin: false,
    mustSee: ['button[type="submit"]', 'input[autocomplete="username"]'],
  },
  {
    id: 'dashboard',
    path: '/certificados/admin/dashboard',
    admin: true,
    mustSee: ['#dash-title', 'text=/Cargar asistencias|Nueva certificación/i'],
  },
  {
    id: 'configuracion',
    path: '/certificados/admin/configuracion',
    admin: true,
    mustSee: ['text=/Configuraci|institucional/i'],
  },
  {
    id: 'alumnos-list',
    path: '/certificados/admin/alumnos',
    admin: true,
    mustSee: ['text=/Alumn/i'],
  },
  {
    id: 'alumnos-nuevo',
    path: '/certificados/admin/alumnos/nuevo',
    admin: true,
    mustSee: ['form, text=/Nuevo|Alumn|Guardar|Crear/i'],
  },
  {
    id: 'alumno-detalle',
    path: '/certificados/admin/alumnos/1',
    admin: true,
    mustSee: ['text=/Ficticia|Persona|Alumn/i'],
  },
  {
    id: 'asistencias',
    path: '/certificados/admin/asistencias',
    admin: true,
    mustSee: ['text=/Asistencia/i'],
  },
  {
    id: 'cursos-list',
    path: '/certificados/admin/cursos',
    admin: true,
    mustSee: ['text=/Curso/i'],
  },
  {
    id: 'curso-nuevo',
    path: '/certificados/admin/cursos/nuevo',
    admin: true,
    mustSee: ['form, text=/Nuevo|Curso|Guardar|Crear/i'],
  },
  {
    id: 'curso-detalle',
    path: '/certificados/admin/cursos/1',
    admin: true,
    mustSee: ['text=/Editar curso|Cargar asistencias|Agregar fecha|Curso/i'],
  },
  {
    id: 'curso-editar',
    path: '/certificados/admin/cursos/1/editar',
    admin: true,
    mustSee: ['form, text=/Editar|Curso|Guardar/i'],
  },
  {
    id: 'asistencias-fecha',
    path: '/certificados/admin/cursos/1/fechas/11/asistencias',
    admin: true,
    mustSee: ['text=/Asistencia|Presente|Ausente/i'],
  },
  {
    id: 'certificaciones-list',
    path: '/certificados/admin/certificaciones',
    admin: true,
    mustSee: ['text=/Certificaci/i'],
  },
  {
    id: 'certificacion-nueva',
    path: '/certificados/admin/certificaciones/nueva',
    admin: true,
    mustSee: ['text=/Nueva|Certificaci|Emitir|Alumn/i'],
  },
  {
    id: 'certificacion-expediente',
    path: '/certificados/admin/certificaciones/1',
    admin: true,
    mustSee: ['text=/Expediente|Certificaci|Copiar|Compartir|PDF/i'],
  },
  {
    id: 'certificacion-pdf',
    path: '/certificados/admin/certificaciones/1/pdf',
    admin: true,
    mustSee: ['text=/PDF|Descargar|Vista/i'],
  },
  {
    id: 'certificacion-entrega',
    path: '/certificados/admin/certificaciones/1/entrega',
    admin: true,
    mustSee: ['text=/Entrega|QR|Copiar|manual/i'],
  },
  {
    id: 'certificacion-revocar',
    path: '/certificados/admin/certificaciones/1/revocar',
    admin: true,
    mustSee: ['text=/Revocar|motivo|Confirm/i'],
  },
];

export interface LayoutFinding {
  pageId: string;
  viewport: string;
  kind: 'overflow' | 'console' | 'a11y' | 'missing' | 'overlap' | 'info';
  severity: 'blocker' | 'major' | 'minor' | 'info';
  message: string;
}

export async function collectConsoleErrors(page: Page): Promise<string[]> {
  const errors: string[] = [];
  page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      const text = msg.text();
      // Ignorar ruido conocido de Angular/devtools en mock.
      if (/favicon|Download the Angular DevTools|NG0|ExpressionChanged/i.test(text)) return;
      errors.push(`console: ${text}`);
    }
  });
  return errors;
}

export async function detectHorizontalOverflow(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const issues: string[] = [];
    const docWidth = document.documentElement.clientWidth;
    const walk = (el: Element) => {
      const style = window.getComputedStyle(el);
      if (style.display === 'none' || style.visibility === 'hidden') return;
      // Skip-link y elementos intencionalmente fuera de pantalla.
      const cls = typeof el.className === 'string' ? el.className : '';
      if (/\bskip-link\b/i.test(cls)) return;
      const rect = el.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;
      if (rect.left < -50) return; // off-canvas / drawer oculto
      if (rect.right > docWidth + 2) {
        const tag = el.tagName.toLowerCase();
        const shortCls = cls ? `.${cls.split(/\s+/).slice(0, 2).join('.')}` : '';
        issues.push(`${tag}${shortCls} overflow x=${Math.round(rect.left)}..${Math.round(rect.right)} vs ${docWidth}`);
      }
      for (const child of Array.from(el.children).slice(0, 80)) walk(child);
    };
    walk(document.body);
    return [...new Set(issues)].slice(0, 12);
  });
}

export async function runAxe(page: Page): Promise<{ violations: number; summary: string[] }> {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'best-practice'])
    .disableRules(['color-contrast']) // contraste se revisa visualmente; suele ser ruidoso en mocks
    .analyze();
  const summary = results.violations.slice(0, 8).map(
    (v) => `${v.impact ?? 'unknown'}: ${v.id} (${v.nodes.length}) — ${v.help}`,
  );
  return { violations: results.violations.length, summary };
}

export async function assertMustSee(page: Page, selectors: string[] | undefined): Promise<string[]> {
  const missing: string[] = [];
  if (!selectors?.length) return missing;
  for (const sel of selectors) {
    const parts = sel.split(',').map((s) => s.trim());
    let found = false;
    for (const part of parts) {
      try {
        let loc;
        const textMatch = /^text=\/(.+)\/([a-z]*)$/i.exec(part);
        if (textMatch) {
          loc = page.getByText(new RegExp(textMatch[1], textMatch[2] || undefined));
        } else {
          loc = page.locator(part);
        }
        await expect(loc.first()).toBeVisible({ timeout: 8_000 });
        found = true;
        break;
      } catch {
        /* try next */
      }
    }
    if (!found) missing.push(sel);
  }
  return missing;
}

export function artifactsDir(...parts: string[]): string {
  const dir = path.join(process.cwd(), 'e2e', 'artifacts', ...parts);
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

export function appendFinding(file: string, finding: LayoutFinding): void {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const list: LayoutFinding[] = fs.existsSync(file)
    ? (JSON.parse(fs.readFileSync(file, 'utf8')) as LayoutFinding[])
    : [];
  list.push(finding);
  fs.writeFileSync(file, JSON.stringify(list, null, 2));
}
