import test from 'node:test';
import assert from 'node:assert/strict';
import { CASES, hasExpectedIdentity } from './print-app-check.mjs';

test('an identity from the preceding case does not satisfy the next case', () => {
  for (let index = 1; index < CASES.length; index += 1) {
    const previous = CASES[index - 1];
    const current = CASES[index];
    const staleFolio = [previous.certificateNumber, previous.student, previous.course].join('\n');

    assert.equal(hasExpectedIdentity(staleFolio, current), false, `${previous.label} must not satisfy ${current.label}`);
  }
});
