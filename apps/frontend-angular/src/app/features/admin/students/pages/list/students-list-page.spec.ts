import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Alumno, STUDENTS_PAGE_SIZE } from '../../students.models';
import { STUDENTS_SOURCE, StudentsService } from '../../students.service';
import { StudentsListPage, STUDENTS_QA_ENABLED } from './students-list-page';

const alumnos: Alumno[] = Array.from({ length: 7 }, (_, i) => ({
  id: i + 1,
  apellido: 'Ficticia',
  nombre: `Persona ${i + 1}`,
  dniMostrar: String(20_111_111 + i),
  estado: 'activo' as const,
  email: i % 2 === 0 ? `persona.${i + 1}@example.invalid` : null,
  tieneEmail: i % 2 === 0,
  cursosConAsistencia: i,
  certificacionesValidas: i % 3,
  certificacionesRevocadas: 0,
}));

/** Fixture > page size para ejercitar página 2. */
const alumnosMuchos: Alumno[] = Array.from({ length: STUDENTS_PAGE_SIZE + 5 }, (_, i) => ({
  id: i + 1,
  apellido: 'Ficticia',
  nombre: `Persona ${i + 1}`,
  dniMostrar: String(20_111_111 + i),
  estado: 'activo' as const,
  email: i % 2 === 0 ? `persona.${i + 1}@example.invalid` : null,
  tieneEmail: i % 2 === 0,
  cursosConAsistencia: i % 4,
  certificacionesValidas: i % 3,
  certificacionesRevocadas: 0,
}));

