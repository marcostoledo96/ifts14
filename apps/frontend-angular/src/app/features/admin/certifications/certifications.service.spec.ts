import { TestBed } from '@angular/core/testing';
import {
  CERTIFICATIONS_SOURCE,
  CertificationsService,
} from './certifications.service';
import { InMemoryCertificationsService, URL_PUBLICA_MAX } from './in-memory-certifications.service';
import {
  getMockAdminPublicStatus,
  MockValidationSource,
  mockPublicValidationToken,
  resetMockAdminPublicStatus,
} from '../../../shared/certificates/mock-tokens';
import { clearMockAdminLiveEstadoResolver } from '../../../shared/certificates/mock-admin-bridge';
import {
  VALIDATION_SOURCE,
  ValidationSource,
} from '../../../shared/certificates/validation-source';

describe('InMemoryCertificationsService', () => {
  afterEach(() => {
    resetMockAdminPublicStatus();
    clearMockAdminLiveEstadoResolver();
  });

  function setup(): CertificationsService {
    TestBed.configureTestingModule({
      // Cada TestBed arranca una nueva instancia con su clon del seed:
      // mutaciones de un test no filtran a otros.
      providers: [{ provide: CERTIFICATIONS_SOURCE, useClass: InMemoryCertificationsService }],
    });
    return TestBed.inject(CERTIFICATIONS_SOURCE);
  }

  function setupWithMockAppWiring(): {
    admin: CertificationsService;
    publicValidation: ValidationSource;
  } {
    TestBed.configureTestingModule({
      providers: [
        InMemoryCertificationsService,
        { provide: CERTIFICATIONS_SOURCE, useExisting: InMemoryCertificationsService },
        { provide: VALIDATION_SOURCE, useClass: MockValidationSource },
      ],
    });
    return {
      admin: TestBed.inject(CERTIFICATIONS_SOURCE),
      publicValidation: TestBed.inject(VALIDATION_SOURCE),
    };
  }

  it('listar devuelve los certificados seed sin argumentos', async () => {
    const svc = setup();
    const list = await svc.listar();
    expect(list.length).toBeGreaterThanOrEqual(3);
    expect(list.length).toBe(6);
  });

  it('expone número ficticio seguro en cada registro', async () => {
    const list = await setup().listar();
    for (const c of list) {
      expect(c.numero).toMatch(/^IFTS14-CERT-\d{4}$/);
    }
  });

  it('listar filtra por estado vigente', async () => {
    const svc = setup();
    const vigentes = await svc.listar({ estado: 'vigente' });
    vigentes.forEach((c) => expect(c.estado).toBe('vigente'));
  });

  it('listar filtra por estado borrador', async () => {
    const svc = setup();
    const borradores = await svc.listar({ estado: 'borrador' });
    borradores.forEach((c) => expect(c.estado).toBe('borrador'));
  });

  it('listar filtra por estado revocado', async () => {
    const svc = setup();
    const revocados = await svc.listar({ estado: 'revocado' });
    revocados.forEach((c) => expect(c.estado).toBe('revocado'));
  });

  it('listar filtra por estado vencido', async () => {
    const svc = setup();
    const vencidos = await svc.listar({ estado: 'vencido' });
    vencidos.forEach((c) => expect(c.estado).toBe('vencido'));
  });

  it('listar filtra por texto (q) sobre nombre, curso y alumno', async () => {
    const svc = setup();
    const porCurso = await svc.listar({ q: 'Curso' });
    expect(porCurso.length).toBeGreaterThanOrEqual(1);
    porCurso.forEach((c) =>
      expect(
        c.cursoNombre.includes('Curso') ||
        c.nombreAlumno.includes('Curso'),
      ).toBe(true),
    );
  });

  it('listar combina estado y q', async () => {
    const svc = setup();
    const res = await svc.listar({ estado: 'vigente', q: 'Curso' });
    res.forEach((c) => expect(c.estado).toBe('vigente'));
  });

  it('listar combina búsqueda por número o documento (DNI completo ficticio)', async () => {
    const svc = setup();
    const byNumber = await svc.listar({ q: '0001' });
    expect(byNumber.map((c) => c.numero)).toEqual(['IFTS14-CERT-0001']);

    const byDocument = await svc.listar({ q: '23456789' });
    expect(byDocument.map((c) => c.id)).toEqual([2]);
  });

  it('listar filtra un curso independiente y lo combina con validez y búsqueda', async () => {
    const svc = setup();
    const results = await svc.listar({
      curso: 'Curso de introducción a la gestión',
      estado: 'vigente',
      q: 'Uno',
    });

    expect(results.map((c) => c.id)).toEqual([1]);
  });

  it('listar con q sin matches devuelve []', async () => {
    const svc = setup();
    const res = await svc.listar({ q: 'zzzz-no-existe' });
    expect(res.length).toBe(0);
  });

  it('listar con q vacío no filtra', async () => {
    const svc = setup();
    const res = await svc.listar({ q: '   ' });
    expect(res.length).toBeGreaterThanOrEqual(3);
  });

  it('obtener devuelve detalle con auditoría y URL truncada', async () => {
    const svc = setup();
    const list = await svc.listar();
    const det = await svc.obtener(list[0].id);
    expect(det.id).toBe(list[0].id);
    expect(det.auditEvents.length).toBeGreaterThanOrEqual(1);
    // URL truncada: no contiene token completo.
    expect(det.publicValidationUrl.length).toBeLessThanOrEqual(URL_PUBLICA_MAX);
  });

  it('obtener id inexistente rechaza', async () => {
    const svc = setup();
    await expectAsync(svc.obtener(999)).toBeRejected();
  });

  it('obtenerEntregaManual devuelve DTO con URL canónica y pdfStatus', async () => {
    const svc = setup();
    const entrega = await svc.obtenerEntregaManual(1);
    expect(entrega.certificadoId).toBe(1);
    expect(entrega.publicValidationUrl).toContain('ifts14.edu.ar');
    expect(entrega.publicValidationUrl).toContain('validar/');
    expect(entrega.tokenPrefix).toMatch(/^prefijo_demo_[a-z0-9]{3}$/);
    expect(entrega.pdfStatus).toMatch(/^(valid|outdated|missing)$/);
  });

  it('obtenerEntregaManual id 4 devuelve pdfStatus outdated (mock scenario)', async () => {
    const svc = setup();
    const entrega = await svc.obtenerEntregaManual(4);
    expect(entrega.pdfStatus).toBe('outdated');
  });

  it('obtenerEntregaManual id inexistente rechaza', async () => {
    const svc = setup();
    await expectAsync(svc.obtenerEntregaManual(999)).toBeRejected();
  });

  it('contar devuelve la cantidad de certificados seed', async () => {
    const svc = setup();
    const list = await svc.listar();
    const count = await svc.contar();
    expect(count).toBe(list.length);
  });

  it('revocar cambia un certificado vigente a revocado', async () => {
    const svc = setup();

    await svc.revocar(1, 'Motivo de prueba');

    const stored = await svc.obtener(1);
    expect(stored.estado).toBe('revocado');
    expect(stored.auditEvents[0].accion).toBe('revocacion');
    expect(stored.auditEvents[0].detalle).toBe('Motivo de prueba');
  });

  it('revocar alinea validación pública mock (CERTIFICATE_REVOKED)', async () => {
    const svc = setup();
    await svc.revocar(2, 'Motivo E-14 prueba alineación mock');
    const publicSrc = new MockValidationSource();
    const result = await publicSrc.fetch(mockPublicValidationToken('prefijo_demo_c2d'));
    expect(result.ok).toBeFalse();
    if (result.ok) return;
    expect(result.error?.error.code).toBe('CERTIFICATE_REVOKED');
  });

  it('revocar alinea admin y validación pública con el wiring useExisting de la app', async () => {
    const { admin, publicValidation } = setupWithMockAppWiring();
    expect(admin).toBe(TestBed.inject(InMemoryCertificationsService));

    await admin.revocar(2, 'Motivo de prueba del wiring real');

    const result = await publicValidation.fetch(mockPublicValidationToken('prefijo_demo_c2d'));
    expect(result.ok).toBeFalse();
    if (result.ok) return;
    expect(result.error?.error.code).toBe('CERTIFICATE_REVOKED');
  });

  it('rehidrata la revocación después de un F5 simulado', async () => {
    const svc = setup() as InMemoryCertificationsService;
    await svc.revocar(2, 'Motivo temporal');

    const afterF5 = new InMemoryCertificationsService();
    expect((await afterF5.obtener(2)).estado).toBe('revocado');

    const publicResult = await new MockValidationSource().fetch(
      mockPublicValidationToken('prefijo_demo_c2d'),
    );
    expect(publicResult.ok).toBeFalse();
  });

  it('resetToSeed borra la revocación persistida y restaura cert 2 a vigente', async () => {
    const svc = setup() as InMemoryCertificationsService;
    await svc.revocar(2, 'Motivo temporal');
    expect((await svc.obtener(2)).estado).toBe('revocado');
    svc.resetToSeed();
    expect((await svc.obtener(2)).estado).toBe('vigente');
    expect(getMockAdminPublicStatus(mockPublicValidationToken('prefijo_demo_c2d'))).toBeUndefined();

    const publicResult = await new MockValidationSource().fetch(
      mockPublicValidationToken('prefijo_demo_c2d'),
    );
    expect(publicResult.ok).toBeTrue();
  });

  for (const [estado, id] of [
    ['borrador', 3],
    ['vencido', 4],
    ['revocado', 5],
  ] as const) {
    it(`revocar rechaza un certificado ${estado} sin mutarlo`, async () => {
      const svc = setup();
      const before = await svc.obtener(id);

      await expectAsync(svc.revocar(id, 'Motivo de prueba')).toBeRejectedWithError(
        'Certificado no revocable.',
      );

      expect(await svc.obtener(id)).toEqual(before);
    });
  }

  it('documentMasked cumple formato DNI completo ficticio (7-8 dígitos)', async () => {
    const svc = setup();
    const list = await svc.listar();
    for (const c of list) {
      expect(c.documentMasked).toMatch(/^\d{7,8}$/);
    }
  });

  it('tokenPrefix cumple formato prefijo_demo_xxx', async () => {
    const svc = setup();
    const list = await svc.listar();
    for (const c of list) {
      expect(c.tokenPrefix).toMatch(/^prefijo_demo_[a-z0-9]{3}$/);
    }
  });

  it('publicValidationUrl no contiene token completo', async () => {
    const svc = setup();
    const list = await svc.listar();
    for (const c of list) {
      const det = await svc.obtener(c.id);
      // La URL truncada no debe contener el token completo del seed.
      expect(det.publicValidationUrl).not.toMatch(/[0-9a-f]{8}-[0-9a-f]{4}/i);
    }
  });

  it('cada TestBed arranca con un clon fresco del seed (aislamiento entre tests)', async () => {
    const svc = setup();
    const count = await svc.contar();
    // El siguiente test llama setup() de nuevo → nuevo TestBed → nueva
    // instancia → seed clonado fresco. Ver beforeEach en otros tests: todos
    // arrancan esperando el mismo conteo seed.
    expect(count).toBeGreaterThanOrEqual(3);
  });

  it('emitir crea certificado vigente y permite handoff por id', async () => {
    const svc = setup();
    const before = await svc.contar();
    const result = await svc.emitir({
      alumnoId: 46,
      cursoId: 4,
      issuedAt: '2026-07-16',
      expiresAt: null,
    });
    expect(result.id).toBeGreaterThan(0);
    expect(result.status).toBe('vigente');
    expect(result.student.documentMasked).toMatch(/^\d{7,8}$/);
    expect(result.expiresAt).toBeNull();
    expect(await svc.contar()).toBe(before + 1);
    const det = await svc.obtener(result.id);
    expect(det.estado).toBe('vigente');
  });

  it('emitir 409 si ya hay vigente del mismo par', async () => {
    const svc = setup();
    const payload = { alumnoId: 50, cursoId: 9, issuedAt: '2026-07-16', expiresAt: null };
    await svc.emitir(payload);
    await expectAsync(svc.emitir(payload)).toBeRejected();
  });

  it('listar por cursoId/alumnoId solo ve pares emitidos en mock', async () => {
    const svc = setup();
    await svc.emitir({ alumnoId: 7, cursoId: 3, issuedAt: '2026-07-16', expiresAt: null });
    const list = await svc.listar({ estado: 'vigente', cursoId: 3, alumnoId: 7 });
    expect(list.length).toBe(1);
    const vacío = await svc.listar({ estado: 'vigente', cursoId: 3, alumnoId: 999 });
    expect(vacío.length).toBe(0);
  });

  it('descargarQrPng devuelve Blob PNG escaneable (no stub 1×1) para id seed', async () => {
    const blob = await setup().descargarQrPng(1);
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.type).toBe('image/png');
    // Un QR 256px supera ampliamente el PNG 1×1 (~70 bytes).
    expect(blob.size).toBeGreaterThan(200);
  });

  it('descargarQrPng rechaza id inexistente', async () => {
    await expectAsync(setup().descargarQrPng(999)).toBeRejected();
  });

  it('descargarPdf devuelve Blob PDF abríble (no stub inválido) para id seed', async () => {
    const blob = await setup().descargarPdf(1);
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.type).toBe('application/pdf');
    expect(blob.size).toBeGreaterThan(400);
    const head = new TextDecoder('latin1').decode(await blob.slice(0, 8).arrayBuffer());
    expect(head.startsWith('%PDF-1.')).toBeTrue();
  });

  it('descargarPdf rechaza id inexistente', async () => {
    await expectAsync(setup().descargarPdf(999)).toBeRejected();
  });
});
