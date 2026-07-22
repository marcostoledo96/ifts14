import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AttendancesListPage } from './attendances-list-page';
import { COURSES_SOURCE } from '../../../courses/courses.service';
import { InMemoryCoursesService } from '../../../courses/in-memory-courses.service';
import { ATTENDANCE_SOURCE } from '../../data/attendance.token';
import { AttendanceMockService } from '../../data/attendance-mock.service';

describe('AttendancesListPage', () => {
  async function render() {
    await TestBed.configureTestingModule({
      imports: [AttendancesListPage],
      providers: [
        provideRouter([]),
        { provide: COURSES_SOURCE, useClass: InMemoryCoursesService },
        { provide: ATTENDANCE_SOURCE, useClass: AttendanceMockService },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(AttendancesListPage);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    return fixture;
  }

  function cards(el: HTMLElement): NodeListOf<Element> {
    return el.querySelectorAll('.lista-asis .card-asis');
  }

  function tableRows(el: HTMLElement): NodeListOf<Element> {
    return el.querySelectorAll('[data-testid="asistencias-tabla"] tbody tr');
  }

  function tableLinks(el: HTMLElement): NodeListOf<Element> {
    return el.querySelectorAll('[data-testid="asistencias-tabla"] .card-asis-link');
  }

  it('muestra título Asistencias y oculta banner demo con API real', async () => {
    const f = await render();
    const el = f.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Asistencias');
    expect(el.textContent).toContain('Registro de cursada');
    expect(el.textContent).not.toContain('Datos de demostración');
  });

  it('renderiza una fila por curso del seed (no flatten de fechas)', async () => {
    const f = await render();
    const el = f.nativeElement as HTMLElement;
    // Seed: 6 cursos (CUR-001..006), incluida CUR-005 sin fechas asistibles.
    expect(cards(el).length).toBe(6);
    expect(tableRows(el).length).toBe(6);
  });

  it('no ofrece chips de estado de fecha programada/realizada', async () => {
    const f = await render();
    const el = f.nativeElement as HTMLElement;
    expect(el.querySelector('button[data-estado="programada"]')).toBeNull();
    expect(el.querySelector('button[data-estado="realizada"]')).toBeNull();
    expect(el.textContent).not.toContain('Estado de la fecha');
  });

  it('expone input type=search por nombre o código', async () => {
    const f = await render();
    const el = f.nativeElement as HTMLElement;
    expect(el.querySelector('input[type="search"]')).not.toBeNull();
  });

  it('filtrar por código deja una sola fila', async () => {
    const f = await render();
    const el = f.nativeElement as HTMLElement;
    const input = el.querySelector('input[type="search"]') as HTMLInputElement;
    input.value = 'CUR-001';
    input.dispatchEvent(new Event('input'));
    f.detectChanges();
    await f.whenStable();
    f.detectChanges();
    expect(cards(el).length).toBe(1);
    expect(tableRows(el).length).toBe(1);
  });

  it('filtrar por fragmento de nombre reduce la lista', async () => {
    const f = await render();
    const el = f.nativeElement as HTMLElement;
    const input = el.querySelector('input[type="search"]') as HTMLInputElement;
    input.value = 'herramientas';
    input.dispatchEvent(new Event('input'));
    f.detectChanges();
    await f.whenStable();
    f.detectChanges();
    expect(cards(el).length).toBe(1);
    expect(el.textContent).toContain('CUR-002');
  });

  it('métricas honestas: N fechas asistibles y M con presentes (sin alumnosActivos)', async () => {
    const f = await render();
    const el = f.nativeElement as HTMLElement;
    const rows = Array.from(tableRows(el));
    const byCode = new Map(
      rows.map((row) => {
        const codigo = row.querySelector('.mono')?.textContent?.trim() ?? '';
        const metric = row.querySelector('.card-asis-conteo')?.textContent?.trim() ?? '';
        return [codigo, metric] as const;
      }),
    );
    expect(byCode.get('CUR-001')).toMatch(/3/);
    expect(byCode.get('CUR-001')).toMatch(/3/);
    expect(byCode.get('CUR-005')).toMatch(/0/);
    // No debe parecer presentes/alumnosActivos (p. ej. 3/14).
    for (const metric of byCode.values()) {
      expect(metric).not.toMatch(/\/14\b/);
    }
  });

  it('curso sin fechas asistibles (CUR-005) permanece visible', async () => {
    const f = await render();
    const el = f.nativeElement as HTMLElement;
    expect(el.textContent).toContain('CUR-005');
    expect(el.textContent).toContain('Curso de registros y archivo');
  });

  it('CTA de cada fila apunta a la intermedia /admin/asistencias/curso/:id', async () => {
    const f = await render();
    const el = f.nativeElement as HTMLElement;
    const links = Array.from(tableLinks(el)) as HTMLAnchorElement[];
    expect(links.length).toBe(6);
    for (const link of links) {
      const href = link.getAttribute('href') ?? '';
      expect(href).toMatch(/^\/admin\/asistencias\/curso\/\d+$/);
      expect(href).not.toContain('/fechas/');
    }
  });

  it('filtrar sin matches muestra vacío de filtro', async () => {
    const f = await render();
    const el = f.nativeElement as HTMLElement;
    const input = el.querySelector('input[type="search"]') as HTMLInputElement;
    input.value = 'zzzz-no-existe';
    input.dispatchEvent(new Event('input'));
    f.detectChanges();
    await f.whenStable();
    f.detectChanges();
    expect(el.textContent).toMatch(/Ningún curso coincide|No hay cursos que coincidan/i);
  });

  it('no llama fetch', async () => {
    const fetchSpy = spyOn(window, 'fetch').and.callThrough();
    await render();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('reintento solapado no deja error stale tras carga exitosa', async () => {
    await TestBed.configureTestingModule({
      imports: [AttendancesListPage],
      providers: [
        provideRouter([]),
        { provide: COURSES_SOURCE, useClass: InMemoryCoursesService },
        { provide: ATTENDANCE_SOURCE, useClass: AttendanceMockService },
      ],
    }).compileComponents();
    const attendance = TestBed.inject(ATTENDANCE_SOURCE) as AttendanceMockService;
    const realHub = attendance.listarHub.bind(attendance);
    let resolveSlow: ((value: Awaited<ReturnType<typeof realHub>>) => void) | null = null;
    const slow = new Promise<Awaited<ReturnType<typeof realHub>>>((resolve) => {
      resolveSlow = resolve;
    });
    let calls = 0;
    spyOn(attendance, 'listarHub').and.callFake(() => {
      calls += 1;
      return calls === 1 ? slow : realHub();
    });

    const f = TestBed.createComponent(AttendancesListPage);
    f.detectChanges();
    // Segunda carga (rápida) mientras la primera sigue pendiente.
    await f.componentInstance.cargar();
    await f.whenStable();
    f.detectChanges();
    expect(f.nativeElement.querySelector('.estado-error')).toBeNull();
    expect(tableRows(f.nativeElement as HTMLElement).length).toBe(6);

    resolveSlow!(await realHub());
    await f.whenStable();
    f.detectChanges();
    expect(f.nativeElement.querySelector('.estado-error')).toBeNull();
    expect(tableRows(f.nativeElement as HTMLElement).length).toBe(6);
    expect(calls).toBe(2);
  });

  it('curso nuevo sin fechas no rompe la lista y queda visible', async () => {
    await TestBed.configureTestingModule({
      imports: [AttendancesListPage],
      providers: [
        provideRouter([]),
        { provide: COURSES_SOURCE, useClass: InMemoryCoursesService },
        { provide: ATTENDANCE_SOURCE, useClass: AttendanceMockService },
      ],
    }).compileComponents();
    const courses = TestBed.inject(COURSES_SOURCE);
    await courses.crear({ codigo: 'VACIO', nombre: 'Curso vacío', estado: 'borrador' });
    const f = TestBed.createComponent(AttendancesListPage);
    f.detectChanges();
    await f.whenStable();
    f.detectChanges();
    const el = f.nativeElement as HTMLElement;
    expect(el.querySelector('.estado-error')).toBeNull();
    expect(el.textContent).toContain('VACIO');
    expect(tableRows(el).length).toBe(7);
  });
});