function stubSource(
  source: Partial<StudentsService> & Pick<StudentsService, 'listar'>,
): StudentsService {
  return {
    contar: () => Promise.resolve(0),
    obtener: () => Promise.resolve(null),
    crear: () => Promise.reject(new Error('not used')),
    actualizar: () => Promise.reject(new Error('not used')),
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
    // Honesto: sin legajo inventado (API no lo expone).
    expect(root.textContent).not.toContain('LEG-');
    expect(root.querySelector('th')?.textContent).not.toContain('Legajo');
    expect(root.querySelector('.intro')?.textContent?.toLowerCase()).not.toMatch(/legajos?/);
  });

  it('intro y vacío total omiten legajo/legajos', async () => {
    const f = await render(stubSource({ listar: () => Promise.resolve([]) }));
    await f.whenStable();
    f.detectChanges();
    const root = f.nativeElement as HTMLElement;
    const intro = root.querySelector('.intro')?.textContent ?? '';
    const vacio = root.querySelector('[data-state="empty-total"]')?.textContent ?? '';
    expect(intro.toLowerCase()).not.toMatch(/legajos?/);
    expect(vacio.toLowerCase()).not.toMatch(/legajos?/);
    expect(intro).toContain('Registro de estudiantes');
    expect(vacio).toContain('su ficha');
  });

  it('busca por nombre, apellido o documento; filtra chips v0 y pagina de a veinte', async () => {
    const f = await render(
      stubSource({
        listar: () => Promise.resolve(alumnosMuchos),
        contar: () => Promise.resolve(alumnosMuchos.length),
      }),
    );
    const page = f.componentInstance;
    const search = (f.nativeElement as HTMLElement).querySelector<HTMLInputElement>('#buscar-alumno');
    const label = (f.nativeElement as HTMLElement).querySelector<HTMLLabelElement>('label[for="buscar-alumno"]');
    expect(label?.textContent?.trim()).toBe('Buscar alumno');
    expect(search?.placeholder).toContain('Nombre, apellido o documento');
    expect(page.itemsVisibles().length).toBe(STUDENTS_PAGE_SIZE);

    page.onSearch({ target: { value: 'Persona 7' } } as unknown as Event);
    expect(page.resultadosFiltrados().length).toBe(1);

    page.onSearch({ target: { value: alumnosMuchos[6].dniMostrar } } as unknown as Event);
    expect(page.resultadosFiltrados()).toEqual([alumnosMuchos[6]]);

    // Apellido (paridad v0): todos comparten "Ficticia".
    page.onSearch({ target: { value: 'Ficticia' } } as unknown as Event);
    expect(page.resultadosFiltrados().length).toBe(alumnosMuchos.length);

    page.onLimpiar();
    page.onPagina(2);
    expect(page.itemsVisibles()).toEqual(alumnosMuchos.slice(STUDENTS_PAGE_SIZE));
    page.onContacto('sin-email');
    expect(page.paginaSegura()).toBe(1);
    expect(page.resultadosFiltrados().every((a) => a.tieneEmail === false)).toBeTrue();
  });

  it('chips v0: Con/Sin certificaciones y Sin email (sin Contacto disponible)', async () => {
    const f = await render();
    const chips = Array.from(
      (f.nativeElement as HTMLElement).querySelectorAll('.chips .chip'),
    ).map((n) => n.textContent?.replace(/\s+/g, ' ').trim());
    expect(chips).toEqual(['Con certificaciones', 'Sin certificaciones', 'Sin email']);
    expect(chips.join(' ')).not.toContain('Contacto disponible');
    expect(chips.join(' ')).not.toContain('Con email');
  });

  it('badges de contacto sin email literal; métricas 0 visibles y null como guión', async () => {
    const mixed: Alumno[] = [
      {
        ...alumnos[0],
        id: 1,
        email: 'persona.visible@example.invalid',
        tieneEmail: true,
        cursosConAsistencia: 0,
        certificacionesValidas: 0,
        certificacionesRevocadas: 0,
      },
      {
        ...alumnos[1],
        id: 2,
        email: null,
        tieneEmail: false,
        cursosConAsistencia: null,
        certificacionesValidas: null,
        certificacionesRevocadas: null,
      },
      {
        ...alumnos[2],
        id: 3,
        email: null,
        tieneEmail: null,
        cursosConAsistencia: 2,
        certificacionesValidas: 1,
        certificacionesRevocadas: 0,
      },
    ];
    const f = await render(stubSource({ listar: () => Promise.resolve(mixed) }));
    const page = f.componentInstance;
    const root = f.nativeElement as HTMLElement;
    expect(page.formatoMetrica(0)).toBe('0');
    expect(page.formatoMetrica(null)).toBe('—');
    expect(page.etiquetaContacto(mixed[0])).toBe('Contacto disponible');
    expect(page.etiquetaContacto(mixed[1])).toBe('Sin email');
    expect(page.etiquetaContacto(mixed[2])).toBe('Sin dato');
    f.detectChanges();
    const badges = [...root.querySelectorAll('table .contacto-badge')].map((el) =>
      el.textContent?.replace(/\s+/g, ' ').trim(),
    );
    expect(badges).toEqual(['Contacto disponible', 'Sin email', 'Sin dato']);
    expect(root.textContent).not.toContain('persona.visible@example.invalid');
    expect(root.textContent).not.toContain('Con email');

    const rows = [...root.querySelectorAll('tbody tr')];
    expect(rows).toHaveSize(3);
    const cellText = (row: Element, index: number) =>
      row.querySelectorAll('td')[index]?.textContent?.replace(/\s+/g, ' ').trim() ?? '';
    // Columnas: Alumno, Documento, Contacto, Cursos, Cert. válidas, Acciones
    expect(cellText(rows[0], 1)).toBe(mixed[0].dniMostrar);
    expect(cellText(rows[0], 3)).toBe('0');
    expect(cellText(rows[0], 4)).toBe('0');
    expect(cellText(rows[1], 1)).toBe(mixed[1].dniMostrar);
    expect(cellText(rows[1], 3)).toBe('—');
    expect(cellText(rows[1], 4)).toBe('—');
    expect(cellText(rows[2], 1)).toBe(mixed[2].dniMostrar);
  });

  it('filtra Con/Sin certificaciones tratando 0 como sin cert y excluyendo null', async () => {
    const mixed: Alumno[] = [
      { ...alumnos[0], id: 1, certificacionesValidas: 2 },
      { ...alumnos[1], id: 2, certificacionesValidas: 0 },
      { ...alumnos[2], id: 3, certificacionesValidas: null },
    ];
    const f = await render(stubSource({ listar: () => Promise.resolve(mixed) }));
    const page = f.componentInstance;

    page.onCertificacion('con-cert');
    expect(page.resultadosFiltrados().map((a) => a.id)).toEqual([1]);

    page.onCertificacion('sin-cert');
    expect(page.resultadosFiltrados().map((a) => a.id)).toEqual([2]);
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
    expect(page.itemsVisibles()).toEqual(alumnos);
  });

  it('combina búsqueda y Sin email; no encuentra email ni legajo inventados', async () => {
    const f = await render();
    const page = f.componentInstance;
    page.onSearch({ target: { value: 'Persona' } } as unknown as Event);
    page.onContacto('sin-email');
    f.detectChanges();
    expect(page.resultadosFiltrados().every((a) => a.tieneEmail === false)).toBeTrue();
    expect(
      (f.nativeElement as HTMLElement).querySelector('button[aria-pressed="true"]')?.textContent,
    ).toContain('Sin email');

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
      { ...alumnos[2], id: 3, tieneEmail: null, cursosConAsistencia: null, certificacionesValidas: null, certificacionesRevocadas: null },
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
    const f = await render(
      stubSource({
        listar: () => Promise.resolve(alumnosMuchos),
        contar: () => Promise.resolve(alumnosMuchos.length),
      }),
    );
    const page = f.componentInstance;
    page.onPagina(99);
    expect(page.paginaSegura()).toBe(2);
    page.onContacto('sin-email');
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

  it('presenta carga skeleton, error, vacío y sin resultados como estados v0', async () => {
    let resolve!: (value: readonly Alumno[]) => void;
    const pending = stubSource({
      listar: () => new Promise((done) => { resolve = done; }),
    });
    const loading = await render(pending);
    const loadingRoot = loading.nativeElement as HTMLElement;
    expect(loadingRoot.querySelector('.tabla-skeleton[aria-busy="true"]')).not.toBeNull();
    expect(loadingRoot.querySelector('[role="alert"]')).toBeNull();
    resolve([]);
    await loading.whenStable();
    loading.detectChanges();
    expect(loadingRoot.querySelector('[data-state="empty-total"] .estado-title')?.textContent).toContain(
      'Todavía no hay alumnos cargados',
    );
    expect(loadingRoot.querySelector('[data-state="empty-total"] a')?.getAttribute('href')).toContain(
      '/admin/alumnos/nuevo',
    );
    expect(loadingRoot.querySelector('[data-state="empty-total"]')?.textContent).toContain(
      'Registrar primer alumno',
    );

    let calls = 0;
    const retrying = stubSource({
      listar: () => (++calls === 1 ? Promise.reject(new Error('fallo')) : Promise.resolve(alumnos)),
    });
    const error = await render(retrying);
    await error.whenStable();
    error.detectChanges();
    const errorRoot = error.nativeElement as HTMLElement;
    expect(errorRoot.querySelector('[role="alert"] .estado-title')?.textContent).toContain(
      'No pudimos cargar el registro',
    );
    expect(errorRoot.querySelector('[role="alert"]')?.textContent).toContain('Reintentar');
    (errorRoot.querySelector('[role="alert"] button') as HTMLButtonElement).click();
    await error.whenStable();
    error.detectChanges();
    expect(errorRoot.querySelector('[role="alert"]')).toBeNull();
    expect(errorRoot.querySelectorAll('tbody tr').length).toBe(alumnos.length);

    error.componentInstance.onSearch({ target: { value: 'nadie' } } as unknown as Event);
    error.detectChanges();
    expect(errorRoot.querySelector('[data-state="no-results"] .estado-title')?.textContent).toContain(
      'Sin coincidencias',
    );
    expect(errorRoot.textContent).not.toContain('Todavía no hay alumnos cargados');
  });

  it('Vista QA humanizada y skeleton/vacío/error forzables', async () => {
    const f = await render();
    const el = f.nativeElement as HTMLElement;
    const page = f.componentInstance;
    expect(el.querySelector('.vista-qa')).not.toBeNull();
    expect(el.textContent).toContain('Con datos');
    expect(el.textContent).toContain('Sin registros');

    page.onForzarEstado('cargando');
    f.detectChanges();
    expect(el.querySelector('.tabla-skeleton')).not.toBeNull();

    page.onForzarEstado('vacio-total');
    f.detectChanges();
    expect(el.querySelector('[data-state="empty-total"]')).not.toBeNull();

    page.onForzarEstado('error');
    f.detectChanges();
    expect(el.querySelector('[role="alert"]')).not.toBeNull();
  });

  it('renderiza tabla desktop, tarjetas mobile, caption sr-only y pager numerado', async () => {
    const f = await render();
    const root = f.nativeElement as HTMLElement;
    const heading = root.querySelector('h1#students-title');
    expect(heading).not.toBeNull();
    expect(heading?.textContent?.trim()).toBe('Alumnos');
    const caption = root.querySelector('table caption');
    expect(caption?.classList.contains('sr-only')).toBeTrue();
    expect(caption?.textContent?.trim()).toContain('Registro de alumnos');
    expect(root.querySelectorAll('table th[scope="col"]').length).toBe(6);
    expect(root.querySelectorAll('tbody tr').length).toBe(alumnos.length);
    expect(root.querySelectorAll('ul.alumnos-cards > li').length).toBe(alumnos.length);
    expect(root.querySelector('.results-summary')?.textContent).toContain('en el registro');
    expect(root.querySelector('.pager-num[aria-current="page"]')?.textContent?.trim()).toBe('1');
  });

  it('asocia Documento con el DNI completo en cada tarjeta mobile', async () => {
    const f = await render();
    const cards = [...(f.nativeElement as HTMLElement).querySelectorAll<HTMLLIElement>('ul.alumnos-cards > li')];

    expect(cards.map((card) => ({
      label: card.querySelector('dt')?.textContent?.trim(),
      value: card.querySelector('dt + dd')?.textContent?.trim(),
    }))).toEqual(alumnos.map((alumno) => ({ label: 'Documento', value: alumno.dniMostrar })));
  });

  it('no modifica QA fuera de desarrollo y expone los enlaces de detalle habilitados', async () => {
    const f = await render(undefined, false);
    f.componentInstance.onForzarEstado('error');
    f.detectChanges();
    expect(f.componentInstance.vistaQA()).toBe('datos');
    const root = f.nativeElement as HTMLElement;
    expect(root.querySelector('.vista-qa')).toBeNull();

    for (const actions of [
      [...root.querySelectorAll<HTMLElement>('table .detalle-accion')],
      [...root.querySelectorAll<HTMLElement>('ul.alumnos-cards .detalle-accion')],
    ]) {
      expect(actions.length).toBe(alumnos.length);
      const details = actions.map((action) => action.querySelector<HTMLAnchorElement>('a'));
      expect(details.map((a) => a?.getAttribute('aria-label'))).toEqual(
        alumnos.map((alumno) => `Ver detalle de ${alumno.apellido}, ${alumno.nombre}`),
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
