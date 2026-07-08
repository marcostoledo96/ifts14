// Verifica que el seed ficticio de certificaciones no contiene datos
// plausibles reales: documentMasked enmascarado, sin emails, sin DNI
// completo, sin nombres propios, sin tokens tipo UUID, sin URL con token
// completo.
import { TestBed } from '@angular/core/testing';
import { CERTIFICATIONS_SOURCE } from '../certifications.service';
import { InMemoryCertificationsService, URL_PUBLICA_MAX } from '../in-memory-certifications.service';

describe('no-real-data en seed de certificaciones', () => {
  async function setup() {
    TestBed.configureTestingModule({
      providers: [{ provide: CERTIFICATIONS_SOURCE, useClass: InMemoryCertificationsService }],
    });
    const svc = TestBed.inject(CERTIFICATIONS_SOURCE);
    return { svc, list: await svc.listar() };
  }

  it('documentMasked cumple formato XX****XX (no DNI completo)', async () => {
    const { list } = await setup();
    for (const c of list) {
      expect(c.documentMasked).toMatch(/^\d{2}\*{4}\d{2}$/);
      expect(c.documentMasked).not.toMatch(/^\d{7,8}$/);
    }
  });

  it('tokenPrefix cumple formato prefijo_demo_xxx (no token completo)', async () => {
    const { list } = await setup();
    for (const c of list) {
      expect(c.tokenPrefix).toMatch(/^prefijo_demo_[a-z0-9]{3}$/);
      expect(c.tokenPrefix.length).toBeLessThan(30);
    }
  });

  it('nombreAlumno no contiene emails', async () => {
    const { list } = await setup();
    for (const c of list) {
      expect(c.nombreAlumno).not.toMatch(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i);
    }
  });

  it('nombreAlumno usa placeholders neutros (Alumno Demo N), no nombres propios', async () => {
    const { list } = await setup();
    const texto = list.map((c) => c.nombreAlumno).join(' ');
    expect(texto).not.toMatch(/\b(Juan|María|Carlos|Sofía|Diego|Lucía|Pedro|Ana|Martín|José)\b/);
  });

  it('no hay tokens tipo UUID en nombres ni prefijos', async () => {
    const { list } = await setup();
    const texto = list.map((c) => `${c.nombreAlumno} ${c.tokenPrefix}`).join(' ');
    expect(texto).not.toMatch(
      /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i,
    );
  });

  it('los ids son pequeños (1..6), no DNIs plausibles', async () => {
    const { list } = await setup();
    for (const c of list) {
      expect(c.id).toBeLessThan(100);
    }
  });

  it('tiene entre 3 y 6 certificados seed', async () => {
    const { list } = await setup();
    expect(list.length).toBeGreaterThanOrEqual(3);
    expect(list.length).toBeLessThanOrEqual(6);
  });

  it(`publicValidationUrl truncada a ${URL_PUBLICA_MAX} chars y sin token completo`, async () => {
    const { svc, list } = await setup();
    for (const c of list) {
      const det = await svc.obtener(c.id);
      expect(det.publicValidationUrl.length).toBeLessThanOrEqual(URL_PUBLICA_MAX);
      // No debe contener un UUID completo como token.
      expect(det.publicValidationUrl).not.toMatch(
        /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i,
      );
    }
  });

  it('auditEvents no exponen datos reales', async () => {
    const { svc, list } = await setup();
    for (const c of list) {
      const det = await svc.obtener(c.id);
      for (const ev of det.auditEvents) {
        expect(ev.detalle).not.toMatch(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i);
        expect(ev.detalle).not.toMatch(/\b\d{7,8}\b/); // no DNI numérico
      }
    }
  });
});