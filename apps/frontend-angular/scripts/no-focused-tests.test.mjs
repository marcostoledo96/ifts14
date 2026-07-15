import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

test('uses fileURLToPath for Windows-compatible paths', () => {
  const script = readFileSync(new URL('./no-focused-tests.mjs', import.meta.url), 'utf8');
  assert.match(script, /fileURLToPath\(new URL\('\.\.\/src', import\.meta\.url\)\)/);
  assert.doesNotMatch(script, /new URL\('\.\.\/src', import\.meta\.url\)\.pathname/);
});
