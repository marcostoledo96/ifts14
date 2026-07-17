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

  it('permite obtener el detalle del alumno de forma segura y consistente', async () => {
    const service = new InMemoryStudentsService();
    const result = await service.obtener(1);
    expect(result).not.toBeNull();
    if (result) {
      expect(result.nombre).toBe('Persona Uno');
      expect(result.ingreso).toBe('2021');
      expect(result.dniMostrar).toBe('00****01');
      expect(result.cursos.length).toBe(4);
      expect(JSON.stringify(result).toLowerCase()).not.toContain('legajo');
      expect(JSON.stringify(result).toLowerCase()).not.toContain('email@');
    }

    const resultInvalido = await service.obtener(999);
    expect(resultInvalido).toBeNull();
  });

  it('crear agrega alumno con dniMostrar enmascarado y sin email literal', async () => {
    const service = new InMemoryStudentsService();
    const created = await service.crear({ apellidoNombre: 'Prueba Alta', dni: '40111222' });
    expect(created.id).toBeGreaterThan(7);
    expect(created.apellido).toBe('Prueba');
    expect(created.nombre).toBe('Alta');
    expect(created.dniMostrar).toBe('40****22');
    expect(created.estado).toBe('activo');
    expect(JSON.stringify(created).toLowerCase()).not.toContain('40111222');
    expect(JSON.stringify(created)).not.toMatch(/"email"\s*:/);
    expect(JSON.stringify(created).toLowerCase()).not.toContain('@');
    const list = await service.listar();
    expect(list.some((a) => a.id === created.id)).toBeTrue();
  });
});

