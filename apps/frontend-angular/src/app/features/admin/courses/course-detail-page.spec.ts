import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ATTENDANCE_SOURCE } from '../attendances/data/attendance.token';
import { Asistencia, AttendanceService } from '../attendances/models/attendance.types';
import { CourseDetailPage } from './course-detail-page';
import { CursoDetalle } from './courses.models';
import { COURSES_SOURCE, CoursesService } from './courses.service';

const detail = (id: number, fechas: CursoDetalle['fechas'] = [], overrides: Partial<CursoDetalle> = {}): CursoDetalle => ({
  id,
  codigo: `CUR-00${id}`,
  nombre: `Curso demo ${id}`,
  estado: 'activo',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-02T00:00:00.000Z',
  cuatrimestre: '1.er cuatrimestre 2026',
  cantidadFechas: fechas.length,
  fechas,
  ...overrides,
});

const fecha = (id: number, estado: 'programada' | 'realizada' | 'cancelada' = 'programada') => ({
  id,
  cursoId: 1,
  fecha: '2026-03-15',
  descripcion: null,
  orden: id,
  estado,
});

function courses(obtener: (id: number) => Promise<CursoDetalle>): CoursesService {
  return {
    obtener,
    listar: () => Promise.resolve([]),
    crear: () => Promise.reject(new Error('not used')),
    actualizar: () => Promise.reject(new Error('not used')),
    actualizarEstado: () => Promise.reject(new Error('not used')),
    listarFechas: () => Promise.resolve([]),
    guardarFecha: () => Promise.reject(new Error('not used')),
    reemplazarFechas: () => Promise.reject(new Error('not used')),
  };
}

function attendance(
  listarAsistenciasDeCurso: AttendanceService['listarAsistenciasDeCurso'],
): AttendanceService {
  return {
    listarAsistenciasDeCurso,
    listarAsistencias: async (cursoId, fechaId) =>
      (await listarAsistenciasDeCurso(cursoId)).filter((a) => a.cursoFechaId === fechaId),
    listarAsistenciasPorPar: () => Promise.resolve([]),
    listarAsistenciasPorAlumno: () => Promise.resolve([]),
    listarAlumnos: () => Promise.resolve([]),
    listarHub: () => Promise.resolve({ cursos: [], fechas: [], asistencias: [], alumnosActivos: 0 }),
    marcar: () => Promise.resolve([]),
    anular: () => Promise.resolve(),
  };
}

