import { TestBed } from '@angular/core/testing';
import { STUDENTS_SOURCE, StudentsService } from '../../students.service';
import { StudentsListPage, STUDENTS_QA_ENABLED } from './students-list-page';

const alumnos = Array.from({ length: 7 }, (_, i) => ({ id: i + 1, apellido: 'Ficticia', nombre: `Persona ${i + 1}`, dniMostrar: `${String(i + 11).padStart(2, '0')}****${String(i + 21).padStart(2, '0')}`, tieneEmail: i % 2 === 0, cursosConAsistencia: i, certificacionesValidas: i % 3 }));

describe('StudentsListPage', () => {
  async function render(source: StudentsService = { listar: () => Promise.resolve(alumnos), contar: () => Promise.resolve(alumnos.length) }, qa = true) {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({ imports: [StudentsListPage], providers: [{ provide: STUDENTS_SOURCE, useValue: source }, { provide: STUDENTS_QA_ENABLED, useValue: qa }] }).compileComponents();
    const fixture = TestBed.createComponent(StudentsListPage); fixture.detectChanges(); await Promise.resolve(); fixture.detectChanges(); return fixture;
  }
  it('busca solo por nombre o documento enmascarado, filtra contacto y pagina de a cinco', async () => {
    const f = await render(); const page = f.componentInstance;
    const search = (f.nativeElement as HTMLElement).querySelector<HTMLInputElement>('#buscar-alumno');
    const label = (f.nativeElement as HTMLElement).querySelector<HTMLLabelElement>('label[for="buscar-alumno"]');
    expect(label?.textContent?.trim()).toBe('Buscar por nombre o documento enmascarado');
    expect(search?.placeholder).toBe('Nombre o XX****XX');
    expect(label?.textContent).not.toContain('apellido');
    expect(search?.placeholder).not.toContain('apellido');
    expect(page.itemsVisibles().length).toBe(5);
    page.onSearch({ target: { value: 'Persona 7' } } as unknown as Event); expect(page.resultadosFiltrados().length).toBe(1);
    page.onSearch({ target: { value: alumnos[6].dniMostrar } } as unknown as Event); expect(page.resultadosFiltrados()).toEqual([alumnos[6]]);
    page.onSearch({ target: { value: 'Ficticia' } } as unknown as Event); expect(page.resultadosFiltrados()).toEqual([]);
    page.onLimpiar(); page.onPagina(2); expect(page.itemsVisibles()).toEqual(alumnos.slice(5));
    page.onContacto('sin-email'); expect(page.paginaSegura()).toBe(1); expect(page.resultadosFiltrados().every((a) => !a.tieneEmail)).toBeTrue();
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
    const f = await render(); const page = f.componentInstance;
    page.onSearch({ target: { value: 'Persona' } } as unknown as Event);
    page.onContacto('con-email'); f.detectChanges();
    expect(page.resultadosFiltrados()).toEqual(alumnos.filter((alumno) => alumno.tieneEmail));
    expect((f.nativeElement as HTMLElement).querySelector('button[aria-pressed="true"]')?.textContent).toContain('Contacto disponible');

    for (const query of ['persona@example.test', 'LEG-0007']) {
      page.onSearch({ target: { value: query } } as unknown as Event); f.detectChanges();
      expect(page.resultadosFiltrados()).toEqual([]);
      expect((f.nativeElement as HTMLElement).textContent).toContain('Sin coincidencias');
    }
  });
  it('reinicia y acota la página al buscar, filtrar y navegar', async () => {
    const f = await render(); const page = f.componentInstance;
    page.onPagina(99); expect(page.paginaSegura()).toBe(2);
    page.onContacto('con-email'); expect(page.pagina()).toBe(1);
    page.onPagina(99); expect(page.paginaSegura()).toBe(1);
    page.onSearch({ target: { value: 'Persona' } } as unknown as Event); expect(page.pagina()).toBe(1);
    page.onPagina(-4); expect(page.pagina()).toBe(1);
    page.onLimpiar(); expect(page.pagina()).toBe(1);
  });
  it('presenta carga, error con retry, vacío y sin resultados como estados distintos', async () => {
    let resolve!: (value: readonly typeof alumnos[number][]) => void;
    const pending: StudentsService = { listar: () => new Promise((done) => { resolve = done; }), contar: () => Promise.resolve(0) };
    const loading = await render(pending); const loadingRoot = loading.nativeElement as HTMLElement;
    expect(loadingRoot.querySelector('[aria-busy="true"]')?.textContent).toContain('Cargando');
    expect(loadingRoot.querySelector('[role="alert"]')).toBeNull();
    resolve([]); await loading.whenStable(); loading.detectChanges();
    const emptyStatus = loadingRoot.querySelector('[role="status"], output[aria-live]');
    expect(emptyStatus?.textContent?.trim()).toBe('No hay alumnos cargados para mostrar.');
    expect(loadingRoot.querySelectorAll('[role="status"], output[aria-live]').length).toBe(1);

    let calls = 0;
    const retrying: StudentsService = { listar: () => ++calls === 1 ? Promise.reject(new Error('fallo')) : Promise.resolve(alumnos), contar: () => Promise.resolve(0) };
    const error = await render(retrying); await error.whenStable(); error.detectChanges();
    const errorRoot = error.nativeElement as HTMLElement;
    expect(errorRoot.querySelector('[role="alert"]')?.textContent).toContain('Reintentar');
    (errorRoot.querySelector('[role="alert"] button') as HTMLButtonElement).click();
    await error.whenStable(); error.detectChanges();
    expect(errorRoot.querySelector('[role="alert"]')).toBeNull();
    expect(errorRoot.querySelectorAll('tbody tr').length).toBe(5);

    error.componentInstance.onSearch({ target: { value: 'nadie' } } as unknown as Event); error.detectChanges();
    const noResultsStatus = errorRoot.querySelector('[role="status"], output[aria-live]');
    expect(noResultsStatus?.textContent?.trim()).toBe('Sin coincidencias: no hay alumnos para los filtros aplicados.');
    expect(errorRoot.querySelectorAll('[role="status"], output[aria-live]').length).toBe(1);
    expect(errorRoot.textContent).not.toContain('No hay alumnos cargados para mostrar');
  });
  it('renderiza tabla desktop, tarjetas mobile y un único resumen live', async () => {
    const f = await render(); const root = f.nativeElement as HTMLElement;
    expect(root.querySelector('table caption')?.textContent).toBe('Alumnos');
    expect(root.querySelectorAll('table th[scope="col"]').length).toBe(6);
    expect(root.querySelectorAll('tbody tr').length).toBe(5);
    expect(root.querySelectorAll('ul.alumnos-cards > li').length).toBe(5);
    expect(root.querySelectorAll('output[aria-live="polite"][aria-atomic="true"]').length).toBe(1);
    expect(root.querySelectorAll('[role="status"], output[aria-live]').length).toBe(1);
  });
  it('asocia Documento con el valor enmascarado en cada tarjeta mobile', async () => {
    const f = await render();
    const cards = [...(f.nativeElement as HTMLElement).querySelectorAll<HTMLLIElement>('ul.alumnos-cards > li')];

    expect(cards.map((card) => ({
      label: card.querySelector('dt')?.textContent?.trim(),
      value: card.querySelector('dt + dd')?.textContent?.trim(),
    }))).toEqual(alumnos.slice(0, 5).map((alumno) => ({ label: 'Documento', value: alumno.dniMostrar })));
  });
  it('no modifica QA fuera de desarrollo y mantiene el detalle deshabilitado', async () => {
    const f = await render(undefined, false); f.componentInstance.onForzarEstado('error'); f.detectChanges();
    expect(f.componentInstance.vistaQA()).toBe('datos');
    const root = f.nativeElement as HTMLElement;

    for (const actions of [
      [...root.querySelectorAll<HTMLElement>('table .detalle-accion')],
      [...root.querySelectorAll<HTMLElement>('ul.alumnos-cards .detalle-accion')],
    ]) {
      expect(actions.length).toBe(5);
      expect(actions.map((action) => action.querySelector('.detalle-motivo')?.textContent?.trim()))
        .toEqual(Array(5).fill('Detalle disponible en F5-03'));
      const details = actions.map((action) => action.querySelector<HTMLButtonElement>('button'));
      expect(details.map((button) => button?.getAttribute('aria-label'))).toEqual(
        alumnos.slice(0, 5).map((alumno) => `Ver detalle de ${alumno.apellido}, ${alumno.nombre}`),
      );
      expect(details.every((button) => button?.disabled && button.getAttribute('aria-disabled') === 'true')).toBeTrue();
      expect(actions.every((action, index) =>
        details[index]?.getAttribute('aria-describedby') === action.querySelector('.detalle-motivo')?.id,
      )).toBeTrue();
      expect(details.every((button) => !button?.hasAttribute('title'))).toBeTrue();
    }
  });
  it('descarta una respuesta de carga anterior', async () => {
    const resolvers: Array<(value: readonly typeof alumnos[number][]) => void> = [];
    const source: StudentsService = {
      listar: () => new Promise((resolve) => resolvers.push(resolve)),
      contar: () => Promise.resolve(0),
    };
    const nuevos = [{ ...alumnos[0], nombre: 'Carga nueva' }];
    const viejos = [{ ...alumnos[0], nombre: 'Carga vieja' }];
    const f = await render(source); const page = f.componentInstance;
    void page.recargar();

    resolvers[1](nuevos); await Promise.resolve();
    expect(page.alumnos()).toEqual(nuevos);
    resolvers[0](viejos); await Promise.resolve();
    expect(page.alumnos()).toEqual(nuevos);
  });
});
