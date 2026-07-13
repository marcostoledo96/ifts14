import { InMemoryStudentsService } from './in-memory-students.service';

describe('InMemoryStudentsService', () => {
  it('expone solo el DTO administrativo mínimo y seguro', async () => {
    const alumnos = await new InMemoryStudentsService().listar();
    expect(alumnos.length).toBeGreaterThan(6);
    expect(alumnos.every((a) => /^\d{2}\*{4}\d{2}$/.test(a.dniMostrar))).toBeTrue();
    expect(new Set(alumnos.map((a) => a.dniMostrar)).size).toBe(alumnos.length);
    expect(alumnos.every((a) => typeof a.tieneEmail === 'boolean')).toBeTrue();
    expect(JSON.stringify(alumnos).toLowerCase()).not.toContain('legajo');
  });
});
