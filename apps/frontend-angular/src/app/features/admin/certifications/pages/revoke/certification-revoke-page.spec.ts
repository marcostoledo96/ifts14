import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { By } from '@angular/platform-browser';
import { CertificationRevokePage } from './certification-revoke-page';
import { CERTIFICATIONS_SOURCE, CertificationsService } from '../../certifications.service';
import { InMemoryCertificationsService, seed } from '../../in-memory-certifications.service';
import { resetMockAdminPublicStatus } from '../../../../../shared/certificates/mock-tokens';
import { ComponentRef } from '@angular/core';

describe('CertificationRevokePage', () => {
  let component: CertificationRevokePage;
  let fixture: ComponentFixture<CertificationRevokePage>;
  let router: Router;

  beforeEach(async () => {
    resetMockAdminPublicStatus();
    await TestBed.configureTestingModule({
      imports: [CertificationRevokePage],
      providers: [
        provideRouter([]),
        { provide: CERTIFICATIONS_SOURCE, useClass: InMemoryCertificationsService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CertificationRevokePage);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    // Bind input
    (fixture.componentRef as ComponentRef<CertificationRevokePage>).setInput('id', '1');
    fixture.detectChanges();
  });

  it('debe cargar la certificación al iniciar', fakeAsync(() => {
    tick(); // resolve promise
    fixture.detectChanges();

    expect(component.cargando()).toBeFalse();
    expect(component.detalle()?.id).toBe(1);
    expect(component.numeroExpediente()).toBe('IFTS14-CERT-0001');
    
    // El checkbox y textarea deberían estar presentes
    const textarea = fixture.debugElement.query(By.css('#motivo-revocacion'));
    expect(textarea).toBeTruthy();
  }));

  it('debe mostrar error si no encuentra la certificación', fakeAsync(() => {
    (fixture.componentRef as ComponentRef<CertificationRevokePage>).setInput('id', '999');
    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    expect(component.error()).toContain('Certificación no encontrada');
  }));

  it('debe validar el motivo requerido y su longitud', fakeAsync(() => {
    tick();
    fixture.detectChanges();
    
    component.confirmado.set(true); // Check confirmation
    fixture.detectChanges();

    const btnRevocar = fixture.debugElement.query(By.css('.btn-submit')).nativeElement as HTMLButtonElement;
    expect(btnRevocar.disabled).toBeFalse(); // Actually Angular might not bind disabled state if we use a getter properly? wait, enviando is what disables it natively, aria-disabled relies on puedeRevocar().
    // let's check puedeRevocar
    expect(component.puedeRevocar()).toBeFalse();
    
    // click revocar to trigger intentado
    btnRevocar.click();
    fixture.detectChanges();
    
    expect(component.intentado()).toBeTrue();
    expect(component.motivoError()).toContain('Ingresá el motivo');

    component.onMotivoChange('Corto');
    fixture.detectChanges();
    expect(component.motivoError()).toContain('Detallá el motivo con al menos 12 caracteres');

    component.onMotivoChange('Este es un motivo válido con la longitud correcta');
    fixture.detectChanges();
    expect(component.motivoError()).toBe('');
    expect(component.puedeRevocar()).toBeTrue();
  }));

  it('debe requerir la confirmación explícita', fakeAsync(() => {
    tick();
    fixture.detectChanges();
    
    component.onMotivoChange('Este es un motivo válido con la longitud correcta');
    fixture.detectChanges();

    expect(component.puedeRevocar()).toBeFalse();
    
    const btnRevocar = fixture.debugElement.query(By.css('.btn-submit')).nativeElement as HTMLButtonElement;
    btnRevocar.click(); // set intentado
    fixture.detectChanges();

    expect(component.confirmError()).toBeTrue();

    component.confirmado.set(true);
    fixture.detectChanges();
    
    expect(component.confirmError()).toBeFalse();
    expect(component.puedeRevocar()).toBeTrue();
  }));

  it('debe llamar al servicio y redirigir tras una revocación exitosa', fakeAsync(() => {
    tick();
    fixture.detectChanges();
    
    spyOn(router, 'navigate');

    component.onMotivoChange('Este es un motivo válido con la longitud correcta');
    component.confirmado.set(true);
    fixture.detectChanges();

    const btnRevocar = fixture.debugElement.query(By.css('.btn-submit')).nativeElement as HTMLButtonElement;
    btnRevocar.click();
    
    expect(component.enviando()).toBeTrue();
    fixture.detectChanges();
    
    // Avanzamos 900ms mock delay
    tick(900);
    fixture.detectChanges();

    expect(component.enviando()).toBeFalse();
    expect(router.navigate).toHaveBeenCalledWith(['/admin/certificaciones', '1'], { queryParams: { revocada: 1 } });
  }));

  for (const [id, estado] of [['3', 'borrador'], ['4', 'vencido'], ['5', 'revocado']]) {
    it(`protege el deep link cuando el certificado está ${estado}`, fakeAsync(() => {
      const certs = TestBed.inject(CERTIFICATIONS_SOURCE) as CertificationsService;
      const revocarSpy = spyOn(certs, 'revocar').and.callThrough();
      const navigateSpy = spyOn(router, 'navigate');
      (fixture.componentRef as ComponentRef<CertificationRevokePage>).setInput('id', id);
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      expect(component.puedeRevocar()).toBeFalse();
      expect(fixture.nativeElement.querySelector('#motivo-revocacion')).toBeNull();
      expect(fixture.nativeElement.textContent).toContain(
        'Solo las certificaciones vigentes pueden revocarse.',
      );

      component.onMotivoChange('Este es un motivo válido con la longitud correcta');
      component.confirmado.set(true);
      void component.onRevocar();
      tick(900);

      expect(revocarSpy).not.toHaveBeenCalled();
      expect(navigateSpy).not.toHaveBeenCalled();
    }));
  }

  it('Escape navega al expediente (REQ-PAR-REV-001)', fakeAsync(() => {
    tick();
    fixture.detectChanges();
    const navigateSpy = spyOn(router, 'navigate');
    component.volverAlExpediente();
    expect(navigateSpy).toHaveBeenCalledWith(['/admin/certificaciones', '1']);
  }));

  it('panel de error de carga muestra alerta y enlace volver', fakeAsync(() => {
    (fixture.componentRef as ComponentRef<CertificationRevokePage>).setInput('id', '999');
    fixture.detectChanges();
    tick();
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.error-panel[role="alert"]')).toBeTruthy();
    expect(el.textContent).toContain('Certificación no encontrada');
    expect(el.querySelector('.btn-volver')?.textContent).toContain('Volver');
  }));
});
