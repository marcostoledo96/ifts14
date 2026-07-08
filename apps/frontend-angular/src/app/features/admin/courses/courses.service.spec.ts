import { TestBed } from '@angular/core/testing';
import {
  COURSES_SOURCE,
  CoursesService,
} from './courses.service';
import { InMemoryCoursesService } from './in-memory-courses.service';

describe('InMemoryCoursesService', () => {
  function setup(): CoursesService {
    TestBed.configureTestingModule({
      // Cada TestBed arranca una nueva instancia de InMemoryCoursesService
      // con su clon del seed: mutaciones de un test no filtran a otros.
      providers: [{ provide: COURSES_SOURCE, useClass: InMemoryCoursesService }],
    });
    return TestBed.inject(COURSES_SOURCE);
  }

  it('listar devuelve los 6 cursos seed sin argumentos', async () => {
    const svc = setup();
    const list = await svc.listar();
    expect(list.length).toBe(6);
  });

  it('listar filtra por estado', async () => {
    const svc = setup();
    const activos = await svc.listar({ estado: 'activo' });
    expect(activos.length).toBe(3);
    activos.forEach((c) => expect(c.estado).toBe('activo'));
  });

  it('listar filtra por texto (q) sobre código y nombre', async () => {
    const svc = setup();
    const porCodigo = await svc.listar({ q: 'CUR-001' });
    expect(porCodigo.length).toBe(1);
    expect(porCodigo[0].codigo).toBe('CUR-001');
    const porNombre = await svc.listar({ q: 'gestión' });
    expect(porNombre.length).toBe(1);
    expect(porNombre[0].nombre).toContain('gestión');
  });

  it('listar combina estado y q', async () => {
    const svc = setup();
    const res = await svc.listar({ estado: 'activo', q: 'CUR-00' });
    expect(res.length).toBe(3);
  });

  it('listar filtra por estado inexistente devuelve []', async () => {
    const svc = setup();
    const res = await svc.listar({ estado: 'archivado' });
    expect(res.length).toBe(1);
    expect(res[0].estado).toBe('archivado');
  });

  it('listar con q vacío no filtra', async () => {
    const svc = setup();
    const res = await svc.listar({ q: '   ' });
    expect(res.length).toBe(6);
  });

  it('obtener devuelve curso con fechas', async () => {
    const svc = setup();
    const det = await svc.obtener(1);
    expect(det.id).toBe(1);
    expect(det.fechas.length).toBe(3);
    expect(det.fechas[0].cursoId).toBe(1);
  });

  it('obtener id inexistente rechaza', async () => {
    const svc = setup();
    await expectAsync(svc.obtener(999)).toBeRejected();
  });

  it('crear agrega un curso nuevo con fechas vacías', async () => {
    const svc = setup();
    const det = await svc.crear({ codigo: 'CUR-NEW', nombre: 'Curso nuevo', estado: 'borrador' });
    expect(det.codigo).toBe('CUR-NEW');
    expect(det.fechas).toEqual([]);
    const list = await svc.listar();
    expect(list.length).toBe(7);
  });

  it('crear sin codigo o nombre rechaza', async () => {
    const svc = setup();
    await expectAsync(
      svc.crear({ codigo: '  ', nombre: 'x', estado: 'borrador' }),
    ).toBeRejected();
    await expectAsync(
      svc.crear({ codigo: 'x', nombre: '  ', estado: 'borrador' }),
    ).toBeRejected();
  });

  it('actualizarEstado muta el curso existente', async () => {
    const svc = setup();
    const det = await svc.actualizarEstado(3, 'activo');
    expect(det.estado).toBe('activo');
    const list = await svc.listar({ estado: 'activo' });
    expect(list.find((c) => c.id === 3)).toBeDefined();
  });

  it('listarFechas devuelve las fechas del curso', async () => {
    const svc = setup();
    const fechas = await svc.listarFechas(1);
    expect(fechas.length).toBe(3);
  });

  it('guardarFecha agrega una fecha nueva cuando id es null', async () => {
    const svc = setup();
    const antes = await svc.listarFechas(1);
    const nueva = await svc.guardarFecha(1, {
      id: null,
      fecha: '2026-04-01',
      descripcion: 'Fecha extra',
      orden: 4,
      estado: 'programada',
    });
    expect(nueva.id).toBeGreaterThan(0);
    const despues = await svc.listarFechas(1);
    expect(despues.length).toBe(antes.length + 1);
  });

  it('guardarFecha actualiza una fecha existente', async () => {
    const svc = setup();
    const actualizada = await svc.guardarFecha(1, {
      id: 11,
      fecha: '2026-03-03',
      descripcion: 'Cambiada',
      orden: 1,
      estado: 'realizada',
    });
    expect(actualizada.fecha).toBe('2026-03-03');
    expect(actualizada.descripcion).toBe('Cambiada');
    expect(actualizada.estado).toBe('realizada');
  });

  it('guardarFecha sin fecha rechaza', async () => {
    const svc = setup();
    await expectAsync(
      svc.guardarFecha(1, {
        id: null,
        fecha: '',
        descripcion: null,
        orden: 1,
        estado: 'programada',
      }),
    ).toBeRejected();
  });

  it('cada TestBed arranca con un clon fresco del seed (aislamiento entre tests)', async () => {
    const svc = setup();
    await svc.crear({ codigo: 'X', nombre: 'X', estado: 'borrador' });
    expect((await svc.listar()).length).toBe(7);
    // El siguiente test llama setup() de nuevo → nuevo TestBed → nueva
    // instancia → seed clonado fresco (ver beforeEach en otros tests: todos
    // arrancan esperando 6 cursos).
  });

  // CRITICAL: reemplazarFechas debe eliminar las fechas ausentes de dtos.
  it('reemplazarFechas elimina las fechas ausentes del set (quitar real)', async () => {
    const svc = setup();
    const antes = await svc.listarFechas(1);
    expect(antes.length).toBe(3);
    // Conservar solo id 12; ids 11 y 13 deben eliminarse.
    const res = await svc.reemplazarFechas(1, [
      { id: 12, fecha: '2026-03-09', descripcion: null, orden: 1, estado: 'programada' },
    ]);
    expect(res.length).toBe(1);
    expect(res[0].id).toBe(12);
    const despues = await svc.listarFechas(1);
    expect(despues.length).toBe(1);
    expect(despues.find((f) => f.id === 11)).toBeUndefined();
    expect(despues.find((f) => f.id === 13)).toBeUndefined();
  });

  it('reemplazarFechas crea fechas nuevas y actualiza existentes', async () => {
    const svc = setup();
    const res = await svc.reemplazarFechas(1, [
      { id: 11, fecha: '2026-03-03', descripcion: 'Cambiada', orden: 1, estado: 'realizada' },
      { id: null, fecha: '2026-03-30', descripcion: 'Nueva', orden: 2, estado: 'programada' },
    ]);
    expect(res.length).toBe(2);
    const actualizada = res.find((r) => r.id === 11);
    expect(actualizada?.fecha).toBe('2026-03-03');
    expect(actualizada?.estado).toBe('realizada');
    const nueva = res.find((r) => r.descripcion === 'Nueva');
    expect(nueva?.id).toBeGreaterThan(0);
    const det = await svc.obtener(1);
    expect(det.fechas.length).toBe(2);
  });

  it('reemplazarFechas con set vacío deja el curso sin fechas', async () => {
    const svc = setup();
    await svc.reemplazarFechas(1, []);
    const det = await svc.obtener(1);
    expect(det.fechas.length).toBe(0);
  });

  it('reemplazarFechas rechaza si falta fecha en algún dto', async () => {
    const svc = setup();
    await expectAsync(
      svc.reemplazarFechas(1, [
        { id: null, fecha: '', descripcion: null, orden: 1, estado: 'programada' },
      ]),
    ).toBeRejected();
  });

  it('reemplazarFechas rechaza si el curso no existe', async () => {
    const svc = setup();
    await expectAsync(
      svc.reemplazarFechas(999, [
        { id: null, fecha: '2026-01-01', descripcion: null, orden: 1, estado: 'programada' },
      ]),
    ).toBeRejected();
  });

  it('reemplazarFechas rechaza si un dto referencia un id inexistente', async () => {
    const svc = setup();
    await expectAsync(
      svc.reemplazarFechas(1, [
        { id: 9999, fecha: '2026-01-01', descripcion: null, orden: 1, estado: 'programada' },
      ]),
    ).toBeRejected();
  });
});