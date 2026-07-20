import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CertificationDeliveryPage } from './certification-delivery-page';
import { provideRouter } from '@angular/router';
import { CERTIFICATIONS_SOURCE, CertificationsService } from '../../certifications.service';
import { InMemoryCertificationsService } from '../../in-memory-certifications.service';
import { EntregaManualDto } from '../../certifications.models';

describe('CertificationDeliveryPage', () => {
  let component: CertificationDeliveryPage;
  let fixture: ComponentFixture<CertificationDeliveryPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CertificationDeliveryPage],
      providers: [
        provideRouter([]),
        { provide: CERTIFICATIONS_SOURCE, useClass: InMemoryCertificationsService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CertificationDeliveryPage);
    component = fixture.componentInstance;
    // mock input binding: id = '1'
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
    expect(d).toBe('15/03/2024'); // default de 'es-AR'
  });

  it('should download PDF via service Blob (REQ-PAR-DEL-001)', async () => {
    await fixture.whenStable();
    fixture.detectChanges();

    const fakeBlob = new Blob(['%PDF-mock'], { type: 'application/pdf' });
    const svc = TestBed.inject(CERTIFICATIONS_SOURCE);
    const pdfSpy = spyOn(svc, 'descargarPdf').and.resolveTo(fakeBlob);
    const createUrlSpy = spyOn(URL, 'createObjectURL').and.returnValue('blob:fake-pdf');
    const revokeSpy = spyOn(URL, 'revokeObjectURL');
    const clickSpy = spyOn(HTMLAnchorElement.prototype, 'click');

    await component.descargarPdf();

    expect(pdfSpy).toHaveBeenCalledWith(1);
    expect(createUrlSpy).toHaveBeenCalled();
    expect(clickSpy).toHaveBeenCalled();
    expect(revokeSpy).toHaveBeenCalledWith('blob:fake-pdf');
    expect(component.descargando()).toBeFalse();
    expect(component.descargado()).toBeTrue();
  });

  it('PDF filename is semantic: cert-{codigo}.pdf', async () => {
    await fixture.whenStable();
    fixture.detectChanges();

    const svc = TestBed.inject(CERTIFICATIONS_SOURCE);
    spyOn(svc, 'descargarPdf').and.resolveTo(new Blob(['x'], { type: 'application/pdf' }));
    spyOn(URL, 'createObjectURL').and.returnValue('blob:fake');
    spyOn(URL, 'revokeObjectURL');

    let downloadedName = '';
    spyOn(HTMLAnchorElement.prototype, 'click').and.callFake(function (this: HTMLAnchorElement) {
      downloadedName = this.download;
    });

    await component.descargarPdf();
    expect(downloadedName).toBe('cert-IFTS14-CERT-0001.pdf');
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
      configurable: true
    });

    await component.copiarLink();

    // Debería cambiar el estado
    expect(component.copiado()).toBeTrue();

    // Esperar a que se restaure el estado (2600ms)
    await new Promise((r) => setTimeout(r, 2700));
    fixture.detectChanges();

    expect(component.copiado()).toBeFalse();

    Object.defineProperty(navigator, 'clipboard', {
      value: originalClipboard,
      configurable: true
    });
  });

  it('should fallback to execCommand when clipboard API unavailable (REQ-DEL-003)', async () => {
    await fixture.whenStable();
    fixture.detectChanges();

    // Simular navegador sin Clipboard API
    const originalClipboard = navigator.clipboard;
    Object.defineProperty(navigator, 'clipboard', {
      value: undefined,
      configurable: true
    });
    const execSpy = spyOn(document, 'execCommand').and.callFake(() => true);

    await component.copiarLink();

    expect(execSpy).toHaveBeenCalledWith('copy');
    expect(component.copiado()).toBeTrue();

    await new Promise((r) => setTimeout(r, 2700));

    Object.defineProperty(navigator, 'clipboard', {
      value: originalClipboard,
      configurable: true
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

  it('REQ-QR-002: error de QR es inline y no limpia el diálogo', async () => {
    await fixture.whenStable();
    fixture.detectChanges();
    const svc = TestBed.inject(CERTIFICATIONS_SOURCE);
    spyOn(svc, 'descargarQrPng').and.rejectWith(new Error('QR no disponible: 500'));

    await component.descargarQr();
    fixture.detectChanges();

    expect(component.qrError()).toContain('QR no disponible');
    expect(component.error()).toBe('');
    expect(component.detalle()).toBeTruthy();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('[role="dialog"]')).not.toBeNull();
    expect(el.querySelector('[role="alert"]')?.textContent).toContain('QR no disponible');
  });

  it('should detect PDF outdated and show regenerar message (REQ-DEL-004, REQ-DEL-005)', async () => {
    // Cert id 4 tiene pdfStatus 'outdated' en el mock
    fixture.componentRef.setInput('id', '4');
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(component.pdfOutdated()).toBeTrue();

    component.volverARegenerarPdf();
    expect(component.regenerarMsg()).toContain('regeneración');
    expect(component.regenerarMsg()).toContain('backend');
  });

  it('should NOT show PDF outdated when status is valid', async () => {
    await fixture.whenStable();
    fixture.detectChanges();

    expect(component.pdfOutdated()).toBeFalse();
  });
});