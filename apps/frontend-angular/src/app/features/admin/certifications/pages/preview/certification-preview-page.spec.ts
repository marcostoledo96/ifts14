import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { CertificationPreviewPage } from './certification-preview-page';
import { CERTIFICATIONS_SOURCE, CertificationsService } from '../../certifications.service';
import {
  CertificacionDetalle,
  EntregaManualDto,
  RegenerarPdfResult,
} from '../../certifications.models';
import { InMemoryCertificationsService } from '../../in-memory-certifications.service';
import { URL_PUBLICA_MAX } from '../../in-memory-certifications.service';
import {
  emptyParameters,
  INSTITUTIONAL_CONFIG_SOURCE,
  InstitutionalConfig,
  InstitutionalConfigService,
} from '../../../institutional-config/institutional-config.service';
import { InMemoryInstitutionalConfigService } from '../../../institutional-config/in-memory-institutional-config.service';
import { resetMockAdminPublicStatus } from '../../../../../shared/certificates/mock-tokens';

const CANONICA_CERT1 =
  'https://ifts14.edu.ar/certificados/validar/prefijo_demo_a1b-completo';

function detalleFixture(
  overrides: Partial<CertificacionDetalle> & { id: number },
): CertificacionDetalle {
  return {
    numero: `IFTS14-CERT-${String(overrides.id).padStart(4, '0')}`,
    nombreAlumno: 'Alumno Demo Uno',
    cursoNombre: 'Curso Demo',
    estado: 'vigente',
    documentMasked: '12345678',
    tokenPrefix: 'prefijo_demo_a1b',
    emitidoEn: '2026-03-01',
    venceEn: '2027-03-01',
    publicValidationUrl: 'https://ifrm/validar/prefijo_demo_a1b…',
    attendedDates: ['2026-03-02'],
    auditEvents: [],
    ...overrides,
  };
}

function entregaFixture(id: number, url = CANONICA_CERT1): EntregaManualDto {
  return {
    certificadoId: id,
    publicValidationUrl: url,
    pdfDownloadUrl: `${id}/pdf`,
    tokenPrefix: 'prefijo_demo_a1b',
    pdfAvailable: true,
    pdfStatus: 'valid',
  };
}

function mockClipboard(writeText: jasmine.Spy): () => void {
  const original = navigator.clipboard;
  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: { writeText } as unknown as Clipboard,
  });
  return () => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: original,
    });
  };
}

function configFixture(
  overrides: Partial<InstitutionalConfig> = {},
): InstitutionalConfig {
  const { parameters: paramOverride, ...rest } = overrides;
  return {
    institutionName: 'IFTS N.° 14',
    certificateText: 'Texto demo',
    rectorName: 'Rectora Real',
    rectorRole: 'Rector/a',
    advisorName: 'Asesor Real',
    advisorRole: 'Asesor/a pedagógico/a',
    updatedAt: '2026-01-01T00:00:00Z',
    ...rest,
    parameters: paramOverride ?? emptyParameters(),
  };
}

