import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { CERTIFICATIONS_SOURCE } from '../../../certifications/certifications.service';
import { InMemoryCertificationsService } from '../../../certifications/in-memory-certifications.service';
import { COURSES_SOURCE } from '../../../courses/courses.service';
import { InMemoryCoursesService } from '../../../courses/in-memory-courses.service';
import { DateCertificatesPage } from './date-certificates-page';

describe('DateCertificatesPage', () => {
  async function render(id: number, fechaId: number) {
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
    const certs = TestBed.inject(CERTIFICATIONS_SOURCE);
    const spy = spyOn(certs, 'descargarQrPng').and.callThrough();
    const btn = (f.nativeElement as HTMLElement).querySelector(
      '[data-testid="cert-descargar-qr"]',
    ) as HTMLButtonElement;
    btn.click();
    f.detectChanges();
    await f.whenStable();
    expect(spy).toHaveBeenCalled();
  });

  it('no expone token completo en la lista', async () => {
    const f = await render(1, 11);
    const text = (f.nativeElement as HTMLElement).textContent || '';
    expect(text).not.toMatch(/-completo/);
    expect(text).toMatch(/\d{7,8}/); // DNI completo admin
  });
});
