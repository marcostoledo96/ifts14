import { ComponentFixture, TestBed, fakeAsync, tick, flushMicrotasks } from '@angular/core/testing';
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

  it('should mask DNI for privacy (Rule D0)', async () => {
    await fixture.whenStable();
    fixture.detectChanges();

    const maskedDni = component.alumnoDniEnmascarado();
    expect(maskedDni).toContain('****');
  });

  it('should format dates correctly', () => {
    const d = component.formatearFecha('2024-03-15');
    expect(d).toBe('15/03/2024'); // default de 'es-AR'
  });

  it('should simulate PDF download', fakeAsync(() => {
    const openSpy = spyOn(window, 'open');
    void component.descargarPdf();
    flushMicrotasks(); // resolve the initial synchronous parts if any
    expect(component.descargando()).toBeTrue();
    expect(component.descargado()).toBeFalse();

    tick(700);

    expect(component.descargando()).toBeFalse();
    expect(component.descargado()).toBeTrue();
    expect(openSpy).toHaveBeenCalledWith(jasmine.stringMatching(/pdf/), '_blank');
  }));

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

  it('should download QR via fetch → Blob → createObjectURL (REQ-DEL-002)', async () => {
    await fixture.whenStable();
    fixture.detectChanges();

    const fakeBlob = new Blob(['fake-qr-png'], { type: 'image/png' });
    const fetchSpy = spyOn(window, 'fetch').and.returnValue(
      Promise.resolve(new Response(fakeBlob, { status: 200, headers: { 'Content-Type': 'image/png' } }))
    );
    const createUrlSpy = spyOn(URL, 'createObjectURL').and.returnValue('blob:fake-qr');
    const revokeSpy = spyOn(URL, 'revokeObjectURL');

    const clickSpy = spyOn(HTMLAnchorElement.prototype, 'click');

    await component.descargarQr();

    expect(fetchSpy).toHaveBeenCalledWith(jasmine.stringMatching(/qr\.png$/));
    expect(createUrlSpy).toHaveBeenCalled();
    expect(clickSpy).toHaveBeenCalled();
    expect(revokeSpy).toHaveBeenCalledWith('blob:fake-qr');
    expect(component.qrDescargando()).toBeFalse();
  });

  it('QR filename is semantic: {numeroExpediente}-qr.png (REQ-DEL-002)', async () => {
    await fixture.whenStable();
    fixture.detectChanges();

    const fakeBlob = new Blob(['x'], { type: 'image/png' });
    spyOn(window, 'fetch').and.returnValue(
      Promise.resolve(new Response(fakeBlob, { status: 200 }))
    );
    spyOn(URL, 'createObjectURL').and.returnValue('blob:fake');
    spyOn(URL, 'revokeObjectURL');

    let downloadedName = '';
    spyOn(HTMLAnchorElement.prototype, 'click').and.callFake(function (this: HTMLAnchorElement) {
      downloadedName = this.download;
    });

    await component.descargarQr();

    expect(downloadedName).toBe('IFTS14-CERT-0001-qr.png');
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