describe('CertificationPreviewPage', () => {
  beforeEach(() => {
    resetMockAdminPublicStatus();
  });

  async function render(
    id: string,
    opts?: {
      certs?: CertificationsService;
      config?: InstitutionalConfigService;
    },
  ) {
    await TestBed.configureTestingModule({
      imports: [CertificationPreviewPage],
      providers: [
        provideRouter([]),
        {
          provide: CERTIFICATIONS_SOURCE,
          useValue: opts?.certs ?? new InMemoryCertificationsService(),
        },
        {
          provide: INSTITUTIONAL_CONFIG_SOURCE,
          useValue: opts?.config ?? new InMemoryInstitutionalConfigService(),
        },
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

  it('muestra datos seguros en la ficha (documentMasked completo, tokenPrefix, URL truncada)', async () => {
    const f = await render('1');
    const el = f.nativeElement as HTMLElement;
    const ficha = el.querySelector('.ficha-expediente');
    expect(ficha).not.toBeNull();
    const text = ficha?.textContent || '';
    // documentMasked visible con DNI completo ficticio (D0 admin UI).
    expect(text).toMatch(/\b12345678\b/);
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

  // --- REQ-CPREV: Copiar / Descargar QR habilitados ---

  it('REQ-CPREV-003: Copiar y Descargar QR quedan habilitados con URL canónica (sin F6-03)', async () => {
    const f = await render('1');
    const el = f.nativeElement as HTMLElement;
    expect(el.textContent).not.toContain('F6-03');
    const acciones = el.querySelector('.acciones-panel');
    const copiar = Array.from(acciones?.querySelectorAll('button') || []).find((b) =>
      b.textContent?.includes('Copiar link'),
    );
    const descargarQr = Array.from(acciones?.querySelectorAll('button') || []).find((b) =>
      b.textContent?.includes('Descargar QR'),
    );
    expect(copiar).toBeTruthy();
    expect(descargarQr).toBeTruthy();
    expect((copiar as HTMLButtonElement).disabled).toBeFalse();
    expect((descargarQr as HTMLButtonElement).disabled).toBeFalse();
  });

  it('REQ-CPREV-002: Copiar usa URL de entrega-manual, no la truncada de detalle', async () => {
    const writeText = jasmine.createSpy('writeText').and.resolveTo(undefined);
    const restoreClipboard = mockClipboard(writeText);

    const fakeCerts: CertificationsService = {
      listar: () => Promise.resolve([]),
      contar: () => Promise.resolve(0),
      revocar: () => Promise.resolve(),
      emitir: () => Promise.reject(new Error('N/A')),
      obtener: (id) => Promise.resolve(detalleFixture({ id })),
      obtenerEntregaManual: (id) => Promise.resolve(entregaFixture(id, CANONICA_CERT1)),
      descargarQrPng: () => Promise.resolve(new Blob()),
      descargarPdf: () => Promise.resolve(new Blob(['%PDF'], { type: 'application/pdf' })),
      regenerarPdf: () => Promise.resolve({ regenerado: false }),
    };

    const f = await render('1', { certs: fakeCerts });
    const el = f.nativeElement as HTMLElement;
    const decorativa = el.querySelector('.validacion-panel .public-url')?.textContent?.trim();
    expect(decorativa).not.toBe(CANONICA_CERT1);

    await f.componentInstance.copiarLink();
    f.detectChanges();
    expect(writeText).toHaveBeenCalledWith(CANONICA_CERT1);
    expect(f.componentInstance.copiado()).toBeTrue();
    expect(el.textContent).toContain('Link copiado');
    restoreClipboard();
  });

  it('REQ-CPREV-003: revocado deshabilita Copiar y Descargar QR', async () => {
    const f = await render('5');
    const el = f.nativeElement as HTMLElement;
    const acciones = el.querySelector('.acciones-panel');
    const copiar = Array.from(acciones?.querySelectorAll('button') || []).find((b) =>
      b.textContent?.includes('Copiar link'),
    );
    const descargarQr = Array.from(acciones?.querySelectorAll('button') || []).find((b) =>
      b.textContent?.includes('Descargar QR'),
    );
    expect((copiar as HTMLButtonElement).disabled).toBeTrue();
    expect((descargarQr as HTMLButtonElement).disabled).toBeTrue();
    expect(copiar?.getAttribute('aria-disabled')).toBe('true');
  });

  it('REQ-CPREV-001: entrega-manual falla → expediente OK y CTAs deshabilitados', async () => {
    const fakeCerts: CertificationsService = {
      listar: () => Promise.resolve([]),
      contar: () => Promise.resolve(0),
      revocar: () => Promise.resolve(),
      emitir: () => Promise.reject(new Error('N/A')),
      obtener: (id) => Promise.resolve(detalleFixture({ id })),
      obtenerEntregaManual: () => Promise.reject(new Error('entrega falló')),
      descargarQrPng: () => Promise.resolve(new Blob()),
      descargarPdf: () => Promise.resolve(new Blob(['%PDF'], { type: 'application/pdf' })),
      regenerarPdf: () => Promise.resolve({ regenerado: false }),
    };
    const f = await render('1', { certs: fakeCerts });
    const el = f.nativeElement as HTMLElement;
    expect(el.querySelector('#cert-title')?.textContent).toContain('Alumno Demo Uno');
    const acciones = el.querySelector('.acciones-panel');
    const copiar = Array.from(acciones?.querySelectorAll('button') || []).find((b) =>
      b.textContent?.includes('Copiar link'),
    );
    const descargarQr = Array.from(acciones?.querySelectorAll('button') || []).find((b) =>
      b.textContent?.includes('Descargar QR'),
    );
    expect((copiar as HTMLButtonElement).disabled).toBeTrue();
    expect((descargarQr as HTMLButtonElement).disabled).toBeTrue();
  });

  it('REQ-CPREV-004: Descargar QR desde Acciones obtiene PNG y dispara download', async () => {
    const blob = new Blob(['qr'], { type: 'image/png' });
    const fakeCerts: CertificationsService = {
      listar: () => Promise.resolve([]),
      contar: () => Promise.resolve(0),
      revocar: () => Promise.resolve(),
      emitir: () => Promise.reject(new Error('N/A')),
      obtener: (id) => Promise.resolve(detalleFixture({ id })),
      obtenerEntregaManual: (id) => Promise.resolve(entregaFixture(id, CANONICA_CERT1)),
      descargarQrPng: jasmine.createSpy('descargarQrPng').and.resolveTo(blob),
      descargarPdf: () => Promise.resolve(new Blob(['%PDF'], { type: 'application/pdf' })),
      regenerarPdf: () => Promise.resolve({ regenerado: false }),
    };

    spyOn(URL, 'createObjectURL').and.returnValue('blob:qr');
    spyOn(URL, 'revokeObjectURL');
    let downloadedName = '';
    spyOn(HTMLAnchorElement.prototype, 'click').and.callFake(function (this: HTMLAnchorElement) {
      downloadedName = this.download;
    });

    const f = await render('1', { certs: fakeCerts });
    await f.componentInstance.descargarQr();
    f.detectChanges();

    expect(fakeCerts.descargarQrPng).toHaveBeenCalledWith(1);
    expect(downloadedName).toBe('cert-IFTS14-CERT-0001-qr.png');
    expect(f.componentInstance.qrError()).toBe('');
  });

  it('REQ-CPREV-005: muestra autoridades reales desde config', async () => {
    const config: InstitutionalConfigService = {
      obtener: () => Promise.resolve(configFixture()),
      guardar: () => Promise.reject(new Error('N/A')),
    };
    const f = await render('1', { config });
    const el = f.nativeElement as HTMLElement;
    const autoridades = el.querySelector('.doc-autoridades');
    expect(autoridades?.textContent).toContain('Rectora Real');
    expect(autoridades?.textContent).toContain('Asesor Real');
    expect(autoridades?.textContent).not.toContain('Autoridad Demo');
    expect(autoridades?.textContent).not.toContain('Configuración institucional pendiente');
  });

  it('REQ-CPREV-006: config fallida muestra pendiente y no bloquea Copiar', async () => {
    const config: InstitutionalConfigService = {
      obtener: () => Promise.reject(new Error('config fail')),
      guardar: () => Promise.reject(new Error('N/A')),
    };
    const f = await render('1', { config });
    const el = f.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Configuración institucional pendiente');
    const copiar = Array.from(el.querySelectorAll('.acciones-panel button')).find((b) =>
      b.textContent?.includes('Copiar link'),
    );
    expect((copiar as HTMLButtonElement).disabled).toBeFalse();
  });

  it('REQ-CPREV-006: ambos nombres vacíos → pendiente; CTAs siguen habilitados', async () => {
    const config: InstitutionalConfigService = {
      obtener: () =>
        Promise.resolve(
          configFixture({ rectorName: '  ', advisorName: '', rectorRole: 'Rector/a' }),
        ),
      guardar: () => Promise.reject(new Error('N/A')),
    };
    const f = await render('1', { config });
    const el = f.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Configuración institucional pendiente');
    const descargarQr = Array.from(el.querySelectorAll('.acciones-panel button')).find((b) =>
      b.textContent?.includes('Descargar QR'),
    );
    expect((descargarQr as HTMLButtonElement).disabled).toBeFalse();
  });

  // --- F4-02 / P6-01 / F6-01: enlaces funcionales ---

  it('F4-02: "Descargar PDF" es un enlace (routerLink) a :id/pdf, no disabled', async () => {
    const f = await render('1');
    const el = f.nativeElement as HTMLElement;
    const acciones = el.querySelector('.acciones-panel');
    const links = acciones?.querySelectorAll('a') || [];
    const descargarLink = Array.from(links).find((a) =>
      a.textContent?.includes('Descargar PDF'),
    );
    expect(descargarLink).toBeTruthy();
    expect(descargarLink?.getAttribute('disabled')).toBeNull();
  });

  it('F4-02: "Regenerar PDF" es un botón funcional (P6-02), no routerLink', async () => {
    const f = await render('1');
    const el = f.nativeElement as HTMLElement;
    const acciones = el.querySelector('.acciones-panel');
    const regenerarBtn = Array.from(acciones?.querySelectorAll('button') || []).find(
      (b) => b.textContent?.includes('Regenerar PDF'),
    );
    expect(regenerarBtn).toBeTruthy();
    expect(regenerarBtn?.getAttribute('disabled')).toBeNull();
    expect(regenerarBtn?.getAttribute('aria-disabled')).toBe('false');
  });

  it('no muestra CTA "Entrega manual" ni Compartir; Descargar QR en Acciones y validación', async () => {
    const f = await render('1');
    const el = f.nativeElement as HTMLElement;
    const acciones = el.querySelector('.acciones-panel');
    expect(acciones?.textContent).not.toContain('Entrega manual');
    expect(acciones?.textContent).not.toContain('Compartir');
    const qrAcciones = Array.from(acciones?.querySelectorAll('button') || []).find((b) =>
      b.textContent?.includes('Descargar QR'),
    );
    const qrVal = Array.from(el.querySelectorAll('.validacion-panel button') || []).find((b) =>
      b.textContent?.includes('Descargar QR'),
    );
    expect(qrAcciones).toBeTruthy();
    expect(qrVal).toBeTruthy();
    expect((qrAcciones as HTMLButtonElement).disabled).toBeFalse();
  });

  it('F6-01: "Revocar certificación" es un enlace (routerLink) a :id/revocar, no disabled', async () => {
    const f = await render('1');
    const el = f.nativeElement as HTMLElement;
    const riesgo = el.querySelector('.riesgo-panel');
    const revocarLink = riesgo?.querySelector('a.btn-revocar');
    expect(revocarLink).not.toBeNull();
    expect(revocarLink?.getAttribute('disabled')).toBeNull();
  });

  it('no permite navegar a revocación cuando el certificado está borrador', async () => {
    const f = await render('3');
    const riesgo = (f.nativeElement as HTMLElement).querySelector('.riesgo-panel');
    const boton = riesgo?.querySelector('button.btn-revocar') as HTMLButtonElement | null;
    const navigateSpy = spyOn(TestBed.inject(Router), 'navigateByUrl');

    expect(riesgo?.querySelector('a.btn-revocar')).toBeNull();
    expect(boton?.disabled).toBeTrue();
    expect(boton?.getAttribute('aria-describedby')).toBe('revocacion-no-disponible');
    expect(riesgo?.textContent).toContain('Solo las certificaciones vigentes pueden revocarse.');
    boton?.click();
    expect(navigateSpy).not.toHaveBeenCalled();
  });

  for (const [id, estado, alumno, curso] of [
    ['4', 'vencido', '4', '4'],
    ['5', 'revocado', '5', '5'],
  ] as const) {
    it(`ofrece Emitir nuevamente (no revocar) cuando el certificado está ${estado}`, async () => {
      const f = await render(id);
      const el = f.nativeElement as HTMLElement;
      const riesgo = el.querySelector('.riesgo-panel');
      const acciones = el.querySelector('.acciones-panel');
      const cta = el.querySelector(
        '[data-testid="cta-emitir-nuevamente"]',
      ) as HTMLAnchorElement | null;
      const ctaRiesgo = el.querySelector(
        '[data-testid="cta-emitir-nuevamente-riesgo"]',
      ) as HTMLAnchorElement | null;

      expect(riesgo?.querySelector('a.btn-revocar')).toBeNull();
      expect(riesgo?.querySelector('button.btn-revocar')).toBeNull();
      expect(cta).not.toBeNull();
      expect(ctaRiesgo).not.toBeNull();
      expect(cta?.getAttribute('href')).toContain('/admin/certificaciones/nueva');
      expect(cta?.getAttribute('href')).toContain(`alumno=${alumno}`);
      expect(cta?.getAttribute('href')).toContain(`curso=${curso}`);
      expect(acciones?.textContent).toContain('certificado nuevo');
      expect(riesgo?.textContent).toContain('dar de alta nuevamente');
    });
  }

  it('no muestra Emitir nuevamente en certificado vigente', async () => {
    const f = await render('1');
    const el = f.nativeElement as HTMLElement;
    expect(el.querySelector('[data-testid="cta-emitir-nuevamente"]')).toBeNull();
  });

  it('botones deshabilitados en acciones tienen aria-disabled="true"', async () => {
    const f = await render('5');
    const el = f.nativeElement as HTMLElement;
    const acciones = el.querySelector('.acciones-panel');
    expect(acciones).not.toBeNull();
    const btns = acciones?.querySelectorAll('button[disabled]') || [];
    expect(btns.length).toBeGreaterThanOrEqual(2);
    for (const b of Array.from(btns)) {
      expect(b.getAttribute('aria-disabled')).toBe('true');
    }
  });

  // --- Secciones del expediente (paridad v0) ---

  it('muestra botón Volver a Certificaciones', async () => {
    const f = await render('1');
    const el = f.nativeElement as HTMLElement;
    const back = el.querySelector('[data-testid="volver-certificaciones"]') as HTMLAnchorElement;
    expect(back).toBeTruthy();
    expect(back.getAttribute('href')).toBe('/admin/certificaciones');
    expect(back.textContent).toMatch(/Volver a Certificaciones/i);
  });

  it('muestra encabezado con kicker, título (alumno) y badge de estado', async () => {
    const f = await render('1');
    const el = f.nativeElement as HTMLElement;
    const header = el.querySelector('.expediente-header');
    expect(header).not.toBeNull();
    expect(header?.querySelector('.kicker')?.textContent).toContain('Expediente');
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
    const rows = doc?.querySelectorAll('.doc-asistencia tbody tr') || [];
    expect(rows.length).toBe(3);
  });

  it('documento réplica muestra autoridades firmantes (solo lectura)', async () => {
    // Config explícita con nombres: el seed in-memory arranca sin autoridades.
    const config: InstitutionalConfigService = {
      obtener: () => Promise.resolve(configFixture()),
      guardar: () => Promise.reject(new Error('N/A')),
    };
    const f = await render('1', { config });
    const el = f.nativeElement as HTMLElement;
    const autoridades = el.querySelector('.doc-autoridades');
    expect(autoridades).not.toBeNull();
    expect(autoridades?.textContent).toContain('Firma digital verificada');
    expect(autoridades?.textContent).not.toContain('Autoridad Demo');
  });

  it('muestra QR real (img) en panel de validación', async () => {
    const f = await render('1');
    await f.whenStable();
    await new Promise((r) => setTimeout(r, 50));
    f.detectChanges();
    const el = f.nativeElement as HTMLElement;
    const qr = el.querySelector('.validacion-panel img.qr-real') as HTMLImageElement | null;
    expect(qr).not.toBeNull();
    expect(qr?.src).toMatch(/^blob:/);
    expect(el.querySelector('.qr-decorativo')).toBeNull();
  });

  // --- REQ-PAR-EXP: densidad visual P-12 ---

  it('REQ-PAR-EXP-001: kicker mono y ficha densificada con kickers de grupo', async () => {
    const f = await render('1');
    const el = f.nativeElement as HTMLElement;
    const kicker = el.querySelector('.kicker') as HTMLElement | null;
    expect(kicker?.textContent?.trim()).toBe('Expediente de certificación');
    expect(getComputedStyle(kicker!).fontFamily).toMatch(/mono/i);
    const ficha = el.querySelector('.ficha-expediente');
    expect(ficha?.querySelector('.group-kicker')?.textContent).toContain('Alumno');
    expect(ficha?.textContent).toContain('jornadas presentes');
    expect(ficha?.textContent).toContain('Trazabilidad administrativa');
    const fila = ficha?.querySelector('.fila-dato') as HTMLElement | null;
    expect(fila).not.toBeNull();
    const padL = parseFloat(getComputedStyle(fila!).paddingLeft);
    expect(padL).toBeGreaterThanOrEqual(14);
  });

  it('REQ-PAR-EXP-002: QR real en validación y note footer muted', async () => {
    const f = await render('1');
    await f.whenStable();
    await new Promise((r) => setTimeout(r, 50));
    f.detectChanges();
    const el = f.nativeElement as HTMLElement;
    const qr = el.querySelector('.validacion-panel img.qr-real');
    expect(qr).not.toBeNull();
    expect(el.querySelector('.qr-decorativo')).toBeNull();
    const note = el.querySelector('.validacion-panel .panel-note-footer');
    expect(note?.textContent).toContain('no contiene datos personales');
  });

  it('REQ-PAR-EXP-003: PDF primary ink; sin Entrega manual; Copiar/Descargar QR OK', async () => {
    const f = await render('1');
    const el = f.nativeElement as HTMLElement;
    expect(el.textContent).not.toContain('F6-03');
    const acciones = el.querySelector('.acciones-panel');
    const pdf = acciones?.querySelector('a.btn-pdf');
    expect(pdf?.textContent?.trim()).toBe('Descargar PDF');
    expect(acciones?.textContent).not.toContain('Entrega manual');
    expect(acciones?.textContent).not.toContain('Compartir');
    const copiar = Array.from(acciones?.querySelectorAll('button') || []).find((b) =>
      b.textContent?.includes('Copiar link'),
    );
    const descargarQr = Array.from(acciones?.querySelectorAll('button') || []).find((b) =>
      b.textContent?.includes('Descargar QR'),
    );
    expect((copiar as HTMLButtonElement).disabled).toBeFalse();
    expect((descargarQr as HTMLButtonElement).disabled).toBeFalse();
    const qrBtn = Array.from(el.querySelectorAll('.validacion-panel button') || []).find((b) =>
      b.textContent?.includes('Descargar QR'),
    );
    expect(qrBtn).toBeTruthy();
  });

  it('REQ-PAR-EXP-004: documento sin radius; firmas con SVG y copy v0', async () => {
    // Config explícita con nombres: el seed in-memory arranca sin autoridades.
    const config: InstitutionalConfigService = {
      obtener: () => Promise.resolve(configFixture()),
      guardar: () => Promise.reject(new Error('N/A')),
    };
    const f = await render('1', { config });
    const el = f.nativeElement as HTMLElement;
    const doc = el.querySelector('.documento-replica') as HTMLElement;
    expect(getComputedStyle(doc).borderRadius).toMatch(/^0px$/);
    const firmas = el.querySelector('.doc-autoridades');
    expect(firmas?.querySelectorAll('svg.doc-firma-icon').length).toBe(2);
    expect(firmas?.textContent).toContain('Firma digital verificada');
  });

  it('zona de riesgo visible con enlace activo de revocación', async () => {
    const f = await render('1');
    const el = f.nativeElement as HTMLElement;
    const riesgo = el.querySelector('.riesgo-panel');
    expect(riesgo).not.toBeNull();
    expect(riesgo?.querySelector('a.btn-revocar')).not.toBeNull();
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
    const volver = el.querySelector('[data-testid="volver-certificaciones"]');
    expect(volver).not.toBeNull();
    expect((volver as HTMLAnchorElement).getAttribute('href')).toBe('/admin/certificaciones');
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
    expect(el.textContent).not.toMatch(
      /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i,
    );
  });

  it('muestra documentMasked (DNI completo ficticio) en la ficha', async () => {
    const f = await render('1');
    const el = f.nativeElement as HTMLElement;
    expect(el.textContent).toMatch(/\b12345678\b/);
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
    expect(el.querySelector('#cert-title')?.textContent).toContain('Alumno Demo Uno');
    f.componentRef.setInput('id', '2');
    f.detectChanges();
    await f.whenStable();
    f.detectChanges();
    expect(f.componentInstance.detalle()?.id).toBe(2);
    expect(f.componentInstance.detalle()?.cursoNombre).toBe(
      'Curso de herramientas administrativas',
    );
    expect(el.querySelector('#cert-title')?.textContent).toContain('Alumno Demo Dos');
    expect(el.textContent).not.toContain('Curso de introducción a la gestión');
    expect(el.textContent).not.toContain('Alumno Demo Uno');
    expect(el.textContent).toContain('Alumno Demo Dos');
  });

  it('route reuse: navegar a id inválido limpia detalle sin retener datos previos', async () => {
    const f = await render('1');
    const el = f.nativeElement as HTMLElement;
    expect(f.componentInstance.detalle()?.id).toBe(1);
    expect(el.querySelector('#cert-title')?.textContent).toContain('Alumno Demo Uno');
    f.componentRef.setInput('id', 'abc');
    f.detectChanges();
    await f.whenStable();
    f.detectChanges();
    expect(f.componentInstance.detalle()).toBeNull();
    expect(f.componentInstance.error()).toContain('no encontrada');
    expect(el.querySelector('.estado-error')?.textContent).toContain(
      'Certificación no encontrada',
    );
    expect(el.querySelector('#cert-title')).toBeNull();
    expect(el.textContent).not.toContain('Curso de introducción a la gestión');
    expect(el.textContent).not.toContain('Alumno Demo Uno');
  });

  it('route reuse: carga stale no sobrescribe pantalla vigente (out-of-order)', async () => {
    const pending = new Map<number, { resolve: (v: unknown) => void }>();

    const fakeCerts: CertificationsService = {
      listar: () => Promise.resolve([]),
      contar: () => Promise.resolve(0),
      revocar: () => Promise.resolve(),
      emitir: () => Promise.reject(new Error('N/A')),
      obtenerEntregaManual: (id) => Promise.resolve(entregaFixture(id)),
      descargarQrPng: () => Promise.resolve(new Blob()),
      descargarPdf: () => Promise.resolve(new Blob(['%PDF'], { type: 'application/pdf' })),
      regenerarPdf: () => Promise.resolve({ regenerado: false }),
      obtener: (id: number) =>
        new Promise<CertificacionDetalle>((resolve) => {
          pending.set(id, { resolve: resolve as (v: unknown) => void });
        }),
    };

    // No usar render(): whenStable colgaría mientras obtener() sigue pendiente.
    await TestBed.configureTestingModule({
      imports: [CertificationPreviewPage],
      providers: [
        provideRouter([]),
        { provide: CERTIFICATIONS_SOURCE, useValue: fakeCerts },
        {
          provide: INSTITUTIONAL_CONFIG_SOURCE,
          useValue: new InMemoryInstitutionalConfigService(),
        },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(CertificationPreviewPage);
    fixture.componentRef.setInput('id', '1');
    fixture.detectChanges();
    expect(pending.has(1)).toBe(true);

    fixture.componentRef.setInput('id', '2');
    fixture.detectChanges();
    expect(pending.has(2)).toBe(true);

    pending.get(2)!.resolve(
      detalleFixture({
        id: 2,
        nombreAlumno: 'Alumno Demo Dos',
        cursoNombre: 'Curso de herramientas administrativas',
        tokenPrefix: 'prefijo_demo_c2d',
        publicValidationUrl: 'https://ifrm/validar/prefijo_demo_c2d…',
        attendedDates: ['2026-04-05', '2026-04-12'],
        auditEvents: [{ at: '2026-04-05', accion: 'emision', detalle: 'Emisión mock.' }],
      }),
    );
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(fixture.componentInstance.detalle()?.id).toBe(2);

    pending.get(1)!.resolve(
      detalleFixture({
        id: 1,
        nombreAlumno: 'Alumno Demo Uno',
        cursoNombre: 'Curso de introducción a la gestión',
        attendedDates: ['2026-03-02', '2026-03-09', '2026-03-16'],
        auditEvents: [{ at: '2026-03-01', accion: 'emision', detalle: 'Emisión mock.' }],
      }),
    );
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.componentInstance.detalle()?.id).toBe(2);
    expect(fixture.componentInstance.detalle()?.cursoNombre).toBe(
      'Curso de herramientas administrativas',
    );

    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('#cert-title')?.textContent).toContain('Alumno Demo Dos');
    expect(el.textContent).toContain('Alumno Demo Dos');
    expect(el.textContent).toContain('prefijo_demo_c2d');
    expect(el.textContent).not.toContain('Curso de introducción a la gestión');
    expect(el.textContent).not.toContain('Alumno Demo Uno');
    expect(el.textContent).not.toContain('prefijo_demo_a1b');
  });

  // --- Handoffs cerrados ---

  it('handoff de PDF F4-02 ejecutado: CTAs PDF son enlaces (sin handoff visible)', async () => {
    const f = await render('1');
    const el = f.nativeElement as HTMLElement;
    const acciones = el.querySelector('.acciones-panel');
    const pdfLinks = Array.from(acciones?.querySelectorAll('a') || []).filter((a) =>
      a.textContent?.includes('PDF'),
    );
    expect(pdfLinks.length).toBe(1);
  });

  it('REQ-CPREV-007: panel de validación ya no menciona F6-03', async () => {
    const f = await render('1');
    const el = f.nativeElement as HTMLElement;
    const validacion = el.querySelector('.validacion-panel');
    expect(validacion?.textContent).not.toContain('F6-03');
  });

  it('handoff de revocación F6-01 ejecutado: CTA es enlace a /revocar', async () => {
    const f = await render('1');
    const el = f.nativeElement as HTMLElement;
    const riesgo = el.querySelector('.riesgo-panel');
    const revocarLink = riesgo?.querySelector('a.btn-revocar');
    expect(revocarLink).not.toBeNull();
    expect(riesgo?.textContent).not.toContain('F6-01');
  });

  // --- P6-02: Regeneración de PDF ---

  it('P6-02: botón "Regenerar PDF" llama a regenerarPdf() y muestra resultado ok', async () => {
    const f = await render('1');
    const el = f.nativeElement as HTMLElement;
    const acciones = el.querySelector('.acciones-panel');
    const regenerarBtn = Array.from(acciones?.querySelectorAll('button') || []).find(
      (b) => b.textContent?.includes('Regenerar PDF'),
    );
    expect(regenerarBtn).toBeTruthy();
    (regenerarBtn as HTMLElement | undefined)?.click();
    f.detectChanges();
    await f.whenStable();
    f.detectChanges();
    const ok = el.querySelector('.regeneracion-ok');
    expect(ok).not.toBeNull();
    expect(ok?.textContent).toContain('regenerado');
  });

  it('P6-02: regeneración con regenerado=false muestra "El PDF ya está actualizado"', async () => {
    const fakeCerts: CertificationsService = {
      listar: () => Promise.resolve([]),
      contar: () => Promise.resolve(0),
      revocar: () => Promise.resolve(),
      emitir: () => Promise.reject(new Error('N/A')),
      obtenerEntregaManual: (id) => Promise.resolve(entregaFixture(id)),
      obtener: (id) => Promise.resolve(detalleFixture({ id })),
      descargarQrPng: () => Promise.resolve(new Blob()),
      descargarPdf: () => Promise.resolve(new Blob(['%PDF'], { type: 'application/pdf' })),
      regenerarPdf: () =>
        Promise.resolve({ regenerado: false, mensaje: 'El PDF ya está actualizado.' }),
    };

    const fixture = await render('1', { certs: fakeCerts });
    const el = fixture.nativeElement as HTMLElement;
    const regenerarBtn = Array.from(
      el.querySelectorAll('.acciones-panel button') || [],
    ).find((b) => b.textContent?.includes('Regenerar PDF'));
    (regenerarBtn as HTMLElement | undefined)?.click();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const info = el.querySelector('.regeneracion-info');
    expect(info).not.toBeNull();
    expect(info?.textContent).toContain('El PDF ya está actualizado');
  });

  it('P6-02: regeneración con error muestra mensaje descriptivo', async () => {
    const fakeCerts: CertificationsService = {
      listar: () => Promise.resolve([]),
      contar: () => Promise.resolve(0),
      revocar: () => Promise.resolve(),
      emitir: () => Promise.reject(new Error('N/A')),
      obtenerEntregaManual: (id) => Promise.resolve(entregaFixture(id)),
      obtener: (id) => Promise.resolve(detalleFixture({ id })),
      descargarQrPng: () => Promise.resolve(new Blob()),
      descargarPdf: () => Promise.resolve(new Blob(['%PDF'], { type: 'application/pdf' })),
      regenerarPdf: () => Promise.reject(new Error('Error de servidor')),
    };

    const fixture = await render('1', { certs: fakeCerts });
    const el = fixture.nativeElement as HTMLElement;
    const regenerarBtn = Array.from(
      el.querySelectorAll('.acciones-panel button') || [],
    ).find((b) => b.textContent?.includes('Regenerar PDF'));
    (regenerarBtn as HTMLElement | undefined)?.click();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const error = el.querySelector('.regeneracion-error');
    expect(error).not.toBeNull();
    expect(error?.textContent).toContain('Error de servidor');
  });

  it('P6-02: botón "Regenerar PDF" muestra estado loading mientras regenera', async () => {
    let resolveRegen: (v: RegenerarPdfResult) => void = () => {};
    const pending = new Promise<RegenerarPdfResult>((r) => {
      resolveRegen = r;
    });
    const fakeCerts: CertificationsService = {
      listar: () => Promise.resolve([]),
      contar: () => Promise.resolve(0),
      revocar: () => Promise.resolve(),
      emitir: () => Promise.reject(new Error('N/A')),
      obtenerEntregaManual: (id) => Promise.resolve(entregaFixture(id)),
      obtener: (id) => Promise.resolve(detalleFixture({ id })),
      descargarQrPng: () => Promise.resolve(new Blob()),
      descargarPdf: () => Promise.resolve(new Blob(['%PDF'], { type: 'application/pdf' })),
      regenerarPdf: () => pending,
    };

    const fixture = await render('1', { certs: fakeCerts });
    const el = fixture.nativeElement as HTMLElement;
    const regenerarBtn = Array.from(
      el.querySelectorAll('.acciones-panel button') || [],
    ).find((b) => b.textContent?.includes('Regenerar PDF'));
    (regenerarBtn as HTMLElement | undefined)?.click();
    fixture.detectChanges();
    const loadingBtn = Array.from(
      el.querySelectorAll('.acciones-panel button') || [],
    ).find((b) => b.textContent?.includes('Regenerando'));
    expect(loadingBtn).toBeTruthy();
    expect(loadingBtn?.getAttribute('disabled')).toBe('');
    expect(loadingBtn?.getAttribute('aria-disabled')).toBe('true');

    resolveRegen({ regenerado: true, publicValidationUrl: 'https://demo/validar/x' });
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  });
});
