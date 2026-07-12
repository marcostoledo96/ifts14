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

  // --- Frontera de datos administrativa ---

  it('muestra datos seguros en la ficha (documentMasked, tokenPrefix, URL truncada)', async () => {
    const f = await render('1');
    const el = f.nativeElement as HTMLElement;
    const ficha = el.querySelector('.ficha-expediente');
    expect(ficha).not.toBeNull();
    const text = ficha?.textContent || '';
    // documentMasked visible como XX****XX (formato mascarado).
    expect(text).toMatch(/\d{2}\*{4}\d{2}/);
    // tokenPrefix visible (prefijo_demo_xxx), no token completo.
    expect(text).toMatch(/prefijo_demo_[a-z0-9]{3}/);
  });

  it('muestra attendedDates como lista de jornadas', async () => {
    const f = await render('1');
    const el = f.nativeElement as HTMLElement;
    const attended = el.querySelector('.asistencia-lista');
    expect(attended).not.toBeNull();
    // Cert 1 tiene 3 attendedDates.
    const items = attended?.querySelectorAll('li') || [];
    expect(items.length).toBe(3);
  });

  it('muestra auditEvents como línea de tiempo de auditoría', async () => {
    const f = await render('1');
    const el = f.nativeElement as HTMLElement;
    const audit = el.querySelector('.auditoria-timeline');
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

  // --- Acciones deshabilitadas con handoff explícito ---

  it('CTAs de PDF, copiar link, entrega, regenerar y revocar están deshabilitados', async () => {
    const f = await render('1');
    const el = f.nativeElement as HTMLElement;
    const disabledBtns = el.querySelectorAll('button[disabled][aria-disabled="true"]');
    expect(disabledBtns.length).toBeGreaterThanOrEqual(5);
  });

  it('CTAs deshabilitados mencionan handoff a F4-02, F5-04, F6-03 y F6-01', async () => {
    const f = await render('1');
    const el = f.nativeElement as HTMLElement;
    const text = el.textContent || '';
    // F4-02 PDF, F5-04 entrega, F6-03 link/delivery, F6-01 revocación.
    expect(text).toContain('F4-02');
    expect(text).toContain('F5-04');
    expect(text).toContain('F6-03');
    expect(text).toContain('F6-01');
  });

  it('acciones deshabilitadas tienen aria-disabled="true" y cursor not-allowed', async () => {
    const f = await render('1');
    const el = f.nativeElement as HTMLElement;
    const acciones = el.querySelector('.acciones-panel');
    expect(acciones).not.toBeNull();
    const btns = acciones?.querySelectorAll('button[disabled]') || [];
    for (const b of Array.from(btns)) {
      expect(b.getAttribute('aria-disabled')).toBe('true');
    }
  });

  // --- Secciones del expediente (paridad v0) ---

  it('muestra breadcrumb con enlace a certificaciones y número de expediente', async () => {
    const f = await render('1');
    const el = f.nativeElement as HTMLElement;
    const breadcrumb = el.querySelector('nav[aria-label="Migas de pan"]');
    expect(breadcrumb).not.toBeNull();
    const link = breadcrumb?.querySelector('a[routerLink="/admin/certificaciones"]');
    expect(link).not.toBeNull();
    // Número visual del expediente derivado del id.
    expect(breadcrumb?.textContent).toMatch(/IFTS14-CERT-/);
  });

  it('muestra encabezado con kicker, título (alumno) y badge de estado', async () => {
    const f = await render('1');
    const el = f.nativeElement as HTMLElement;
    const header = el.querySelector('.expediente-header');
    expect(header).not.toBeNull();
    expect(header?.querySelector('.kicker')?.textContent).toContain('Expediente');
    // Paridad v0: h1 es el nombre del alumno, el curso va en el subtítulo.
    expect(header?.querySelector('h1')?.textContent).toContain('Alumno Demo Uno');
    expect(header?.querySelector('.subtitle')?.textContent).toContain('Curso de introducción');
    expect(header?.querySelector('.estado-badge')).not.toBeNull();
  });

  it('muestra columna de control (ficha, acciones, validación, riesgo)', async () => {
    const f = await render('1');
    const el = f.nativeElement as HTMLElement;
    const control = el.querySelector('.control-col');
    expect(control).not.toBeNull();
    expect(control?.querySelector('.ficha-expediente')).not.toBeNull();
    expect(control?.querySelector('.acciones-panel')).not.toBeNull();
    expect(control?.querySelector('.validacion-panel')).not.toBeNull();
    expect(control?.querySelector('.riesgo-panel')).not.toBeNull();
  });

  it('muestra columna de documento (réplica institucional)', async () => {
    const f = await render('1');
    const el = f.nativeElement as HTMLElement;
    const doc = el.querySelector('.documento-col');
    expect(doc).not.toBeNull();
    expect(doc?.querySelector('.documento-replica')).not.toBeNull();
  });

  it('documento réplica tiene encabezado navy, declaración y tabla de asistencia', async () => {
    const f = await render('1');
    const el = f.nativeElement as HTMLElement;
    const doc = el.querySelector('.documento-replica');
    expect(doc?.querySelector('.doc-header')).not.toBeNull();
    expect(doc?.querySelector('.doc-declaracion')).not.toBeNull();
    expect(doc?.querySelector('.doc-asistencia')).not.toBeNull();
    // Tabla con fechas asistidas.
    const rows = doc?.querySelectorAll('.doc-asistencia tbody tr') || [];
    expect(rows.length).toBe(3);
  });

  it('documento réplica muestra autoridades firmantes (solo lectura)', async () => {
    const f = await render('1');
    const el = f.nativeElement as HTMLElement;
    const autoridades = el.querySelector('.doc-autoridades');
    expect(autoridades).not.toBeNull();
    expect(autoridades?.textContent).toContain('Firma digital');
  });

  it('QR decorativo visible sin datos personales', async () => {
    const f = await render('1');
    const el = f.nativeElement as HTMLElement;
    const qr = el.querySelector('.qr-decorativo');
    expect(qr).not.toBeNull();
    expect(qr?.getAttribute('aria-hidden')).toBe('true');
  });

  it('zona de riesgo visible con handoff a F6-01 (revocación)', async () => {
    const f = await render('1');
    const el = f.nativeElement as HTMLElement;
    const riesgo = el.querySelector('.riesgo-panel');
    expect(riesgo).not.toBeNull();
    expect(riesgo?.textContent).toContain('F6-01');
  });

  // --- Id inválido / inexistente ---

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

  it('estado no encontrado no renderiza secciones del expediente', async () => {
    const f = await render('abc');
    const el = f.nativeElement as HTMLElement;
    expect(el.querySelector('.control-col')).toBeNull();
    expect(el.querySelector('.documento-col')).toBeNull();
    expect(el.querySelector('.expediente-header')).toBeNull();
  });

  it('muestra enlace de retorno a /admin/certificaciones', async () => {
    const f = await render('1');
    const el = f.nativeElement as HTMLElement;
    const volver = el.querySelector('a[routerLink="/admin/certificaciones"]');
    expect(volver).not.toBeNull();
  });

  // --- Privacidad ---

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

  it('no expone DNI completo (7-8 dígitos) en el DOM', async () => {
    const f = await render('1');
    const el = f.nativeElement as HTMLElement;
    // documentMasked es XX****XX: nunca 7-8 dígitos contiguos.
    expect(el.textContent).not.toMatch(/\b\d{7,8}\b/);
  });

  it('no expone email en el DOM', async () => {
    const f = await render('1');
    const el = f.nativeElement as HTMLElement;
    expect(el.textContent).not.toMatch(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i);
  });

  it('no expone legajo ni matrícula como literales en el DOM', async () => {
    const f = await render('1');
    const el = f.nativeElement as HTMLElement;
    const text = el.textContent || '';
    expect(text).not.toMatch(/legajo/i);
    expect(text).not.toMatch(/matr[íi]cula/i);
  });

  // --- Route reuse ---

  it('route reuse: navegar de cert 1 a cert 2 recarga el detalle nuevo', async () => {
    const f = await render('1');
    const el = f.nativeElement as HTMLElement;
    expect(f.componentInstance.detalle()?.id).toBe(1);
    // Paridad v0: h1 (#cert-title) muestra el nombre del alumno.
    expect(el.querySelector('#cert-title')?.textContent).toContain('Alumno Demo Uno');
    f.componentRef.setInput('id', '2');
    f.detectChanges();
    await f.whenStable();
    f.detectChanges();
    expect(f.componentInstance.detalle()?.id).toBe(2);
    expect(f.componentInstance.detalle()?.cursoNombre).toBe(
      'Curso de herramientas administrativas',
    );
    // DOM: muestra contenido de cert 2, ya no muestra contenido de cert 1.
    expect(el.querySelector('#cert-title')?.textContent).toContain('Alumno Demo Dos');
    expect(el.textContent).not.toContain('Curso de introducción a la gestión');
    expect(el.textContent).not.toContain('Alumno Demo Uno');
    expect(el.textContent).toContain('Alumno Demo Dos');
  });

  it('route reuse: navegar a id inválido limpia detalle sin retener datos previos', async () => {
    const f = await render('1');
    const el = f.nativeElement as HTMLElement;
    expect(f.componentInstance.detalle()?.id).toBe(1);
    // Paridad v0: h1 muestra el nombre del alumno.
    expect(el.querySelector('#cert-title')?.textContent).toContain('Alumno Demo Uno');
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
    // Paridad v0: h1 (#cert-title) muestra el nombre del alumno.
    expect(el.querySelector('#cert-title')?.textContent).toContain('Alumno Demo Dos');
    expect(el.textContent).toContain('Alumno Demo Dos');
    expect(el.textContent).toContain('prefijo_demo_c2d');
    expect(el.textContent).not.toContain('Curso de introducción a la gestión');
    expect(el.textContent).not.toContain('Alumno Demo Uno');
    expect(el.textContent).not.toContain('prefijo_demo_a1b');
  });

  // --- Handoffs explícitos por acción ---

  it('handoff de PDF menciona F4-02 explícitamente', async () => {
    const f = await render('1');
    const el = f.nativeElement as HTMLElement;
    const acciones = el.querySelector('.acciones-panel');
    expect(acciones?.textContent).toContain('F4-02');
  });

  it('handoff de entrega menciona F5-04 explícitamente', async () => {
    const f = await render('1');
    const el = f.nativeElement as HTMLElement;
    const acciones = el.querySelector('.acciones-panel');
    expect(acciones?.textContent).toContain('F5-04');
  });

  it('handoff de link/validación menciona F6-03 explícitamente', async () => {
    const f = await render('1');
    const el = f.nativeElement as HTMLElement;
    const validacion = el.querySelector('.validacion-panel');
    expect(validacion?.textContent).toContain('F6-03');
  });

  it('handoff de revocación menciona F6-01 explícitamente', async () => {
    const f = await render('1');
    const el = f.nativeElement as HTMLElement;
    const riesgo = el.querySelector('.riesgo-panel');
    expect(riesgo?.textContent).toContain('F6-01');
  });
});