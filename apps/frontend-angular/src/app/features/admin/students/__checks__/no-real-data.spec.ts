import { seed } from '../in-memory-students.service';

describe('students privacy', () => {
  it('el seed no contiene identificadores o datos personales prohibidos', () => {
    const value = JSON.stringify(seed).toLowerCase();
    expect(value).not.toMatch(/"email"\s*:/);
    for (const forbidden of ['legajo', 'token', 'matricula', 'matrícula', 'uuid', '@']) {
      expect(value).not.toContain(forbidden);
    }
    expect(value).not.toMatch(/\d{8}/);
    expect(seed.every((alumno) => /^\d{2}\*{4}\d{2}$/.test(alumno.dniMostrar))).toBeTrue();
    expect(new Set(seed.map((alumno) => alumno.dniMostrar)).size).toBe(seed.length);
  });
});
