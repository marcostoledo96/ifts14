import { InMemoryStudentsService } from './in-memory-students.service';

describe('InMemoryStudentsService', () => {
  it('expone el DTO administrativo con DNI completo ficticio', async () => {
    const alumnos = await new InMemoryStudentsService().listar();
    expect(alumnos.length).toBeGreaterThan(6);
    expect(alumnos.every((a) => /^\d{7,8}$/.test(a.dniMostrar))).toBeTrue();
    expect(new Set(alumnos.map((a) => a.dniMostrar)).size).toBe(alumnos.length);
    expect(alumnos.every((a) => typeof a.tieneEmail === 'boolean')).toBeTrue();
    expect(alumnos.every((a) => a.email === null || a.email.includes('@example.invalid'))).toBeTrue();
    expect(JSON.stringify(alumnos).toLowerCase()).not.toContain('legajo');
  });

  it('permite obtener el detalle del alumno de forma consistente', async () => {
    const service = new InMemoryStudentsService();
    const result = await service.obtener(1);
    expect(result).not.toBeNull();
    if (result) {
      expect(result.nombre).toBe('Persona Uno');
      expect(result.ingreso).toBe('2021');
      expect(result.dniMostrar).toBe('20111222');
      expect(result.email).toBe('persona.uno@example.invalid');
      expect(result.cursos.length).toBe(4);
      expect(JSON.stringify(result).toLowerCase()).not.toContain('legajo');
    }

    const resultInvalido = await service.obtener(999);
    expect(resultInvalido).toBeNull();
  });

  it('crear agrega alumno con dniMostrar completo y email opcional', async () => {
    const service = new InMemoryStudentsService();
    const created = await service.crear({
      apellidoNombre: 'Prueba Alta',
      dni: '40111222',
      email: 'prueba.alta@example.invalid',
    });
    expect(created.id).toBeGreaterThan(7);
    expect(created.apellido).toBe('Prueba');
    expect(created.nombre).toBe('Alta');
    expect(created.dniMostrar).toBe('40111222');
    expect(created.email).toBe('prueba.alta@example.invalid');
    expect(created.tieneEmail).toBeTrue();
    expect(created.estado).toBe('activo');
    const list = await service.listar();
    expect(list.some((a) => a.id === created.id)).toBeTrue();
  });

  it('crear rechaza DNI duplicado con 409 y id existente', async () => {
    const service = new InMemoryStudentsService();
    await expectAsync(
      service.crear({ apellidoNombre: 'Otro Nombre', dni: '20111222' }),
    ).toBeRejectedWith(
      jasmine.objectContaining({ status: 409, existingStudentId: 1 }),
    );
  });
});
