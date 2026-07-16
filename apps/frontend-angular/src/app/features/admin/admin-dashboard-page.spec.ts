import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AdminDashboardPage } from './admin-dashboard-page';
import { COURSES_SOURCE } from './courses/courses.service';
import { InMemoryCoursesService } from './courses/in-memory-courses.service';
import { CERTIFICATIONS_SOURCE } from './certifications/certifications.service';
import { InMemoryCertificationsService } from './certifications/in-memory-certifications.service';
import type { CertificationsService } from './certifications/certifications.service';
import { STUDENTS_SOURCE } from './students/students.service';
import { InMemoryStudentsService } from './students/in-memory-students.service';

describe('AdminDashboardPage', () => {
  async function render() {
    await TestBed.configureTestingModule({
      imports: [AdminDashboardPage],
      providers: [
        provideRouter([]),
        // COURSES_SOURCE disponible para que el dashboard pueda hidratar
        // el conteo en el futuro. El componente lo inyecta opcionalmente.
        { provide: COURSES_SOURCE, useClass: InMemoryCoursesService },
        { provide: CERTIFICATIONS_SOURCE, useClass: InMemoryCertificationsService },
        { provide: STUDENTS_SOURCE, useClass: InMemoryStudentsService },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(AdminDashboardPage);
    fixture.detectChanges();
    return fixture;
  }

  it('muestra tarjeta Cursos como enlace a /admin/cursos', async () => {
    const f = await render();
    const el = f.nativeElement as HTMLElement;
    const links = Array.from(el.querySelectorAll('a[routerLink]')) as HTMLAnchorElement[];
    const cursosLink = links.find((a) => a.textContent?.includes('Abrir Cursos'));
    expect(cursosLink).toBeDefined();
    expect(cursosLink?.getAttribute('href')).toContain('/admin/cursos');
  });

  it('muestra tarjeta Asistencias como enlace a /admin/asistencias', async () => {
    const f = await render();
    const el = f.nativeElement as HTMLElement;
    const links = Array.from(el.querySelectorAll('a[routerLink]')) as HTMLAnchorElement[];
    const asistLink = links.find((a) => a.textContent?.includes('Abrir Asistencias'));
    expect(asistLink).toBeDefined();
    expect(asistLink?.getAttribute('href')).toContain('/admin/asistencias');
  });

  it('muestra tarjeta Certificaciones como enlace a /admin/certificaciones', async () => {
    const f = await render();
    const el = f.nativeElement as HTMLElement;
    const links = Array.from(el.querySelectorAll('a[routerLink]')) as HTMLAnchorElement[];
    const certLink = links.find((a) => a.textContent?.includes('Abrir Certificaciones'));
    expect(certLink).toBeDefined();
    expect(certLink?.getAttribute('href')).toContain('/admin/certificaciones');
  });

  it('muestra tarjeta Alumnos como enlace a /admin/alumnos', async () => {
    const f = await render();
    const link = Array.from((f.nativeElement as HTMLElement).querySelectorAll('a')).find((a) => a.textContent?.includes('Abrir Alumnos'));
    expect(link?.getAttribute('href')).toContain('/admin/alumnos');
  });

  it('muestra conteo ficticio de cursos en demo', async () => {
    const f = await render();
    const el = f.nativeElement as HTMLElement;
    expect(el.textContent).toContain('6');
  });

  it('el conteo de certificaciones coincide con CERTIFICATIONS_SOURCE.contar()', async () => {
    const f = await render();
    const svc = TestBed.inject(CERTIFICATIONS_SOURCE);
    const esperado = await svc.contar();
    // estabiliza el signal async (contar() resuelve en microtask).
    f.detectChanges();
    await Promise.resolve();
    f.detectChanges();
    const el = f.nativeElement as HTMLElement;
    const count = el.querySelector('.card-count[aria-label="Cantidad de certificaciones en demo"]');
    expect(count?.textContent?.trim()).toBe(String(esperado));
  });

  it('la tarjeta Certificaciones no contiene "Próximamente" ni "F2-06"', async () => {
    const f = await render();
    const el = f.nativeElement as HTMLElement;
    expect(el.textContent).not.toContain('Próximamente');
    expect(el.textContent).not.toContain('F2-06');
  });

  it('si CERTIFICATIONS_SOURCE.contar() rechaza, el conteo queda en 0 sin romper el dashboard', async () => {
    const rejecting: CertificationsService = {
      listar: () => Promise.reject(new Error('Network error')),
      obtener: () => Promise.reject(new Error('Network error')),
      obtenerEntregaManual: () => Promise.reject(new Error('Network error')),
      contar: () => Promise.reject(new Error('Network error')),
      revocar: () => Promise.reject(new Error('Network error')),
    };
    await TestBed.configureTestingModule({
      imports: [AdminDashboardPage],
      providers: [
        provideRouter([]),
        { provide: COURSES_SOURCE, useClass: InMemoryCoursesService },
        { provide: CERTIFICATIONS_SOURCE, useValue: rejecting },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(AdminDashboardPage);
    fixture.detectChanges();
    await Promise.resolve();
    await Promise.resolve();
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const count = el.querySelector('.card-count[aria-label="Cantidad de certificaciones en demo"]');
    expect(count?.textContent?.trim()).toBe('0');
  });

  it('no llama fetch', async () => {
    const fetchSpy = spyOn(window, 'fetch').and.callThrough();
    const f = await render();
    f.detectChanges();
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
