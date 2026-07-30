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

  it('expone chips Activos/Inactivos y no usa select ni borrador/cerrado/archivado', async () => {
    const f = await render();
    const el = f.nativeElement as HTMLElement;
    expect(el.querySelector('select')).toBeNull();
    expect(el.querySelector('input[type="search"]')).not.toBeNull();
    for (const estado of ['activo', 'inactivo']) {
      const chip = el.querySelector(`button[data-estado="${estado}"]`) as HTMLButtonElement | null;
      expect(chip).not.toBeNull();
      expect(chip?.querySelector('.chip-dot')).not.toBeNull();
    }
    expect(el.querySelector('button[data-estado="borrador"]')).toBeNull();
    expect(el.querySelector('button[data-estado="cerrado"]')).toBeNull();
    expect(el.querySelector('button[data-estado="archivado"]')).toBeNull();
    expect(el.textContent).toContain('Activos');
    expect(el.textContent).toContain('Inactivos');
    expect(el.textContent).not.toContain('Cerrados');
    expect(el.textContent).not.toContain('Archivados');
    expect(el.textContent).not.toContain('Borrador');
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

  it('renderiza items del seed (6 cursos) con badge, acento, iconos y métricas', async () => {
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
    expect(el.textContent).toContain('Inactivo');
    expect(el.textContent).toContain('fechas');
    // Seed in-memory ya expone números; no placeholders de integración.
    expect(el.textContent).not.toContain('Dato disponible con integración real');
    const metricas = el.querySelectorAll('td .metrica-valor');
    expect(metricas.length).toBeGreaterThan(0);
    expect(metricas[1].textContent?.trim()).not.toBe('—');
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

  it('filtrar por Inactivos agrupa cerrado/borrador/archivado', async () => {
    const f = await render();
    const el = f.nativeElement as HTMLElement;
    const chip = el.querySelector('button[data-estado="inactivo"]') as HTMLButtonElement;
    chip.click();
    f.detectChanges();
    await f.whenStable();
    f.detectChanges();
    expect(chip.getAttribute('aria-pressed')).toBe('true');
    expect(el.querySelectorAll('.card-curso').length).toBe(3);
    expect(el.textContent).toContain('Inactivo');
    expect(el.textContent).not.toContain('Borrador');
    expect(el.textContent).not.toContain('Cerrado');
    expect(el.textContent).not.toContain('Archivado');
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
    expect(el.querySelector('[role="alert"]')?.textContent).toContain('No pudimos cargar');
    expect(el.querySelector('[role="alert"] .estado-icon')).not.toBeNull();
    const retry = el.querySelector('[role="alert"] button') as HTMLButtonElement;
    expect(retry.textContent).toContain('Reintentar');
    expect(retry.classList.contains('btn-primary')).toBeTrue();
    expect(el.querySelector('app-empty-state')).toBeNull();
    retry.click();
    f.detectChanges();
    await f.whenStable();
    f.detectChanges();
    expect(source.listar).toHaveBeenCalledTimes(2);
    expect(el.querySelector('[data-state="empty-total"] .estado-title')?.textContent).toContain(
      'Todavía no hay cursos cargados',
    );
    const emptyCta = el.querySelector(
      '[data-state="empty-total"] a[routerLink="/admin/cursos/nuevo"]',
    ) as HTMLAnchorElement | null;
    expect(emptyCta?.textContent).toContain('Crear primer curso');
    expect(emptyCta?.classList.contains('btn-primary')).toBeTrue();
    expect(el.querySelector('app-empty-state')).toBeNull();
  });

  it('oculta la barra Vista QA cuando el token QA es false', async () => {
    const f = await render(new InMemoryCoursesService(), false);
    const el = f.nativeElement as HTMLElement;
    expect(el.querySelector('.vista-qa')).toBeNull();
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

  it('conserva el último resultado cuando dos cargas terminan en orden inverso', async () => {
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
    // Carga del constructor (gen1) + reintento forzado (gen2).
    void f.componentInstance.recargar();
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

  it('filtra en cliente sin re-fetch al buscar', async () => {
    const source = jasmine.createSpyObj<CoursesService>('CoursesService', ['listar']);
    source.listar.and.returnValue(
      Promise.resolve([
        { ...cursoStub(1), nombre: 'Curso Alpha', codigo: 'A1' },
        { ...cursoStub(2), nombre: 'Curso Beta', codigo: 'B2' },
      ]),
    );
    const f = await render(source);
    expect(source.listar).toHaveBeenCalledTimes(1);
    f.componentInstance.onSearch({ target: { value: 'Beta' } } as unknown as Event);
    f.detectChanges();
    expect(source.listar).toHaveBeenCalledTimes(1);
    expect(f.componentInstance.resultadosFiltrados().length).toBe(1);
    expect(f.componentInstance.resultadosFiltrados()[0]?.nombre).toBe('Curso Beta');
  });

  it('filtra por fechas en cliente sin re-fetch y toggle limpia', async () => {
    const source = jasmine.createSpyObj<CoursesService>('CoursesService', ['listar']);
    source.listar.and.returnValue(
      Promise.resolve([
        { ...cursoStub(1), cantidadFechas: 2 },
        { ...cursoStub(2), cantidadFechas: 0 },
      ]),
    );
    const f = await render(source);
    const el = f.nativeElement as HTMLElement;
    expect(source.listar).toHaveBeenCalledTimes(1);

    const con = el.querySelector('button[data-fechas="con"]') as HTMLButtonElement;
    con.click();
    f.detectChanges();
    expect(source.listar).toHaveBeenCalledTimes(1);
    expect(con.getAttribute('aria-pressed')).toBe('true');
    expect(el.querySelectorAll('.card-curso').length).toBe(1);
    expect(el.textContent).toContain('CUR-001');

    const sin = el.querySelector('button[data-fechas="sin"]') as HTMLButtonElement;
    sin.click();
    f.detectChanges();
    expect(source.listar).toHaveBeenCalledTimes(1);
    expect(sin.getAttribute('aria-pressed')).toBe('true');
    expect(el.querySelectorAll('.card-curso').length).toBe(1);
    expect(el.textContent).toContain('CUR-002');

    sin.click();
    f.detectChanges();
    expect(sin.getAttribute('aria-pressed')).toBe('false');
    expect(el.querySelectorAll('.card-curso').length).toBe(2);
  });

  it('chip estado y limpiar no re-fetchan el listado', async () => {
    const source = jasmine.createSpyObj<CoursesService>('CoursesService', ['listar']);
    source.listar.and.returnValue(
      Promise.resolve([
        { ...cursoStub(1), estado: 'activo' },
        { ...cursoStub(2), estado: 'cerrado' },
      ]),
    );
    const f = await render(source);
    const el = f.nativeElement as HTMLElement;
    expect(source.listar).toHaveBeenCalledTimes(1);

    (el.querySelector('button[data-estado="activo"]') as HTMLButtonElement).click();
    f.detectChanges();
    expect(source.listar).toHaveBeenCalledTimes(1);
    expect(el.querySelectorAll('.card-curso').length).toBe(1);

    (el.querySelector('button.clear-filters') as HTMLButtonElement).click();
    f.detectChanges();
    expect(source.listar).toHaveBeenCalledTimes(1);
    expect(el.querySelectorAll('.card-curso').length).toBe(2);
  });

  it('etiquetaCodigo oculta Sin programar y muestra cuatrimestre real', async () => {
    const source = jasmine.createSpyObj<CoursesService>('CoursesService', ['listar']);
    source.listar.and.returnValue(
      Promise.resolve([
        { ...cursoStub(1), codigo: 'A1', cuatrimestre: 'Sin programar' },
        { ...cursoStub(2), codigo: 'B2', cuatrimestre: '1C 2026' },
      ]),
    );
    const f = await render(source);
    const page = f.componentInstance;
    expect(page.etiquetaCodigo(page.cursos()[0]!)).toBe('A1');
    expect(page.etiquetaCodigo(page.cursos()[1]!)).toBe('B2 · 1C 2026');
    const el = f.nativeElement as HTMLElement;
    expect(el.textContent).toContain('A1');
    expect(el.textContent).not.toContain('Sin programar');
    expect(el.textContent).toContain('B2 · 1C 2026');
  });

  it('no llama fetch', async () => {
    const fetchSpy = spyOn(window, 'fetch').and.callThrough();
    await render();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('pagina de a 20 y resetea página al filtrar', async () => {
    const muchos = Array.from({ length: COURSES_PAGE_SIZE + 5 }, (_, i) => cursoStub(i + 1));
    const source = jasmine.createSpyObj<CoursesService>('CoursesService', ['listar']);
    source.listar.and.returnValue(Promise.resolve(muchos));

    const f = await render(source);
    const page = f.componentInstance;
    expect(page.itemsVisibles().length).toBe(COURSES_PAGE_SIZE);
    expect((f.nativeElement as HTMLElement).querySelector('[aria-label="Paginación de cursos"]')).not.toBeNull();

    page.onPagina(2);
    f.detectChanges();
    expect(page.itemsVisibles()).toEqual(muchos.slice(COURSES_PAGE_SIZE));

    page.onSearch({ target: { value: 'Curso 3' } } as unknown as Event);
    f.detectChanges();
    expect(source.listar).toHaveBeenCalledTimes(1);
    expect(page.paginaSegura()).toBe(1);
    expect(page.itemsVisibles().length).toBe(1);

    page.onPagina(99);
    expect(page.paginaSegura()).toBe(1);
    page.onPagina(-4);
    expect(page.paginaSegura()).toBe(1);
  });
});
