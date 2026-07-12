// Guard: rechaza tests Jasmine enfocados (fit/fdescribe) y .only antes de correr la suite.
// ponytail: escaneo lineal de src, sin deps. Suficiente para repo de este tamaño.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../src', import.meta.url));
const PATTERNS = [/\bfdescribe\s*\(/, /\bfit\s*\(/, /\.only\s*\(/];
const violations = [];

function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      walk(full);
    } else if (entry.endsWith('.ts')) {
      const lines = readFileSync(full, 'utf8').split('\n');
      lines.forEach((line, i) => {
        if (PATTERNS.some((p) => p.test(line))) {
          violations.push(`${full}:${i + 1}: ${line.trim()}`);
        }
      });
    }
  }
}

walk(ROOT);

if (violations.length) {
  console.error('Tests enfocados detectados (fit/fdescribe/.only):');
  for (const v of violations) console.error('  ' + v);
  console.error('Quitá el foco antes de commitear.');
  process.exit(1);
}
console.log('no-focused-tests: ok');
