import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { COURSES_QA_ENABLED, CoursesListPage } from './courses-list-page';
import { COURSES_PAGE_SIZE, Curso } from './courses.models';
import { COURSES_SOURCE, CoursesService } from './courses.service';
import { InMemoryCoursesService } from './in-memory-courses.service';

function cursoStub(id: number): Curso {
  return {
    id,
    codigo: `CUR-${String(id).padStart(3, '0')}`,
    nombre: `Curso ${id}`,
    estado: 'activo',
    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
    cuatrimestre: '1C 2026',
    cantidadFechas: 1,
    alumnosPresentes: null,
    certificaciones: null,
  };
}

describe('CoursesListPage', () => {
  async function render(
    source: CoursesService = new InMemoryCoursesService(),
    qaEnabled?: boolean,
  ) {
    await TestBed.configureTestingModule({
      imports: [CoursesListPage],
      providers: [
        provideRouter([]),
        { provide: COURSES_SOURCE, useValue: source },
        ...(qaEnabled === undefined ? [] : [{ provide: COURSES_QA_ENABLED, useValue: qaEnabled }]),
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(CoursesListPage);
    // detectChanges dispara ctor → recargar() async; whenStable espera.
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    return fixture;
  }

  it('muestra título Cursos y enlace Nuevo curso con icono Plus', async () => {
    const f = await render();
    const el = f.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Cursos');
    const nuevoLink = el.querySelector('a[routerLink="/admin/cursos/nuevo"]');
    expect(nuevoLink).not.toBeNull();
    expect(nuevoLink?.querySelector('svg.btn-icon')).not.toBeNull();
    expect(el.querySelector('.filtro-search .search-icon')).not.toBeNull();
    expect(el.querySelector('.filtros .results-summary')).not.toBeNull();
  });

  it('no muestra banner de demostración con API real (useRealApi)', async () => {
    const f = await render();
    const el = f.nativeElement as HTMLElement;
    expect(el.textContent).not.toContain('Datos de demostración');
  });

  it('renderiza tabla accesible, cards móviles y controles de fechas', async () => {
    const f = await render();
    const el = f.nativeElement as HTMLElement;

    expect(el.querySelector('table caption')?.textContent).toContain('Listado de cursos');
    expect(el.querySelectorAll('th[scope="col"]').length).toBeGreaterThan(0);
    expect(el.querySelector('.cards-mobile')).not.toBeNull();
    expect(el.querySelector('button[aria-pressed][data-fechas="con"]')).not.toBeNull();
    expect(el.querySelector('button[aria-pressed][data-fechas="sin"]')).not.toBeNull();
    expect(el.querySelector('[aria-live="polite"]')?.textContent).toContain('cursos');
  });

  it('expone chips de estado con dots y no usa select de estado', async () => {
    const f = await render();
    const el = f.nativeElement as HTMLElement;
    expect(el.querySelector('select')).toBeNull();
    expect(el.querySelector('input[type="search"]')).not.toBeNull();
    for (const estado of ['borrador', 'activo', 'cerrado', 'archivado']) {
      const chip = el.querySelector(`button[data-estado="${estado}"]`) as HTMLButtonElement | null;
      expect(chip).not.toBeNull();
      expect(chip?.querySelector('.chip-dot')).not.toBeNull();
    }
    expect(el.textContent).toContain('Activos');
    expect(el.textContent).toContain('Cerrados');
    expect(el.textContent).toContain('Archivados');
    expect(el.textContent).toContain('Borrador');
  });

  it('limpia filtros y mantiene acciones de detalle y edición accesibles', async () => {
    const f = await render();
    const el = f.nativeElement as HTMLElement;
    const input = el.querySelector('input[type="search"]') as HTMLInputElement;
    input.value = 'CUR-001';
    input.dispatchEvent(new Event('input'));
    f.detectChanges();
    await f.whenStable();
    f.detectChanges();

    const clear = el.querySelector('button.clear-filters') as HTMLButtonElement;
    expect(clear.textContent).toContain('Limpiar filtros');
    clear.click();
    f.detectChanges();
    await f.whenStable();
    f.detectChanges();
    expect(input.value).toBe('');
    expect(el.querySelector('a[aria-label^="Ver detalle"]')).not.toBeNull();
    expect(el.querySelector('a[aria-label^="Editar"]')).not.toBeNull();
  });

  it('renderiza items del seed (6 cursos) con badge, acento, iconos y placeholders', async () => {
    const f = await render();
    const el = f.nativeElement as HTMLElement;
    const cards = el.querySelectorAll('.card-curso');
    expect(cards.length).toBe(6);
    expect(el.querySelector('.estado-badge .estado-dot')).not.toBeNull();
    expect(el.querySelector('.row-accent')).not.toBeNull();
    expect(el.querySelector('.card-accent')).not.toBeNull();
    expect(el.querySelector('.action-icon svg')).not.toBeNull();
    expect(el.querySelector('.metrics .metric-icon')).not.toBeNull();
    expect(el.textContent).toContain('Activo');
    expect(el.textContent).toContain('fechas');
    const presentes = el.querySelectorAll('td span[title="Dato disponible con integración real"]');
    expect(presentes.length).toBeGreaterThan(0);
    expect(presentes[0].textContent).toContain('—');
  });

  it('enlaces de detalle apuntan a /admin/cursos/:id', async () => {
    const f = await render();
    const el = f.nativeElement as HTMLElement;
    const link = el.querySelector('a[aria-label^="Ver detalle"]') as HTMLAnchorElement | null;
    expect(link).not.toBeNull();
    expect(link?.getAttribute('href')).toContain('/admin/cursos/');
  });

  it('filtrar por estado=activo con chip reduce la lista', async () => {
    const f = await render();
    const el = f.nativeElement as HTMLElement;
    const chip = el.querySelector('button[data-estado="activo"]') as HTMLButtonElement;
    chip.click();
    f.detectChanges();
    await f.whenStable();
    f.detectChanges();
    expect(chip.getAttribute('aria-pressed')).toBe('true');
    const cards = el.querySelectorAll('.card-curso');
    expect(cards.length).toBe(3);
  });

  it('segundo click en el mismo chip limpia el filtro de estado', async () => {
    const f = await render();
    const el = f.nativeElement as HTMLElement;
    const chip = el.querySelector('button[data-estado="activo"]') as HTMLButtonElement;
    chip.click();
    f.detectChanges();
    await f.whenStable();
    f.detectChanges();
    expect(el.querySelectorAll('.card-curso').length).toBe(3);
    chip.click();
    f.detectChanges();
    await f.whenStable();
    f.detectChanges();
    expect(chip.getAttribute('aria-pressed')).toBe('false');
    expect(el.querySelectorAll('.card-curso').length).toBe(6);
  });

  it('filtrar por texto reduce la lista', async () => {
    const f = await render();
    const el = f.nativeElement as HTMLElement;
    const input = el.querySelector('input[type="search"]') as HTMLInputElement;
    input.value = 'CUR-001';
    input.dispatchEvent(new Event('input'));
    f.detectChanges();
    await f.whenStable();
    f.detectChanges();
    const cards = el.querySelectorAll('.card-curso');
    expect(cards.length).toBe(1);
  });

  it('filtrar sin matches muestra vacío v0 con título e icono', async () => {
    const f = await render();
    const el = f.nativeElement as HTMLElement;
    const input = el.querySelector('input[type="search"]') as HTMLInputElement;
    input.value = 'zzzz-no-existe';
    input.dispatchEvent(new Event('input'));
    f.detectChanges();
    await f.whenStable();
    f.detectChanges();
    expect(el.querySelector('[data-state="no-results"] .estado-title')?.textContent).toContain(
      'Ningún curso coincide',
    );
    expect(el.querySelector('[data-state="no-results"] .estado-icon')).not.toBeNull();
  });

  it('muestra error v0 con título, icono y reintenta la carga', async () => {
    const source = jasmine.createSpyObj<CoursesService>('CoursesService', [
      'listar', 'obtener', 'crear', 'actualizar', 'actualizarEstado', 'listarFechas', 'guardarFecha', 'reemplazarFechas',
    ]);
    source.listar.and.returnValues(
      Promise.reject(new Error('fallo interno')),
      Promise.resolve([]),
    );
    const f = await render(source);
    const el = f.nativeElement as HTMLElement;
    expect(el.querySelector('[role="alert"] .estado-title')?.textContent).toContain(
      'No pudimos cargar los cursos',
    );
    expect(el.querySelector('[role="alert"]')?.textContent).toContain('No se pudo cargar');
    expect(el.querySelector('[role="alert"] .estado-icon')).not.toBeNull();
    const retry = el.querySelector('[role="alert"] button') as HTMLButtonElement;
    expect(retry.textContent).toContain('Reintentar');
    retry.click();
    f.detectChanges();
    await f.whenStable();
    f.detectChanges();
    expect(source.listar).toHaveBeenCalledTimes(2);
    expect(el.querySelector('[data-state="empty-total"] .estado-title')?.textContent).toContain(
      'Todavía no hay cursos cargados',
    );
    expect(el.querySelector('[data-state="empty-total"] a[routerLink="/admin/cursos/nuevo"]')?.textContent)
      .toContain('Crear primer curso');
  });

  it('expone Vista QA en desarrollo y fuerza skeleton/vacío/error', async () => {
    const f = await render(new InMemoryCoursesService(), true);
    const el = f.nativeElement as HTMLElement;
    const page = f.componentInstance;
    expect(el.querySelector('.vista-qa')).not.toBeNull();
    expect(el.textContent).toContain('Con datos');
    expect(el.textContent).toContain('Sin cursos');

    page.onVistaQA('cargando');
    f.detectChanges();
    expect(el.querySelector('.tabla-skeleton[aria-busy="true"]')).not.toBeNull();

    page.onVistaQA('vacio-total');
    f.detectChanges();
    expect(el.querySelector('[data-state="empty-total"]')).not.toBeNull();

    page.onVistaQA('error');
    f.detectChanges();
    expect(el.querySelector('[role="alert"]')).not.toBeNull();
  });

  it('ignora onVistaQA cuando QA está deshabilitado', async () => {
    const f = await render(new InMemoryCoursesService(), false);
    const page = f.componentInstance;
    page.onVistaQA('cargando');
    f.detectChanges();
    expect(page.vistaQA()).toBe('datos');
    expect((f.nativeElement as HTMLElement).querySelector('.vista-qa')).toBeNull();
  });

  it('conserva el último filtro cuando dos cargas terminan en orden inverso', async () => {
    let resolveFirst!: (value: readonly Curso[]) => void;
    let resolveSecond!: (value: readonly Curso[]) => void;
    const source = jasmine.createSpyObj<CoursesService>('CoursesService', ['listar']);
    source.listar.and.returnValues(
      new Promise((resolve) => { resolveFirst = resolve; }),
      new Promise((resolve) => { resolveSecond = resolve; }),
    );

    await TestBed.configureTestingModule({
      imports: [CoursesListPage],
      providers: [provideRouter([]), { provide: COURSES_SOURCE, useValue: source }],
    }).compileComponents();
    const f = TestBed.createComponent(CoursesListPage);
    f.detectChanges();

    const input = f.nativeElement.querySelector('input[type="search"]') as HTMLInputElement;
    input.value = 'segunda';
    input.dispatchEvent(new Event('input'));
    expect(source.listar).toHaveBeenCalledTimes(2);

    resolveSecond([{ id: 2, nombre: 'Resultado actual' }] as unknown as readonly Curso[]);
    await Promise.resolve();
    f.detectChanges();
    expect(f.componentInstance.cursos()[0]?.nombre).toBe('Resultado actual');
    expect(f.componentInstance.cargando()).toBeFalse();

    resolveFirst([{ id: 1, nombre: 'Resultado stale' }] as unknown as readonly Curso[]);
    await Promise.resolve();
    f.detectChanges();
    expect(f.componentInstance.cursos()[0]?.nombre).toBe('Resultado actual');
    expect(f.componentInstance.error()).toBe('');
    expect(f.componentInstance.cargando()).toBeFalse();
  });

  it('no llama fetch', async () => {
    const fetchSpy = spyOn(window, 'fetch').and.callThrough();
    await render();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('pagina de a 20 y resetea página al filtrar', async () => {
    const muchos = Array.from({ length: COURSES_PAGE_SIZE + 5 }, (_, i) => cursoStub(i + 1));
    const source = jasmine.createSpyObj<CoursesService>('CoursesService', ['listar']);
    source.listar.and.callFake((filtros) => {
      const q = filtros?.q?.trim().toLowerCase() ?? '';
      if (!q) return Promise.resolve(muchos);
      return Promise.resolve(muchos.filter((c) => c.nombre.toLowerCase().includes(q)));
    });

    const f = await render(source);
    const page = f.componentInstance;
    expect(page.itemsVisibles().length).toBe(COURSES_PAGE_SIZE);
    expect((f.nativeElement as HTMLElement).querySelector('[aria-label="Paginación de cursos"]')).not.toBeNull();

    page.onPagina(2);
    f.detectChanges();
    expect(page.itemsVisibles()).toEqual(muchos.slice(COURSES_PAGE_SIZE));

    page.onSearch({ target: { value: 'Curso 3' } } as unknown as Event);
    await f.whenStable();
    f.detectChanges();
    expect(page.paginaSegura()).toBe(1);
    expect(page.itemsVisibles().length).toBe(1);

    page.onPagina(99);
    expect(page.paginaSegura()).toBe(1);
    page.onPagina(-4);
    expect(page.paginaSegura()).toBe(1);
  });
});