describe('CourseDetailPage', () => {
  async function render(
    source: CoursesService,
    id = '1',
    sourceAttendance?: AttendanceService,
  ) {
    await TestBed.configureTestingModule({
      imports: [CourseDetailPage],
      providers: [
        provideRouter([]),
        { provide: COURSES_SOURCE, useValue: source },
        ...(sourceAttendance ? [{ provide: ATTENDANCE_SOURCE, useValue: sourceAttendance }] : []),
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(CourseDetailPage);
    fixture.componentRef.setInput('id', id);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    return fixture;
  }

  it('si listarAsistenciasDeCurso falla, todas las fechas quedan no disponibles', async () => {
    const f = await render(
      courses(() => Promise.resolve(detail(1, [fecha(11), fecha(12), fecha(13)]))),
      '1',
      attendance(() => Promise.reject(new Error('seam failure'))),
    );
    const el = f.nativeElement as HTMLElement;
    expect(el.textContent).toContain('No disponible');
    expect(el.querySelectorAll('a[href*="/fechas/11/asistencias"], a[href*="/fechas/12/asistencias"], a[href*="/fechas/13/asistencias"]').length).toBe(0);
    expect(el.querySelector('[aria-label="Acción de asistencia no disponible"]')).not.toBeNull();
  });

  it('aísla un throw síncrono del seam de asistencias', async () => {
    const f = await render(
      courses(() => Promise.resolve(detail(1, [fecha(11), fecha(12)]))),
      '1',
      attendance(() => {
        throw new Error('sync seam failure');
      }),
    );
    const el = f.nativeElement as HTMLElement;
    expect(el.textContent).toContain('No disponible');
    expect(el.textContent).not.toContain('sync seam failure');
    expect(el.querySelectorAll('a[href*="/fechas/11/asistencias"], a[href*="/fechas/12/asistencias"]').length).toBe(0);
  });

  it('sin ATTENDANCE_SOURCE deja métricas honestamente no disponibles', async () => {
    const f = await render(courses(() => Promise.resolve(detail(1, [fecha(11)]))));
    const el = f.nativeElement as HTMLElement;
    expect(el.textContent).toContain('No disponible');
    expect(el.querySelectorAll('a[href*="/fechas/11/asistencias"]').length).toBe(0);
  });

  it('descarta una carga previa al reutilizar la ruta y limpia un id inválido', async () => {
    let resolveFirst!: (value: CursoDetalle) => void;
    const first = new Promise<CursoDetalle>((resolve) => (resolveFirst = resolve));
    const f = await render(courses((id) => (id === 1 ? first : Promise.resolve(detail(id)))), '1');
    f.componentRef.setInput('id', '2');
    f.detectChanges();
    await f.whenStable();
    resolveFirst(detail(1));
    await f.whenStable();
    f.detectChanges();
    expect((f.nativeElement as HTMLElement).textContent).toContain('Curso demo 2');
    expect((f.nativeElement as HTMLElement).textContent).not.toContain('Curso demo 1');
    f.componentRef.setInput('id', 'abc');
    f.detectChanges();
    await f.whenStable();
    f.detectChanges();
    expect((f.nativeElement as HTMLElement).textContent).toContain('Curso no encontrado.');
    expect((f.nativeElement as HTMLElement).textContent).not.toContain('Curso demo 2');
    expect((f.nativeElement as HTMLElement).querySelector('[data-testid="cta-reintentar-curso"]')).toBeNull();
  });

  it('muestra la ficha con acento y una tabla y tarjetas equivalentes', async () => {
    const f = await render(courses(() => Promise.resolve(detail(1, [fecha(11)]))));
    const el = f.nativeElement as HTMLElement;
    expect(el.querySelector('.curso-ficha .acento')).not.toBeNull();
    expect(el.querySelector('h1')?.textContent).toContain('Curso demo 1');
    expect(el.querySelector('table caption')?.textContent).toContain('Fechas de cursada');
    expect(el.querySelectorAll('th[scope="col"]').length).toBe(3);
    expect(el.querySelectorAll('ul.fechas-cards li').length).toBe(1);
  });

  it('distingue vacío real Pendiente/Cargar de asistencia no disponible y elimina acciones canceladas', async () => {
    const f = await render(
      courses(() => Promise.resolve(detail(1, [fecha(11), fecha(12, 'realizada'), fecha(13, 'cancelada')]))),
      '1',
      attendance(() =>
        Promise.resolve([
          { cursoId: 1, cursoFechaId: 12 },
          { cursoId: 1, cursoFechaId: 12 },
        ] as never),
      ),
    );
    const el = f.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Pendiente');
    expect(el.textContent).toContain('2 presentes');
    expect(el.querySelectorAll('.fechas-tabla a[href*="/fechas/11/asistencias"], .fechas-cards a[href*="/fechas/11/asistencias"]').length).toBe(2);
    expect(el.querySelectorAll('a[href*="/fechas/13/asistencias"]').length).toBe(0);
  });

  it('ignora asistencias ajenas o malformadas antes de contar y decidir la acción', async () => {
    const mixed = [
      { id: 1, cursoId: 1, cursoFechaId: 11 },
      { id: 2, cursoId: 2, cursoFechaId: 11 },
      { id: 3, cursoId: 2, cursoFechaId: 12 },
      { id: 4 },
      null,
      undefined,
      { id: 5, cursoId: 2, cursoFechaId: 12 },
      { id: 6 },
    ] as unknown as readonly Asistencia[];
    const f = await render(
      courses(() => Promise.resolve(detail(1, [fecha(11), fecha(12)]))),
      '1',
      attendance(() => Promise.resolve(mixed)),
    );
    const el = f.nativeElement as HTMLElement;
    expect(el.textContent).toContain('1 presente');
    expect(el.textContent).toContain('Pendiente');
    expect(el.querySelectorAll('.fechas-tabla a[href*="/fechas/11/asistencias"], .fechas-cards a[href*="/fechas/11/asistencias"]').length).toBe(2);
    expect(el.querySelectorAll('.fechas-tabla a[href*="/fechas/12/asistencias"], .fechas-cards a[href*="/fechas/12/asistencias"]').length).toBe(2);
    expect(el.querySelectorAll('.fechas-tabla a[href*="/fechas/11/asistencias"]')[0]?.textContent).toContain(
      'Ver y entregar',
    );
    expect(el.querySelectorAll('.fechas-tabla a[href*="/fechas/12/asistencias"]')[0]?.textContent).toContain('Cargar');
  });

  it('expone carga, error, vacío y un único anuncio live con rol implícito status', async () => {
    const f = await render(courses(() => Promise.resolve(detail(1))));
    const el = f.nativeElement as HTMLElement;
    const live = [...el.querySelectorAll('[aria-live], output')];
    const liveRoles = live.map((node) =>
      node instanceof HTMLOutputElement ? node.getAttribute('role') ?? 'status' : node.getAttribute('role'),
    );
    expect(liveRoles).toEqual(['status']);
    expect(el.querySelectorAll('[role="alert"]').length).toBe(0);
    expect(el.textContent).toContain('Agregar fecha');
    expect(el.textContent).toContain('Editar curso');
    expect(el.textContent).toContain('Todavía no hay fechas cargadas');
    expect((el.querySelector('[data-testid="cta-editar-curso"]') as HTMLAnchorElement).getAttribute('href')).toContain(
      '/admin/cursos/1/editar',
    );
    // Sin fechas asistibles: no hay «Abrir primera fecha»; sí CTA al hub.
    expect(el.querySelector('[data-testid="cta-cargar-asistencias"]')).toBeNull();
    const hub = el.querySelector('[data-testid="cta-ver-fechas-curso"]') as HTMLAnchorElement;
    expect(hub).not.toBeNull();
    expect(hub.getAttribute('href')).toContain('/admin/asistencias/curso/1');
  });

  it('enlaza Abrir primera fecha a la primera fecha disponible', async () => {
    const f = await render(
      courses(() => Promise.resolve(detail(1, [fecha(11), fecha(12)]))),
      '1',
      attendance(() => Promise.resolve([])),
    );
    const el = f.nativeElement as HTMLElement;
    const cta = el.querySelector('[data-testid="cta-cargar-asistencias"]') as HTMLAnchorElement;
    expect(cta.textContent?.trim()).toContain('Abrir primera fecha');
    expect(cta.getAttribute('href')).toContain('/admin/cursos/1/fechas/11/asistencias');
  });

  it('mantiene aria-busy durante la carga', async () => {
    let resolve!: (value: CursoDetalle) => void;
    const pending = new Promise<CursoDetalle>((done) => (resolve = done));
    await TestBed.configureTestingModule({
      imports: [CourseDetailPage],
      providers: [provideRouter([]), { provide: COURSES_SOURCE, useValue: courses(() => pending) }],
    }).compileComponents();
    const loading = TestBed.createComponent(CourseDetailPage);
    loading.componentRef.setInput('id', '1');
    loading.detectChanges();
    expect((loading.nativeElement as HTMLElement).querySelector('[aria-busy="true"]')).not.toBeNull();
    resolve(detail(1));
    await loading.whenStable();
    loading.destroy();
  });

  it('muestra un error recuperable cuando courses.obtener rechaza', async () => {
    const failed = await render(courses(() => Promise.reject(new Error('fallo de red'))));
    const el = failed.nativeElement as HTMLElement;
    expect(el.textContent).toContain('No se pudo cargar el curso. Reintentá.');
    expect(el.textContent).not.toContain('fallo de red');
    expect(el.querySelector('[data-testid="cta-reintentar-curso"]')).not.toBeNull();
    expect(el.querySelectorAll('[role="alert"]').length).toBe(0);
    expect(el.querySelectorAll('output[aria-live="polite"]').length).toBe(1);
  });

  it('no usa red ni expone identificadores privados en el DOM', async () => {
    const fetchSpy = spyOn(window, 'fetch').and.callThrough();
    const f = await render(courses(() => Promise.resolve(detail(1, [fecha(11)]))));
    const text = (f.nativeElement as HTMLElement).textContent ?? '';
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(text).not.toMatch(/dni|email|token|uuid|legajo|matr[ií]cula/i);
  });

  // --- P8: not-found limpio (id / in-memory / HTTP 404) ---

  it('not-found limpio para id inválido sin Reintentar ni ruido técnico', async () => {
    const f = await render(courses(() => Promise.resolve(detail(1))), '0');
    const el = f.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Curso no encontrado.');
    expect(el.querySelector('[data-testid="cta-reintentar-curso"]')).toBeNull();
    expect(el.textContent).not.toMatch(/Http failure|status code|404/i);
  });

  it('not-found limpio para Error in-memory con prefijo Curso no encontrado', async () => {
    const f = await render(
      courses(() => Promise.reject(new Error('Curso no encontrado: 99'))),
      '99',
    );
    const el = f.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Curso no encontrado.');
    expect(el.textContent).not.toContain('Curso no encontrado: 99');
    expect(el.querySelector('[data-testid="cta-reintentar-curso"]')).toBeNull();
  });

  it('not-found limpio para HttpErrorResponse 404 sin cuerpo técnico', async () => {
    const err = new HttpErrorResponse({
      status: 404,
      statusText: 'Not Found',
      url: '/api/v1/admin/courses/42',
      error: { error: { message: 'Resource not found', code: 'NOT_FOUND' } },
    });
    const f = await render(courses(() => Promise.reject(err)), '42');
    const el = f.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Curso no encontrado.');
    expect(el.textContent).not.toContain('Resource not found');
    expect(el.textContent).not.toContain('/api/v1/admin/courses');
    expect(el.textContent).not.toContain('NOT_FOUND');
    expect(el.querySelector('[data-testid="cta-reintentar-curso"]')).toBeNull();
  });

  it('Reintentar en fallo recuperable recupera la ficha y quita el CTA', async () => {
    let calls = 0;
    const source = courses(() => {
      calls += 1;
      if (calls === 1) return Promise.reject(new Error('timeout'));
      return Promise.resolve(detail(7, [fecha(71)]));
    });
    const f = await render(source, '7');
    const el = f.nativeElement as HTMLElement;
    expect(calls).toBe(1);
    expect(el.textContent).toContain('No se pudo cargar el curso. Reintentá.');
    expect(el.querySelector('[data-testid="cta-reintentar-curso"]')).not.toBeNull();
    (el.querySelector('[data-testid="cta-reintentar-curso"]') as HTMLButtonElement).click();
    f.detectChanges();
    await f.whenStable();
    f.detectChanges();
    expect(calls).toBe(2);
    expect(f.componentInstance.detalle()?.id).toBe(7);
    expect(f.componentInstance.error()).toBe('');
    expect(el.querySelector('[data-testid="cta-reintentar-curso"]')).toBeNull();
    expect(el.textContent).toContain('CUR-007');
  });

  it('HttpErrorResponse 500 es recuperable sin filtrar cuerpo técnico', async () => {
    const err = new HttpErrorResponse({
      status: 500,
      statusText: 'Internal Server Error',
      url: '/api/v1/admin/courses/7',
      error: { error: { message: 'stacktrace secret', code: 'INTERNAL' } },
    });
    const f = await render(courses(() => Promise.reject(err)), '7');
    const el = f.nativeElement as HTMLElement;
    expect(el.textContent).toContain('No se pudo cargar el curso. Reintentá.');
    expect(el.textContent).not.toContain('stacktrace');
    expect(el.textContent).not.toContain('/api/v1');
    expect(el.querySelector('[data-testid="cta-reintentar-curso"]')).not.toBeNull();
  });

  it('HttpErrorResponse 403 no ofrece Reintentar', async () => {
    const err = new HttpErrorResponse({
      status: 403,
      statusText: 'Forbidden',
      url: '/api/v1/admin/courses/7',
      error: { error: { message: 'Forbidden' } },
    });
    const f = await render(courses(() => Promise.reject(err)), '7');
    const el = f.nativeElement as HTMLElement;
    expect(el.textContent).toContain('No tenés permiso para ver este curso.');
    expect(el.querySelector('[data-testid="cta-reintentar-curso"]')).toBeNull();
  });

  it('CTA hub, labels humanas, fecha es-AR, sin guión junto a Pendiente y Ver y entregar intacto', async () => {
    const f = await render(
      courses(() =>
        Promise.resolve(
          detail(1, [fecha(11), fecha(12, 'realizada')], {
            estado: 'cerrado',
            cuatrimestre: 'Sin programar',
          }),
        ),
      ),
      '1',
      attendance(() =>
        Promise.resolve([{ cursoId: 1, cursoFechaId: 12 }] as never),
      ),
    );
    const el = f.nativeElement as HTMLElement;

    const hub = el.querySelector('[data-testid="cta-ver-fechas-curso"]') as HTMLAnchorElement;
    expect(hub.textContent?.trim()).toBe('Ver fechas del curso');
    expect(hub.getAttribute('href')).toBe('/admin/asistencias/curso/1');

    expect(el.textContent).toContain('Inactivo');
    expect(el.textContent).not.toMatch(/\bcerrado\b/);
    expect(el.textContent).toContain('Programada');
    expect(el.textContent).toContain('Realizada');
    expect(el.textContent).not.toMatch(/\bprogramada\b/);
    expect(el.textContent).not.toContain('Sin programar');

    // Fecha humana es-AR (no ISO crudo como único texto de celda).
    expect(el.querySelector('.fechas-tabla td.fecha')?.textContent).not.toBe('2026-03-15');
    expect(el.querySelector('.fechas-tabla td.fecha')?.textContent).toMatch(/15/);

    // Sin «—» junto a Pendiente (tabla + cards).
    const pendientes = [...el.querySelectorAll('.fechas-tabla td, .fechas-cards li')].filter((n) =>
      (n.textContent ?? '').includes('Pendiente'),
    );
    expect(pendientes.length).toBeGreaterThan(0);
    for (const node of pendientes) {
      expect(node.textContent).not.toContain('—');
    }

    expect(el.querySelectorAll('.fechas-tabla a[href*="/fechas/12/asistencias"]')[0]?.textContent).toContain(
      'Ver y entregar',
    );
    expect(el.querySelector('[data-testid="cta-cargar-asistencias"]')).not.toBeNull();
  });
});
