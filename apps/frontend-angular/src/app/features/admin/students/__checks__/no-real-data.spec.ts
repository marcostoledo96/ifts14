import { seed } from '../in-memory-students.service';

describe('students privacy', () => {
  it('el seed usa DNI completo ficticio y emails @example.invalid opcionales', () => {
    const value = JSON.stringify(seed).toLowerCase();
    for (const forbidden of ['legajo', 'token', 'matricula', 'matrícula', 'uuid']) {
      expect(value).not.toContain(forbidden);
    }
    expect(seed.every((alumno) => /^\d{6,10}$/.test(alumno.dniMostrar))).toBeTrue();
    expect(new Set(seed.map((alumno) => alumno.dniMostrar)).size).toBe(seed.length);
    expect(
      seed.every(
        (alumno) =>
          alumno.email === null ||
          (typeof alumno.email === 'string' && alumno.email.endsWith('@example.invalid')),
      ),
    ).toBeTrue();
  });
});
