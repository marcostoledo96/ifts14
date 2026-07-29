import { TestBed } from '@angular/core/testing';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { AttendanceCourseDatesPage } from './attendance-course-dates-page';
import { COURSES_SOURCE } from '../../../courses/courses.service';
import { InMemoryCoursesService } from '../../../courses/in-memory-courses.service';
import { ATTENDANCE_SOURCE } from '../../data/attendance.token';
import { AttendanceMockService } from '../../data/attendance-mock.service';

describe('AttendanceCourseDatesPage', () => {
  async function render(id: string) {
    await TestBed.configureTestingModule({
      imports: [AttendanceCourseDatesPage],
      providers: [
        provideRouter([], withComponentInputBinding()),
        { provide: COURSES_SOURCE, useClass: InMemoryCoursesService },
        { provide: ATTENDANCE_SOURCE, useClass: AttendanceMockService },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(AttendanceCourseDatesPage);
    fixture.componentRef.setInput('id', id);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    return fixture;
  }

  function tableRows(el: HTMLElement): NodeListOf<Element> {
    return el.querySelectorAll('[data-testid="curso-fechas-tabla"] tbody tr');
  }

  function cards(el: HTMLElement): NodeListOf<Element> {
    return el.querySelectorAll('.lista-asis .card-asis');
  }

  it('lista fechas de más antigua a más reciente (sin priorizar programada)', async () => {
    const hubStub = {
      listarHub: async () => ({
        cursos: [{ id: 99, codigo: 'CUR-ORD', nombre: 'Curso orden', estado: 'activo' as const }],
        fechas: [
          // Desordenadas a propósito: programada más nueva primero en el hub.
          {
            id: 3,
            cursoId: 99,
            fecha: '2026-07-20',
            descripcion: null,
            orden: 3,
            estado: 'programada' as const,
          },
          {
            id: 1,
            cursoId: 99,
            fecha: '2026-07-01',
            descripcion: null,
            orden: 1,
            estado: 'realizada' as const,
          },
          {
            id: 2,
            cursoId: 99,
            fecha: '2026-07-10',
            descripcion: null,
            orden: 2,
            estado: 'realizada' as const,
          },
        ],
        asistencias: [
          {
            id: 1,
            alumnoId: 1,
            cursoId: 99,
            cursoFechaId: 1,
            fecha: '2026-07-01',
            fechaEstado: 'realizada' as const,
            registradoEn: '2026-07-01T12:00:00Z',
          },
        ],
        alumnosActivos: 1,
      }),
    };

    await TestBed.configureTestingModule({
      imports: [AttendanceCourseDatesPage],
      providers: [
        provideRouter([], withComponentInputBinding()),
        { provide: COURSES_SOURCE, useClass: InMemoryCoursesService },
        { provide: ATTENDANCE_SOURCE, useValue: hubStub },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(AttendanceCourseDatesPage);
    fixture.componentRef.setInput('id', '99');
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const fechas = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll(
        '[data-testid="curso-fechas-tabla"] tbody time[datetime]',
      ),
    ).map((n) => n.getAttribute('datetime'));
    expect(fechas).toEqual(['2026-07-01', '2026-07-10', '2026-07-20']);
  });

  it('lista solo fechas no canceladas del curso', async () => {
    const f = await render('1');
    const el = f.nativeElement as HTMLElement;
    // CUR-001: 3 realizadas.
    expect(tableRows(el).length).toBe(3);
    expect(cards(el).length).toBe(3);
    expect(el.textContent).toContain('Curso de introducción a la gestión');
    const estados = Array.from(el.querySelectorAll('[data-testid="curso-fechas-tabla"] .estado-chip')).map(
      (n) => n.textContent?.trim().toLowerCase() ?? '',
    );
    expect(estados.every((e) => e !== 'cancelada')).toBeTrue();
  });

  it('muestra botón claro Volver a Asistencias hacia el hub', async () => {
    const f = await render('3');
    const el = f.nativeElement as HTMLElement;
    const back = el.querySelector('[data-testid="volver-asistencias"]') as HTMLAnchorElement;
    expect(back).toBeTruthy();
    expect(back.getAttribute('href')).toBe('/admin/asistencias');
    expect(back.textContent).toMatch(/Volver a Asistencias/i);
  });

  it('expone chips programada/realizada y filtra por estado', async () => {
    const f = await render('6');
    const el = f.nativeElement as HTMLElement;
    expect(el.querySelector('button[data-estado="programada"]')).toBeTruthy();
    expect(el.querySelector('button[data-estado="realizada"]')).toBeTruthy();
    // CUR-006: 3 programadas.
    expect(tableRows(el).length).toBe(3);

    const chipRealizada = el.querySelector(
      'button[data-estado="realizada"]',
    ) as HTMLButtonElement;
    chipRealizada.click();
    f.detectChanges();
    expect(tableRows(el).length).toBe(0);
    expect(el.textContent).toMatch(/Ninguna fecha coincide|No hay fechas que coincidan/i);

    const chipProgramada = el.querySelector(
      'button[data-estado="programada"]',
    ) as HTMLButtonElement;
    chipProgramada.click();
    f.detectChanges();
    expect(tableRows(el).length).toBe(3);
  });

  it('CTA Tomar asistencia apunta al marcado existente', async () => {
    const f = await render('1');
    const el = f.nativeElement as HTMLElement;
    const links = Array.from(
      el.querySelectorAll('[data-testid="curso-fechas-tabla"] .card-asis-link'),
    ) as HTMLAnchorElement[];
    expect(links.length).toBe(3);
    for (const link of links) {
      const href = link.getAttribute('href') ?? '';
      expect(href).toMatch(/^\/admin\/cursos\/1\/fechas\/\d+\/asistencias$/);
      expect(link.textContent).toContain('Tomar asistencia');
    }
  });

  it('empty claro con enlace al detalle del curso cuando no hay fechas asistibles', async () => {
    const f = await render('5');
    const el = f.nativeElement as HTMLElement;
    expect(tableRows(el).length).toBe(0);
    expect(el.textContent).toMatch(/no tiene fechas asistibles|sin fechas asistibles/i);
    const link = el.querySelector('a[href="/admin/cursos/5"]') as HTMLAnchorElement;
    expect(link).toBeTruthy();
  });

  it('curso ausente en el hub: título not-found, Volver sin Reintentar', async () => {
    const f = await render('9999');
    const el = f.nativeElement as HTMLElement;
    const page = f.componentInstance;
    expect(el.querySelector('.estado-error')).toBeTruthy();
    expect(el.querySelector('.estado-title')?.textContent?.trim()).toBe('Curso no encontrado');
    expect(el.textContent).toMatch(/Curso no encontrado/i);
    expect(el.textContent).toMatch(/Volver a Asistencias/i);
    expect(el.textContent).not.toContain('Reintentar');
    expect(page.errorRecuperable()).toBeFalse();
  });

  it('id inválido: título not-found, Volver sin Reintentar ni tumbar', async () => {
    const f = await render('abc');
    const el = f.nativeElement as HTMLElement;
    const page = f.componentInstance;
    expect(el.querySelector('.estado-error')).toBeTruthy();
    expect(el.querySelector('.estado-title')?.textContent?.trim()).toBe('Curso no encontrado');
    expect(el.textContent).toMatch(/Curso no encontrado/i);
    expect(el.textContent).toMatch(/Volver a Asistencias/i);
    expect(el.textContent).not.toContain('Reintentar');
    expect(page.errorRecuperable()).toBeFalse();
  });

  it('fallo recuperable de listarHub: título carga, Reintentar+Volver; Reintentar re-llama sin PII', async () => {
    const listarHub = jasmine
      .createSpy('listarHub')
      .and.returnValues(
        Promise.reject(new Error('network')),
        Promise.resolve({
          cursos: [{ id: 99, codigo: 'CUR-OK', nombre: 'Curso ok', estado: 'activo' as const }],
          fechas: [
            {
              id: 1,
              cursoId: 99,
              fecha: '2026-07-01',
              descripcion: null,
              orden: 1,
              estado: 'programada' as const,
            },
          ],
          asistencias: [],
          alumnosActivos: 0,
        }),
      );

    await TestBed.configureTestingModule({
      imports: [AttendanceCourseDatesPage],
      providers: [
        provideRouter([], withComponentInputBinding()),
        { provide: COURSES_SOURCE, useClass: InMemoryCoursesService },
        { provide: ATTENDANCE_SOURCE, useValue: { listarHub } },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(AttendanceCourseDatesPage);
    fixture.componentRef.setInput('id', '99');
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const page = fixture.componentInstance;
    let el = fixture.nativeElement as HTMLElement;
    let text = el.textContent || '';
    expect(page.errorRecuperable()).toBeTrue();
    expect(el.querySelector('.estado-title')?.textContent?.trim()).toBe(
      'No pudimos cargar las fechas',
    );
    expect(text).toContain('Reintentar');
    expect(text).toMatch(/Volver a Asistencias/i);
    expect(text).toContain('No se pudieron cargar las fechas. Reintentá.');
    expect(text.toLowerCase()).not.toMatch(/\bdni\b/);
    expect(text.toLowerCase()).not.toContain('token');
    expect(listarHub).toHaveBeenCalledTimes(1);

    const reintentar = Array.from(el.querySelectorAll('button')).find((b) =>
      (b.textContent || '').includes('Reintentar'),
    ) as HTMLButtonElement;
    expect(reintentar).toBeTruthy();
    reintentar.click();
    await fixture.whenStable();
    fixture.detectChanges();

    el = fixture.nativeElement as HTMLElement;
    text = el.textContent || '';
    expect(listarHub).toHaveBeenCalledTimes(2);
    expect(page.error()).toBe('');
    expect(page.errorRecuperable()).toBeFalse();
    expect(text).toContain('Curso ok');
    expect(text).not.toMatch(/\bdni\b/i);
    expect(text.toLowerCase()).not.toContain('token');
  });

  it('al cambiar de curso resetea búsqueda y filtro de estado', async () => {
    const f = await render('6');
    const el = f.nativeElement as HTMLElement;
    const chipRealizada = el.querySelector(
      'button[data-estado="realizada"]',
    ) as HTMLButtonElement;
    chipRealizada.click();
    f.detectChanges();
    expect(el.textContent).toMatch(/Ninguna fecha coincide|No hay fechas que coincidan/i);

    f.componentRef.setInput('id', '1');
    f.detectChanges();
    await f.whenStable();
    f.detectChanges();
    expect(tableRows(el).length).toBe(3);
    expect(el.querySelector('button[data-estado="realizada"]')?.getAttribute('aria-pressed')).toBe(
      'false',
    );
  });
});
