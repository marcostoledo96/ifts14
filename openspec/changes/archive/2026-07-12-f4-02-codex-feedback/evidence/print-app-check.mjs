// Checker autoritativo: Angular real + CDP printToPDF para los estados F4-02.
import { execFileSync, spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';

const BASE = process.env.APP_BASE || 'http://127.0.0.1:4321/certificados/';
const PORT = 49232;
export const CASES = [
  {
    id: '1', label: 'vigente', certificateNumber: 'IFTS14-CERT-0001', student: 'Alumno Demo Uno',
    course: 'Curso de introducción a la gestión', dates: ['2026-03-02', '2026-03-09', '2026-03-16'], stateMark: null,
  },
  {
    id: '3', label: 'borrador', certificateNumber: 'IFTS14-CERT-0003', student: 'Alumno Demo Tres',
    course: 'Curso de prácticas documentales', dates: ['2026-05-04'], stateMark: 'BORRADOR',
  },
  {
    id: '4', label: 'vencido', certificateNumber: 'IFTS14-CERT-0004', student: 'Alumno Demo Cuatro',
    course: 'Curso de procedimientos básicos', dates: ['2025-09-01', '2025-09-08'], stateMark: 'VENCIDO',
  },
  {
    id: '5', label: 'revocado', certificateNumber: 'IFTS14-CERT-0005', student: 'Alumno Demo Cinco',
    course: 'Curso de registros y archivo', dates: ['2025-06-10'], stateMark: 'REVOCADO',
  },
];
const FORBIDDEN = [
  'Saltar al contenido', 'Panel administrativo', 'Volver al expediente', 'Vista imprimible',
  'dictado entre', 'legajo', 'matrícula', 'matricula',
];
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export function hasExpectedIdentity(text, expected) {
  const normalized = text.toLocaleLowerCase();
  return [expected.certificateNumber, expected.student, expected.course]
    .every((value) => normalized.includes(value.toLocaleLowerCase()));
}

class Cdp {
  constructor(url) {
    this.id = 0;
    this.pending = new Map();
    this.ws = new WebSocket(url);
    this.ready = new Promise((resolve, reject) => {
      this.ws.onopen = resolve;
      this.ws.onerror = () => reject(new Error('CDP WebSocket no disponible'));
    });
    this.ws.onmessage = ({ data }) => {
      const message = JSON.parse(data);
      const pending = this.pending.get(message.id);
      if (!pending) return;
      this.pending.delete(message.id);
      message.error ? pending.reject(new Error(message.error.message)) : pending.resolve(message.result);
    };
  }
  async send(method, params = {}) {
    await this.ready;
    const id = ++this.id;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }
  close() { this.ws.close(); }
}

async function retry(action, label) {
  for (let i = 0; i < 60; i++) {
    try { const result = await action(); if (result) return result; } catch {}
    await sleep(500);
  }
  throw new Error(`timeout: ${label}`);
}

async function main() {
  const outDir = process.argv[2] || '.app-pdf-check';
  rmSync(outDir, { recursive: true, force: true });
  mkdirSync(outDir, { recursive: true });
  const chrome = spawn(process.env.CHROME || 'google-chrome', [
    '--headless=new', '--no-sandbox', '--disable-gpu', '--no-first-run',
    `--remote-debugging-port=${PORT}`, '--remote-debugging-address=127.0.0.1', BASE,
  ], { stdio: 'ignore' });
  let cdp;
  try {
    const tab = await retry(async () => {
      const response = await fetch(`http://127.0.0.1:${PORT}/json/new?about:blank`, { method: 'PUT' });
      return (await response.json()).webSocketDebuggerUrl;
    }, 'CDP');
    cdp = new Cdp(tab);
    const evaluate = async (expression) => (await cdp.send('Runtime.evaluate', {
      expression, awaitPromise: true, returnByValue: true,
    })).result?.value;
    const waitFor = (expression, label) => retry(() => evaluate(expression), label);
    await cdp.send('Page.enable');
    await cdp.send('Emulation.setEmulatedMedia', { media: 'print' });
    await cdp.send('Page.navigate', { url: `${BASE}admin/login` });
    await waitFor(`!!document.querySelector('app-login-form form')`, 'login UI');
    await evaluate(`(() => {
      for (const [selector, value] of [['#login-usuario', 'admin_demo'], ['#login-clave', 'clave_demo_123']]) {
        const input = document.querySelector(selector);
        Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(input, value);
        input.dispatchEvent(new Event('input', { bubbles: true }));
      }
      document.querySelector('app-login-form button[type=submit]').click();
    })()`);
    await waitFor(`!!document.querySelector('app-admin-shell')`, 'sesión mock por UI');

    const results = [];
    for (const expected of CASES) {
      const { id, label, dates, stateMark } = expected;
      await evaluate(`history.pushState({}, '', '/certificados/admin/certificaciones/${id}/pdf'); window.dispatchEvent(new PopStateEvent('popstate'))`);
      const identity = JSON.stringify([expected.certificateNumber, expected.student, expected.course]);
      await waitFor(`(() => {
        const folio = document.querySelector('app-certification-pdf-preview-page .certificado-folio');
        const text = folio?.textContent?.toLocaleLowerCase() || '';
        return !!folio
          && !document.querySelector('app-certification-pdf-preview-page .estado-linea')
          && ${identity}.every((value) => text.includes(value.toLocaleLowerCase()));
      })()`, `${label} identidad y carga`);
      const layout = await evaluate(`(() => {
        const folio = document.querySelector('.certificado-folio');
        const style = getComputedStyle(folio);
        const text = folio?.textContent || '';
        return {
          overflow: style.overflow,
          clipped: folio.scrollHeight > folio.clientHeight + 1,
          identity: ${identity}.every((value) => text.toLocaleLowerCase().includes(value.toLocaleLowerCase())),
          loading: !!document.querySelector('app-certification-pdf-preview-page .estado-linea'),
          dates: ${JSON.stringify(dates)}.every((date) => text.includes(date)),
          mark: document.querySelector('.cert-estado-marca')?.textContent?.trim() || '',
          band: document.querySelector('.cert-estado-banda')?.textContent?.trim() || '',
        };
      })()`);
      const prePrintFailures = [
        !layout.identity && `identidad esperada ausente: ${expected.certificateNumber}`,
        layout.loading && 'folio todavía en carga',
        !layout.dates && 'fechas esperadas ausentes en el DOM',
        stateMark === null
          ? (layout.mark || layout.band) && 'vigente contiene marca o banda'
          : layout.mark !== stateMark && `marca: esperado ${stateMark}, obtenido ${layout.mark || 'ausente'}`,
        stateMark && !layout.band && 'banda de estado ausente',
      ].filter(Boolean);
      if (prePrintFailures.length) throw new Error(`${label} antes de imprimir: ${prePrintFailures.join('; ')}`);
      const file = `${outDir}/${label}.pdf`;
      const pdf = await cdp.send('Page.printToPDF', {
        landscape: true, printBackground: true, preferCSSPageSize: true,
        paperWidth: 11.69, paperHeight: 8.27, marginTop: 0, marginBottom: 0, marginLeft: 0, marginRight: 0,
      });
      const bytes = Buffer.from(pdf.data, 'base64');
      writeFileSync(file, bytes);
      const text = execFileSync('pdftotext', [file, '-'], { encoding: 'utf8' });
      const pages = (execFileSync('pdfinfo', [file], { encoding: 'utf8' }).match(/^Pages:\s+(\d+)/m) || [])[1];
      const failures = [
        pages !== '1' && `páginas: esperado 1, obtenido ${pages}`,
        layout.overflow !== 'visible' && `overflow print: ${layout.overflow}`,
        layout.clipped && 'contenido recortado',
        !layout.identity && `identidad esperada ausente: ${expected.certificateNumber}`,
        layout.loading && 'folio todavía en carga',
        !layout.dates && 'fechas esperadas ausentes en el DOM antes de imprimir',
        ...dates.filter((date) => !text.includes(date)).map((date) => `fecha ausente: ${date}`),
        stateMark === null
          ? (layout.mark || layout.band) && 'vigente contiene marca o banda'
          : layout.mark !== stateMark && `marca: esperado ${stateMark}, obtenido ${layout.mark || 'ausente'}`,
        stateMark && !layout.band && 'banda de estado ausente',
        ...FORBIDDEN.filter((value) => text.toLowerCase().includes(value.toLowerCase())).map((value) => `prohibido: ${value}`),
        /\b\d{7,8}\b/.test(text) && 'DNI completo detectado',
        /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i.test(text) && 'UUID detectado',
        /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i.test(text) && 'email detectado',
      ].filter(Boolean);
      results.push({ label, pages, file, hash: createHash('sha256').update(bytes).digest('hex'), failures });
    }
    writeFileSync('openspec/changes/f4-02-codex-feedback/evidence/print-hashes.txt', `${results.map((r) => `${r.hash}  ${r.label}.pdf`).join('\n')}\n`);
    let failed = 0;
    console.log('--- print-app-check (app Angular real) ---');
    for (const result of results) {
      failed += Boolean(result.failures.length);
      console.log(`[${result.failures.length ? 'FAIL' : 'PASS'}] ${result.label}: páginas=${result.pages} sha256=${result.hash}`);
      result.failures.forEach((failure) => console.log(`  FAIL: ${failure}`));
    }
    console.log(`Veredicto: ${failed ? 'FAIL' : 'PASS'} (${results.length} casos)`);
    process.exitCode = failed ? 1 : 0;
  } finally {
    cdp?.close();
    chrome.kill('SIGTERM');
  }
}

if (process.argv[1] && import.meta.url === new URL(process.argv[1], 'file:').href) {
  main().catch((error) => { console.error(`FATAL: ${error.message}`); process.exitCode = 2; });
}
