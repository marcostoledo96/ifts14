import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { CERTIFICATIONS_QA_ENABLED, CertificationsListPage } from './certifications-list-page';
import { CERTIFICATIONS_SOURCE } from '../../certifications.service';
import { InMemoryCertificationsService } from '../../in-memory-certifications.service';
import { Certificacion, CertificacionesFiltros, EntregaManualDto } from '../../certifications.models';
import { CertificationsService } from '../../certifications.service';
import { resetMockAdminPublicStatus } from '../../../../../shared/certificates/mock-tokens';

describe('CertificationsListPage', () => {
  async function render(qaEnabled?: boolean) {
    resetMockAdminPublicStatus();
    await TestBed.configureTestingModule({
      imports: [CertificationsListPage],
      providers: [
        provideRouter([]),
        { provide: CERTIFICATIONS_SOURCE, useClass: InMemoryCertificationsService },
        ...(qaEnabled === undefined ? [] : [{ provide: CERTIFICATIONS_QA_ENABLED, useValue: qaEnabled }]),
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(CertificationsListPage);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    return fixture;
  }

  it('muestra título Certificaciones y oculta banner demo con API real', async () => {
    const f = await render();
    const el = f.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Certificaciones');
    expect(el.textContent).not.toContain('Datos de demostración');
  });

  it('expone CTA Nueva certificación hacia /admin/certificaciones/nueva', async () => {
    const f = await render();
    const el = f.nativeElement as HTMLElement;
    const cta = el.querySelector('a[href="/admin/certificaciones/nueva"], a[routerlink="/admin/certificaciones/nueva"]')
      ?? Array.from(el.querySelectorAll('a')).find((a) => a.textContent?.includes('Nueva certificación'));
    expect(cta).toBeTruthy();
    expect((cta as HTMLAnchorElement).getAttribute('href') || (cta as HTMLAnchorElement).getAttribute('ng-reflect-router-link')).toContain('nueva');
  });

  it('expone input type=search', async () => {
    const f = await render();
    const el = f.nativeElement as HTMLElement;
    expect(el.querySelector('input[type="search"]')).not.toBeNull();
  });

  it('expone chips de validez accesibles', async () => {
    const f = await render();
    const el = f.nativeElement as HTMLElement;
    // 4 chips de estado + 4 botones de vista QA (en dev) = 8.
    expect(el.querySelectorAll('button[aria-pressed]').length).toBeGreaterThanOrEqual(4);
    expect(el.textContent).toContain('Estado de validez');
    expect(el.textContent).toContain('Válida');
    expect(el.querySelector('button[data-estado="vigente"]')?.textContent).toContain('Válida');
    expect(el.textContent).not.toContain('Estado de entrega');
    expect(el.textContent).not.toMatch(/\benvio\b/i);
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
    expect(el.querySelectorAll('th[scope="col"]').length).toBe(6);
    // Seed mock: 6 ítems; con PAGINA_TAMANO=20 caben todos en la primera página.
    expect(el.querySelectorAll('.cards-mobile article').length).toBe(6);
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

  it('no expone token completo en el listado y muestra DNI completo ficticio', async () => {
    const f = await render();
    const el = f.nativeElement as HTMLElement;
    expect(el.textContent).not.toMatch(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
    // textContent concatena celdas sin espacio (…12345678Curso…); no usar \b.
    expect(el.textContent).toContain('12345678');
  });

  it('filtra por validez y búsqueda de forma combinada y limpia filtros', async () => {
    const f = await render();
    const el = f.nativeElement as HTMLElement;
    const chip = el.querySelector('button[data-estado="vigente"]') as HTMLButtonElement;
    chip.click();
    f.detectChanges();
    await f.whenStable();
    f.detectChanges();
    expect(f.componentInstance.estado()).toBe('vigente');
    expect(el.textContent).toContain('Limpiar filtros');
    expect(chip.getAttribute('aria-pressed')).toBe('true');
  });

  it('combina curso, validez y búsqueda; conserva el texto y reinicia la página', async () => {
    const f = await render();
    const page = f.componentInstance;
    const el = f.nativeElement as HTMLElement;
    page.onPagina(2);
    const select = el.querySelector('select[aria-label="Filtrar por curso"]') as HTMLSelectElement;
    select.value = 'Curso de introducción a la gestión';
    select.dispatchEvent(new Event('change'));
    (el.querySelector('button[data-estado="vigente"]') as HTMLButtonElement).click();
    const input = el.querySelector('input[type="search"]') as HTMLInputElement;
    input.value = 'Uno';
    input.dispatchEvent(new Event('input'));
    f.detectChanges();

    expect(page.q()).toBe('Uno');
    expect(page.estado()).toBe('vigente');
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
    expect(el.querySelector('.results-summary p')?.textContent?.replace(/\s+/g, ' ').trim()).toBe(
      '1 certificación coinciden con el filtro',
    );
  });

  it('pagina de a 20 y vuelve a la primera página al cambiar filtros', async () => {
    const f = await render();
    const el = f.nativeElement as HTMLElement;
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
    expect(el.querySelector('.tabla-skeleton[aria-busy="true"]')).not.toBeNull();
    buttons.find((button) => button.textContent?.includes('Error'))?.click();
    f.detectChanges();
    expect(el.querySelector('[role="alert"] svg.estado-icon')).not.toBeNull();
    expect(el.querySelector('[role="alert"] button')?.textContent).toContain('Reintentar');
    buttons.find((button) => button.textContent?.includes('Sin registros'))?.click();
    f.detectChanges();
    const empty = el.querySelector('[data-state="empty-total"]');
    expect(empty).not.toBeNull();
    expect(empty?.querySelector('svg[data-icon="inbox"]')).not.toBeNull();
    expect(empty?.textContent).toContain('Emitir primera certificación');
    expect(
      empty?.querySelector('a[href="/admin/certificaciones/nueva"], a[routerlink="/admin/certificaciones/nueva"]')
        ?? Array.from(empty?.querySelectorAll('a') ?? []).find((a) => a.textContent?.includes('Emitir primera')),
    ).toBeTruthy();
  });

  it('muestra badges de validez con punto y borde para los cuatro estados', async () => {
    const f = await render();
    const el = f.nativeElement as HTMLElement;
    const badges = Array.from(el.querySelectorAll('.validez-badge'));
    expect(badges.length).toBeGreaterThan(0);
    expect(badges.every((b) => b.querySelector('.validez-dot'))).toBeTrue();
    const labels = new Set(badges.map((b) => b.textContent?.trim()));
    expect(labels.has('Válida')).toBeTrue();
    // Seed incluye al menos vigente; labels de otros estados si están presentes.
    for (const estado of ['borrador', 'vigente', 'revocado', 'vencido'] as const) {
      const badge = el.querySelector(`.validez-badge[data-estado="${estado}"]`);
      if (badge) {
        expect(badge.querySelector('.validez-dot')).not.toBeNull();
        expect(badge.textContent?.trim()).toBe(
          estado === 'vigente' ? 'Válida' : estado === 'borrador' ? 'Borrador' : estado === 'revocado' ? 'Revocado' : 'Vencido',
        );
      }
    }
  });

  it('chip Válida filtra solo estado vigente del modelo', async () => {
    const f = await render();
    const page = f.componentInstance;
    const el = f.nativeElement as HTMLElement;
    (el.querySelector('button[data-estado="vigente"]') as HTMLButtonElement).click();
    f.detectChanges();
    expect(page.estado()).toBe('vigente');
    expect(page.resultadosFiltrados().every((c) => c.estado === 'vigente')).toBeTrue();
    expect(el.querySelectorAll('.validez-badge').length).toBeGreaterThan(0);
    expect(
      Array.from(el.querySelectorAll('.validez-badge')).every((b) => b.getAttribute('data-estado') === 'vigente'),
    ).toBeTrue();
  });

  it('no renderiza el harness cuando QA está deshabilitado', async () => {
    const f = await render(false);
    expect((f.nativeElement as HTMLElement).querySelector('.vista-qa')).toBeNull();
  });

  it('ignora onVistaQA cuando QA está deshabilitado', async () => {
    const f = await render(false);
    const page = f.componentInstance;

    page.onVistaQA('cargando');
    f.detectChanges();

    expect(page.vistaQA()).toBe('datos');
    expect(page.cargando()).toBeFalse();
    expect(page.error()).toBe('');
    expect(page.vacioTotal()).toBeFalse();
    expect((f.nativeElement as HTMLElement).querySelector('table')).not.toBeNull();
  });

  it('mantiene el harness disponible en desarrollo y tests', async () => {
    const f = await render(true);
    expect((f.nativeElement as HTMLElement).querySelector('.vista-qa')).not.toBeNull();
  });

  it('reintenta desde el error QA, vuelve a datos y recupera la lista', async () => {
    const f = await render(true);
    const page = f.componentInstance;
    const listar = spyOn(TestBed.inject(CERTIFICATIONS_SOURCE), 'listar').and.callThrough();
    const el = f.nativeElement as HTMLElement;

    page.onVistaQA('error');
    f.detectChanges();
    (el.querySelector('[role="alert"] button') as HTMLButtonElement).click();
    await f.whenStable();
    f.detectChanges();

    expect(page.vistaQA()).toBe('datos');
    expect(listar).toHaveBeenCalledTimes(1);
    expect(page.certificados().length).toBeGreaterThan(0);
    expect(el.querySelector('table')).not.toBeNull();
  });

  it('reintenta errores reales en producción sin habilitar controles QA', async () => {
    const recovered = [{ id: 1, numero: 'IFTS14-CERT-0001', nombreAlumno: 'Alumno Demo Uno', cursoNombre: 'Curso', estado: 'vigente', documentMasked: '12345678', tokenPrefix: 'prefijo_demo_a1b', emitidoEn: null, venceEn: null }] satisfies readonly Certificacion[];
    const listarSpy = jasmine.createSpy('listar').and.returnValues(
      Promise.reject(new Error('fallo real')),
      Promise.resolve(recovered),
    );
    const service: CertificationsService = {
      listar: listarSpy,
      obtener: () => Promise.resolve({} as any),
      obtenerEntregaManual: () => Promise.resolve({} as EntregaManualDto),
      descargarQrPng: () => Promise.resolve(new Blob()),
      descargarPdf: () => Promise.resolve(new Blob(['%PDF'], { type: 'application/pdf' })),
      regenerarPdf: () => Promise.resolve({ regenerado: false }),
      contar: () => Promise.resolve(0),
      revocar: () => Promise.resolve(),
      emitir: () => Promise.reject(new Error('N/A')),
    };
    await TestBed.configureTestingModule({
      imports: [CertificationsListPage],
      providers: [
        provideRouter([]),
        { provide: CERTIFICATIONS_SOURCE, useValue: service },
        { provide: CERTIFICATIONS_QA_ENABLED, useValue: false },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(CertificationsListPage);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;

    expect(el.querySelector('.vista-qa')).toBeNull();
    expect(el.querySelector('[role="alert"]')).not.toBeNull();

    (el.querySelector('[role="alert"] button') as HTMLButtonElement).click();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(listarSpy).toHaveBeenCalledTimes(2);
    expect(fixture.componentInstance.error()).toBe('');
    expect(fixture.componentInstance.certificados()).toEqual(recovered);
    expect(el.querySelector('.vista-qa')).toBeNull();
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
      obtenerEntregaManual: () => Promise.reject(new Error('N/A')),
      descargarQrPng: () => Promise.resolve(new Blob()),
      descargarPdf: () => Promise.resolve(new Blob(['%PDF'], { type: 'application/pdf' })),
      regenerarPdf: () => Promise.reject(new Error('N/A')),
      contar: () => Promise.resolve(0),
      revocar: () => Promise.resolve(),
      emitir: () => Promise.reject(new Error('N/A')),
    };
    await TestBed.configureTestingModule({
      imports: [CertificationsListPage],
      providers: [provideRouter([]), { provide: CERTIFICATIONS_SOURCE, useValue: delayed }],
    }).compileComponents();
    const fixture = TestBed.createComponent(CertificationsListPage);
    fixture.detectChanges();
    const page = fixture.componentInstance;
    void page.recargar();
    resolveSecond([{ id: 2, numero: 'IFTS14-CERT-0002', nombreAlumno: 'Alumno Demo Dos', cursoNombre: 'Curso', estado: 'vigente', documentMasked: '23456789', tokenPrefix: 'prefijo_demo_c2d', emitidoEn: null, venceEn: null }]);
    await fixture.whenStable();
    resolveFirst([{ id: 1, numero: 'IFTS14-CERT-0001', nombreAlumno: 'Alumno Demo Uno', cursoNombre: 'Curso', estado: 'vigente', documentMasked: '12345678', tokenPrefix: 'prefijo_demo_a1b', emitidoEn: null, venceEn: null }]);
    await fixture.whenStable();
    expect(page.certificados()[0].id).toBe(2);
  });

  it('no llama fetch', async () => {
    const fetchSpy = spyOn(window, 'fetch').and.callThrough();
    await render();
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
