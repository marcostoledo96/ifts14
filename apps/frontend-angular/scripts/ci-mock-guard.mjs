// Guard: falla si el entorno de producción usa mocks (useRealApi !== true).
// Lee src/environments/environment.ts via regex; sin parser TypeScript ni deps.
// ponytail: regex sobre el valor literal, suficiente para env de producción controlado.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const ENV_PATH = fileURLToPath(new URL('../src/environments/environment.ts', import.meta.url));
const src = readFileSync(ENV_PATH, 'utf8');
const match = src.match(/useRealApi:\s*(true|false)/);

if (!match) {
  console.error('CI ERROR: no se pudo leer useRealApi desde environment.ts');
  process.exit(1);
}

if (match[1] !== 'true') {
  console.error('CI ERROR: production environment uses mocks (useRealApi !== true)');
  process.exit(1);
}

console.log('ci-mock-guard: ok (useRealApi=true)');