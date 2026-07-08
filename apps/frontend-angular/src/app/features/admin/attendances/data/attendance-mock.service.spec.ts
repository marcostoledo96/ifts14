import { TestBed } from '@angular/core/testing';
import { ATTENDANCE_SOURCE } from '../data/attendance.token';
import { AttendanceMockService } from '../data/attendance-mock.service';

describe('AttendanceMockService', () => {
  async function setup() {
    await TestBed.configureTestingModule({
      providers: [{ provide: ATTENDANCE_SOURCE, useClass: AttendanceMockService }],
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

  it('dniMostrar cumple formato XX****XX', async () => {
    const svc = await setup();
    const list = await svc.listarAlumnos(1);
    for (const a of list) {
      expect(a.dniMostrar).toMatch(/^\d{2}\*{4}\d{2}$/);
    }
  });

  it('no contiene email, DNI completo, token, legajo ni matrícula en campos', async () => {
    const svc = await setup();
    const list = await svc.listarAlumnos(1);
    for (const a of list) {
      expect(a.apellidoNombre).not.toMatch(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i);
      expect(a.dniMostrar).not.toMatch(/^\d{7,8}$/);
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