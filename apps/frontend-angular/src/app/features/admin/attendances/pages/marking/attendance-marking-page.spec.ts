import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { CERTIFICATIONS_SOURCE } from '../../../certifications/certifications.service';
import { InMemoryCertificationsService } from '../../../certifications/in-memory-certifications.service';
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
        { provide: CERTIFICATIONS_SOURCE, useClass: InMemoryCertificationsService },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(AttendanceMarkingPage);
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.resolveTo(true);
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

  function toggles(el: HTMLElement): HTMLButtonElement[] {
    return Array.from(el.querySelectorAll('.toggle-presente')) as HTMLButtonElement[];
  }

  it('carga curso, fecha y alumnos', async () => {
    const f = await render(1, 11);
    const el = f.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Curso de introducción a la gestión');
    expect(el.textContent).toMatch(/02 de mar/i);
    expect(el.querySelector('.fecha-select')?.getAttribute('value') ?? (el.querySelector('.fecha-select') as HTMLSelectElement).value).toBe('11');
    const rows = el.querySelectorAll('.alumno-row');
    expect(rows.length).toBeGreaterThanOrEqual(12);
  });

  it('enlaces Volver al curso y Ver curso apuntan al detalle', async () => {
    const f = await render(1, 11);
    const el = f.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Volver al curso');
    expect(el.textContent).toContain('Asistencias y certificados');
    expect(el.textContent).toContain('Alumnos del curso');
    expect(el.textContent).toContain('Ver certificados del curso');
    const cta = el.querySelector('[data-testid="cta-ver-certificados"]') as HTMLAnchorElement;
    expect(cta.getAttribute('href')).toContain('/admin/cursos/1/fechas/11/asistencias/certificados');
    const links = Array.from(el.querySelectorAll('a[href*="/admin/cursos/1"]')) as HTMLAnchorElement[];
    expect(links.length).toBeGreaterThanOrEqual(2);
  });

  it('no inventa legajo ni email en el roster', async () => {
    const f = await render(1, 11);
    const el = f.nativeElement as HTMLElement;
    const text = (el.textContent || '').toLowerCase();
    expect(text).not.toContain('leg-');
    expect(text).not.toContain('@');
    expect(text).not.toContain('example.invalid');
  });

  it('dniMostrar visible con DNI completo ficticio', async () => {
    const f = await render(1, 11);
    const el = f.nativeElement as HTMLElement;
    const dnis = Array.from(el.querySelectorAll('.alumno-dni')).map((s) => s.textContent);
    expect(dnis.length).toBeGreaterThan(0);
    for (const d of dnis) {
      expect(d).toMatch(/^\d{7,8}$/);
    }
  });

  it('marcado usa toggle accesible (button aria-pressed), no checkbox nativo', async () => {
    const f = await render(3, 31);
    const el = f.nativeElement as HTMLElement;
    expect(el.querySelectorAll('input[type="checkbox"]').length).toBe(0);
    const btns = toggles(el);
    expect(btns.length).toBeGreaterThan(0);
    btns.forEach((b) => {
      expect(b.getAttribute('aria-pressed')).toBe('false');
      expect(b.textContent?.trim()).toContain('Marcar');
    });
  });

  it('toggle presente cambia aria-pressed y copy a «✓ Presente»', async () => {
    const f = await render(3, 31);
    const el = f.nativeElement as HTMLElement;
    const first = toggles(el)[0];
    first.click();
    f.detectChanges();
    expect(first.getAttribute('aria-pressed')).toBe('true');
    expect(first.textContent).toContain('Presente');
  });

  it('contador de marcados refleja selección inicial (0 para fecha sin presentes)', async () => {
    const f = await render(3, 31);
    const el = f.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Presentes (0)');
  });

  it('contador de marcados refleja baseline (8 para fecha realizada)', async () => {
    const f = await render(4, 41);
    const el = f.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Presentes (8)');
  });

  it('toggle actualiza contador', async () => {
    const f = await render(3, 31);
    const el = f.nativeElement as HTMLElement;
    toggles(el)[0].click();
    f.detectChanges();
    expect(el.textContent).toContain('Presentes (1)');
  });

  it('Guardar y generar deshabilitado sin presentes ni cambios; habilitado al marcar', async () => {
    const f = await render(3, 31);
    const el = f.nativeElement as HTMLElement;
    const btn = el.querySelector('[data-testid="cta-guardar-generar"]') as HTMLButtonElement;
    expect(btn.disabled).toBe(true);
    expect(btn.textContent).toContain('Guardar y generar certificados');
    toggles(el)[0].click();
    f.detectChanges();
    expect(btn.disabled).toBe(false);
  });

  it('con presentes ya guardados permite regenerar sin dirty', async () => {
    const f = await render(4, 41);
    const btn = (f.nativeElement as HTMLElement).querySelector(
      '[data-testid="cta-guardar-generar"]',
    ) as HTMLButtonElement;
    expect(btn.disabled).toBe(false);
  });

  it('resumen muestra cambios sin guardar', async () => {
    const f = await render(3, 31);
    const el = f.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Sin cambios pendientes');
    toggles(el)[0].click();
    f.detectChanges();
    const cambios = el.querySelector('.resumen-cambios');
    expect(cambios?.textContent).toContain('marcado');
  });

  it('guardar persiste presentes en memoria y redirige a certificados', async () => {
    const f = await render(3, 31);
    const router = TestBed.inject(Router);
    const svc = TestBed.inject(ATTENDANCE_SOURCE);
    const before = await svc.listarAsistencias(3, 31);
    expect(before.length).toBe(0);
    const btns = toggles(f.nativeElement as HTMLElement);
    btns[0].click();
    btns[1].click();
    btns[2].click();
    f.detectChanges();
    const btn = (f.nativeElement as HTMLElement).querySelector(
      '[data-testid="cta-guardar-generar"]',
    ) as HTMLButtonElement;
    btn.click();
    f.detectChanges();
    await f.whenStable();
    f.detectChanges();
    const after = await svc.listarAsistencias(3, 31);
    expect(after.length).toBe(3);
    expect(router.navigate).toHaveBeenCalledWith(
      ['/admin/cursos', 3, 'fechas', 31, 'asistencias', 'certificados'],
      jasmine.objectContaining({
        state: jasmine.objectContaining({
          mensaje: jasmine.stringMatching(/Asistencias guardadas/),
        }),
      }),
    );
  });

  it('guardarYGenerar emite nuevos, regenera vigentes y navega a la página de certificados', async () => {
    const f = await render(1, 11);
    const router = TestBed.inject(Router);
    const certs = TestBed.inject(CERTIFICATIONS_SOURCE);
    const emitirSpy = spyOn(certs, 'emitir').and.callThrough();
    const regenerarSpy = spyOn(certs, 'regenerarPdf').and.callThrough();
    const vigenteAntes = (await certs.listar({ cursoId: 1, alumnoId: 1, estado: 'vigente' }))[0];
    expect(vigenteAntes).toBeTruthy();
    const tokenAntes = vigenteAntes.tokenPrefix;

    const btns = toggles(f.nativeElement as HTMLElement);
    // Alumno 1 ya puede venir presente del seed; 2 y 3 se marcan → emitir.
    for (const i of [0, 1, 2]) {
      if (btns[i].getAttribute('aria-pressed') !== 'true') {
        btns[i].click();
      }
    }
    f.detectChanges();
    const btn = (f.nativeElement as HTMLElement).querySelector(
      '[data-testid="cta-guardar-generar"]',
    ) as HTMLButtonElement;
    btn.click();
    f.detectChanges();
    await f.whenStable();
    f.detectChanges();

    expect(regenerarSpy).toHaveBeenCalledWith(vigenteAntes.id);
    expect(emitirSpy).toHaveBeenCalledTimes(2);
    const vigenteDespues = (await certs.listar({ cursoId: 1, alumnoId: 1, estado: 'vigente' }))[0];
    expect(vigenteDespues.tokenPrefix).toBe(tokenAntes);
    expect(f.componentInstance.resumenGen()).toEqual(
      jasmine.objectContaining({ emitidos: 2, actualizados: 1, fallidos: 0 }),
    );
    expect(router.navigate).toHaveBeenCalledWith(
      ['/admin/cursos', 1, 'fechas', 11, 'asistencias', 'certificados'],
      jasmine.objectContaining({
        state: jasmine.objectContaining({
          resumenGen: jasmine.objectContaining({ emitidos: 2, actualizados: 1 }),
        }),
      }),
    );
  });

  it('sidebar ofrece CTA a la página de certificados (sin lista lateral)', async () => {
    const f = await render(1, 11);
    await f.whenStable();
    f.detectChanges();
    const el = f.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Certificados del curso');
    expect(el.querySelector('[data-testid="cta-ver-certificados"]')).not.toBeNull();
    expect(el.querySelectorAll('[data-testid="cert-descargar-pdf"]').length).toBe(0);
    expect(el.querySelector('.certs-lista')).toBeNull();
  });

  it('descartar restaura baseline', async () => {
    const f = await render(4, 41);
    const el = f.nativeElement as HTMLElement;
    // Baseline = 8 presentes. Quitar uno.
    toggles(el)[0].click();
    f.detectChanges();
    expect(el.textContent).toContain('Presentes (7)');
    // Descartar → vuelve a 8.
    const descartarBtn = el.querySelector('.btn-secondary') as HTMLButtonElement;
    expect(descartarBtn.disabled).toBe(false);
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

  it('CTA a certificados del curso en el hub (sin lista lateral)', async () => {
    const f = await render(1, 11);
    const el = f.nativeElement as HTMLElement;
    expect(el.querySelector('.certs-cta-panel')).not.toBeNull();
    expect(el.querySelector('[data-testid="cta-ver-certificados"]')).not.toBeNull();
    expect(el.textContent).toContain('Certificados del curso');
    expect(el.querySelector('.certs-lista')).toBeNull();
  });

  // --- Selector de fecha inline ---

  it('selector cambia fecha sin cambios: navega a la nueva ruta', async () => {
    const f = await render(1, 11);
    const el = f.nativeElement as HTMLElement;
    const navSpy = TestBed.inject(Router).navigate as jasmine.Spy;
    navSpy.calls.reset();
    const select = el.querySelector('.fecha-select') as HTMLSelectElement;
    select.value = '12';
    select.dispatchEvent(new Event('change'));
    expect(navSpy).toHaveBeenCalledWith(['/admin/cursos', 1, 'fechas', 12, 'asistencias']);
  });

  it('selector con cambios pendientes: confirmar descarte navega', async () => {
    const f = await render(1, 11);
    const el = f.nativeElement as HTMLElement;
    toggles(el)[0].click();
    f.detectChanges();
    const navSpy = TestBed.inject(Router).navigate as jasmine.Spy;
    navSpy.calls.reset();
    const confirmSpy = spyOn(window, 'confirm').and.returnValue(true);
    const select = el.querySelector('.fecha-select') as HTMLSelectElement;
    select.value = '12';
    select.dispatchEvent(new Event('change'));
    expect(confirmSpy).toHaveBeenCalled();
    expect(navSpy).toHaveBeenCalledWith(['/admin/cursos', 1, 'fechas', 12, 'asistencias']);
  });

  it('selector con cambios pendientes: cancelar no navega y revierte el select', async () => {
    const f = await render(1, 11);
    const el = f.nativeElement as HTMLElement;
    toggles(el)[0].click();
    f.detectChanges();
    const navSpy = TestBed.inject(Router).navigate as jasmine.Spy;
    navSpy.calls.reset();
    spyOn(window, 'confirm').and.returnValue(false);
    const select = el.querySelector('.fecha-select') as HTMLSelectElement;
    select.value = '12';
    select.dispatchEvent(new Event('change'));
    expect(navSpy).not.toHaveBeenCalled();
    expect(select.value).toBe('11');
  });

  it('fecha cancelada aparece deshabilitada en el selector', async () => {
    const f = await render(5, 51);
    const el = f.nativeElement as HTMLElement;
    const select = el.querySelector('.fecha-select') as HTMLSelectElement;
    const opciones = Array.from(select.querySelectorAll('option'));
    const cancelada = opciones.find((o) => o.textContent?.includes('cancelada'));
    expect(cancelada).toBeTruthy();
    expect(cancelada?.disabled).toBe(true);
  });

  it('id inválido muestra error sin Reintentar ni PII', async () => {
    const f = await render(0, 0);
    const el = f.nativeElement as HTMLElement;
    await f.whenStable();
    f.detectChanges();
    expect(el.textContent).toContain('no encontrad');
    expect(el.textContent).not.toContain('Reintentar');
    expect(f.componentInstance.errorRecuperable()).toBeFalse();
    expect((el.textContent || '').toLowerCase()).not.toMatch(/\bdni\b/);
    expect((el.textContent || '').toLowerCase()).not.toContain('token');
  });

  it('fechaId no existente muestra error controlado sin Reintentar (999)', async () => {
    const f = await render(1, 999);
    const el = f.nativeElement as HTMLElement;
    await f.whenStable();
    f.detectChanges();
    // No revienta, no deja body en blanco: estado alert + links al curso.
    const alert = el.querySelector('[role="alert"]');
    expect(alert).not.toBeNull();
    expect(alert?.textContent).toContain('Fecha no encontrada');
    expect(el.textContent).not.toContain('Reintentar');
    expect(f.componentInstance.errorRecuperable()).toBeFalse();
    const hrefs = Array.from(el.querySelectorAll('a')).map((a) => a.getAttribute('href') || '');
    expect(hrefs.some((h) => h.includes('/admin/cursos/1'))).toBe(true);
    expect(alert?.textContent).toContain('Ver detalle del curso');
    expect(alert?.textContent).toContain('Agregar fecha');
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
      actualizar: () => Promise.reject(new Error('noop')),
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
      listarAsistenciasDeCurso: (cid: number) =>
        new Promise<readonly Asistencia[]>((resolve) => {
          pending.set(`sc-${cid}`, { resolve: resolve as (v: unknown) => void });
        }),
      listarAsistenciasPorPar: () => Promise.resolve([]),
      listarAsistenciasPorAlumno: () => Promise.resolve([]),
      listarHub: () => Promise.resolve({ cursos: [], fechas: [], asistencias: [], alumnosActivos: 0 }),
      marcar: () => Promise.resolve([]),
      anular: () => Promise.resolve(),
    };

    await TestBed.configureTestingModule({
      imports: [AttendanceMarkingPage],
      providers: [
        provideRouter([]),
        { provide: COURSES_SOURCE, useValue: fakeCourses },
        { provide: ATTENDANCE_SOURCE, useValue: fakeAttendance },
        { provide: CERTIFICATIONS_SOURCE, useClass: InMemoryCertificationsService },
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
      actualizar: () => Promise.reject(new Error('noop')),
      actualizarEstado: () => Promise.reject(new Error('noop')),
      listarFechas: () => Promise.resolve([]),
      guardarFecha: () => Promise.reject(new Error('noop')),
      reemplazarFechas: () => Promise.reject(new Error('noop')),
    };
    const fakeAttendance: AttendanceService = {
      listarAlumnos: () => Promise.resolve([
        { id: 1, apellidoNombre: 'A1 B1', dniMostrar: '20111111', estado: 'activo' as const },
        { id: 2, apellidoNombre: 'A2 B2', dniMostrar: '20222222', estado: 'activo' as const },
      ]),
      listarAsistencias: () => Promise.resolve([]),
      listarAsistenciasDeCurso: () => Promise.resolve([]),
      listarAsistenciasPorPar: () => Promise.resolve([]),
      listarAsistenciasPorAlumno: () => Promise.resolve([]),
      listarHub: () => Promise.resolve({ cursos: [], fechas: [], asistencias: [], alumnosActivos: 0 }),
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
        { provide: CERTIFICATIONS_SOURCE, useClass: InMemoryCertificationsService },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(AttendanceMarkingPage);
    fixture.componentRef.setInput('id', '1');
    fixture.componentRef.setInput('fechaId', '11');
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    // Marcar un presente (toggle) y disparar guardarYGenerar().
    const btns = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll('.toggle-presente'),
    ) as HTMLButtonElement[];
    btns[0].click();
    fixture.detectChanges();
    const btn = (fixture.nativeElement as HTMLElement).querySelector(
      '[data-testid="cta-guardar-generar"]',
    ) as HTMLButtonElement;
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

  // --- P14 CRITICAL: Reintentar, fecha futura, serial emit/regen, envelope 400 ---

  it('fallo recuperable de carga: Reintentar re-llama fuentes sin PII', async () => {
    const obtener = jasmine
      .createSpy('obtener')
      .and.returnValues(
        Promise.reject(new Error('network')),
        Promise.resolve({
          id: 3,
          codigo: 'CUR-003',
          nombre: 'Curso ok',
          estado: 'activo' as const,
          createdAt: '',
          updatedAt: '',
          fechas: [
            {
              id: 31,
              cursoId: 3,
              fecha: '2026-05-04',
              descripcion: null,
              orden: 1,
              estado: 'programada' as const,
            },
          ],
        }),
      );
    const listarAlumnos = jasmine
      .createSpy('listarAlumnos')
      .and.resolveTo([
        { id: 1, apellidoNombre: 'A1 B1', dniMostrar: '20111111', estado: 'activo' as const },
      ]);
    const listarAsistencias = jasmine.createSpy('listarAsistencias').and.resolveTo([]);

    await TestBed.configureTestingModule({
      imports: [AttendanceMarkingPage],
      providers: [
        provideRouter([]),
        {
          provide: COURSES_SOURCE,
          useValue: {
            listar: () => Promise.resolve([]),
            obtener,
            crear: () => Promise.reject(new Error('noop')),
            actualizar: () => Promise.reject(new Error('noop')),
            actualizarEstado: () => Promise.reject(new Error('noop')),
            listarFechas: () => Promise.resolve([]),
            guardarFecha: () => Promise.reject(new Error('noop')),
            reemplazarFechas: () => Promise.reject(new Error('noop')),
          },
        },
        {
          provide: ATTENDANCE_SOURCE,
          useValue: {
            listarAlumnos,
            listarAsistencias,
            listarAsistenciasDeCurso: () => Promise.resolve([]),
            listarAsistenciasPorPar: () => Promise.resolve([]),
            listarAsistenciasPorAlumno: () => Promise.resolve([]),
            listarHub: () =>
              Promise.resolve({ cursos: [], fechas: [], asistencias: [], alumnosActivos: 0 }),
            marcar: () => Promise.resolve([]),
            anular: () => Promise.resolve(),
          },
        },
        { provide: CERTIFICATIONS_SOURCE, useClass: InMemoryCertificationsService },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(AttendanceMarkingPage);
    spyOn(TestBed.inject(Router), 'navigate').and.resolveTo(true);
    fixture.componentRef.setInput('id', '3');
    fixture.componentRef.setInput('fechaId', '31');
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const page = fixture.componentInstance;
    let el = fixture.nativeElement as HTMLElement;
    let text = el.textContent || '';
    expect(page.errorRecuperable()).toBeTrue();
    expect(text).toContain('Reintentar');
    expect(text).toContain('No se pudieron cargar las asistencias');
    expect(text.toLowerCase()).not.toMatch(/\bdni\b/);
    expect(text.toLowerCase()).not.toContain('token');
    expect(obtener).toHaveBeenCalledTimes(1);

    const reintentar = Array.from(el.querySelectorAll('button')).find((b) =>
      (b.textContent || '').includes('Reintentar'),
    ) as HTMLButtonElement;
    expect(reintentar).toBeTruthy();
    reintentar.click();
    await fixture.whenStable();
    fixture.detectChanges();

    el = fixture.nativeElement as HTMLElement;
    text = el.textContent || '';
    expect(obtener).toHaveBeenCalledTimes(2);
    expect(listarAlumnos).toHaveBeenCalled();
    expect(listarAsistencias).toHaveBeenCalled();
    expect(page.error()).toBe('');
    expect(page.errorRecuperable()).toBeFalse();
    expect(text).toContain('Curso ok');
    expect(text).not.toContain('Reintentar');
  });

  it('fecha futura AR: guarda OK, no emite/regen, fallidos + copy futura', async () => {
    const futureFecha = '2099-06-15';
    const marcar = jasmine.createSpy('marcar').and.callFake(
      (_cid: number, _fid: number, items: readonly { alumnoId: number; presente: boolean }[]) =>
        Promise.resolve(
          items
            .filter((i) => i.presente)
            .map((i, idx) => ({
              id: 9000 + idx,
              alumnoId: i.alumnoId,
              cursoId: 90,
              cursoFechaId: 901,
              fecha: futureFecha,
              fechaEstado: 'programada' as const,
              registradoEn: '',
            })),
        ),
    );
    const emitir = jasmine.createSpy('emitir').and.resolveTo({ id: 1 });
    const regenerarPdf = jasmine.createSpy('regenerarPdf').and.resolveTo({ regenerado: true });
    const listarCerts = jasmine.createSpy('listar').and.resolveTo([]);

    await TestBed.configureTestingModule({
      imports: [AttendanceMarkingPage],
      providers: [
        provideRouter([]),
        {
          provide: COURSES_SOURCE,
          useValue: {
            listar: () => Promise.resolve([]),
            obtener: () =>
              Promise.resolve({
                id: 90,
                codigo: 'CUR-090',
                nombre: 'Curso futuro',
                estado: 'activo' as const,
                createdAt: '',
                updatedAt: '',
                fechas: [
                  {
                    id: 901,
                    cursoId: 90,
                    fecha: futureFecha,
                    descripcion: null,
                    orden: 1,
                    estado: 'programada' as const,
                  },
                ],
              }),
            crear: () => Promise.reject(new Error('noop')),
            actualizar: () => Promise.reject(new Error('noop')),
            actualizarEstado: () => Promise.reject(new Error('noop')),
            listarFechas: () => Promise.resolve([]),
            guardarFecha: () => Promise.reject(new Error('noop')),
            reemplazarFechas: () => Promise.reject(new Error('noop')),
          },
        },
        {
          provide: ATTENDANCE_SOURCE,
          useValue: {
            listarAlumnos: () =>
              Promise.resolve([
                { id: 1, apellidoNombre: 'A1 B1', dniMostrar: '20111111', estado: 'activo' as const },
                { id: 2, apellidoNombre: 'A2 B2', dniMostrar: '20222222', estado: 'activo' as const },
              ]),
            listarAsistencias: () => Promise.resolve([]),
            listarAsistenciasDeCurso: () => Promise.resolve([]),
            listarAsistenciasPorPar: () => Promise.resolve([]),
            listarAsistenciasPorAlumno: () => Promise.resolve([]),
            listarHub: () =>
              Promise.resolve({ cursos: [], fechas: [], asistencias: [], alumnosActivos: 0 }),
            marcar,
            anular: () => Promise.resolve(),
          },
        },
        {
          provide: CERTIFICATIONS_SOURCE,
          useValue: {
            listar: listarCerts,
            emitir,
            regenerarPdf,
            obtener: () => Promise.reject(new Error('noop')),
            obtenerEntregaManual: () => Promise.reject(new Error('noop')),
            descargarQrPng: () => Promise.reject(new Error('noop')),
            descargarPdf: () => Promise.reject(new Error('noop')),
            contar: () => Promise.resolve(0),
            revocar: () => Promise.reject(new Error('noop')),
          },
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(AttendanceMarkingPage);
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.resolveTo(true);
    fixture.componentRef.setInput('id', '90');
    fixture.componentRef.setInput('fechaId', '901');
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const btns = toggles(fixture.nativeElement as HTMLElement);
    btns[0].click();
    btns[1].click();
    fixture.detectChanges();
    const cta = (fixture.nativeElement as HTMLElement).querySelector(
      '[data-testid="cta-guardar-generar"]',
    ) as HTMLButtonElement;
    cta.click();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(marcar).toHaveBeenCalled();
    expect(emitir).not.toHaveBeenCalled();
    expect(regenerarPdf).not.toHaveBeenCalled();
    expect(listarCerts).not.toHaveBeenCalled();
    expect(fixture.componentInstance.resumenGen()).toEqual(
      jasmine.objectContaining({ emitidos: 0, actualizados: 0, fallidos: 2 }),
    );
    const navState = (router.navigate as jasmine.Spy).calls.mostRecent().args[1]?.state as {
      mensaje?: string;
      resumenGen?: { fallidos: number };
    };
    expect(navState.resumenGen?.fallidos).toBe(2);
    expect(navState.mensaje).toMatch(/futura|programada/i);
    expect(navState.mensaje?.toLowerCase()).not.toMatch(/\bdni\b/);
    expect(navState.mensaje?.toLowerCase()).not.toContain('token');
  });

  it('emisión/regeneración en serie: no solapa awaits (≥2 presentes)', async () => {
    let inFlight = 0;
    let maxInFlight = 0;
    const callOrder: string[] = [];

    const emitir = jasmine.createSpy('emitir').and.callFake(async () => {
      const n = emitir.calls.count();
      callOrder.push(`start:emit-${n}`);
      inFlight += 1;
      maxInFlight = Math.max(maxInFlight, inFlight);
      // Microtarea + macrotarea: si hubiera Promise.all, maxInFlight > 1.
      await Promise.resolve();
      await new Promise<void>((r) => setTimeout(r, 10));
      inFlight -= 1;
      callOrder.push(`end:emit-${n}`);
      return { id: n };
    });
    const regenerarPdf = jasmine.createSpy('regenerarPdf');

    await TestBed.configureTestingModule({
      imports: [AttendanceMarkingPage],
      providers: [
        provideRouter([]),
        {
          provide: COURSES_SOURCE,
          useValue: {
            listar: () => Promise.resolve([]),
            obtener: () =>
              Promise.resolve({
                id: 91,
                codigo: 'CUR-091',
                nombre: 'Curso serial',
                estado: 'activo' as const,
                createdAt: '',
                updatedAt: '',
                fechas: [
                  {
                    id: 911,
                    cursoId: 91,
                    fecha: '2026-01-10',
                    descripcion: null,
                    orden: 1,
                    estado: 'realizada' as const,
                  },
                ],
              }),
            crear: () => Promise.reject(new Error('noop')),
            actualizar: () => Promise.reject(new Error('noop')),
            actualizarEstado: () => Promise.reject(new Error('noop')),
            listarFechas: () => Promise.resolve([]),
            guardarFecha: () => Promise.reject(new Error('noop')),
            reemplazarFechas: () => Promise.reject(new Error('noop')),
          },
        },
        {
          provide: ATTENDANCE_SOURCE,
          useValue: {
            listarAlumnos: () =>
              Promise.resolve([
                { id: 1, apellidoNombre: 'A1 B1', dniMostrar: '20111111', estado: 'activo' as const },
                { id: 2, apellidoNombre: 'A2 B2', dniMostrar: '20222222', estado: 'activo' as const },
              ]),
            listarAsistencias: () => Promise.resolve([]),
            listarAsistenciasDeCurso: () => Promise.resolve([]),
            listarAsistenciasPorPar: () => Promise.resolve([]),
            listarAsistenciasPorAlumno: () => Promise.resolve([]),
            listarHub: () =>
              Promise.resolve({ cursos: [], fechas: [], asistencias: [], alumnosActivos: 0 }),
            marcar: (
              _cid: number,
              _fid: number,
              items: readonly { alumnoId: number; presente: boolean }[],
            ) =>
              Promise.resolve(
                items
                  .filter((i) => i.presente)
                  .map((i, idx) => ({
                    id: 9100 + idx,
                    alumnoId: i.alumnoId,
                    cursoId: 91,
                    cursoFechaId: 911,
                    fecha: '2026-01-10',
                    fechaEstado: 'realizada' as const,
                    registradoEn: '',
                  })),
              ),
            anular: () => Promise.resolve(),
          },
        },
        {
          provide: CERTIFICATIONS_SOURCE,
          useValue: {
            listar: () => Promise.resolve([]),
            emitir,
            regenerarPdf,
            obtener: () => Promise.reject(new Error('noop')),
            obtenerEntregaManual: () => Promise.reject(new Error('noop')),
            descargarQrPng: () => Promise.reject(new Error('noop')),
            descargarPdf: () => Promise.reject(new Error('noop')),
            contar: () => Promise.resolve(0),
            revocar: () => Promise.reject(new Error('noop')),
          },
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(AttendanceMarkingPage);
    spyOn(TestBed.inject(Router), 'navigate').and.resolveTo(true);
    fixture.componentRef.setInput('id', '91');
    fixture.componentRef.setInput('fechaId', '911');
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const btns = toggles(fixture.nativeElement as HTMLElement);
    btns[0].click();
    btns[1].click();
    fixture.detectChanges();
    const cta = (fixture.nativeElement as HTMLElement).querySelector(
      '[data-testid="cta-guardar-generar"]',
    ) as HTMLButtonElement;
    cta.click();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(emitir).toHaveBeenCalledTimes(2);
    expect(regenerarPdf).not.toHaveBeenCalled();
    expect(maxInFlight).toBe(1);
    expect(callOrder).toEqual(['start:emit-1', 'end:emit-1', 'start:emit-2', 'end:emit-2']);
    expect(fixture.componentInstance.resumenGen()).toEqual(
      jasmine.objectContaining({ emitidos: 2, fallidos: 0 }),
    );
  });

  it('regeneración en serie: no solapa awaits (≥2 vigentes)', async () => {
    let inFlight = 0;
    let maxInFlight = 0;
    const callOrder: string[] = [];

    const regenerarPdf = jasmine.createSpy('regenerarPdf').and.callFake(async (id: number) => {
      callOrder.push(`start:regen-${id}`);
      inFlight += 1;
      maxInFlight = Math.max(maxInFlight, inFlight);
      await Promise.resolve();
      await new Promise<void>((r) => setTimeout(r, 10));
      inFlight -= 1;
      callOrder.push(`end:regen-${id}`);
      return {
        regenerado: true,
        publicValidationUrl: `https://example.invalid/v/${id}`,
        pdfDownloadUrl: `${id}/pdf`,
        pdfStatus: 'valid' as const,
      };
    });
    const emitir = jasmine.createSpy('emitir');

    await TestBed.configureTestingModule({
      imports: [AttendanceMarkingPage],
      providers: [
        provideRouter([]),
        {
          provide: COURSES_SOURCE,
          useValue: {
            listar: () => Promise.resolve([]),
            obtener: () =>
              Promise.resolve({
                id: 92,
                codigo: 'CUR-092',
                nombre: 'Curso regen serial',
                estado: 'activo' as const,
                createdAt: '',
                updatedAt: '',
                fechas: [
                  {
                    id: 921,
                    cursoId: 92,
                    fecha: '2026-01-10',
                    descripcion: null,
                    orden: 1,
                    estado: 'realizada' as const,
                  },
                ],
              }),
            crear: () => Promise.reject(new Error('noop')),
            actualizar: () => Promise.reject(new Error('noop')),
            actualizarEstado: () => Promise.reject(new Error('noop')),
            listarFechas: () => Promise.resolve([]),
            guardarFecha: () => Promise.reject(new Error('noop')),
            reemplazarFechas: () => Promise.reject(new Error('noop')),
          },
        },
        {
          provide: ATTENDANCE_SOURCE,
          useValue: {
            listarAlumnos: () =>
              Promise.resolve([
                { id: 1, apellidoNombre: 'A1 B1', dniMostrar: '20111111', estado: 'activo' as const },
                { id: 2, apellidoNombre: 'A2 B2', dniMostrar: '20222222', estado: 'activo' as const },
              ]),
            listarAsistencias: () => Promise.resolve([]),
            listarAsistenciasDeCurso: () => Promise.resolve([]),
            listarAsistenciasPorPar: () => Promise.resolve([]),
            listarAsistenciasPorAlumno: () => Promise.resolve([]),
            listarHub: () =>
              Promise.resolve({ cursos: [], fechas: [], asistencias: [], alumnosActivos: 0 }),
            marcar: (
              _cid: number,
              _fid: number,
              items: readonly { alumnoId: number; presente: boolean }[],
            ) =>
              Promise.resolve(
                items
                  .filter((i) => i.presente)
                  .map((i, idx) => ({
                    id: 9200 + idx,
                    alumnoId: i.alumnoId,
                    cursoId: 92,
                    cursoFechaId: 921,
                    fecha: '2026-01-10',
                    fechaEstado: 'realizada' as const,
                    registradoEn: '',
                  })),
              ),
            anular: () => Promise.resolve(),
          },
        },
        {
          provide: CERTIFICATIONS_SOURCE,
          useValue: {
            listar: () =>
              Promise.resolve([
                {
                  id: 501,
                  numero: 'C-501',
                  nombreAlumno: 'A1 B1',
                  cursoNombre: 'Curso regen serial',
                  estado: 'vigente' as const,
                  documentMasked: '20111111',
                  tokenPrefix: 'prefijo_501',
                  emitidoEn: '2026-01-01',
                  venceEn: null,
                  alumnoId: 1,
                  cursoId: 92,
                },
                {
                  id: 502,
                  numero: 'C-502',
                  nombreAlumno: 'A2 B2',
                  cursoNombre: 'Curso regen serial',
                  estado: 'vigente' as const,
                  documentMasked: '20222222',
                  tokenPrefix: 'prefijo_502',
                  emitidoEn: '2026-01-01',
                  venceEn: null,
                  alumnoId: 2,
                  cursoId: 92,
                },
              ]),
            emitir,
            regenerarPdf,
            obtener: () => Promise.reject(new Error('noop')),
            obtenerEntregaManual: () => Promise.reject(new Error('noop')),
            descargarQrPng: () => Promise.reject(new Error('noop')),
            descargarPdf: () => Promise.reject(new Error('noop')),
            contar: () => Promise.resolve(0),
            revocar: () => Promise.reject(new Error('noop')),
          },
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(AttendanceMarkingPage);
    spyOn(TestBed.inject(Router), 'navigate').and.resolveTo(true);
    fixture.componentRef.setInput('id', '92');
    fixture.componentRef.setInput('fechaId', '921');
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const btns = toggles(fixture.nativeElement as HTMLElement);
    btns[0].click();
    btns[1].click();
    fixture.detectChanges();
    const cta = (fixture.nativeElement as HTMLElement).querySelector(
      '[data-testid="cta-guardar-generar"]',
    ) as HTMLButtonElement;
    cta.click();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(emitir).not.toHaveBeenCalled();
    expect(regenerarPdf).toHaveBeenCalledTimes(2);
    expect(maxInFlight).toBe(1);
    expect(callOrder).toEqual(['start:regen-501', 'end:regen-501', 'start:regen-502', 'end:regen-502']);
    expect(fixture.componentInstance.resumenGen()).toEqual(
      jasmine.objectContaining({ actualizados: 2, fallidos: 0 }),
    );
  });

  it('API not-found en carga: sin Reintentar', async () => {
    await TestBed.configureTestingModule({
      imports: [AttendanceMarkingPage],
      providers: [
        provideRouter([]),
        {
          provide: COURSES_SOURCE,
          useValue: {
            listar: () => Promise.resolve([]),
            obtener: () => Promise.reject(new Error('Curso no encontrado: 999')),
            crear: () => Promise.reject(new Error('noop')),
            actualizar: () => Promise.reject(new Error('noop')),
            actualizarEstado: () => Promise.reject(new Error('noop')),
            listarFechas: () => Promise.resolve([]),
            guardarFecha: () => Promise.reject(new Error('noop')),
            reemplazarFechas: () => Promise.reject(new Error('noop')),
          },
        },
        {
          provide: ATTENDANCE_SOURCE,
          useValue: {
            listarAlumnos: () => Promise.resolve([]),
            listarAsistencias: () => Promise.resolve([]),
            listarAsistenciasDeCurso: () => Promise.resolve([]),
            listarAsistenciasPorPar: () => Promise.resolve([]),
            listarAsistenciasPorAlumno: () => Promise.resolve([]),
            listarHub: () =>
              Promise.resolve({ cursos: [], fechas: [], asistencias: [], alumnosActivos: 0 }),
            marcar: () => Promise.resolve([]),
            anular: () => Promise.resolve(),
          },
        },
        {
          provide: CERTIFICATIONS_SOURCE,
          useValue: {
            listar: () => Promise.resolve([]),
            emitir: () => Promise.reject(new Error('noop')),
            regenerarPdf: () => Promise.reject(new Error('noop')),
            obtener: () => Promise.reject(new Error('noop')),
            obtenerEntregaManual: () => Promise.reject(new Error('noop')),
            descargarQrPng: () => Promise.reject(new Error('noop')),
            descargarPdf: () => Promise.reject(new Error('noop')),
            contar: () => Promise.resolve(0),
            revocar: () => Promise.reject(new Error('noop')),
          },
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(AttendanceMarkingPage);
    fixture.componentRef.setInput('id', '999');
    fixture.componentRef.setInput('fechaId', '1');
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const root = fixture.nativeElement as HTMLElement;
    expect(fixture.componentInstance.errorRecuperable()).toBeFalse();
    expect(root.textContent).toContain('Curso o fecha no encontrados');
    expect(root.textContent).not.toContain('Reintentar');
  });

  it('envelope 400 al marcar: mensaje vía mensajeErrorApi sin PII', async () => {
    const apiMsg = 'No hay presentes para emitir en esta fecha.';
    const envelope = new HttpErrorResponse({
      status: 400,
      statusText: 'Bad Request',
      error: { error: { code: 'validation_error', message: apiMsg } },
      url: '/api/admin/asistencias',
    });

    await TestBed.configureTestingModule({
      imports: [AttendanceMarkingPage],
      providers: [
        provideRouter([]),
        { provide: COURSES_SOURCE, useClass: InMemoryCoursesService },
        {
          provide: ATTENDANCE_SOURCE,
          useValue: {
            listarAlumnos: () =>
              Promise.resolve([
                { id: 1, apellidoNombre: 'A1 B1', dniMostrar: '20111111', estado: 'activo' as const },
              ]),
            listarAsistencias: () => Promise.resolve([]),
            listarAsistenciasDeCurso: () => Promise.resolve([]),
            listarAsistenciasPorPar: () => Promise.resolve([]),
            listarAsistenciasPorAlumno: () => Promise.resolve([]),
            listarHub: () =>
              Promise.resolve({ cursos: [], fechas: [], asistencias: [], alumnosActivos: 0 }),
            marcar: () => Promise.reject(envelope),
            anular: () => Promise.resolve(),
          },
        },
        { provide: CERTIFICATIONS_SOURCE, useClass: InMemoryCertificationsService },
      ],
    }).compileComponents();

    // Override courses.obtener via real InMemory — use curso 3/31 seed.
    const fixture = TestBed.createComponent(AttendanceMarkingPage);
    spyOn(TestBed.inject(Router), 'navigate').and.resolveTo(true);
    fixture.componentRef.setInput('id', '3');
    fixture.componentRef.setInput('fechaId', '31');
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const btns = toggles(fixture.nativeElement as HTMLElement);
    expect(btns.length).toBeGreaterThan(0);
    btns[0].click();
    fixture.detectChanges();
    const cta = (fixture.nativeElement as HTMLElement).querySelector(
      '[data-testid="cta-guardar-generar"]',
    ) as HTMLButtonElement;
    cta.click();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const err = fixture.componentInstance.error();
    expect(err).toBe(apiMsg);
    expect(err.toLowerCase()).not.toMatch(/\bdni\b/);
    expect(err.toLowerCase()).not.toContain('token');
    expect(err).not.toContain('20111111');
    expect(fixture.componentInstance.errorRecuperable()).toBeFalse();
    expect((fixture.nativeElement as HTMLElement).textContent).not.toContain('Reintentar');
  });
});
