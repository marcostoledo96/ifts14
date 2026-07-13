import { InMemoryStudentsService, seed } from '../in-memory-students.service';
import { StudentsListPage } from '../pages/list/students-list-page';

const forbiddenField = /(?:^|[^\w])["']?(?:dni|token|email|legajo|matr[ií]cula)["']?\s*:/i;
const forbiddenLiteral = /(?:^|[^\w])["'](?:dni|token|email|legajo|matr[ií]cula)["']/i;
const uuid = /\b[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\b/i;

describe('students no network or storage', () => {
  it('la fuente y carga no incorporan red, storage ni cookies', () => {
    const source = [seed.toString(), InMemoryStudentsService.toString(), StudentsListPage.prototype.recargar.toString()].join('\n').toLowerCase();
    for (const forbidden of ['httpclient', 'fetch(', 'xmlhttprequest', 'localstorage', 'sessionstorage', 'indexeddb', 'document.cookie']) expect(source).not.toContain(forbidden);
  });
  it('rechaza campos, literales e identificadores sensibles sin confundir dniMostrar', () => {
    const source = [
      JSON.stringify(seed),
      seed.toString(),
      InMemoryStudentsService.toString(),
      StudentsListPage.toString(),
      StudentsListPage.prototype.recargar.toString(),
    ].join('\n');
    expect(source).not.toMatch(forbiddenField);
    expect(source).not.toMatch(forbiddenLiteral);
    expect(source).not.toMatch(uuid);
    expect(source).toContain('dniMostrar');
    expect('{ dniMostrar: "00****01", tieneEmail: true }').not.toMatch(forbiddenField);
    for (const sample of ['dni: "123"', 'token:', 'email:', 'legajo:', 'matrícula:', '"legajo"', '123e4567-e89b-12d3-a456-426614174000']) {
      expect(forbiddenField.test(sample) || forbiddenLiteral.test(sample) || uuid.test(sample)).toBeTrue();
    }
  });
});
