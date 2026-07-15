import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { CoursesListPage } from './courses-list-page';
import { Curso } from './courses.models';
import { COURSES_SOURCE, CoursesService } from './courses.service';
import { InMemoryCoursesService } from './in-memory-courses.service';

describe('CoursesListPage', () => {
  async function render(source: CoursesService = new InMemoryCoursesService()) {
    await TestBed.configureTestingModule({
      imports: [CoursesListPage],
      providers: [
        provideRouter([]),
        { provide: COURSES_SOURCE, useValue: source },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(CoursesListPage);
    // detectChanges dispara ctor → recargar() async; whenStable espera.
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    return fixture;
  }

  it('muestra título Cursos y enlace Nuevo curso', async () => {
    const f = await render();
    const el = f.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Cursos');
    const nuevoLink = el.querySelector('a[routerLink="/admin/cursos/nuevo"]');
    expect(nuevoLink).not.toBeNull();
  });

  it('muestra banner Datos de demostración', async () => {
    const f = await render();
    const el = f.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Datos de demostración');
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

  it('expone input type=search y select de estado', async () => {
    const f = await render();
    const el = f.nativeElement as HTMLElement;
    expect(el.querySelector('input[type="search"]')).not.toBeNull();
    expect(el.querySelector('select')).not.toBeNull();
  });

  it('renderiza items del seed (6 cursos)', async () => {
    const f = await render();
    const el = f.nativeElement as HTMLElement;
    const cards = el.querySelectorAll('.card-curso');
    expect(cards.length).toBe(6);
  });

  it('enlaces de detalle apuntan a /admin/cursos/:id', async () => {
    const f = await render();
    const el = f.nativeElement as HTMLElement;
    const link = el.querySelector('a[aria-label^="Ver detalle"]') as HTMLAnchorElement | null;
    expect(link).not.toBeNull();
    expect(link?.getAttribute('href')).toContain('/admin/cursos/');
  });

  it('filtrar por estado=activo reduce la lista', async () => {
    const f = await render();
    const el = f.nativeElement as HTMLElement;
    const select = el.querySelector('select') as HTMLSelectElement;
    select.value = 'activo';
    select.dispatchEvent(new Event('change'));
    f.detectChanges();
    await f.whenStable();
    f.detectChanges();
    const cards = el.querySelectorAll('.card-curso');
    expect(cards.length).toBe(3);
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

  it('filtrar sin matches muestra mensaje de vacío', async () => {
    const f = await render();
    const el = f.nativeElement as HTMLElement;
    const input = el.querySelector('input[type="search"]') as HTMLInputElement;
    input.value = 'zzzz-no-existe';
    input.dispatchEvent(new Event('input'));
    f.detectChanges();
    await f.whenStable();
    f.detectChanges();
    expect(el.textContent).toContain('No hay cursos que coincidan');
  });

  it('muestra error seguro y reintenta la carga', async () => {
    const source = jasmine.createSpyObj<CoursesService>('CoursesService', [
      'listar', 'obtener', 'crear', 'actualizarEstado', 'listarFechas', 'guardarFecha', 'reemplazarFechas',
    ]);
    source.listar.and.returnValues(
      Promise.reject(new Error('fallo interno')),
      Promise.resolve([]),
    );
    const f = await render(source);
    const el = f.nativeElement as HTMLElement;
    expect(el.querySelector('[role="alert"]')?.textContent).toContain('No se pudo cargar');
    const retry = el.querySelector('[role="alert"] button') as HTMLButtonElement;
    expect(retry.textContent).toContain('Reintentar');
    retry.click();
    f.detectChanges();
    await f.whenStable();
    f.detectChanges();
    expect(source.listar).toHaveBeenCalledTimes(2);
    expect(el.textContent).toContain('Todavía no hay cursos cargados');
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
});
