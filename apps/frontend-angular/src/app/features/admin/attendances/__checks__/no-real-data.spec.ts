// Verifica que el seed ficticio de asistencias no contiene datos plausibles
// reales: dniMostrar enmascarado, sin emails, sin DNI completo, sin nombres
// propios, sin tokens tipo UUID.
import { TestBed } from '@angular/core/testing';
import { ATTENDANCE_SOURCE } from '../data/attendance.token';
import { AttendanceMockService } from '../data/attendance-mock.service';
import { COURSES_SOURCE } from '../../courses/courses.service';
import { InMemoryCoursesService } from '../../courses/in-memory-courses.service';

describe('no-real-data en seed de asistencias', () => {
  let svc: import('../models/attendance.types').AttendanceService;

  beforeAll(async () => {
    await TestBed.configureTestingModule({
      providers: [
        { provide: COURSES_SOURCE, useClass: InMemoryCoursesService },
        { provide: ATTENDANCE_SOURCE, useClass: AttendanceMockService },
      ],
    }).compileComponents();
    svc = TestBed.inject(ATTENDANCE_SOURCE);
    (svc as unknown as { __reset: () => void }).__reset();
  });

  async function listarAlumnos(cursoId: number) {
    return svc.listarAlumnos(cursoId);
  }

  it('dniMostrar cumple formato XX****XX (no DNI completo)', async () => {
    const list = await listarAlumnos(1);
    for (const a of list) {
      expect(a.dniMostrar).toMatch(/^\d{2}\*{4}\d{2}$/);
      expect(a.dniMostrar).not.toMatch(/^\d{7,8}$/);
    }
  });

  it('apellidoNombre no contiene emails', async () => {
    const list = await listarAlumnos(1);
    for (const a of list) {
      expect(a.apellidoNombre).not.toMatch(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i);
    }
  });

  it('apellidoNombre usa placeholders neutros (A1..B15), no nombres propios', async () => {
    const list = await listarAlumnos(1);
    const texto = list.map((a) => a.apellidoNombre).join(' ');
    expect(texto).not.toMatch(/\b(Juan|María|Carlos|Sofía|Diego|Lucía|Pedro|Ana|Martín|José)\b/);
  });

  it('no hay tokens tipo UUID en nombres ni dniMostrar', async () => {
    const list = await listarAlumnos(1);
    const texto = list.map((a) => `${a.apellidoNombre} ${a.dniMostrar}`).join(' ');
    expect(texto).not.toMatch(
      /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i,
    );
  });

  it('los ids de alumno son pequeños (< 100), no DNIs plausibles', async () => {
    const list = await listarAlumnos(1);
    for (const a of list) {
      expect(a.id).toBeLessThan(100);
    }
  });

  it('12–15 alumnos por curso seed', async () => {
    for (let cid = 1; cid <= 6; cid++) {
      const list = await listarAlumnos(cid);
      expect(list.length).toBeGreaterThanOrEqual(12);
      expect(list.length).toBeLessThanOrEqual(15);
    }
  });

  it('solo campos permitidos en AsistenciaAlumno', async () => {
    const list = await listarAlumnos(1);
    for (const a of list) {
      expect(Object.keys(a).sort()).toEqual(
        ['apellidoNombre', 'dniMostrar', 'estado', 'id'].sort(),
      );
    }
  });
});