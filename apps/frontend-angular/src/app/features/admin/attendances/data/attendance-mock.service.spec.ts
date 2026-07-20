import { TestBed } from '@angular/core/testing';
import { ATTENDANCE_SOURCE } from '../data/attendance.token';
import { AttendanceMockService } from '../data/attendance-mock.service';
import { COURSES_SOURCE } from '../../courses/courses.service';
import { InMemoryCoursesService } from '../../courses/in-memory-courses.service';

describe('AttendanceMockService', () => {
  async function setup() {
    await TestBed.configureTestingModule({
      providers: [
        { provide: COURSES_SOURCE, useClass: InMemoryCoursesService },
        { provide: ATTENDANCE_SOURCE, useClass: AttendanceMockService },
      ],
    }).compileComponents();
    const svc = TestBed.inject(ATTENDANCE_SOURCE);
    // __reset para arrancar limpio entre specs.
    (svc as unknown as { __reset: () => void }).__reset();
    return svc;
  }

  it('listarAlumnos devuelve 12–15 personas para curso 1', async () => {
    const svc = await setup();
    const list = await svc.listarAlumnos(1);
    expect(list.length).toBeGreaterThanOrEqual(12);
    expect(list.length).toBeLessThanOrEqual(15);
  });

  it('dniMostrar expone DNI completo ficticio (7–8 dígitos)', async () => {
    const svc = await setup();
    const list = await svc.listarAlumnos(1);
    for (const a of list) {
      expect(a.dniMostrar).toMatch(/^\d{7,8}$/);
    }
  });

  it('no contiene email, token, legajo ni matrícula en campos extra', async () => {
    const svc = await setup();
    const list = await svc.listarAlumnos(1);
    for (const a of list) {
      expect(a.apellidoNombre).not.toMatch(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i);
      // Sin campos extra: solo id, apellidoNombre, dniMostrar, estado.
      expect(Object.keys(a).sort()).toEqual(
        ['apellidoNombre', 'dniMostrar', 'estado', 'id'].sort(),
      );
    }
  });

  it('listarAsistencias devuelve vacío para fecha sin presentes (curso 1, fecha 11)', async () => {
    const svc = await setup();
    const list = await svc.listarAsistencias(1, 11);
    expect(list.length).toBe(0);
  });

  it('listarAsistencias devuelve presentes para fecha realizada (curso 4, fecha 41)', async () => {
    const svc = await setup();
    const list = await svc.listarAsistencias(4, 41);
    expect(list.length).toBe(8);
  });

  it('listarAsistenciasPorPar filtra por curso y alumno', async () => {
    const svc = await setup();
    // alumnoId seed curso 4: (4-1)*15 + 1 = 46
    const list = await svc.listarAsistenciasPorPar(4, 46);
    expect(list.length).toBeGreaterThanOrEqual(1);
    expect(list.every((a) => a.cursoId === 4 && a.alumnoId === 46)).toBeTrue();
  });

  it('listarAsistenciasPorAlumno filtra solo por alumno', async () => {
    const svc = await setup();
    const list = await svc.listarAsistenciasPorAlumno(46);
    expect(list.length).toBeGreaterThanOrEqual(1);
    expect(list.every((a) => a.alumnoId === 46)).toBeTrue();
  });

  it('marcar registra presentes en memoria', async () => {
    const svc = await setup();
    const alumnos = await svc.listarAlumnos(1);
    const marcados = alumnos.slice(0, 5).map((a) => ({ alumnoId: a.id, presente: true }));
    const result = await svc.marcar(1, 11, marcados);
    expect(result.length).toBe(5);
    const after = await svc.listarAsistencias(1, 11);
    expect(after.length).toBe(5);
  });

  it('marcar reemplaza presentes existentes (no duplica)', async () => {
    const svc = await setup();
    const alumnos = await svc.listarAlumnos(4);
    // Fecha 41 ya tiene 8 presentes; marcar 3 diferentes reemplaza el set.
    const marcados = alumnos.slice(0, 3).map((a) => ({ alumnoId: a.id, presente: true }));
    const result = await svc.marcar(4, 41, marcados);
    expect(result.length).toBe(3);
    const after = await svc.listarAsistencias(4, 41);
    expect(after.length).toBe(3);
  });

  it('marcar con presente=false no registra asistencia', async () => {
    const svc = await setup();
    const alumnos = await svc.listarAlumnos(1);
    const marcados = alumnos.slice(0, 3).map((a) => ({ alumnoId: a.id, presente: false }));
    const result = await svc.marcar(1, 11, marcados);
    expect(result.length).toBe(0);
  });

  it('marcar con fechaId desconocido rechaza con error controlado', async () => {
    const svc = await setup();
    const alumnos = await svc.listarAlumnos(1);
    const marcados = alumnos.slice(0, 3).map((a) => ({ alumnoId: a.id, presente: true }));
    await expectAsync(svc.marcar(1, 999, marcados)).toBeRejectedWithError(
      /Fecha no encontrada/,
    );
  });

  it('marcar reconoce fecha creada en la sesión (no está en seed estático)', async () => {
    const svc = await setup();
    const courses = TestBed.inject(COURSES_SOURCE);
    const hoyAr = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Argentina/Buenos_Aires',
    }).format(new Date());
    const nueva = await courses.guardarFecha(1, {
      id: null,
      fecha: hoyAr,
      descripcion: 'Fecha extra creada en sesión',
      orden: 99,
      estado: 'programada',
    });
    const alumnos = await svc.listarAlumnos(1);
    const marcados = alumnos.slice(0, 2).map((a) => ({ alumnoId: a.id, presente: true }));
    const result = await svc.marcar(1, nueva.id, marcados);
    expect(result.length).toBe(2);
    expect(result[0].fecha).toBe(hoyAr);
    // Same-day (hoy AR) permanece programada según auto-estado.
    expect(result[0].fechaEstado).toBe('programada');
    const after = await svc.listarAsistencias(1, nueva.id);
    expect(after.length).toBe(2);
  });

  it('marcar en fecha pasada pasa a realizada y actualiza el curso', async () => {
    const svc = await setup();
    const courses = TestBed.inject(COURSES_SOURCE);
    const nueva = await courses.guardarFecha(1, {
      id: null,
      fecha: '2020-03-01',
      descripcion: 'Fecha pasada auto',
      orden: 98,
      estado: 'programada',
    });
    const alumnos = await svc.listarAlumnos(1);
    const marcados = alumnos.slice(0, 1).map((a) => ({ alumnoId: a.id, presente: true }));
    const result = await svc.marcar(1, nueva.id, marcados);
    expect(result[0].fechaEstado).toBe('realizada');
    const det = await courses.obtener(1);
    expect(det.fechas.find((f) => f.id === nueva.id)?.estado).toBe('realizada');
  });

  it('marcar vacío en fecha realizada vuelve a programada', async () => {
    const svc = await setup();
    const courses = TestBed.inject(COURSES_SOURCE);
    const nueva = await courses.guardarFecha(1, {
      id: null,
      fecha: '2020-04-01',
      descripcion: 'Fecha a vaciar',
      orden: 97,
      estado: 'programada',
    });
    const alumnos = await svc.listarAlumnos(1);
    await svc.marcar(
      1,
      nueva.id,
      alumnos.slice(0, 2).map((a) => ({ alumnoId: a.id, presente: true })),
    );
    await svc.marcar(1, nueva.id, []);
    const det = await courses.obtener(1);
    expect(det.fechas.find((f) => f.id === nueva.id)?.estado).toBe('programada');
    const after = await svc.listarAsistencias(1, nueva.id);
    expect(after.length).toBe(0);
  });

  it('marcar rechaza fecha cancelada con error controlado', async () => {
    const svc = await setup();
    // Curso 5, fecha 51 está cancelada en el seed.
    const alumnos = await svc.listarAlumnos(5);
    const marcados = alumnos.slice(0, 2).map((a) => ({ alumnoId: a.id, presente: true }));
    await expectAsync(svc.marcar(5, 51, marcados)).toBeRejectedWithError(
      /cancelada/,
    );
    const after = await svc.listarAsistencias(5, 51);
    expect(after.length).toBe(0);
  });

  it('anular elimina una asistencia por id', async () => {
    const svc = await setup();
    const list = await svc.listarAsistencias(4, 41);
    const id = list[0].id;
    await svc.anular(id);
    const after = await svc.listarAsistencias(4, 41);
    expect(after.length).toBe(list.length - 1);
    expect(after.find((a) => a.id === id)).toBeUndefined();
  });

  it('anular con id inválido rechaza', async () => {
    const svc = await setup();
    await expectAsync(svc.anular(999999)).toBeRejected();
  });

  it('listarAlumnos con cursoId inválido rechaza', async () => {
    const svc = await setup();
    await expectAsync(svc.listarAlumnos(999)).toBeRejected();
  });

  it('listarAlumnos genera roster para curso creado en la sesión', async () => {
    const svc = await setup();
    const courses = TestBed.inject(COURSES_SOURCE);
    const creado = await courses.crear({
      codigo: 'CUR-QA',
      nombre: 'Curso QA asistencias',
      estado: 'activo',
    });
    const list = await svc.listarAlumnos(creado.id);
    expect(list.length).toBeGreaterThanOrEqual(12);
    expect(list.length).toBeLessThanOrEqual(15);
    // Segunda llamada reutiliza el mismo roster (misma longitud / ids).
    const again = await svc.listarAlumnos(creado.id);
    expect(again.map((a) => a.id)).toEqual(list.map((a) => a.id));
  });

  it('__reset restaura el estado seed', async () => {
    const svc = await setup();
    const alumnos = await svc.listarAlumnos(1);
    const marcados = alumnos.slice(0, 3).map((a) => ({ alumnoId: a.id, presente: true }));
    await svc.marcar(1, 11, marcados);
    const before = await svc.listarAsistencias(1, 11);
    expect(before.length).toBe(3);
    (svc as unknown as { __reset: () => void }).__reset();
    const after = await svc.listarAsistencias(1, 11);
    expect(after.length).toBe(0);
  });

  it('no llama fetch', async () => {
    const fetchSpy = spyOn(window, 'fetch').and.callThrough();
    const svc = await setup();
    await svc.listarAlumnos(1);
    await svc.marcar(1, 11, []);
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});