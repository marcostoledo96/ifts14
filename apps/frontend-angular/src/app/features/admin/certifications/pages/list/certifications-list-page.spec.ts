import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { CertificationsListPage } from './certifications-list-page';
import { CERTIFICATIONS_SOURCE } from '../../certifications.service';
import { InMemoryCertificationsService } from '../../in-memory-certifications.service';
import { Certificacion, CertificacionesFiltros } from '../../certifications.models';
import { CertificationsService } from '../../certifications.service';

describe('CertificationsListPage', () => {
  async function render() {
    await TestBed.configureTestingModule({
      imports: [CertificationsListPage],
      providers: [
        provideRouter([]),
        { provide: CERTIFICATIONS_SOURCE, useClass: InMemoryCertificationsService },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(CertificationsListPage);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    return fixture;
  }

  it('muestra título Certificaciones y banner demo', async () => {
    const f = await render();
    const el = f.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Certificaciones');
    expect(el.textContent).toContain('Datos de demostración');
  });

  it('expone input type=search', async () => {
    const f = await render();
    const el = f.nativeElement as HTMLElement;
    expect(el.querySelector('input[type="search"]')).not.toBeNull();
  });

  it('expone chips de validez y entrega accesibles', async () => {
    const f = await render();
    const el = f.nativeElement as HTMLElement;
    expect(el.querySelectorAll('button[aria-pressed]').length).toBeGreaterThanOrEqual(11);
    expect(el.textContent).toContain('Estado de validez');
    expect(el.textContent).toContain('Estado de entrega');
  });

  it('expone selector de curso independiente basado en el seed seguro', async () => {
    const f = await render();
    const el = f.nativeElement as HTMLElement;
    const select = el.querySelector('select[aria-label="Filtrar por curso"]') as HTMLSelectElement;

    expect(select).not.toBeNull();
    expect(Array.from(select.options).map((option) => option.text)).toContain(
      'Curso de introducción a la gestión',
    );
  });

  it('renderiza tabla desktop y cards mobile equivalentes', async () => {
    const f = await render();
    const el = f.nativeElement as HTMLElement;
    expect(el.querySelector('table caption')).not.toBeNull();
    expect(el.querySelectorAll('th[scope="col"]').length).toBe(7);
    expect(el.querySelectorAll('.cards-mobile article').length).toBe(5);
    expect(el.querySelector('.cards-mobile dl')).not.toBeNull();
  });

  it('empty state usa output aria-live=polite cuando no hay matches', async () => {
    const f = await render();
    const el = f.nativeElement as HTMLElement;
    const input = el.querySelector('input[type="search"]') as HTMLInputElement;
    input.value = 'zzzz-no-existe';
    input.dispatchEvent(new Event('input'));
    f.detectChanges();
    await f.whenStable();
    f.detectChanges();
    const output = el.querySelector('[data-state="no-results"]');
    expect(output).not.toBeNull();
    expect(output?.textContent).toContain('No hay');
  });

  it('enlaces conservan rutas existentes de detalle y PDF', async () => {
    const f = await render();
    const el = f.nativeElement as HTMLElement;
    const link = el.querySelector('table a[href*="/admin/certificaciones/"]') as HTMLAnchorElement | null;
    expect(link).not.toBeNull();
    expect(link?.getAttribute('href')).toContain('/admin/certificaciones/');
    expect(el.querySelector('a[href$="/pdf"]')).not.toBeNull();
  });

  it('no expone token completo ni DNI completo en el listado', async () => {
    const f = await render();
    const el = f.nativeElement as HTMLElement;
    expect(el.textContent).not.toMatch(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
    // documentMasked cumple XX****XX: no hay DNI completo de 7-8 dígitos.
    expect(el.textContent).not.toMatch(/\b\d{7,8}\b/);
  });

  it('filtra por validez, entrega y búsqueda de forma combinada y limpia filtros', async () => {
    const f = await render();
    const el = f.nativeElement as HTMLElement;
    const buttons = Array.from(el.querySelectorAll<HTMLButtonElement>('button'));
    buttons.find((button) => button.textContent?.includes('vigente'))?.click();
    buttons.find((button) => button.textContent?.includes('Entregado'))?.click();
    f.detectChanges();
    await f.whenStable();
    f.detectChanges();
    expect(el.textContent).toContain('Limpiar filtros');
    expect(el.querySelector('button[aria-pressed="true"]')).not.toBeNull();
  });

  it('combina curso, validez, entrega y búsqueda; conserva el texto y reinicia la página', async () => {
    const f = await render();
    const page = f.componentInstance;
    const el = f.nativeElement as HTMLElement;
    page.onPagina(2);
    const select = el.querySelector('select[aria-label="Filtrar por curso"]') as HTMLSelectElement;
    select.value = 'Curso de introducción a la gestión';
    select.dispatchEvent(new Event('change'));
    const buttons = Array.from(el.querySelectorAll<HTMLButtonElement>('button'));
    buttons.find((button) => button.textContent?.includes('vigente'))?.click();
    buttons.find((button) => button.textContent?.includes('Entregado'))?.click();
    const input = el.querySelector('input[type="search"]') as HTMLInputElement;
    input.value = 'Uno';
    input.dispatchEvent(new Event('input'));
    f.detectChanges();

    expect(page.q()).toBe('Uno');
    expect(page.pagina()).toBe(1);
    expect(page.resultadosFiltrados().map((c) => c.id)).toEqual([1]);
  });

  it('filtrar por texto reduce la lista', async () => {
    const f = await render();
    const el = f.nativeElement as HTMLElement;
    const input = el.querySelector('input[type="search"]') as HTMLInputElement;
    input.value = 'Uno';
    input.dispatchEvent(new Event('input'));
    f.detectChanges();
    await f.whenStable();
    f.detectChanges();
    expect(el.querySelectorAll('.cards-mobile article').length).toBe(1);
    expect(el.querySelector('.results-summary p')?.textContent?.trim()).toBe(
      'Total: 6 · Coincidencias: 1 · Visibles: 1',
    );
  });

  it('pagina de a cinco y vuelve a la primera página al cambiar filtros', async () => {
    const f = await render();
    const el = f.nativeElement as HTMLElement;
    const next = el.querySelector('nav[aria-label="Paginación"] button[aria-label="Página siguiente"]') as HTMLButtonElement;
    next.click();
    f.detectChanges();
    expect(el.querySelector('[aria-current="page"]')?.textContent).toContain('2');
    const input = el.querySelector('input[type="search"]') as HTMLInputElement;
    input.value = 'Uno';
    input.dispatchEvent(new Event('input'));
    await f.whenStable();
    f.detectChanges();
    expect(el.querySelector('[aria-current="page"]')?.textContent).toContain('1');
  });

  it('distingue carga, error y vacío total desde el harness QA', async () => {
    const f = await render();
    const el = f.nativeElement as HTMLElement;
    const buttons = Array.from(el.querySelectorAll<HTMLButtonElement>('.vista-qa button'));
    buttons.find((button) => button.textContent?.includes('Cargando'))?.click();
    f.detectChanges();
    expect(el.querySelector('output[aria-busy="true"] li:nth-child(5)')).not.toBeNull();
    buttons.find((button) => button.textContent?.includes('Error'))?.click();
    f.detectChanges();
    expect(el.querySelector('[role="alert"] button')?.textContent).toContain('Reintentar');
    buttons.find((button) => button.textContent?.includes('Sin registros'))?.click();
    f.detectChanges();
    expect(el.querySelector('[data-state="empty-total"]')).not.toBeNull();
  });

  it('descarta una respuesta stale al recargar dos veces', async () => {
    let resolveFirst!: (value: readonly Certificacion[]) => void;
    let resolveSecond!: (value: readonly Certificacion[]) => void;
    let calls = 0;
    const delayed: CertificationsService = {
      listar: (_filters?: CertificacionesFiltros) =>
        new Promise<readonly Certificacion[]>((resolve) => {
          calls += 1;
          if (calls === 1) resolveFirst = resolve;
          else resolveSecond = resolve;
        }),
      obtener: () => Promise.reject(new Error('N/A')),
      contar: () => Promise.resolve(0),
    };
    await TestBed.configureTestingModule({
      imports: [CertificationsListPage],
      providers: [provideRouter([]), { provide: CERTIFICATIONS_SOURCE, useValue: delayed }],
    }).compileComponents();
    const fixture = TestBed.createComponent(CertificationsListPage);
    fixture.detectChanges();
    const page = fixture.componentInstance;
    void page.recargar();
    resolveSecond([{ id: 2, numero: 'IFTS14-CERT-0002', nombreAlumno: 'Alumno Demo Dos', cursoNombre: 'Curso', estado: 'vigente', envio: 'entregado', documentMasked: '34****56', tokenPrefix: 'prefijo_demo_c2d', emitidoEn: null, venceEn: null }]);
    await fixture.whenStable();
    resolveFirst([{ id: 1, numero: 'IFTS14-CERT-0001', nombreAlumno: 'Alumno Demo Uno', cursoNombre: 'Curso', estado: 'vigente', envio: 'entregado', documentMasked: '12****34', tokenPrefix: 'prefijo_demo_a1b', emitidoEn: null, venceEn: null }]);
    await fixture.whenStable();
    expect(page.certificados()[0].id).toBe(2);
  });

  it('no llama fetch', async () => {
    const fetchSpy = spyOn(window, 'fetch').and.callThrough();
    await render();
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
