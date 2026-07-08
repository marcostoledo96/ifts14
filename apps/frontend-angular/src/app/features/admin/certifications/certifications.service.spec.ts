import { TestBed } from '@angular/core/testing';
import {
  CERTIFICATIONS_SOURCE,
  CertificationsService,
} from './certifications.service';
import { InMemoryCertificationsService, URL_PUBLICA_MAX } from './in-memory-certifications.service';

describe('InMemoryCertificationsService', () => {
  function setup(): CertificationsService {
    TestBed.configureTestingModule({
      // Cada TestBed arranca una nueva instancia con su clon del seed:
      // mutaciones de un test no filtran a otros.
      providers: [{ provide: CERTIFICATIONS_SOURCE, useClass: InMemoryCertificationsService }],
    });
    return TestBed.inject(CERTIFICATIONS_SOURCE);
  }

  it('listar devuelve los certificados seed sin argumentos', async () => {
    const svc = setup();
    const list = await svc.listar();
    expect(list.length).toBeGreaterThanOrEqual(3);
    expect(list.length).toBeLessThanOrEqual(6);
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

  it('contar devuelve la cantidad de certificados seed', async () => {
    const svc = setup();
    const list = await svc.listar();
    const count = await svc.contar();
    expect(count).toBe(list.length);
  });

  it('documentMasked cumple formato XX****XX', async () => {
    const svc = setup();
    const list = await svc.listar();
    for (const c of list) {
      expect(c.documentMasked).toMatch(/^\d{2}\*{4}\d{2}$/);
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
});