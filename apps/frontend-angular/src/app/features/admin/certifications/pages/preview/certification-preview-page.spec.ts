import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { CertificationPreviewPage } from './certification-preview-page';
import { CERTIFICATIONS_SOURCE, CertificationsService } from '../../certifications.service';
import { CertificacionDetalle } from '../../certifications.models';
import { InMemoryCertificationsService } from '../../in-memory-certifications.service';
import { URL_PUBLICA_MAX } from '../../in-memory-certifications.service';

describe('CertificationPreviewPage', () => {
  async function render(id: string) {
    await TestBed.configureTestingModule({
      imports: [CertificationPreviewPage],
      providers: [
        provideRouter([]),
        { provide: CERTIFICATIONS_SOURCE, useClass: InMemoryCertificationsService },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(CertificationPreviewPage);
    fixture.componentRef.setInput('id', id);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    return fixture;
  }

  it('muestra datos seguros en dl (documentMasked, tokenPrefix, URL truncada)', async () => {
    const f = await render('1');
    const el = f.nativeElement as HTMLElement;
    const dl = el.querySelector('dl.detalle-meta');
    expect(dl).not.toBeNull();
    const text = dl?.textContent || '';
    // documentMasked visible como XX****XX (formato mascarado).
    expect(text).toMatch(/\d{2}\*{4}\d{2}/);
    // tokenPrefix visible (prefijo_demo_xxx), no token completo.
    expect(text).toMatch(/prefijo_demo_[a-z0-9]{3}/);
  });

  it('muestra attendedDates como lista', async () => {
    const f = await render('1');
    const el = f.nativeElement as HTMLElement;
    const attended = el.querySelector('.attended-dates');
    expect(attended).not.toBeNull();
    // Cert 1 tiene 3 attendedDates.
    const items = attended?.querySelectorAll('li') || [];
    expect(items.length).toBe(3);
  });

  it('muestra auditEvents como lista', async () => {
    const f = await render('1');
    const el = f.nativeElement as HTMLElement;
    const audit = el.querySelector('.audit-events');
    expect(audit).not.toBeNull();
    expect(audit?.querySelectorAll('li').length).toBeGreaterThanOrEqual(1);
  });

  it('URL pública se muestra truncada (<= URL_PUBLICA_MAX chars) sin token completo', async () => {
    const f = await render('1');
    const el = f.nativeElement as HTMLElement;
    const urlEl = el.querySelector('.public-url');
    expect(urlEl).not.toBeNull();
    const urlText = urlEl?.textContent?.trim() || '';
    expect(urlText.length).toBeLessThanOrEqual(URL_PUBLICA_MAX);
    // No contiene un UUID completo.
    expect(urlText).not.toMatch(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
  });

  it('CTAs de PDF, entrega, revocación y listado real están deshabilitados', async () => {
    const f = await render('1');
    const el = f.nativeElement as HTMLElement;
    const disabledBtns = el.querySelectorAll('button[disabled][aria-disabled="true"]');
    expect(disabledBtns.length).toBeGreaterThanOrEqual(4);
  });

  it('CTAs deshabilitados mencionan handoff a F4/F5/F6', async () => {
    const f = await render('1');
    const el = f.nativeElement as HTMLElement;
    const text = el.textContent || '';
    expect(text).toContain('F4-01');
    expect(text).toContain('F5-04');
    expect(text).toContain('F6-01');
  });

  it('id inválido "abc" muestra "Certificación no encontrada" sin excepción', async () => {
    const f = await render('abc');
    const el = f.nativeElement as HTMLElement;
    expect(el.textContent).toContain('no encontrada');
  });

  it('id hex "0x1" no se coerce a 1: muestra "no encontrada"', async () => {
    const f = await render('0x1');
    const el = f.nativeElement as HTMLElement;
    expect(el.textContent).toContain('no encontrada');
  });

  it('id notación científica "1e0" no se coerce a 1: muestra "no encontrada"', async () => {
    const f = await render('1e0');
    const el = f.nativeElement as HTMLElement;
    expect(el.textContent).toContain('no encontrada');
  });

  it('id con espacios " 1 " se normaliza y carga la certificación', async () => {
    const f = await render(' 1 ');
    const el = f.nativeElement as HTMLElement;
    expect(el.textContent).not.toContain('no encontrada');
  });

  it('id inexistente "999" muestra "Certificación no encontrada"', async () => {
    const f = await render('999');
    const el = f.nativeElement as HTMLElement;
    expect(el.textContent).toContain('no encontrada');
  });

  it('muestra enlace de retorno a /admin/certificaciones', async () => {
    const f = await render('1');
    const el = f.nativeElement as HTMLElement;
    const volver = el.querySelector('a[routerLink="/admin/certificaciones"]');
    expect(volver).not.toBeNull();
  });

  it('no llama fetch', async () => {
    const fetchSpy = spyOn(window, 'fetch').and.callThrough();
    await render('1');
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('no expone token completo en el DOM', async () => {
    const f = await render('1');
    const el = f.nativeElement as HTMLElement;
    expect(el.textContent).not.toMatch(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
  });

  // --- Route reuse ---

  it('route reuse: navegar de cert 1 a cert 2 recarga el detalle nuevo', async () => {
    const f = await render('1');
    const el = f.nativeElement as HTMLElement;
    expect(f.componentInstance.detalle()?.id).toBe(1);
    expect(el.querySelector('#cert-title')?.textContent).toContain(
      'Curso de introducción a la gestión',
    );
    f.componentRef.setInput('id', '2');
    f.detectChanges();
    await f.whenStable();
    f.detectChanges();
    expect(f.componentInstance.detalle()?.id).toBe(2);
    expect(f.componentInstance.detalle()?.cursoNombre).toBe(
      'Curso de herramientas administrativas',
    );
    // DOM: muestra contenido de cert 2, ya no muestra contenido de cert 1.
    expect(el.querySelector('#cert-title')?.textContent).toContain(
      'Curso de herramientas administrativas',
    );
    expect(el.textContent).not.toContain('Curso de introducción a la gestión');
    expect(el.textContent).not.toContain('Alumno Demo Uno');
    expect(el.textContent).toContain('Alumno Demo Dos');
  });

  it('route reuse: navegar a id inválido limpia detalle sin retener datos previos', async () => {
    const f = await render('1');
    const el = f.nativeElement as HTMLElement;
    expect(f.componentInstance.detalle()?.id).toBe(1);
    expect(el.querySelector('#cert-title')?.textContent).toContain(
      'Curso de introducción a la gestión',
    );
    f.componentRef.setInput('id', 'abc');
    f.detectChanges();
    await f.whenStable();
    f.detectChanges();
    expect(f.componentInstance.detalle()).toBeNull();
    expect(f.componentInstance.error()).toContain('no encontrada');
    // DOM: muestra "Certificación no encontrada" y no retiene contenido de cert 1.
    expect(el.querySelector('.estado-error')?.textContent).toContain(
      'Certificación no encontrada',
    );
    expect(el.querySelector('#cert-title')).toBeNull();
    expect(el.textContent).not.toContain('Curso de introducción a la gestión');
    expect(el.textContent).not.toContain('Alumno Demo Uno');
  });

  // CRITICAL: el guard `loadGen` descarta cargas stale cuando el id cambia
  // antes de que obtener() resuelva. Sin este guard, la promise de la carga
  // anterior resuelve DESPUÉS de la nueva y sobrescribe la pantalla vigente
  // con el certificado viejo. Este fake permite resolver manualmente las
  // promises fuera de orden para verificar el guard de forma determinística.
  it('route reuse: carga stale no sobrescribe pantalla vigente (out-of-order)', async () => {
    const pending = new Map<number, { resolve: (v: unknown) => void }>();

    const fakeCerts: CertificationsService = {
      listar: () => Promise.resolve([]),
      contar: () => Promise.resolve(0),
      obtener: (id: number) =>
        new Promise<CertificacionDetalle>((resolve) => {
          pending.set(id, { resolve: resolve as (v: unknown) => void });
        }),
    };

    await TestBed.configureTestingModule({
      imports: [CertificationPreviewPage],
      providers: [
        provideRouter([]),
        { provide: CERTIFICATIONS_SOURCE, useValue: fakeCerts },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(CertificationPreviewPage);
    fixture.componentRef.setInput('id', '1');
    fixture.detectChanges();
    // obtener(1) pendiente.
    expect(pending.has(1)).toBe(true);

    // Cambiar a cert 2 sin resolver la carga de 1 todavía.
    fixture.componentRef.setInput('id', '2');
    fixture.detectChanges();
    expect(pending.has(2)).toBe(true);

    // Resolver cert 2 PRIMERO (orden correcto de llegada).
    pending.get(2)!.resolve({
      id: 2,
      nombreAlumno: 'Alumno Demo Dos',
      cursoNombre: 'Curso de herramientas administrativas',
      estado: 'vigente',
      documentMasked: '34****56',
      tokenPrefix: 'prefijo_demo_c2d',
      emitidoEn: '2026-04-05',
      venceEn: '2027-04-05',
      publicValidationUrl: 'https://ifrm/validar/prefijo_demo_c2d…',
      attendedDates: ['2026-04-05', '2026-04-12'],
      auditEvents: [{ at: '2026-04-05', accion: 'emision', detalle: 'Emisión mock.' }],
    });
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(fixture.componentInstance.detalle()?.id).toBe(2);

    // Ahora resolver cert 1 TARDE (carga stale). loadGen debe descartarla.
    pending.get(1)!.resolve({
      id: 1,
      nombreAlumno: 'Alumno Demo Uno',
      cursoNombre: 'Curso de introducción a la gestión',
      estado: 'vigente',
      documentMasked: '12****34',
      tokenPrefix: 'prefijo_demo_a1b',
      emitidoEn: '2026-03-01',
      venceEn: '2027-03-01',
      publicValidationUrl: 'https://ifrm/validar/prefijo_demo_a1b…',
      attendedDates: ['2026-03-02', '2026-03-09', '2026-03-16'],
      auditEvents: [{ at: '2026-03-01', accion: 'emision', detalle: 'Emisión mock.' }],
    });
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    // La pantalla sigue mostrando cert 2; la carga stale de 1 se descartó.
    expect(fixture.componentInstance.detalle()?.id).toBe(2);
    expect(fixture.componentInstance.detalle()?.cursoNombre).toBe(
      'Curso de herramientas administrativas',
    );

    // DOM: muestra contenido de cert 2 (id vigente), sin contenido stale de cert 1.
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('#cert-title')?.textContent).toContain(
      'Curso de herramientas administrativas',
    );
    expect(el.textContent).toContain('Alumno Demo Dos');
    expect(el.textContent).toContain('prefijo_demo_c2d');
    expect(el.textContent).not.toContain('Curso de introducción a la gestión');
    expect(el.textContent).not.toContain('Alumno Demo Uno');
    expect(el.textContent).not.toContain('prefijo_demo_a1b');
  });
});