// Check autoritativo: Angular real + UI mock + CDP printToPDF, sin dependencias.
import { execFileSync, spawn } from 'node:child_process';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';

const BASE = process.env.APP_BASE || 'http://127.0.0.1:4321/certificados/';
const PORT = 49231;
const CASES = [
  ['1', 'normal', ['CERTIFICADO', 'Alumno Demo Uno', 'IFTS14-CERT-0001']],
  ['5', 'revocado', ['CERTIFICADO', 'Alumno Demo Cinco', 'IFTS14-CERT-0005', 'revocada']],
];
const FORBIDDEN = ['Saltar al contenido', 'Panel administrativo', 'Volver al expediente', 'Vista imprimible'];
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

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
    for (const [id, label, required] of CASES) {
      await evaluate(`history.pushState({}, '', '/certificados/admin/certificaciones/${id}/pdf'); window.dispatchEvent(new PopStateEvent('popstate'))`);
      await waitFor(`!!document.querySelector('app-certification-pdf-preview-page .certificado-folio')`, `${label} folio`);
      const layout = await evaluate(`(() => {
        const folio = document.querySelector('.certificado-folio');
        const style = getComputedStyle(folio);
        return { overflow: style.overflow, clipped: folio.scrollHeight > folio.clientHeight + 1, height: style.height };
      })()`);
      const file = `${outDir}/${label}.pdf`;
      const pdf = await cdp.send('Page.printToPDF', {
        landscape: true, printBackground: true, preferCSSPageSize: true,
        paperWidth: 11.69, paperHeight: 8.27, marginTop: 0, marginBottom: 0, marginLeft: 0, marginRight: 0,
      });
      writeFileSync(file, Buffer.from(pdf.data, 'base64'));
      const text = execFileSync('pdftotext', [file, '-'], { encoding: 'utf8' });
      const pages = (execFileSync('pdfinfo', [file], { encoding: 'utf8' }).match(/^Pages:\s+(\d+)/m) || [])[1];
      const failures = [
        pages !== '1' && `páginas: esperado 1, obtenido ${pages}`,
        layout.overflow !== 'visible' && `overflow print: ${layout.overflow}`,
        layout.clipped && `contenido recortado: ${layout.height}`,
        ...required.filter((value) => !text.toLowerCase().includes(value.toLowerCase())).map((value) => `ausente: ${value}`),
        ...FORBIDDEN.filter((value) => text.toLowerCase().includes(value.toLowerCase())).map((value) => `prohibido: ${value}`),
        /\b\d{7,8}\b/.test(text) && 'DNI completo detectado',
        /[0-9a-f]{8}-[0-9a-f]{4}/.test(text) && 'UUID detectado',
      ].filter(Boolean);
      results.push({ label, pages, file, failures });
    }
    let failed = 0;
    console.log('--- print-app-check (app Angular real) ---');
    for (const result of results) {
      failed += Boolean(result.failures.length);
      console.log(`[${result.failures.length ? 'FAIL' : 'PASS'}] ${result.label}: páginas=${result.pages} pdf=${result.file}`);
      result.failures.forEach((failure) => console.log(`  FAIL: ${failure}`));
    }
    console.log(`Veredicto: ${failed ? 'FAIL' : 'PASS'} (${results.length} casos)`);
    process.exitCode = failed ? 1 : 0;
  } finally {
    cdp?.close();
    chrome.kill('SIGTERM');
  }
}

main().catch((error) => { console.error(`FATAL: ${error.message}`); process.exitCode = 2; });
