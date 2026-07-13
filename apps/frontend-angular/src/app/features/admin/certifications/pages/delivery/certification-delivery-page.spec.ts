import { ComponentFixture, TestBed, fakeAsync, tick, flushMicrotasks } from '@angular/core/testing';
import { CertificationDeliveryPage } from './certification-delivery-page';
import { provideRouter } from '@angular/router';
import { CERTIFICATIONS_SOURCE } from '../../certifications.service';
import { InMemoryCertificationsService } from '../../in-memory-certifications.service';

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

  it('should create and load data', fakeAsync(() => {
    expect(component).toBeTruthy();
    
    tick(); // allow load to resolve
    fixture.detectChanges();

    expect(component.cargando()).toBeFalse();
    expect(component.detalle()).toBeTruthy();
    expect(component.detalle()?.numero).toContain('IFTS14');
  }));

  it('should mask DNI for privacy (Rule D0)', fakeAsync(() => {
    tick();
    fixture.detectChanges();

    const maskedDni = component.alumnoDniEnmascarado();
    expect(maskedDni).toContain('****');
  }));

  it('should format dates correctly', () => {
    const d = component.formatearFecha('2024-03-15');
    expect(d).toBe('15/03/2024'); // default de 'es-AR'
  });

  it('should simulate PDF download', fakeAsync(() => {
    void component.descargarPdf();
    flushMicrotasks(); // resolve the initial synchronous parts if any
    expect(component.descargando()).toBeTrue();
    expect(component.descargado()).toBeFalse();

    tick(700);

    expect(component.descargando()).toBeFalse();
    expect(component.descargado()).toBeTrue();
  }));

  it('should simulate clipboard copy and clear after timeout', fakeAsync(() => {
    tick(); // allow initial load to resolve
    
    const originalClipboard = navigator.clipboard;
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: () => Promise.resolve() },
      configurable: true
    });

    void component.copiarLink();
    tick(); // Allow the promise to resolve
    
    // Debería cambiar el estado
    expect(component.copiado()).toBeTrue();
    
    // Avanzar el tiempo 2600ms
    tick(2600);
    
    // Se debería restaurar el estado
    expect(component.copiado()).toBeFalse();

    Object.defineProperty(navigator, 'clipboard', {
      value: originalClipboard,
      configurable: true
    });
  }));
});
