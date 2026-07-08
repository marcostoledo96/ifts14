import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AdminDashboardPage } from './admin-dashboard-page';
import { COURSES_SOURCE } from './courses/courses.service';
import { InMemoryCoursesService } from './courses/in-memory-courses.service';

describe('AdminDashboardPage', () => {
  async function render() {
    await TestBed.configureTestingModule({
      imports: [AdminDashboardPage],
      providers: [
        provideRouter([]),
        // COURSES_SOURCE disponible para que el dashboard pueda hidratar
        // el conteo en el futuro. El componente lo inyecta opcionalmente.
        { provide: COURSES_SOURCE, useClass: InMemoryCoursesService },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(AdminDashboardPage);
    fixture.detectChanges();
    return fixture;
  }

  it('muestra tarjeta Cursos como enlace a /admin/cursos', async () => {
    const f = await render();
    const el = f.nativeElement as HTMLElement;
    const link = el.querySelector('a[routerLink]') as HTMLAnchorElement | null;
    expect(link).not.toBeNull();
    expect(link?.textContent).toContain('Abrir Cursos');
    expect(link?.getAttribute('href')).toContain('/admin/cursos');
  });

  it('muestra conteo ficticio de cursos en demo', async () => {
    const f = await render();
    const el = f.nativeElement as HTMLElement;
    expect(el.textContent).toContain('6');
  });

  it('mantiene Asistencias y Certificaciones como placeholders', async () => {
    const f = await render();
    const el = f.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Próximamente: Asistencias');
    expect(el.textContent).toContain('Próximamente: Certificaciones');
  });

  it('indica handoff F2-05 y F2-06', async () => {
    const f = await render();
    const el = f.nativeElement as HTMLElement;
    expect(el.textContent).toContain('F2-05');
    expect(el.textContent).toContain('F2-06');
  });

  it('no llama fetch', async () => {
    const fetchSpy = spyOn(window, 'fetch').and.callThrough();
    const f = await render();
    f.detectChanges();
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});