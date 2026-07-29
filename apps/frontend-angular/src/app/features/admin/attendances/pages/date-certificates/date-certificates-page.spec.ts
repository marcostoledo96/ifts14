import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { resetMockAdminPublicStatus } from '../../../../../shared/certificates/mock-tokens';
import { CERTIFICATIONS_SOURCE } from '../../../certifications/certifications.service';
import { InMemoryCertificationsService } from '../../../certifications/in-memory-certifications.service';
import { COURSES_SOURCE } from '../../../courses/courses.service';
import { InMemoryCoursesService } from '../../../courses/in-memory-courses.service';
import { DateCertificatesPage } from './date-certificates-page';

describe('DateCertificatesPage', () => {
  beforeEach(() => {
    // Otros specs pueden dejar certs seed en "revocado" vía localStorage compartido.
    resetMockAdminPublicStatus();
    TestBed.resetTestingModule();
  });

  async function render(id: number | string, fechaId: number | string) {
    await TestBed.configureTestingModule({
      imports: [DateCertificatesPage],
      providers: [
        provideRouter([]),
        { provide: COURSES_SOURCE, useClass: InMemoryCoursesService },
        { provide: CERTIFICATIONS_SOURCE, useClass: InMemoryCertificationsService },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(DateCertificatesPage);
    fixture.componentRef.setInput('id', String(id));
    fixture.componentRef.setInput('fechaId', String(fechaId));
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    return fixture;
  }

  it('lista certificados del curso con acciones link, QR y PDF', async () => {
    const f = await render(1, 11);
    const el = f.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Certificados del curso');
    expect(el.textContent).toMatch(/Volver a [Aa]sistencias/);
    const volver = el.querySelector('[data-testid="volver-asistencias"]') as HTMLAnchorElement;
    expect(volver.getAttribute('href')).toContain('/admin/cursos/1/fechas/11/asistencias');
    expect(el.querySelectorAll('[data-testid="cert-copiar-link"]').length).toBeGreaterThan(0);
    expect(el.querySelectorAll('[data-testid="cert-descargar-qr"]').length).toBeGreaterThan(0);
    expect(el.querySelectorAll('[data-testid="cert-descargar-pdf"]').length).toBeGreaterThan(0);
    // Orden: Copiar link → Descargar QR → Descargar PDF
    const firstRow = el.querySelector('.cert-acciones');
    const labels = Array.from(firstRow?.querySelectorAll('button') ?? []).map((b) =>
      (b.textContent || '').trim(),
    );
    expect(labels[0]).toMatch(/Copiar link|Copiado/);
    expect(labels[1]).toContain('Descargar QR');
    expect(labels[2]).toContain('Descargar PDF');
  });

  it('descargarQr llama descargarQrPng del seam', async () => {
    const f = await render(1, 11);
    const page = f.componentInstance;
    const vigente = page.certificados().find((c) => page.puedeEntregar(c));
    expect(vigente).toBeTruthy();
    const certs = TestBed.inject(CERTIFICATIONS_SOURCE);
    const spy = spyOn(certs, 'descargarQrPng').and.resolveTo(
      new Blob([new Uint8Array([137, 80, 78, 71])], { type: 'image/png' }),
    );
    const btn = (f.nativeElement as HTMLElement).querySelector(
      '[data-testid="cert-descargar-qr"]',
    ) as HTMLButtonElement;
    expect(btn).not.toBeNull();
    expect(btn.disabled).toBeFalse();
    btn.click();
    f.detectChanges();
    await f.whenStable();
    expect(spy).toHaveBeenCalledWith(vigente!.id);
  });

  it('no expone token completo en la lista', async () => {
    const f = await render(1, 11);
    const text = (f.nativeElement as HTMLElement).textContent || '';
    expect(text).not.toMatch(/-completo/);
    expect(text).toMatch(/\d{7,8}/); // DNI completo admin
  });

  it('vacío: CTA a marcar asistencias sin filas ni acciones', async () => {
    await TestBed.configureTestingModule({
      imports: [DateCertificatesPage],
      providers: [
        provideRouter([]),
        { provide: COURSES_SOURCE, useClass: InMemoryCoursesService },
        {
          provide: CERTIFICATIONS_SOURCE,
          useValue: {
            listar: jasmine.createSpy('listar').and.resolveTo([]),
            obtenerEntregaManual: () => Promise.reject(new Error('noop')),
            descargarQrPng: () => Promise.reject(new Error('noop')),
          },
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(DateCertificatesPage);
    fixture.componentRef.setInput('id', '1');
    fixture.componentRef.setInput('fechaId', '11');
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Todavía no hay certificados');
    expect(el.textContent).toContain('Ir a marcar asistencias');
    expect(el.querySelector('[data-testid="certs-lista"]')).toBeNull();
    expect(el.querySelectorAll('[data-testid="cert-copiar-link"]').length).toBe(0);
    const cta = Array.from(el.querySelectorAll('a')).find((a) =>
      (a.textContent || '').includes('Ir a marcar asistencias'),
    ) as HTMLAnchorElement;
    expect(cta.getAttribute('href')).toContain('/admin/cursos/1/fechas/11/asistencias');
  });

  it('fallo recuperable de carga: Reintentar re-llama fuentes sin PII', async () => {
    const detalleOk = {
      id: 1,
      codigo: 'CUR-001',
      nombre: 'Curso ok',
      estado: 'activo' as const,
      createdAt: '',
      updatedAt: '',
      fechas: [
        {
          id: 11,
          cursoId: 1,
          fecha: '2026-05-04',
          descripcion: null,
          orden: 1,
          estado: 'programada' as const,
        },
      ],
    };
    const obtener = jasmine
      .createSpy('obtener')
      .and.returnValues(Promise.reject(new Error('network')), Promise.resolve(detalleOk));
    const listar = jasmine
      .createSpy('listar')
      .and.returnValues(Promise.resolve([]), Promise.resolve([]));

    await TestBed.configureTestingModule({
      imports: [DateCertificatesPage],
      providers: [
        provideRouter([]),
        {
          provide: COURSES_SOURCE,
          useValue: {
            listar: () => Promise.resolve([]),
            obtener,
            crear: () => Promise.reject(new Error('noop')),
            actualizar: () => Promise.reject(new Error('noop')),
            actualizarEstado: () => Promise.reject(new Error('noop')),
            listarFechas: () => Promise.resolve([]),
            guardarFecha: () => Promise.reject(new Error('noop')),
            reemplazarFechas: () => Promise.reject(new Error('noop')),
          },
        },
        {
          provide: CERTIFICATIONS_SOURCE,
          useValue: {
            listar,
            obtenerEntregaManual: () => Promise.reject(new Error('noop')),
            descargarQrPng: () => Promise.reject(new Error('noop')),
          },
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(DateCertificatesPage);
    fixture.componentRef.setInput('id', '1');
    fixture.componentRef.setInput('fechaId', '11');
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const page = fixture.componentInstance;
    let el = fixture.nativeElement as HTMLElement;
    let text = el.textContent || '';
    expect(page.errorRecuperable()).toBeTrue();
    expect(text).toContain('Reintentar');
    expect(text).toContain('No se pudieron cargar los certificados');
    expect(text).not.toContain('network');
    expect(text.toLowerCase()).not.toMatch(/\bdni\b/);
    expect(text.toLowerCase()).not.toContain('token');
    expect(obtener).toHaveBeenCalledTimes(1);

    const reintentar = Array.from(el.querySelectorAll('button')).find((b) =>
      (b.textContent || '').includes('Reintentar'),
    ) as HTMLButtonElement;
    expect(reintentar).toBeTruthy();
    reintentar.click();
    await fixture.whenStable();
    fixture.detectChanges();

    el = fixture.nativeElement as HTMLElement;
    text = el.textContent || '';
    expect(obtener).toHaveBeenCalledTimes(2);
    expect(listar).toHaveBeenCalled();
    expect(page.error()).toBe('');
    expect(page.errorRecuperable()).toBeFalse();
    expect(text).toContain('Curso ok');
    expect(text).not.toContain('Reintentar');
  });

  it('id inválido muestra error controlado sin Reintentar', async () => {
    const f = await render('x', 11);
    const el = f.nativeElement as HTMLElement;
    const text = el.textContent || '';
    expect(f.componentInstance.error()).toBe('Curso no encontrado.');
    expect(f.componentInstance.errorRecuperable()).toBeFalse();
    expect(text).toContain('Curso no encontrado.');
    expect(text).not.toContain('Reintentar');
    expect(text.toLowerCase()).not.toContain('token');
  });

  it('API not-found en carga: sin Reintentar', async () => {
    const obtener = jasmine
      .createSpy('obtener')
      .and.rejectWith(new Error('Curso no encontrado en mock'));
    const listar = jasmine.createSpy('listar').and.resolveTo([]);

    await TestBed.configureTestingModule({
      imports: [DateCertificatesPage],
      providers: [
        provideRouter([]),
        {
          provide: COURSES_SOURCE,
          useValue: {
            listar: () => Promise.resolve([]),
            obtener,
            crear: () => Promise.reject(new Error('noop')),
            actualizar: () => Promise.reject(new Error('noop')),
            actualizarEstado: () => Promise.reject(new Error('noop')),
            listarFechas: () => Promise.resolve([]),
            guardarFecha: () => Promise.reject(new Error('noop')),
            reemplazarFechas: () => Promise.reject(new Error('noop')),
          },
        },
        {
          provide: CERTIFICATIONS_SOURCE,
          useValue: {
            listar,
            obtenerEntregaManual: () => Promise.reject(new Error('noop')),
            descargarQrPng: () => Promise.reject(new Error('noop')),
          },
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(DateCertificatesPage);
    fixture.componentRef.setInput('id', '99');
    fixture.componentRef.setInput('fechaId', '11');
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const page = fixture.componentInstance;
    const text = (fixture.nativeElement as HTMLElement).textContent || '';
    expect(page.error()).toBe('Curso no encontrado.');
    expect(page.errorRecuperable()).toBeFalse();
    expect(text).not.toContain('Reintentar');
    expect(text).not.toContain('Curso no encontrado en mock');
  });

  it('link Expediente por fila a /admin/certificaciones/:id', async () => {
    const f = await render(1, 11);
    const el = f.nativeElement as HTMLElement;
    const links = Array.from(
      el.querySelectorAll('[data-testid="cert-expediente"]'),
    ) as HTMLAnchorElement[];
    expect(links.length).toBeGreaterThan(0);
    const firstCert = f.componentInstance.certificados()[0];
    expect(links[0].textContent?.trim()).toBe('Expediente');
    expect(links[0].getAttribute('href')).toContain(`/admin/certificaciones/${firstCert.id}`);
    // No vive dentro de .cert-acciones (orden de botones intacto).
    expect(links[0].closest('.cert-acciones')).toBeNull();
    expect(links[0].closest('.cert-datos')).not.toBeNull();
  });

  it('error de acción: mensaje vía helper sin Reintentar ni raw único', async () => {
    const f = await render(1, 11);
    const page = f.componentInstance;
    const vigente = page.certificados().find((c) => page.puedeEntregar(c));
    expect(vigente).toBeTruthy();
    const certs = TestBed.inject(CERTIFICATIONS_SOURCE);
    spyOn(certs, 'obtenerEntregaManual').and.rejectWith(
      new HttpErrorResponse({
        status: 400,
        error: { error: { message: 'No se pudo obtener la entrega.' } },
      }),
    );

    const btn = (f.nativeElement as HTMLElement).querySelector(
      '[data-testid="cert-copiar-link"]',
    ) as HTMLButtonElement;
    btn.click();
    f.detectChanges();
    await f.whenStable();
    f.detectChanges();

    const text = (f.nativeElement as HTMLElement).textContent || '';
    expect(page.error()).toBe('No se pudo obtener la entrega.');
    expect(page.errorRecuperable()).toBeFalse();
    expect(text).not.toContain('Reintentar');
    expect(text.toLowerCase()).not.toContain('token');
  });

  it('error de acción sin envelope: genérico es-AR sin raw Error.message', async () => {
    const f = await render(1, 11);
    const page = f.componentInstance;
    const certs = TestBed.inject(CERTIFICATIONS_SOURCE);
    spyOn(certs, 'obtenerEntregaManual').and.rejectWith(
      new HttpErrorResponse({
        status: 0,
        statusText: 'Unknown Error',
        error: new ProgressEvent('error'),
      }),
    );

    const btn = (f.nativeElement as HTMLElement).querySelector(
      '[data-testid="cert-copiar-link"]',
    ) as HTMLButtonElement;
    btn.click();
    f.detectChanges();
    await f.whenStable();
    f.detectChanges();

    const text = (f.nativeElement as HTMLElement).textContent || '';
    expect(page.error()).toBe('No se pudo completar la acción. Intentá de nuevo.');
    expect(page.error()).not.toContain('Http failure');
    expect(page.errorRecuperable()).toBeFalse();
    expect(text).not.toContain('Reintentar');
  });
});
