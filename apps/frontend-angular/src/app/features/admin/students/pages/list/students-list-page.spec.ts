import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Alumno } from '../../students.models';
import { STUDENTS_SOURCE, StudentsService } from '../../students.service';
import { StudentsListPage, STUDENTS_QA_ENABLED } from './students-list-page';

const alumnos: Alumno[] = Array.from({ length: 7 }, (_, i) => ({
  id: i + 1,
  apellido: 'Ficticia',
  nombre: `Persona ${i + 1}`,
  dniMostrar: `${String(i + 11).padStart(2, '0')}****${String(i + 21).padStart(2, '0')}`,
  estado: 'activo' as const,
  tieneEmail: i % 2 === 0,
  cursosConAsistencia: i,
  certificacionesValidas: i % 3,
}));

function stubSource(
  source: Partial<StudentsService> & Pick<StudentsService, 'listar'>,
): StudentsService {
  return {
    contar: () => Promise.resolve(0),
    obtener: () => Promise.resolve(null),
    crear: () => Promise.reject(new Error('not used')),
    ...source,
  };
}

describe('StudentsListPage', () => {
  async function render(
    source: StudentsService = stubSource({
      listar: () => Promise.resolve(alumnos),
      contar: () => Promise.resolve(alumnos.length),
    }),
    qa = true,
  ) {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [StudentsListPage],
      providers: [
        provideRouter([]),
        { provide: STUDENTS_SOURCE, useValue: source },
        { provide: STUDENTS_QA_ENABLED, useValue: qa },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(StudentsListPage);
    fixture.detectChanges();
    await Promise.resolve();
    fixture.detectChanges();
    return fixture;
  }

  it('muestra CTA Nuevo alumno con icono hacia /admin/alumnos/nuevo', async () => {
    const f = await render();
    const root = f.nativeElement as HTMLElement;
    const cta = root.querySelector<HTMLAnchorElement>('[data-testid="cta-nuevo-alumno"]');
    expect(cta?.textContent?.replace(/\s+/g, ' ').trim()).toBe('Nuevo alumno');
    expect(cta?.getAttribute('href')).toContain('/admin/alumnos/nuevo');
    expect(cta?.querySelector('svg.btn-icon')).not.toBeNull();
    expect(root.querySelector('.search-wrap .search-icon')).not.toBeNull();
    expect(root.querySelector('.chips .chip-dot')).not.toBeNull();
    expect(root.textContent).not.toContain('LEG-');
    expect(root.querySelector('th')?.textContent).not.toContain('Legajo');
  });

  it('busca solo por nombre o documento enmascarado, filtra contacto y pagina de a cinco', async () => {
    const f = await render();
    const page = f.componentInstance;
    const search = (f.nativeElement as HTMLElement).querySelector<HTMLInputElement>('#buscar-alumno');
    const label = (f.nativeElement as HTMLElement).querySelector<HTMLLabelElement>('label[for="buscar-alumno"]');
    expect(label?.textContent?.trim()).toBe('Buscar por nombre o documento enmascarado');
    expect(search?.placeholder).toBe('Nombre o XX****XX');
    expect(label?.textContent).not.toContain('apellido');
    expect(search?.placeholder).not.toContain('apellido');
    expect(page.itemsVisibles().length).toBe(5);
    page.onSearch({ target: { value: 'Persona 7' } } as unknown as Event);
    expect(page.resultadosFiltrados().length).toBe(1);
    page.onSearch({ target: { value: alumnos[6].dniMostrar } } as unknown as Event);
    expect(page.resultadosFiltrados()).toEqual([alumnos[6]]);
    page.onSearch({ target: { value: 'Ficticia' } } as unknown as Event);
    expect(page.resultadosFiltrados()).toEqual([]);
    page.onLimpiar();
    page.onPagina(2);
    expect(page.itemsVisibles()).toEqual(alumnos.slice(5));
    page.onContacto('sin-email');
    expect(page.paginaSegura()).toBe(1);
    expect(page.resultadosFiltrados().every((a) => a.tieneEmail === false)).toBeTrue();
  });

  it('vacía la búsqueda visible y restaura los resultados al limpiar filtros', async () => {
    const f = await render();
    const page = f.componentInstance;
    const search = (f.nativeElement as HTMLElement).querySelector<HTMLInputElement>('#buscar-alumno')!;

    search.value = 'Persona 7';
    search.dispatchEvent(new Event('input'));
    f.detectChanges();
    expect(page.resultadosFiltrados()).toEqual([alumnos[6]]);

    (f.nativeElement as HTMLElement).querySelector<HTMLButtonElement>('button.clear')!.click();
    f.detectChanges();
    expect(search.value).toBe('');
    expect(page.q()).toBe('');
    expect(page.resultadosFiltrados()).toEqual(alumnos);
    expect(page.itemsVisibles()).toEqual(alumnos.slice(0, 5));
  });

  it('combina búsqueda y contacto, y no encuentra email ni legajo', async () => {
    const f = await render();
    const page = f.componentInstance;
    page.onSearch({ target: { value: 'Persona' } } as unknown as Event);
    page.onContacto('con-email');
    f.detectChanges();
    expect(page.resultadosFiltrados()).toEqual(alumnos.filter((alumno) => alumno.tieneEmail === true));
    expect((f.nativeElement as HTMLElement).querySelector('button[aria-pressed="true"]')?.textContent).toContain('Contacto disponible');

    for (const query of ['persona@example.test', 'LEG-0007']) {
      page.onSearch({ target: { value: query } } as unknown as Event);
      f.detectChanges();
      expect(page.resultadosFiltrados()).toEqual([]);
      expect((f.nativeElement as HTMLElement).textContent).toContain('Sin coincidencias');
    }
  });

  it('excluye tieneEmail null del filtro Sin email y muestra placeholder', async () => {
    const mixed: Alumno[] = [
      { ...alumnos[0], id: 1, tieneEmail: true },
      { ...alumnos[1], id: 2, tieneEmail: false },
      { ...alumnos[2], id: 3, tieneEmail: null, cursosConAsistencia: null, certificacionesValidas: null },
    ];
    const f = await render(stubSource({ listar: () => Promise.resolve(mixed) }));
    const page = f.componentInstance;
    page.onContacto('sin-email');
    expect(page.resultadosFiltrados().map((a) => a.id)).toEqual([2]);
    page.onLimpiar();
    f.detectChanges();
    expect((f.nativeElement as HTMLElement).textContent).toContain('Sin dato');
    expect((f.nativeElement as HTMLElement).textContent).toContain('—');
  });

  it('muestra warning Sin email y ShieldCheck solo con dato real', async () => {
    const f = await render();
    f.detectChanges();
    const root = f.nativeElement as HTMLElement;
    const warnRows = [...root.querySelectorAll('.contacto-badge--warn')];
    expect(warnRows.length).toBeGreaterThan(0);
    expect(warnRows.every((el) => el.textContent?.includes('Sin email'))).toBeTrue();
    expect(root.querySelectorAll('td .metrica .badge-icon').length).toBeGreaterThan(0);
    expect(root.querySelector('.btn-detalle svg.btn-icon')).not.toBeNull();
    expect(root.querySelector('.cert-badge')).not.toBeNull();
  });

  it('reinicia y acota la página al buscar, filtrar y navegar', async () => {
    const f = await render();
    const page = f.componentInstance;
    page.onPagina(99);
    expect(page.paginaSegura()).toBe(2);
    page.onContacto('con-email');
    expect(page.pagina()).toBe(1);
    page.onPagina(99);
    expect(page.paginaSegura()).toBe(1);
    page.onSearch({ target: { value: 'Persona' } } as unknown as Event);
    expect(page.pagina()).toBe(1);
    page.onPagina(-4);
    expect(page.pagina()).toBe(1);
    page.onLimpiar();
    expect(page.pagina()).toBe(1);
  });

  it('presenta carga, error con retry, vacío y sin resultados como estados distintos', async () => {
    let resolve!: (value: readonly Alumno[]) => void;
    const pending = stubSource({
      listar: () => new Promise((done) => { resolve = done; }),
    });
    const loading = await render(pending);
    const loadingRoot = loading.nativeElement as HTMLElement;
    expect(loadingRoot.querySelector('[aria-busy="true"]')?.textContent).toContain('Cargando');
    expect(loadingRoot.querySelector('[aria-busy="true"] svg')).not.toBeNull();
    expect(loadingRoot.querySelector('[role="alert"]')).toBeNull();
    resolve([]);
    await loading.whenStable();
    loading.detectChanges();
    const emptyStatus = loadingRoot.querySelector('[data-state="empty-total"] [role="status"]');
    expect(emptyStatus?.textContent?.trim()).toBe('No hay alumnos cargados para mostrar.');
    expect(loadingRoot.querySelector('[data-state="empty-total"] a')?.getAttribute('href')).toContain('/admin/alumnos/nuevo');
    expect(loadingRoot.querySelector('[data-state="empty-total"] svg')).not.toBeNull();

    let calls = 0;
    const retrying = stubSource({
      listar: () => (++calls === 1 ? Promise.reject(new Error('fallo')) : Promise.resolve(alumnos)),
    });
    const error = await render(retrying);
    await error.whenStable();
    error.detectChanges();
    const errorRoot = error.nativeElement as HTMLElement;
    expect(errorRoot.querySelector('[role="alert"]')?.textContent).toContain('Reintentar');
    expect(errorRoot.querySelector('[role="alert"] svg')).not.toBeNull();
    (errorRoot.querySelector('[role="alert"] button') as HTMLButtonElement).click();
    await error.whenStable();
    error.detectChanges();
    expect(errorRoot.querySelector('[role="alert"]')).toBeNull();
    expect(errorRoot.querySelectorAll('tbody tr').length).toBe(5);

    error.componentInstance.onSearch({ target: { value: 'nadie' } } as unknown as Event);
    error.detectChanges();
    const noResultsStatus = errorRoot.querySelector('[data-state="no-results"] [role="status"]');
    expect(noResultsStatus?.textContent?.trim()).toBe('Sin coincidencias: no hay alumnos para los filtros aplicados.');
    expect(errorRoot.querySelector('[data-state="no-results"] svg')).not.toBeNull();
    expect(errorRoot.textContent).not.toContain('No hay alumnos cargados para mostrar');
  });

  it('renderiza tabla desktop, tarjetas mobile y un único resumen live', async () => {
    const f = await render();
    const root = f.nativeElement as HTMLElement;
    const heading = root.querySelector('h1#students-title');
    expect(heading).not.toBeNull();
    expect(heading?.textContent?.trim()).toBe('Alumnos');
    expect(root.querySelector('table caption')?.textContent?.trim()).toBe('Alumnos');
    expect(root.querySelectorAll('table th[scope="col"]').length).toBe(6);
    expect(root.querySelectorAll('tbody tr').length).toBe(5);
    expect(root.querySelectorAll('ul.alumnos-cards > li').length).toBe(5);
    expect(root.querySelectorAll('output[aria-live="polite"][aria-atomic="true"]').length).toBe(1);
  });

  it('asocia Documento con el valor enmascarado en cada tarjeta mobile', async () => {
    const f = await render();
    const cards = [...(f.nativeElement as HTMLElement).querySelectorAll<HTMLLIElement>('ul.alumnos-cards > li')];

    expect(cards.map((card) => ({
      label: card.querySelector('dt')?.textContent?.trim(),
      value: card.querySelector('dt + dd')?.textContent?.trim(),
    }))).toEqual(alumnos.slice(0, 5).map((alumno) => ({ label: 'Documento', value: alumno.dniMostrar })));
  });

  it('no modifica QA fuera de desarrollo y expone los enlaces de detalle habilitados', async () => {
    const f = await render(undefined, false);
    f.componentInstance.onForzarEstado('error');
    f.detectChanges();
    expect(f.componentInstance.vistaQA()).toBe('datos');
    const root = f.nativeElement as HTMLElement;

    for (const actions of [
      [...root.querySelectorAll<HTMLElement>('table .detalle-accion')],
      [...root.querySelectorAll<HTMLElement>('ul.alumnos-cards .detalle-accion')],
    ]) {
      expect(actions.length).toBe(5);
      const details = actions.map((action) => action.querySelector<HTMLAnchorElement>('a'));
      expect(details.map((a) => a?.getAttribute('aria-label'))).toEqual(
        alumnos.slice(0, 5).map((alumno) => `Ver detalle de ${alumno.apellido}, ${alumno.nombre}`),
      );
      expect(details.every((a) => a?.getAttribute('href') !== null)).toBeTrue();
      expect(details.every((a, index) => a?.getAttribute('href')?.includes(`/admin/alumnos/${alumnos[index].id}`))).toBeTrue();
    }
  });

  it('descarta una respuesta de carga anterior', async () => {
    const resolvers: Array<(value: readonly Alumno[]) => void> = [];
    const source = stubSource({
      listar: () => new Promise((resolve) => resolvers.push(resolve)),
    });
    const nuevos = [{ ...alumnos[0], nombre: 'Carga nueva' }];
    const viejos = [{ ...alumnos[0], nombre: 'Carga vieja' }];
    const f = await render(source);
    const page = f.componentInstance;
    void page.recargar();

    resolvers[1](nuevos);
    await Promise.resolve();
    expect(page.alumnos()).toEqual(nuevos);
    resolvers[0](viejos);
    await Promise.resolve();
    expect(page.alumnos()).toEqual(nuevos);
  });
});
