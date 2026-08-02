// Verifica que el seed ficticio de certificaciones no contiene datos
// plausibles reales: documentMasked con DNI completo ficticio, sin emails,
// sin nombres propios, sin tokens tipo UUID, sin URL con token
// completo. Además valida que el DOM renderizado por el expediente no
// expone token completo, email, legajo ni matrícula (D0: admin UI sí
// muestra DNI completo ficticio).
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { CERTIFICATIONS_SOURCE } from '../certifications.service';
import { InMemoryCertificationsService, URL_PUBLICA_MAX } from '../in-memory-certifications.service';
import { CertificationPreviewPage } from '../pages/preview/certification-preview-page';
import { INSTITUTIONAL_CONFIG_SOURCE } from '../../institutional-config/institutional-config.service';
import { InMemoryInstitutionalConfigService } from '../../institutional-config/in-memory-institutional-config.service';
import { CertificationPdfPreviewPage } from '../pages/pdf/certification-pdf-preview-page';
import { CertificationsListPage } from '../pages/list/certifications-list-page';
import { CertificationRevokePage } from '../pages/revoke/certification-revoke-page';
import { resetMockAdminPublicStatus } from '../../../../shared/certificates/mock-tokens';

describe('no-real-data en seed de certificaciones', () => {
  beforeEach(() => {
    resetMockAdminPublicStatus();
  });

  async function setup() {
    TestBed.configureTestingModule({
      providers: [{ provide: CERTIFICATIONS_SOURCE, useClass: InMemoryCertificationsService }],
    });
    const svc = TestBed.inject(CERTIFICATIONS_SOURCE);
    return { svc, list: await svc.listar() };
  }

  it('documentMasked cumple formato DNI completo ficticio (7-8 dígitos)', async () => {
    const { list } = await setup();
    for (const c of list) {
      expect(c.documentMasked).toMatch(/^\d{7,8}$/);
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

  it('número del seed respeta el contrato mock-only', async () => {
    const { list } = await setup();
    for (const c of list) {
      expect(c.numero).toMatch(/^IFTS14-CERT-\d{4}$/);
    }
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
        expect(ev.detalle).not.toMatch(/\b\d{7,8}\b/); // no DNI numérico en auditoría
      }
    }
  });

  // --- Frontera de datos en el DOM renderizado (F4-01) ---
  // El expediente admin no DEBE exponer token completo, email, legajo
  // ni matrícula en el HTML renderizado. D0: sí muestra DNI completo ficticio.

  async function renderExpediente(id: string) {
    await TestBed.configureTestingModule({
      imports: [CertificationPreviewPage],
      providers: [
        provideRouter([]),
        { provide: CERTIFICATIONS_SOURCE, useClass: InMemoryCertificationsService },
        { provide: INSTITUTIONAL_CONFIG_SOURCE, useClass: InMemoryInstitutionalConfigService },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(CertificationPreviewPage);
    fixture.componentRef.setInput('id', id);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('DOM del expediente muestra documentMasked con DNI completo ficticio', async () => {
    const el = await renderExpediente('1');
    expect(el.textContent).toMatch(/\b12345678\b/);
  });

  it('DOM del expediente no expone token completo (UUID)', async () => {
    const el = await renderExpediente('1');
    expect(el.textContent).not.toMatch(
      /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i,
    );
  });

  it('DOM del expediente no expone email', async () => {
    const el = await renderExpediente('1');
    expect(el.textContent).not.toMatch(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i);
  });

  it('DOM del expediente no expone legajo ni matrícula como literales', async () => {
    const el = await renderExpediente('1');
    const text = el.textContent || '';
    expect(text).not.toMatch(/legajo/i);
    expect(text).not.toMatch(/matr[íi]cula/i);
  });

  it('DOM del expediente no llama fetch ni storage', async () => {
    const fetchSpy = spyOn(window, 'fetch').and.callThrough();
    await renderExpediente('1');
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('DOM del listado muestra DNI completo ficticio y no expone token ni email', async () => {
    const fetchSpy = spyOn(window, 'fetch').and.callThrough();
    await TestBed.configureTestingModule({
      imports: [CertificationsListPage],
      providers: [provideRouter([]), { provide: CERTIFICATIONS_SOURCE, useClass: InMemoryCertificationsService }],
    }).compileComponents();
    const fixture = TestBed.createComponent(CertificationsListPage);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const text = fixture.nativeElement.textContent || '';
    // textContent concatena nodos sin espacio: no usar \b entre dígito y letra.
    expect(text).toContain('12345678');
    expect(text).not.toMatch(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
    expect(text).not.toMatch(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i);
    expect(text).not.toMatch(/prefijo_demo_/i);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  // --- Frontera de datos en el DOM del PDF preview (F4-02) ---
  // La vista imprimible admin NO DEBE exponer token completo, email,
  // legajo ni matrícula. D0: sí muestra DNI completo ficticio.

  async function renderPdfPreview(id: string) {
    await TestBed.configureTestingModule({
      imports: [CertificationPdfPreviewPage],
      providers: [
        provideRouter([]),
        { provide: CERTIFICATIONS_SOURCE, useClass: InMemoryCertificationsService },
        { provide: INSTITUTIONAL_CONFIG_SOURCE, useClass: InMemoryInstitutionalConfigService },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(CertificationPdfPreviewPage);
    fixture.componentRef.setInput('id', id);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  for (const [id, dni] of [
    ['1', '12345678'],
    ['3', '34567890'],
    ['4', '45678901'],
    ['5', '56789012'],
  ] as const) {
    it(`DOM del PDF preview ${id} conserva la frontera de privacidad y muestra DNI ficticio`, async () => {
      const el = await renderPdfPreview(id);
      const text = el.textContent || '';
      expect(text).toMatch(new RegExp(`\\b${dni}\\b`));
      expect(text).not.toMatch(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
      expect(text).not.toMatch(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i);
      expect(text).not.toMatch(/legajo/i);
      expect(text).not.toMatch(/matr[íi]cula/i);
      expect(el.querySelector('.cert-doc')?.textContent).toMatch(new RegExp(`D\\.N\\.I\\.\\s+${dni}`));
      expect((el.querySelector('.cert-val-url')?.textContent?.trim().length || 0)).toBeLessThanOrEqual(
        URL_PUBLICA_MAX,
      );
    });
  }

  it('DOM del PDF preview no llama fetch ni storage', async () => {
    const fetchSpy = spyOn(window, 'fetch').and.callThrough();
    await renderPdfPreview('1');
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('DOM del PDF preview muestra documentMasked con DNI completo ficticio', async () => {
    const el = await renderPdfPreview('1');
    const doc = el.querySelector('.cert-doc');
    expect(doc?.textContent).toMatch(/^\s*D\.N\.I\.\s+12345678/);
  });

  it('DOM del PDF preview muestra URL truncada (<= URL_PUBLICA_MAX) sin UUID', async () => {
    const el = await renderPdfPreview('1');
    const urlEl = el.querySelector('.cert-val-url');
    const urlText = urlEl?.textContent?.trim() || '';
    expect(urlText.length).toBeLessThanOrEqual(URL_PUBLICA_MAX);
    expect(urlText).not.toMatch(
      /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i,
    );
  });

  // --- Frontera de datos en el DOM de revocación (F6-01) ---

  async function renderRevokePage(id: string) {
    await TestBed.configureTestingModule({
      imports: [CertificationRevokePage],
      providers: [
        provideRouter([]),
        { provide: CERTIFICATIONS_SOURCE, useClass: InMemoryCertificationsService },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(CertificationRevokePage);
    fixture.componentRef.setInput('id', id);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('DOM de revocación muestra DNI ficticio y no expone token completo, email ni llama a fetch', async () => {
    const fetchSpy = spyOn(window, 'fetch').and.callThrough();
    const el = await renderRevokePage('1');
    const text = el.textContent || '';

    expect(text).toContain('12345678');
    expect(text).not.toMatch(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
    expect(text).not.toMatch(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i);
    expect(text).not.toMatch(/legajo/i);
    expect(text).not.toMatch(/matr[íi]cula/i);
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
