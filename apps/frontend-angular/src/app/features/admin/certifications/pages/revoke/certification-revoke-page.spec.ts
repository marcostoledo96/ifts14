import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { By } from '@angular/platform-browser';
import { HttpErrorResponse } from '@angular/common/http';
import { CertificationRevokePage } from './certification-revoke-page';
import { CERTIFICATIONS_SOURCE, CertificationsService } from '../../certifications.service';
import { InMemoryCertificationsService } from '../../in-memory-certifications.service';
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
    (fixture.componentRef as ComponentRef<CertificationRevokePage>).setInput('id', '1');
    fixture.detectChanges();
  });

  it('debe cargar la certificación al iniciar', fakeAsync(() => {
    tick();
    fixture.detectChanges();

    expect(component.cargando()).toBeFalse();
    expect(component.detalle()?.id).toBe(1);
    expect(component.numeroExpediente()).toBe('IFTS14-CERT-0001');
    expect(component.error()).toBe('');
    expect(component.errorRecuperable()).toBeFalse();
    expect(component.errorAccion()).toBe('');

    const textarea = fixture.debugElement.query(By.css('#motivo-revocacion'));
    expect(textarea).toBeTruthy();
  }));

  it('debe mostrar error si no encuentra la certificación', fakeAsync(() => {
    (fixture.componentRef as ComponentRef<CertificationRevokePage>).setInput('id', '999');
    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    expect(component.error()).toBe('Certificación no encontrada.');
    expect(component.errorRecuperable()).toBeFalse();
  }));

  it('debe validar el motivo requerido y su longitud', fakeAsync(() => {
    tick();
    fixture.detectChanges();

    component.confirmado.set(true);
    fixture.detectChanges();

    const btnRevocar = fixture.debugElement.query(By.css('.btn-submit')).nativeElement as HTMLButtonElement;
    expect(btnRevocar.disabled).toBeFalse();
    expect(component.puedeRevocar()).toBeFalse();

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
    btnRevocar.click();
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

    tick(900);
    fixture.detectChanges();

    expect(component.enviando()).toBeFalse();
    expect(router.navigate).toHaveBeenCalledWith(['/admin/certificaciones', '1'], { queryParams: { revocada: 1 } });
  }));

  for (const [id, estado] of [['4', 'revocado'], ['5', 'revocado']]) {
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
        'Solo las certificaciones válidas pueden revocarse.',
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
    expect(el.querySelector('[data-testid="volver-expediente"]')?.textContent).toContain('Volver');
    expect(el.textContent).not.toContain('Reintentar');
  }));

  // --- P21 honesty / signal split ---

  it('P21 honesty: raw obtener → mensaje fijo + Reintentar; re-cargar al reintentar', fakeAsync(() => {
    const LEAK = 'RAW_BACKEND_STACK_TRACE_xyz';
    const certs = TestBed.inject(CERTIFICATIONS_SOURCE) as CertificationsService;
    const obtener = spyOn(certs, 'obtener').and.returnValues(
      Promise.reject(new Error(LEAK)),
      Promise.resolve({
        id: 1,
        numero: 'IFTS14-CERT-0001',
        nombreAlumno: 'Alumno Demo Uno',
        documentMasked: '30111222',
        cursoNombre: 'Curso Demo',
        estado: 'vigente',
        emitidoEn: '2024-01-15',
        alumnoId: 1,
        cursoId: 1,
      } as never),
    );

    void component.cargar();
    tick();
    fixture.detectChanges();

    expect(component.error()).toBe('No se pudo cargar la certificación.');
    expect(component.error()).not.toContain('RAW_BACKEND');
    expect(component.errorRecuperable()).toBeTrue();
    expect(component.errorAccion()).toBe('');
    expect(component.detalle()).toBeNull();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Reintentar');
    expect(el.textContent).not.toContain(LEAK);

    const btn = Array.from(el.querySelectorAll('button')).find((b) =>
      (b.textContent || '').includes('Reintentar'),
    );
    expect(btn).toBeTruthy();
    (btn as HTMLElement).click();
    tick();
    fixture.detectChanges();

    expect(obtener).toHaveBeenCalledTimes(2);
    expect(component.error()).toBe('');
    expect(component.errorRecuperable()).toBeFalse();
    expect(component.detalle()?.id).toBe(1);
  }));

  it('P21 honesty: not-found / id inválido sin Reintentar ni errorRecuperable', fakeAsync(() => {
    (fixture.componentRef as ComponentRef<CertificationRevokePage>).setInput('id', '0x1');
    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    expect(component.error()).toBe('Certificación no encontrada.');
    expect(component.errorRecuperable()).toBeFalse();
    expect((fixture.nativeElement as HTMLElement).textContent).not.toContain('Reintentar');
  }));

  it('P21 honesty: load panel nunca muestra raw Error.message / DNI / token', fakeAsync(() => {
    const LEAK = 'Http failure: DNI 30111222 token a1b2c3d4-e5f6-7890-abcd-ef1234567890';
    const certs = TestBed.inject(CERTIFICATIONS_SOURCE) as CertificationsService;
    spyOn(certs, 'obtener').and.rejectWith(new Error(LEAK));

    void component.cargar();
    tick();
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    const panel = el.querySelector('.error-panel[role="alert"]');
    expect(panel).toBeTruthy();
    expect(panel?.textContent).toContain('No se pudo cargar la certificación.');
    expect(panel?.textContent).toContain('Reintentar');
    expect(component.error()).toBe('No se pudo cargar la certificación.');
    expect(component.error()).not.toContain(LEAK);
    expect(el.textContent).not.toContain('30111222');
    expect(el.textContent).not.toContain('a1b2c3d4-e5f6-7890-abcd-ef1234567890');
    expect(el.textContent).not.toContain('Http failure');
  }));

  it('P21 submit: fallo → errorAccion inline; diálogo vivo; sin overlay load ni raw', fakeAsync(() => {
    tick();
    fixture.detectChanges();

    const LEAK = 'REVOKAR_RAW_LEAK_secret';
    const certs = TestBed.inject(CERTIFICATIONS_SOURCE) as CertificationsService;
    spyOn(certs, 'revocar').and.rejectWith(new Error(LEAK));

    component.onMotivoChange('Este es un motivo válido con la longitud correcta');
    component.confirmado.set(true);
    fixture.detectChanges();

    const btnRevocar = fixture.debugElement.query(By.css('.btn-submit')).nativeElement as HTMLButtonElement;
    btnRevocar.click();
    tick(900);
    fixture.detectChanges();

    expect(component.errorAccion()).toBe('No se pudo revocar la certificación.');
    expect(component.errorAccion()).not.toContain('REVOKAR_RAW');
    expect(component.error()).toBe('');
    expect(component.errorRecuperable()).toBeFalse();
    expect(component.detalle()).toBeTruthy();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('[role="alertdialog"]')).toBeTruthy();
    expect(el.querySelector('[data-testid="error-accion"]')?.textContent).toContain(
      'No se pudo revocar la certificación.',
    );
    expect(el.querySelector('.error-overlay')).toBeNull();
    expect(el.textContent).not.toContain('Reintentar');
    expect(el.textContent).not.toContain(LEAK);
  }));

  it('P21 submit: HttpErrorResponse envelope → mensaje en errorAccion', fakeAsync(() => {
    tick();
    fixture.detectChanges();

    const certs = TestBed.inject(CERTIFICATIONS_SOURCE) as CertificationsService;
    spyOn(certs, 'revocar').and.rejectWith(
      new HttpErrorResponse({
        status: 422,
        error: { error: { message: 'Motivo insuficiente según política.' } },
      }),
    );

    component.onMotivoChange('Este es un motivo válido con la longitud correcta');
    component.confirmado.set(true);
    void component.onRevocar();
    tick(900);
    fixture.detectChanges();

    expect(component.errorAccion()).toBe('Motivo insuficiente según política.');
    expect(component.error()).toBe('');
    expect(component.errorRecuperable()).toBeFalse();
  }));

  it('P21 MOTIVO_MAX es 180 (maxlength + slice)', fakeAsync(() => {
    tick();
    fixture.detectChanges();

    expect(component.MOTIVO_MAX).toBe(180);
    const textarea = fixture.debugElement.query(By.css('#motivo-revocacion')).nativeElement as HTMLTextAreaElement;
    expect(textarea.getAttribute('maxlength')).toBe('180');

    component.onMotivoChange('x'.repeat(250));
    expect(component.motivo().length).toBe(180);
  }));

  it('P21 sanitize: motivo con DNI/token/email se envía con placeholders', fakeAsync(() => {
    tick();
    fixture.detectChanges();

    const certs = TestBed.inject(CERTIFICATIONS_SOURCE) as CertificationsService;
    const revocarSpy = spyOn(certs, 'revocar').and.returnValue(Promise.resolve());
    spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));

    component.onMotivoChange(
      'Error carga DNI 30111222 token a1b2c3d4-e5f6-7890-abcd-ef1234567890 mail demo@ifts14.edu.ar',
    );
    component.confirmado.set(true);
    void component.onRevocar();
    tick();
    fixture.detectChanges();

    expect(revocarSpy).toHaveBeenCalled();
    const motivoEnviado = revocarSpy.calls.mostRecent().args[1] as string;
    expect(motivoEnviado).toContain('[DNI]');
    expect(motivoEnviado).toContain('[TOKEN]');
    expect(motivoEnviado).toContain('[EMAIL]');
    expect(motivoEnviado).not.toContain('30111222');
    expect(motivoEnviado).not.toContain('a1b2c3d4-e5f6-7890-abcd-ef1234567890');
    expect(motivoEnviado).not.toContain('demo@ifts14.edu.ar');
  }));

  it('muestra copy de consecuencias y checkbox de confirmación', fakeAsync(() => {
    tick();
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('cambiará el estado público');
    expect(el.textContent).toContain('validación por QR');
    expect(el.querySelector('#confirmo-revocacion')).toBeTruthy();
  }));
});
