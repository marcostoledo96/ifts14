import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { CertificationPdfPreviewPage } from './certification-pdf-preview-page';
import { CERTIFICATIONS_SOURCE, CertificationsService } from '../../certifications.service';
import { CertificacionDetalle } from '../../certifications.models';
import { InMemoryCertificationsService, URL_PUBLICA_MAX } from '../../in-memory-certifications.service';

describe('CertificationPdfPreviewPage', () => {
  async function render(id: string) {
    await TestBed.configureTestingModule({
      imports: [CertificationPdfPreviewPage],
      providers: [
        provideRouter([]),
        { provide: CERTIFICATIONS_SOURCE, useClass: InMemoryCertificationsService },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(CertificationPdfPreviewPage);
    fixture.componentRef.setInput('id', id);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    return fixture;
  }

  // --- Render del folio con datos seguros ---

  it('muestra el número de expediente derivado del id (IFTS14-CERT-NNNN)', async () => {
    const f = await render('1');
    const el = f.nativeElement as HTMLElement;
    expect(el.textContent).toContain('IFTS14-CERT-0001');
  });

  it('muestra el nombre del alumno como protagonista del certificado', async () => {
    const f = await render('1');
    const el = f.nativeElement as HTMLElement;
    const prota = el.querySelector('.cert-protagonista');
    expect(prota?.textContent).toContain('Alumno Demo Uno');
  });

  it('muestra documentMasked (no DNI completo) debajo del nombre', async () => {
    const f = await render('1');
    const el = f.nativeElement as HTMLElement;
    const doc = el.querySelector('.cert-doc');
    expect(doc?.textContent).toMatch(/\d{2}\*{4}\d{2}/);
  });

  it('muestra el nombre del curso en el cuerpo del certificado', async () => {
    const f = await render('1');
    const el = f.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Curso de introducción a la gestión');
  });

  it('muestra cada fecha asistida ISO exacta, sin resumirla como período', async () => {
    const f = await render('1');
    const el = f.nativeElement as HTMLElement;
    const fechas = [...el.querySelectorAll('.cert-fecha-asistida')].map((date) => date.textContent?.trim());
    expect(fechas).toEqual(['2026-03-02', '2026-03-09', '2026-03-16']);
    expect(el.textContent).not.toContain('dictado entre');
  });

  it('conserva el valor ISO de una fecha asistida sin transformarlo', async () => {
    const f = await render('1');
    expect(f.componentInstance.formatearFechaAsistida('2026-03-02')).toBe('2026-03-02');
  });

  it('muestra la fecha de emisión formateada en lenguaje natural', async () => {
    const f = await render('1');
    const el = f.nativeElement as HTMLElement;
    const cierre = el.querySelector('.cert-cierre');
    // emitidoEn 2026-03-01 → "1 de marzo de 2026".
    expect(cierre?.textContent).toMatch(/marzo.*2026/i);
  });

  it('muestra la URL pública truncada (<= URL_PUBLICA_MAX chars) sin token completo', async () => {
    const f = await render('1');
    const el = f.nativeElement as HTMLElement;
    const urlEl = el.querySelector('.cert-val-url');
    expect(urlEl).not.toBeNull();
    const urlText = urlEl?.textContent?.trim() || '';
    expect(urlText.length).toBeLessThanOrEqual(URL_PUBLICA_MAX);
    expect(urlText).not.toMatch(
      /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i,
    );
  });

  // --- QR decorativo 8×8 ---

  it('QR decorativo tiene 64 celdas (8x8) y aria-hidden', async () => {
    const f = await render('1');
    const el = f.nativeElement as HTMLElement;
    const qr = el.querySelector('.qr-decorativo');
    expect(qr).not.toBeNull();
    expect(qr?.getAttribute('aria-hidden')).toBe('true');
    const cells = qr?.querySelectorAll('.qr-cell') || [];
    expect(cells.length).toBe(64);
  });

  // --- Autoridades neutras ---

  it('muestra autoridades firmantes neutras (Autoridad Demo Uno/Dos)', async () => {
    const f = await render('1');
    const el = f.nativeElement as HTMLElement;
    const firmas = el.querySelectorAll('.cert-firma-nombre');
    expect(firmas.length).toBe(2);
    expect(firmas[0]?.textContent).toContain('Autoridad Demo Uno');
    expect(firmas[1]?.textContent).toContain('Autoridad Demo Dos');
  });

  it('muestra cargos de las autoridades (Rector/a y Asesor/a Pedagógica)', async () => {
    const f = await render('1');
    const el = f.nativeElement as HTMLElement;
    const cargos = el.querySelectorAll('.cert-firma-cargo');
    expect(cargos.length).toBe(2);
    expect(cargos[0]?.textContent).toMatch(/Rector/i);
    expect(cargos[1]?.textContent).toMatch(/Asesor.*Pedag[oó]gica/i);
  });

  // --- Acciones no imprimibles ---

  it('barra de acciones tiene clase no-print', async () => {
    const f = await render('1');
    const el = f.nativeElement as HTMLElement;
    const barra = el.querySelector('.acciones-barra');
    expect(barra?.classList.contains('no-print')).toBe(true);
  });

  it('botón Imprimir llama a imprimir() y actualiza la live region', async () => {
    const f = await render('1');
    const el = f.nativeElement as HTMLElement;
    const btn = el.querySelector('.btn-imprimir') as HTMLButtonElement;
    expect(btn).not.toBeNull();
    spyOn(f.componentInstance, 'imprimir').and.callThrough();
    btn.click();
    f.detectChanges();
    expect(f.componentInstance.imprimir).toHaveBeenCalled();
    // La live region debe tener feedback tras el click.
    const feedback = el.querySelector('.print-feedback');
    expect(feedback?.getAttribute('role')).toBe('status');
    expect(feedback?.getAttribute('aria-live')).toBe('polite');
  });

  it('live region de impresión tiene role="status" y aria-live="polite"', async () => {
    const f = await render('1');
    const el = f.nativeElement as HTMLElement;
    const feedback = el.querySelector('.print-feedback');
    expect(feedback?.getAttribute('role')).toBe('status');
    expect(feedback?.getAttribute('aria-live')).toBe('polite');
  });

  it('breadcrumb tiene enlace a certificaciones y al expediente', async () => {
    const f = await render('1');
    const el = f.nativeElement as HTMLElement;
    const breadcrumb = el.querySelector('nav[aria-label="Migas de pan"]');
    expect(breadcrumb).not.toBeNull();
    // Los routerLink con interpolación se aplican como directivas; verificamos
    // que hay al menos dos enlaces navegables en el breadcrumb.
    const links = breadcrumb?.querySelectorAll('a') || [];
    expect(links.length).toBeGreaterThanOrEqual(2);
    expect(breadcrumb?.textContent).toContain('IFTS14-CERT-');
  });

  // --- Ids robustos ---

  it('id "abc" muestra "Certificación no encontrada" sin excepción', async () => {
    const f = await render('abc');
    const el = f.nativeElement as HTMLElement;
    expect(el.textContent).toContain('no encontrada');
  });

  it('id "0" muestra "no encontrada" (no es positivo)', async () => {
    const f = await render('0');
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

  it('id inexistente "999" muestra "Certificación no encontrada"', async () => {
    const f = await render('999');
    const el = f.nativeElement as HTMLElement;
    expect(el.textContent).toContain('no encontrada');
  });

  it('id vacío muestra "no encontrada"', async () => {
    const f = await render('');
    const el = f.nativeElement as HTMLElement;
    expect(el.textContent).toContain('no encontrada');
  });

  it('id con espacios " 1 " se normaliza y carga la certificación', async () => {
    const f = await render(' 1 ');
    const el = f.nativeElement as HTMLElement;
    expect(el.textContent).not.toContain('no encontrada');
    expect(el.textContent).toContain('Alumno Demo Uno');
  });

  // --- Route reuse: cambio de id ---

  it('route reuse: navegar de cert 1 a cert 2 recarga el detalle nuevo', async () => {
    const f = await render('1');
    const el = f.nativeElement as HTMLElement;
    expect(f.componentInstance.detalle()?.id).toBe(1);
    expect(el.querySelector('.cert-protagonista')?.textContent).toContain('Alumno Demo Uno');
    f.componentRef.setInput('id', '2');
    f.detectChanges();
    await f.whenStable();
    f.detectChanges();
    expect(f.componentInstance.detalle()?.id).toBe(2);
    expect(el.querySelector('.cert-protagonista')?.textContent).toContain('Alumno Demo Dos');
    expect(el.textContent).not.toContain('Alumno Demo Uno');
  });

  it('route reuse: navegar a id inválido limpia detalle sin retener datos previos', async () => {
    const f = await render('1');
    const el = f.nativeElement as HTMLElement;
    expect(f.componentInstance.detalle()?.id).toBe(1);
    f.componentRef.setInput('id', 'abc');
    f.detectChanges();
    await f.whenStable();
    f.detectChanges();
    expect(f.componentInstance.detalle()).toBeNull();
    expect(f.componentInstance.error()).toContain('no encontrada');
    expect(el.textContent).not.toContain('Alumno Demo Uno');
  });

  // --- Privacidad: NO exposición de datos prohibidos ---

  it('no muestra tokenPrefix como campo/label admin en el documento', async () => {
    const f = await render('1');
    const el = f.nativeElement as HTMLElement;
    // tokenPrefix como dato admin no debe aparecer como label/campo. La URL
    // pública truncada que contiene el prefijo está permitida por design.md.
    expect(el.textContent).not.toMatch(/Token\s*\(parcial\)/i);
    expect(el.textContent).not.toMatch(/tokenPrefix/i);
  });

  it('no expone DNI completo (7-8 dígitos contiguos) en el DOM', async () => {
    const f = await render('1');
    const el = f.nativeElement as HTMLElement;
    expect(el.textContent).not.toMatch(/\b\d{7,8}\b/);
  });

  it('no expone email en el DOM', async () => {
    const f = await render('1');
    const el = f.nativeElement as HTMLElement;
    expect(el.textContent).not.toMatch(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i);
  });

  it('no expone UUID completo en el DOM', async () => {
    const f = await render('1');
    const el = f.nativeElement as HTMLElement;
    expect(el.textContent).not.toMatch(
      /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i,
    );
  });

  it('no expone legajo ni matrícula como literales en el DOM', async () => {
    const f = await render('1');
    const el = f.nativeElement as HTMLElement;
    const text = el.textContent || '';
    expect(text).not.toMatch(/legajo/i);
    expect(text).not.toMatch(/matr[íi]cula/i);
  });

  it('no llama fetch', async () => {
    const fetchSpy = spyOn(window, 'fetch').and.callThrough();
    await render('1');
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  // --- Estados del documento ---

  for (const [id, marca, texto] of [
    ['3', 'BORRADOR', 'borrador'],
    ['4', 'VENCIDO', 'vencido'],
    ['5', 'REVOCADO', 'revocada'],
  ] as const) {
    it(`certificado ${id} muestra marca y banda ${marca}`, async () => {
      const f = await render(id);
      const el = f.nativeElement as HTMLElement;
      expect(el.querySelector('.cert-estado-marca')?.textContent?.trim()).toBe(marca);
      expect(el.querySelector('.cert-estado-banda')?.textContent?.toLowerCase()).toContain(texto);
      expect((el.querySelector('.btn-imprimir') as HTMLButtonElement).disabled).toBeFalse();
    });
  }

  it('certificado vigente (id 1) permanece limpio, sin marca ni banda', async () => {
    const f = await render('1');
    const el = f.nativeElement as HTMLElement;
    expect(el.querySelector('.cert-estado-marca')).toBeNull();
    expect(el.querySelector('.cert-estado-banda')).toBeNull();
  });

  // --- Impresión nativa (Phase 3) ---

  it('imprimir() actualiza la live region ANTES de llamar window.print (feedback diferido)', async () => {
    const f = await render('1');
    const el = f.nativeElement as HTMLElement;
    let rafCalled = false;
    let printCalled = false;
    // Stub requestAnimationFrame para capturar el orden.
    const origRAF = window.requestAnimationFrame;
    window.requestAnimationFrame = ((cb: FrameRequestCallback) => {
      rafCalled = true;
      // Ejecutar el callback sincrónicamente para probar el orden.
      cb(0);
      return 0;
    }) as typeof window.requestAnimationFrame;
    const printSpy = spyOn(window, 'print').and.callFake(() => {
      printCalled = true;
    });
    f.componentInstance.imprimir();
    f.detectChanges();
    // El feedback se setea antes del rAF.
    expect(f.componentInstance.printFeedback()).toContain('listo');
    // El rAF se pidió y dentro de él se llamó window.print.
    expect(rafCalled).toBe(true);
    expect(printSpy).toHaveBeenCalled();
    expect(printCalled).toBe(true);
    // Restaurar.
    window.requestAnimationFrame = origRAF;
  });

  it('imprimir() NO llama window.print si no está disponible (fallback)', async () => {
    const f = await render('1');
    const origPrint = window.print;
    // Simular entorno sin window.print.
    (window as unknown as { print: unknown }).print = undefined;
    f.componentInstance.imprimir();
    f.detectChanges();
    expect(f.componentInstance.printFeedback()).toContain('no disponible');
    // Restaurar.
    window.print = origPrint;
  });

  // --- Print: el chrome del shell se oculta vía CSS @media print, no DOM ---
  // El workaround DOM de ocultar/restaurar shell fue eliminado; el CSS
  // @media print en admin-shell.css oculta el chrome de forma estable.
  // Este test verifica que imprimir() no manipula display del shell.

  it('imprimir() no manipula display del shell admin (CSS @media print lo oculta)', async () => {
    const shell = document.createElement('app-admin-shell');
    shell.innerHTML = `
      <a class="skip-link" href="#">skip</a>
      <aside class="sidebar-desktop" style="display: block"></aside>
      <header class="topbar" style="display: block"></header>
      <footer style="display: block"></footer>
    `;
    document.body.appendChild(shell);
    const f = await render('1');
    const origRAF = window.requestAnimationFrame;
    window.requestAnimationFrame = ((cb: FrameRequestCallback) => {
      cb(0);
      return 0;
    }) as typeof window.requestAnimationFrame;
    const printSpy = spyOn(window, 'print').and.callFake(() => {});
    f.componentInstance.imprimir();
    window.requestAnimationFrame = origRAF;
    expect(printSpy).toHaveBeenCalled();
    // Después de imprimir, el shell conserva su display original (CSS lo
    // oculta solo en @media print, no por manipulación DOM persistente).
    const sidebar = document.querySelector('app-admin-shell .sidebar-desktop') as HTMLElement;
    expect(sidebar.style.display).toBe('block');
    shell.remove();
  });

  // --- Guard anti-race (out-of-order) ---

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
      imports: [CertificationPdfPreviewPage],
      providers: [
        provideRouter([]),
        { provide: CERTIFICATIONS_SOURCE, useValue: fakeCerts },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(CertificationPdfPreviewPage);
    fixture.componentRef.setInput('id', '1');
    fixture.detectChanges();
    expect(pending.has(1)).toBe(true);

    // Cambiar a cert 2 sin resolver la carga de 1 todavía.
    fixture.componentRef.setInput('id', '2');
    fixture.detectChanges();
    expect(pending.has(2)).toBe(true);

    // Resolver cert 2 PRIMERO.
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

    // Resolver cert 1 TARDE (carga stale). loadGen debe descartarla.
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

    expect(fixture.componentInstance.detalle()?.id).toBe(2);
    expect(fixture.componentInstance.detalle()?.cursoNombre).toBe(
      'Curso de herramientas administrativas',
    );

    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.cert-protagonista')?.textContent).toContain('Alumno Demo Dos');
    expect(el.textContent).not.toContain('Alumno Demo Uno');
  });
});
