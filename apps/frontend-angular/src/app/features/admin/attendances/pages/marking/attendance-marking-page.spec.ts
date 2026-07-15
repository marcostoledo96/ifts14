import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AttendanceMarkingPage } from './attendance-marking-page';
import { COURSES_SOURCE, CoursesService } from '../../../courses/courses.service';
import { InMemoryCoursesService } from '../../../courses/in-memory-courses.service';
import { ATTENDANCE_SOURCE } from '../../data/attendance.token';
import { Asistencia, AsistenciaAlumno, AttendanceService } from '../../models/attendance.types';
import { AttendanceMockService } from '../../data/attendance-mock.service';
import { CursoDetalle } from '../../../courses/courses.models';

describe('AttendanceMarkingPage', () => {
  async function render(id: number, fechaId: number) {
    await TestBed.configureTestingModule({
      imports: [AttendanceMarkingPage],
      providers: [
        provideRouter([]),
        { provide: COURSES_SOURCE, useClass: InMemoryCoursesService },
        { provide: ATTENDANCE_SOURCE, useClass: AttendanceMockService },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(AttendanceMarkingPage);
    fixture.componentRef.setInput('id', String(id));
    fixture.componentRef.setInput('fechaId', String(fechaId));
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    return fixture;
  }

  async function navigateTo(
    fixture: Awaited<ReturnType<typeof render>>,
    id: number,
    fechaId: number,
  ) {
    fixture.componentRef.setInput('id', String(id));
    fixture.componentRef.setInput('fechaId', String(fechaId));
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  }

  it('carga curso, fecha y alumnos', async () => {
    const f = await render(1, 11);
    const el = f.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Curso de introducción a la gestión');
    expect(el.textContent).toContain('2026-03-02');
    const rows = el.querySelectorAll('.alumno-row');
    expect(rows.length).toBeGreaterThanOrEqual(12);
  });

  it('muestra resumen de fecha en dl', async () => {
    const f = await render(1, 11);
    const el = f.nativeElement as HTMLElement;
    const dl = el.querySelector('.fecha-resumen');
    expect(dl).not.toBeNull();
    expect(dl?.tagName).toBe('DL');
  });

  it('dniMostrar visible y enmascarado (XX****XX)', async () => {
    const f = await render(1, 11);
    const el = f.nativeElement as HTMLElement;
    const dnis = Array.from(el.querySelectorAll('.alumno-dni')).map((s) => s.textContent);
    expect(dnis.length).toBeGreaterThan(0);
    for (const d of dnis) {
      expect(d).toMatch(/^\d{2}\*{4}\d{2}$/);
    }
  });

  it('checkboxes nativos con label asociado', async () => {
    const f = await render(1, 11);
    const el = f.nativeElement as HTMLElement;
    const checks = el.querySelectorAll('input[type="checkbox"]');
    expect(checks.length).toBeGreaterThan(0);
    checks.forEach((c) => {
      // Cada checkbox está dentro de un <label>.
      expect(c.parentElement?.tagName).toBe('LABEL');
    });
  });

  it('contador de marcados refleja selección inicial (0 para fecha sin presentes)', async () => {
    const f = await render(1, 11);
    const el = f.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Presentes (0)');
  });

  it('contador de marcados refleja baseline (8 para fecha realizada)', async () => {
    const f = await render(4, 41);
    const el = f.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Presentes (8)');
  });

  it('toggle checkbox actualiza contador', async () => {
    const f = await render(1, 11);
    const el = f.nativeElement as HTMLElement;
    const firstCheck = el.querySelector('input[type="checkbox"]') as HTMLInputElement;
    firstCheck.checked = true;
    firstCheck.dispatchEvent(new Event('change'));
    f.detectChanges();
    expect(el.textContent).toContain('Presentes (1)');
  });

  it('guardar persiste presentes en memoria', async () => {
    const f = await render(1, 11);
    const svc = TestBed.inject(ATTENDANCE_SOURCE);
    const before = await svc.listarAsistencias(1, 11);
    expect(before.length).toBe(0);
    // Marcar 3 primeros checkboxes.
    const checks = Array.from(
      (f.nativeElement as HTMLElement).querySelectorAll('input[type="checkbox"]'),
    ) as HTMLInputElement[];
    checks[0].checked = true;
    checks[0].dispatchEvent(new Event('change'));
    checks[1].checked = true;
    checks[1].dispatchEvent(new Event('change'));
    checks[2].checked = true;
    checks[2].dispatchEvent(new Event('change'));
    f.detectChanges();
    const btn = (f.nativeElement as HTMLElement).querySelector('.btn-primary') as HTMLButtonElement;
    btn.click();
    f.detectChanges();
    await f.whenStable();
    f.detectChanges();
    const after = await svc.listarAsistencias(1, 11);
    expect(after.length).toBe(3);
    expect((f.nativeElement as HTMLElement).textContent).toContain('guardada en memoria');
  });

  it('descartar restaura baseline', async () => {
    const f = await render(4, 41);
    const el = f.nativeElement as HTMLElement;
    // Baseline = 8 presentes. Desmarcar uno.
    const checks = Array.from(el.querySelectorAll('input[type="checkbox"]')) as HTMLInputElement[];
    checks[0].checked = false;
    checks[0].dispatchEvent(new Event('change'));
    f.detectChanges();
    expect(el.textContent).toContain('Presentes (7)');
    // Descartar → vuelve a 8.
    const descartarBtn = el.querySelector('.btn-secondary') as HTMLButtonElement;
    descartarBtn.click();
    f.detectChanges();
    expect(el.textContent).toContain('Presentes (8)');
  });

  it('guardado-feedback usa output aria-live polite (no anidado en BandaEstado)', async () => {
    const f = await render(1, 11);
    const el = f.nativeElement as HTMLElement;
    const output = el.querySelector('output[aria-live="polite"]');
    expect(output).not.toBeNull();
    // No debe estar dentro de BandaEstado (section.banda).
    expect(output?.closest('.banda')).toBeNull();
  });

  it('búsqueda filtra alumnos por nombre', async () => {
    const f = await render(1, 11);
    const el = f.nativeElement as HTMLElement;
    const input = el.querySelector('input[type="search"]') as HTMLInputElement;
    input.value = 'A1';
    input.dispatchEvent(new Event('input'));
    f.detectChanges();
    const rows = el.querySelectorAll('.alumno-row');
    expect(rows.length).toBeLessThan(12);
  });

  it('id inválido muestra error sin exponer datos', async () => {
    const f = await render(0, 0);
    const el = f.nativeElement as HTMLElement;
    await f.whenStable();
    f.detectChanges();
    expect(el.textContent).toContain('no encontrad');
  });

  it('fechaId no existente muestra error controlado sin body en blanco (999)', async () => {
    const f = await render(1, 999);
    const el = f.nativeElement as HTMLElement;
    await f.whenStable();
    f.detectChanges();
    // No revienta, no deja body en blanco: estado alert + link de recuperación.
    const alert = el.querySelector('[role="alert"]');
    expect(alert).not.toBeNull();
    expect(alert?.textContent).toContain('Fecha no encontrada');
    // Enlace de retorno a Asistencias.
    const links = Array.from(el.querySelectorAll('a'));
    expect(links.some((a) => a.getAttribute('routerLink') === '/admin/asistencias')).toBe(true);
    // No hay lista de alumnos (no body de marcado).
    expect(el.querySelectorAll('.alumno-row').length).toBe(0);
  });

  it('no llama fetch', async () => {
    const fetchSpy = spyOn(window, 'fetch').and.callThrough();
    await render(1, 11);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  // --- Route reuse ---

  it('route reuse: navegar de curso 1/fecha 11 a curso 2/fecha 21 recarga datos', async () => {
    const f = await render(1, 11);
    expect(f.componentInstance.detalle()?.id).toBe(1);
    const alumnos1 = f.componentInstance.alumnos().length;
    await navigateTo(f, 2, 21);
    expect(f.componentInstance.detalle()?.id).toBe(2);
    const alumnos2 = f.componentInstance.alumnos().length;
    // Curso 1 tiene 13 alumnos (12 + 1), curso 2 tiene 14 (12 + 2).
    expect(alumnos1).not.toBe(alumnos2);
  });

  it('route reuse: navegar a id inválido limpia estado sin retener datos previos', async () => {
    const f = await render(1, 11);
    expect(f.componentInstance.detalle()?.id).toBe(1);
    await navigateTo(f, 0, 0);
    expect(f.componentInstance.detalle()).toBeNull();
    expect(f.componentInstance.alumnos().length).toBe(0);
    expect(f.componentInstance.error()).toContain('no encontrad');
  });

  // CRITICAL: el guard `loadGen` descarta cargas stale cuando cursoId/fechaId
  // cambia antes de resolver. Sin controles de orden async, la promise de la
  // carga anterior resuelve DESPUÉS de la nueva y sobrescribe la pantalla
  // vigente. Este fake permite resolver manualmente las promises fuera de
  // orden para verificar el guard de forma determinística.
  it('route reuse: carga stale no sobrescribe pantalla vigente (out-of-order)', async () => {
    const pending = new Map<
      string,
      { resolve: (v: unknown) => void }
    >();

    const fakeCourses: CoursesService = {
      listar: () => Promise.resolve([]),
      obtener: (id: number) =>
        new Promise<CursoDetalle>((resolve) => {
          pending.set(`c-${id}`, { resolve: resolve as (v: unknown) => void });
        }),
      crear: () => Promise.reject(new Error('noop')),
      actualizarEstado: () => Promise.reject(new Error('noop')),
      listarFechas: () => Promise.resolve([]),
      guardarFecha: () => Promise.reject(new Error('noop')),
      reemplazarFechas: () => Promise.reject(new Error('noop')),
    };
    const fakeAttendance: AttendanceService = {
      listarAlumnos: (cid: number) =>
        new Promise<readonly AsistenciaAlumno[]>((resolve) => {
          pending.set(`a-${cid}`, { resolve: resolve as (v: unknown) => void });
        }),
      listarAsistencias: (cid: number, fid: number) =>
        new Promise<readonly Asistencia[]>((resolve) => {
          pending.set(`s-${cid}-${fid}`, { resolve: resolve as (v: unknown) => void });
        }),
      marcar: () => Promise.resolve([]),
      anular: () => Promise.resolve(),
    };

    await TestBed.configureTestingModule({
      imports: [AttendanceMarkingPage],
      providers: [
        provideRouter([]),
        { provide: COURSES_SOURCE, useValue: fakeCourses },
        { provide: ATTENDANCE_SOURCE, useValue: fakeAttendance },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(AttendanceMarkingPage);
    fixture.componentRef.setInput('id', '1');
    fixture.componentRef.setInput('fechaId', '11');
    fixture.detectChanges();
    // obtener(1), listarAlumnos(1), listarAsistencias(1,11) pendientes.
    expect(pending.has('c-1')).toBe(true);

    // Cambiar a curso 2/fecha 21 sin resolver la carga de 1 todavía.
    fixture.componentRef.setInput('id', '2');
    fixture.componentRef.setInput('fechaId', '21');
    fixture.detectChanges();
    expect(pending.has('c-2')).toBe(true);

    // Resolver curso 2 PRIMERO (orden correcto de llegada).
    pending.get('c-2')!.resolve({
      id: 2,
      codigo: 'CUR-002',
      nombre: 'Curso de herramientas administrativas',
      estado: 'activo',
      createdAt: '',
      updatedAt: '',
      fechas: [{ id: 21, cursoId: 2, fecha: '2026-04-05', descripcion: null, orden: 1, estado: 'programada' }],
    });
    pending.get('a-2')!.resolve([]);
    pending.get('s-2-21')!.resolve([]);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(fixture.componentInstance.detalle()?.id).toBe(2);

    // Ahora resolver curso 1 TARDE (carga stale). loadGen debe descartarla.
    pending.get('c-1')!.resolve({
      id: 1,
      codigo: 'CUR-001',
      nombre: 'Curso de introducción a la gestión',
      estado: 'activo',
      createdAt: '',
      updatedAt: '',
      fechas: [{ id: 11, cursoId: 1, fecha: '2026-03-02', descripcion: null, orden: 1, estado: 'programada' }],
    });
    pending.get('a-1')!.resolve([]);
    pending.get('s-1-11')!.resolve([]);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    // La pantalla sigue mostrando curso 2; la carga stale de 1 se descartó.
    expect(fixture.componentInstance.detalle()?.id).toBe(2);
    expect(fixture.componentInstance.detalle()?.nombre).toBe(
      'Curso de herramientas administrativas',
    );
  });

  // CRITICAL: el guard `saveCid/saveFid` descarta el resultado de un guardado
  // stale cuando la ruta cambia mientras marcar() está en vuelo. Sin este
  // guard, baseline/ok/guardando de la pantalla vigente se mutan con datos
  // de la ruta anterior. Fake de servicios permite resolver manualmente.
  it('route reuse: guardado stale no muta baseline/ok de pantalla vigente (out-of-order save)', async () => {
    const pendingMarcar = new Map<
      string,
      { resolve: (v: readonly Asistencia[]) => void; reject: (e: Error) => void }
    >();

    const fakeCourses: CoursesService = {
      listar: () => Promise.resolve([]),
      obtener: (id: number) =>
        Promise.resolve({
          id,
          codigo: `CUR-${String(id).padStart(3, '0')}`,
          nombre: `Curso ${id}`,
          estado: 'activo' as const,
          createdAt: '',
          updatedAt: '',
          cuatrimestre: '1.er cuatrimestre 2026',
          cantidadFechas: 1,
          fechas: [{ id: id * 10 + 1, cursoId: id, fecha: '2026-01-01', descripcion: null, orden: 1, estado: 'programada' as const }],
        }),
      crear: () => Promise.reject(new Error('noop')),
      actualizarEstado: () => Promise.reject(new Error('noop')),
      listarFechas: () => Promise.resolve([]),
      guardarFecha: () => Promise.reject(new Error('noop')),
      reemplazarFechas: () => Promise.reject(new Error('noop')),
    };
    const fakeAttendance: AttendanceService = {
      listarAlumnos: () => Promise.resolve([
        { id: 1, apellidoNombre: 'A1 B1', dniMostrar: '11****11', estado: 'activo' as const },
        { id: 2, apellidoNombre: 'A2 B2', dniMostrar: '22****22', estado: 'activo' as const },
      ]),
      listarAsistencias: () => Promise.resolve([]),
      marcar: (cid: number, fid: number) =>
        new Promise<readonly Asistencia[]>((resolve, reject) => {
          pendingMarcar.set(`${cid}-${fid}`, { resolve, reject });
        }),
      anular: () => Promise.resolve(),
    };

    await TestBed.configureTestingModule({
      imports: [AttendanceMarkingPage],
      providers: [
        provideRouter([]),
        { provide: COURSES_SOURCE, useValue: fakeCourses },
        { provide: ATTENDANCE_SOURCE, useValue: fakeAttendance },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(AttendanceMarkingPage);
    fixture.componentRef.setInput('id', '1');
    fixture.componentRef.setInput('fechaId', '11');
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    // Marcar un presente y disparar guardar().
    const checks = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll('input[type="checkbox"]'),
    ) as HTMLInputElement[];
    checks[0].checked = true;
    checks[0].dispatchEvent(new Event('change'));
    fixture.detectChanges();
    const btn = (fixture.nativeElement as HTMLElement).querySelector('.btn-primary') as HTMLButtonElement;
    btn.click();
    fixture.detectChanges();
    await fixture.whenStable();
    // marcar(1,11) está pendiente. Guardando=true.
    expect(fixture.componentInstance.guardando()).toBe(true);
    expect(pendingMarcar.has('1-11')).toBe(true);

    // Cambiar la ruta a curso 2/fecha 21 sin resolver el guardado de 1.
    fixture.componentRef.setInput('id', '2');
    fixture.componentRef.setInput('fechaId', '21');
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(fixture.componentInstance.courseId()).toBe(2);

    // Resolver el guardado stale de 1-11 AHORA (fuera de orden).
    pendingMarcar.get('1-11')!.resolve([
      { id: 5000, alumnoId: 1, cursoId: 1, cursoFechaId: 11, fecha: '2026-01-01', fechaEstado: 'programada' as const, registradoEn: '' },
    ]);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    // La pantalla vigente (curso 2) no debe reflejar el guardado de curso 1:
    // ok vacío, baseline sin el alumno del curso 1, guardando no atascado.
    expect(fixture.componentInstance.ok()).toBe('');
    expect(fixture.componentInstance.baseline().size).toBe(0);
    expect(fixture.componentInstance.guardando()).toBe(false);
  });
});
