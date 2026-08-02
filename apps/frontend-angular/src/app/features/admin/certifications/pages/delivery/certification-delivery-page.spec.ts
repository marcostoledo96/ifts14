import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { CertificationDeliveryPage } from './certification-delivery-page';
import { provideRouter, Router } from '@angular/router';
import { CERTIFICATIONS_SOURCE } from '../../certifications.service';
import { InMemoryCertificationsService } from '../../in-memory-certifications.service';
import { EntregaManualDto } from '../../certifications.models';
import { resetMockAdminPublicStatus } from '../../../../../shared/certificates/mock-tokens';

describe('CertificationDeliveryPage', () => {
  let component: CertificationDeliveryPage;
  let fixture: ComponentFixture<CertificationDeliveryPage>;

  beforeEach(async () => {
    resetMockAdminPublicStatus();
    await TestBed.configureTestingModule({
      imports: [CertificationDeliveryPage],
      providers: [
        provideRouter([]),
        { provide: CERTIFICATIONS_SOURCE, useClass: InMemoryCertificationsService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CertificationDeliveryPage);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('id', '1');
    fixture.detectChanges();
  });

  it('should create and load data', async () => {
    expect(component).toBeTruthy();

    await fixture.whenStable();
    fixture.detectChanges();

    expect(component.cargando()).toBeFalse();
    expect(component.detalle()).toBeTruthy();
    expect(component.detalle()?.numero).toContain('IFTS14');
  });

  it('should load EntregaManualDto with canonical URL (REQ-DEL-001)', async () => {
    await fixture.whenStable();
    fixture.detectChanges();

    const entrega = component.entrega();
    expect(entrega).toBeTruthy();
    expect(entrega?.publicValidationUrl).toContain('ifts14.edu.ar');
    expect(entrega?.publicValidationUrl).toContain('validar/');
    expect(entrega?.tokenPrefix).toContain('prefijo_demo');
  });

  it('validarUrl returns canonical URL from DTO, not hardcode', async () => {
    await fixture.whenStable();
    fixture.detectChanges();

    const url = component.validarUrl();
    expect(url).toBe(component.entrega()?.publicValidationUrl ?? '');
  });

  it('should show full fictional DNI in admin UI (Rule D0)', async () => {
    await fixture.whenStable();
    fixture.detectChanges();

    const dni = component.alumnoDniEnmascarado();
    expect(dni).toMatch(/^\d{7,8}$/);
    expect(dni).toBe('12345678');
  });

  it('should format dates correctly', () => {
    const d = component.formatearFecha('2024-03-15');
    expect(d).toBe('15/03/2024');
  });

  it('should navigate to folio /pdf?descargar=1 (mismo diseño institucional)', async () => {
    await fixture.whenStable();
    fixture.detectChanges();

    const svc = TestBed.inject(CERTIFICATIONS_SOURCE);
    const pdfSpy = spyOn(svc, 'descargarPdf');
    const router = TestBed.inject(Router);
    const navSpy = spyOn(router, 'navigate').and.resolveTo(true);

    await component.descargarPdf();

    expect(pdfSpy).not.toHaveBeenCalled();
    expect(navSpy).toHaveBeenCalledWith(['/admin/certificaciones', 1, 'pdf'], {
      queryParams: { descargar: '1' },
    });
    expect(component.descargando()).toBeFalse();
    expect(component.descargado()).toBeTrue();
  });

  it('navigate=false: folio ?descargar=1 sin mutar location ni Blob', async () => {
    await fixture.whenStable();
    fixture.detectChanges();

    const svc = TestBed.inject(CERTIFICATIONS_SOURCE);
    const pdfSpy = spyOn(svc, 'descargarPdf');
    const router = TestBed.inject(Router);
    const navSpy = spyOn(router, 'navigate');

    const url = await component.descargarPdf({ navigate: false });

    expect(pdfSpy).not.toHaveBeenCalled();
    expect(navSpy).not.toHaveBeenCalled();
    expect(url).toContain('/admin/certificaciones/1/pdf');
    expect(url).toContain('descargar=1');
    expect(component.descargado()).toBeTrue();
  });

  it('PDF download route uses expediente id (IFTS14-CERT-NNNN)', async () => {
    await fixture.whenStable();
    fixture.detectChanges();

    const router = TestBed.inject(Router);
    const navSpy = spyOn(router, 'navigate').and.resolveTo(true);

    await component.descargarPdf();
    expect(navSpy).toHaveBeenCalledWith(['/admin/certificaciones', 1, 'pdf'], {
      queryParams: { descargar: '1' },
    });
    expect(component.pdfFilename()).toBe('cert-IFTS14-CERT-0001.pdf');
  });

  it('footer has Copiar + PDF + Cancelar; QR outside footer (REQ-PAR-DEL-001)', async () => {
    await fixture.whenStable();
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const footer = el.querySelector('.dialog-footer .actions');
    expect(footer?.textContent).toContain('Copiar link');
    expect(footer?.textContent).toContain('Descargar PDF');
    expect(footer?.textContent).toContain('Cancelar');
    expect(footer?.textContent).not.toContain('Descargar QR');
    const qrBtn = Array.from(el.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Descargar QR'),
    );
    expect(qrBtn).toBeTruthy();
    expect(footer?.contains(qrBtn as Node)).toBeFalse();
  });

  it('should copy link via navigator.clipboard and show feedback (REQ-DEL-003)', async () => {
    await fixture.whenStable();
    fixture.detectChanges();

    const originalClipboard = navigator.clipboard;
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: jasmine.createSpy('writeText').and.returnValue(Promise.resolve()) },
      configurable: true,
    });

    await component.copiarLink();

    expect(component.copiado()).toBeTrue();

    await new Promise((r) => setTimeout(r, 2700));
    fixture.detectChanges();

    expect(component.copiado()).toBeFalse();

    Object.defineProperty(navigator, 'clipboard', {
      value: originalClipboard,
      configurable: true,
    });
  });

  it('should fallback to execCommand when clipboard API unavailable (REQ-DEL-003)', async () => {
    await fixture.whenStable();
    fixture.detectChanges();

    const originalClipboard = navigator.clipboard;
    Object.defineProperty(navigator, 'clipboard', {
      value: undefined,
      configurable: true,
    });
    const execSpy = spyOn(document, 'execCommand').and.callFake(() => true);

    await component.copiarLink();

    expect(execSpy).toHaveBeenCalledWith('copy');
    expect(component.copiado()).toBeTrue();

    await new Promise((r) => setTimeout(r, 2700));

    Object.defineProperty(navigator, 'clipboard', {
      value: originalClipboard,
      configurable: true,
    });
  });

  it('should download QR via service Blob → createObjectURL (REQ-QR-002)', async () => {
    await fixture.whenStable();
    fixture.detectChanges();

    const fakeBlob = new Blob(['fake-qr-png'], { type: 'image/png' });
    const svc = TestBed.inject(CERTIFICATIONS_SOURCE);
    const qrSpy = spyOn(svc, 'descargarQrPng').and.resolveTo(fakeBlob);
    const createUrlSpy = spyOn(URL, 'createObjectURL').and.returnValue('blob:fake-qr');
    const revokeSpy = spyOn(URL, 'revokeObjectURL');
    const clickSpy = spyOn(HTMLAnchorElement.prototype, 'click');

    await component.descargarQr();

    expect(qrSpy).toHaveBeenCalledWith(1);
    expect(createUrlSpy).toHaveBeenCalled();
    expect(clickSpy).toHaveBeenCalled();
    expect(revokeSpy).toHaveBeenCalledWith('blob:fake-qr');
    expect(component.qrDescargando()).toBeFalse();
    expect(component.qrError()).toBe('');
  });

  it('QR filename is semantic: cert-{codigo}-qr.png (REQ-QR-002)', async () => {
    await fixture.whenStable();
    fixture.detectChanges();

    const svc = TestBed.inject(CERTIFICATIONS_SOURCE);
    spyOn(svc, 'descargarQrPng').and.resolveTo(new Blob(['x'], { type: 'image/png' }));
    spyOn(URL, 'createObjectURL').and.returnValue('blob:fake');
    spyOn(URL, 'revokeObjectURL');

    let downloadedName = '';
    spyOn(HTMLAnchorElement.prototype, 'click').and.callFake(function (this: HTMLAnchorElement) {
      downloadedName = this.download;
    });

    await component.descargarQr();

    expect(downloadedName).toBe('cert-IFTS14-CERT-0001-qr.png');
  });

  it('REQ-QR-001: botón Descargar QR visible con aria-label', async () => {
    await fixture.whenStable();
    fixture.detectChanges();
    const btn = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll('button'),
    ).find((b) => b.textContent?.includes('Descargar QR'));
    expect(btn).toBeTruthy();
    expect((btn as HTMLButtonElement).disabled).toBeFalse();
    expect(btn?.getAttribute('aria-label')).toContain('QR');
  });

  it('REQ-QR-002 / P20: error de QR es genérico sin raw ni errorRecuperable', async () => {
    await fixture.whenStable();
    fixture.detectChanges();
    const svc = TestBed.inject(CERTIFICATIONS_SOURCE);
    spyOn(svc, 'descargarQrPng').and.rejectWith(new Error('QR no disponible: 500 RAW_LEAK'));

    await component.descargarQr();
    fixture.detectChanges();

    expect(component.qrError()).toBe('No se pudo descargar el QR.');
    expect(component.qrError()).not.toContain('RAW_LEAK');
    expect(component.error()).toBe('');
    expect(component.errorRecuperable()).toBeFalse();
    expect(component.detalle()).toBeTruthy();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('[role="dialog"]')).not.toBeNull();
    expect(el.textContent).not.toContain('Reintentar');
  });

  it('P20: fallo PDF handoff usa genérico sin raw ni errorRecuperable', async () => {
    await fixture.whenStable();
    fixture.detectChanges();
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.rejectWith(new Error('NAV_FAIL_SECRET_xyz'));

    await component.descargarPdf();
    fixture.detectChanges();

    expect(component.qrError()).toBe('No se pudo descargar el PDF.');
    expect(component.qrError()).not.toContain('NAV_FAIL');
    expect(component.errorRecuperable()).toBeFalse();
  });

  it('P20: 409 soft — ficha + bedelía copy; Copiar/QR off; sin Reintentar', async () => {
    const svc = TestBed.inject(CERTIFICATIONS_SOURCE);
    spyOn(svc, 'obtenerEntregaManual').and.rejectWith(
      new HttpErrorResponse({
        status: 409,
        error: { error: { code: 'TOKEN_NOT_RECOVERABLE', message: 'cipher leak' } },
      }),
    );

    fixture.componentRef.setInput('id', '1');
    await component.cargar();
    fixture.detectChanges();

    expect(component.detalle()).toBeTruthy();
    expect(component.entrega()).toBeNull();
    expect(component.entregaError()).toContain('enlace de validación');
    expect(component.entregaError()).toContain('contactá a sistemas');
    expect(component.entregaError()).not.toContain('token_cipher_key');
    expect(component.entregaError()).not.toContain('cipher leak');
    expect(component.error()).toBe('');
    expect(component.errorRecuperable()).toBeFalse();
    expect(component.validarUrl()).toBe('');

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Alumno Demo Uno');
    expect(el.textContent).not.toContain('Reintentar');
    const copiar = Array.from(el.querySelectorAll('button')).find((b) =>
      (b.textContent || '').includes('Copiar link'),
    ) as HTMLButtonElement | undefined;
    const qr = Array.from(el.querySelectorAll('button')).find((b) =>
      (b.textContent || '').includes('Descargar QR'),
    ) as HTMLButtonElement | undefined;
    expect(copiar?.disabled).toBeTrue();
    expect(qr?.disabled).toBeTrue();
  });

  it('P20 honesty: raw obtener → mensaje fijo + Reintentar', async () => {
    const svc = TestBed.inject(CERTIFICATIONS_SOURCE);
    spyOn(svc, 'obtener').and.rejectWith(new Error('RAW_BACKEND_STACK_TRACE_xyz'));

    await component.cargar();
    fixture.detectChanges();

    expect(component.error()).toBe('No se pudo cargar la certificación.');
    expect(component.error()).not.toContain('RAW_BACKEND');
    expect(component.errorRecuperable()).toBeTrue();
    expect(component.detalle()).toBeNull();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Reintentar');
  });

  it('P20 honesty: not-found sin Reintentar', async () => {
    fixture.componentRef.setInput('id', '99999');
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(component.error()).toBe('Certificación no encontrada.');
    expect(component.errorRecuperable()).toBeFalse();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).not.toContain('Reintentar');
  });

  it('P20 honesty: id inválido sin Reintentar', async () => {
    fixture.componentRef.setInput('id', '0x1');
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(component.error()).toBe('Certificación no encontrada.');
    expect(component.errorRecuperable()).toBeFalse();
    expect((fixture.nativeElement as HTMLElement).textContent).not.toContain('Reintentar');
  });

  it('should detect PDF outdated and wire regenerarPdf sin URL leak (REQ-DEL-004/005)', async () => {
    fixture.componentRef.setInput('id', '4');
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(component.pdfOutdated()).toBeTrue();

    const svc = TestBed.inject(CERTIFICATIONS_SOURCE);
    const leakUrl = 'https://ifts14.edu.ar/certificados/validar/FULLTOKEN_LEAK_abc';
    const regenSpy = spyOn(svc, 'regenerarPdf').and.resolveTo({
      regenerado: true,
      publicValidationUrl: leakUrl,
      pdfStatus: 'valid',
    });
    const entregaAfter: EntregaManualDto = {
      certificadoId: 4,
      publicValidationUrl: 'https://ifts14.edu.ar/certificados/validar/prefijo_demo_g4h-completo',
      pdfDownloadUrl: '4/pdf',
      tokenPrefix: 'prefijo_demo_g4h',
      pdfAvailable: false,
      pdfStatus: 'valid',
    };
    const entregaSpy = spyOn(svc, 'obtenerEntregaManual').and.resolveTo(entregaAfter);

    await component.volverARegenerarPdf();
    fixture.detectChanges();

    expect(regenSpy).toHaveBeenCalledWith(4);
    expect(entregaSpy).toHaveBeenCalledWith(4);
    expect(component.regenerarMsg()).toBe('El PDF se regeneró correctamente.');
    expect(component.regenerarMsg()).not.toContain('FULLTOKEN');
    expect(component.regenerarMsg()).not.toContain('validar/');
    expect(component.pdfOutdated()).toBeFalse();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).not.toContain('FULLTOKEN_LEAK');
  });

  it('P20: fallo regen usa mensajeErrorApi sin raw ni errorRecuperable', async () => {
    fixture.componentRef.setInput('id', '4');
    fixture.detectChanges();
    await fixture.whenStable();

    const svc = TestBed.inject(CERTIFICATIONS_SOURCE);
    spyOn(svc, 'regenerarPdf').and.rejectWith(new Error('REGEN_RAW_FAIL'));

    await component.volverARegenerarPdf();
    fixture.detectChanges();

    expect(component.regenerarMsg()).toBe('No se pudo regenerar el PDF.');
    expect(component.regenerarMsg()).not.toContain('REGEN_RAW');
    expect(component.errorRecuperable()).toBeFalse();
  });

  it('P20: post-regen 409 soft — éxito regen + bedelía sin cipher leak', async () => {
    fixture.componentRef.setInput('id', '4');
    fixture.detectChanges();
    await fixture.whenStable();

    const svc = TestBed.inject(CERTIFICATIONS_SOURCE);
    spyOn(svc, 'regenerarPdf').and.resolveTo({ regenerado: true, pdfStatus: 'valid' });
    spyOn(svc, 'obtenerEntregaManual').and.rejectWith(
      new HttpErrorResponse({
        status: 409,
        error: { error: { code: 'TOKEN_NOT_RECOVERABLE', message: 'cipher leak' } },
      }),
    );

    await component.volverARegenerarPdf();
    fixture.detectChanges();

    expect(component.regenerarMsg()).toBe('El PDF se regeneró correctamente.');
    expect(component.entrega()).toBeNull();
    expect(component.entregaError()).toContain('enlace de validación');
    expect(component.entregaError()).not.toContain('cipher leak');
    expect(component.entregaError()).not.toContain('token_cipher_key');
    expect(component.errorRecuperable()).toBeFalse();
  });

  it('should NOT show PDF outdated when status is valid', async () => {
    await fixture.whenStable();
    fixture.detectChanges();

    expect(component.pdfOutdated()).toBeFalse();
  });

  it('D0 anti-token: DNI completo; toasts/post-regen sin URL/token completo filtrado', async () => {
    await fixture.whenStable();
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('12345678');
    // Link canónico en ficha es intencional (entrega); D0 aplica a toasts/post-regen.
    expect(component.qrError()).toBe('');
    expect(component.regenerarMsg()).toBe('');
    expect(component.regenerarMsg()).not.toContain('validar/');
  });

  it('REQ-DEL-007: backdrop fuera del tab order; Tab envuelve dentro de #dialog', async () => {
    await fixture.whenStable();
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const backdrop = el.querySelector('.backdrop') as HTMLElement | null;
    expect(backdrop).not.toBeNull();
    expect(backdrop?.getAttribute('tabindex')).toBeNull();
    expect(backdrop?.getAttribute('aria-hidden')).toBe('true');

    const dialog = el.querySelector('#dialog') as HTMLElement;
    expect(dialog).not.toBeNull();
    const focusables = Array.from(
      dialog.querySelectorAll<HTMLElement>(
        'a[href], button:not(:disabled), textarea, input, select, [tabindex]:not([tabindex="-1"])',
      ),
    ).filter((n) => n.tabIndex >= 0 || n.tagName === 'BUTTON' || n.tagName === 'A');
    expect(focusables.length).toBeGreaterThan(1);

    const last = focusables[focusables.length - 1];
    last.focus();
    const tab = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true });
    Object.defineProperty(tab, 'shiftKey', { value: false });
    spyOn(tab, 'preventDefault').and.callThrough();
    component.onTab(tab);
    expect(tab.preventDefault).toHaveBeenCalled();
    expect(document.activeElement).toBe(focusables[0]);
    expect(document.activeElement).not.toBe(backdrop);
  });

  it('REQ-DEL-007: error-dialog atrapa Tab y Esc navega al expediente', async () => {
    const svc = TestBed.inject(CERTIFICATIONS_SOURCE);
    spyOn(svc, 'obtener').and.rejectWith(new Error('RAW_BACKEND_STACK_TRACE_xyz'));
    await component.cargar();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    const dialog = el.querySelector('#dialog') as HTMLElement | null;
    expect(dialog).not.toBeNull();
    expect(dialog?.getAttribute('aria-modal')).toBe('true');
    expect(dialog?.getAttribute('tabindex')).toBe('-1');
    expect(el.textContent).toContain('Reintentar');

    const focusables = Array.from(
      dialog!.querySelectorAll<HTMLElement>('button:not(:disabled)'),
    );
    expect(focusables.length).toBeGreaterThanOrEqual(2);
    focusables[focusables.length - 1].focus();
    const tab = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true });
    Object.defineProperty(tab, 'shiftKey', { value: false });
    spyOn(tab, 'preventDefault').and.callThrough();
    component.onTab(tab);
    expect(tab.preventDefault).toHaveBeenCalled();
    expect(document.activeElement).toBe(focusables[0]);

    const router = TestBed.inject(Router);
    const navSpy = spyOn(router, 'navigate').and.resolveTo(true);
    component.volverAlExpediente();
    expect(navSpy).toHaveBeenCalledWith(['/admin/certificaciones', '1']);
  });
});
