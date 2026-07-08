import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { CourseDetailPage } from './course-detail-page';
import { COURSES_SOURCE } from './courses.service';
import { InMemoryCoursesService } from './in-memory-courses.service';

describe('CourseDetailPage', () => {
  async function render(id: number) {
    await TestBed.configureTestingModule({
      imports: [CourseDetailPage],
      providers: [
        provideRouter([]),
        { provide: COURSES_SOURCE, useClass: InMemoryCoursesService },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(CourseDetailPage);
    fixture.componentRef.setInput('id', String(id));
    // detectChanges dispara ngOnInit → cargar() async; whenStable espera la
    // promise; segundo detectChanges refleja el detalle en la vista.
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    return fixture;
  }

  it('muestra nombre, código y estado del curso', async () => {
    const f = await render(1);
    const el = f.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Curso de introducción a la gestión');
    expect(el.textContent).toContain('CUR-001');
    expect(el.textContent).toContain('Estado: activo');
  });

  it('muestra la lista de fechas como dl', async () => {
    const f = await render(1);
    const el = f.nativeElement as HTMLElement;
    const fechasDl = el.querySelector('.fechas-lista');
    expect(fechasDl).not.toBeNull();
    const rows = el.querySelectorAll('.fecha-row');
    expect(rows.length).toBe(3);
  });

  it('muestra enlace a editar y al listado', async () => {
    const f = await render(1);
    const el = f.nativeElement as HTMLElement;
    const editarLink = el.querySelector('a.btn-primary') as HTMLAnchorElement | null;
    expect(editarLink).not.toBeNull();
    expect(editarLink?.getAttribute('href')).toContain('/admin/cursos/1/editar');
    const volver = el.querySelector('a[routerLink="/admin/cursos"]');
    expect(volver).not.toBeNull();
  });

  it('muestra enlace Tomar asistencia por fecha', async () => {
    const f = await render(1);
    const el = f.nativeElement as HTMLElement;
    const asistLinks = Array.from(el.querySelectorAll('.fecha-asistencia')) as HTMLAnchorElement[];
    // Curso 1 tiene 3 fechas → 3 enlaces Tomar asistencia.
    expect(asistLinks.length).toBe(3);
    const first = asistLinks[0];
    expect(first.getAttribute('href')).toContain('/admin/cursos/1/fechas/11/asistencias');
    expect(first.getAttribute('aria-label')).toContain('Tomar asistencia');
  });

  it('oculta Tomar asistencia para fecha cancelada y muestra texto no accionable', async () => {
    // Curso 5 tiene una fecha cancelada (id 51).
    const f = await render(5);
    const el = f.nativeElement as HTMLElement;
    const links = Array.from(el.querySelectorAll('a.fecha-asistencia')) as HTMLAnchorElement[];
    // No debe haber enlace de asistencia para la fecha cancelada.
    expect(links.length).toBe(0);
    const span = el.querySelector('.fecha-asistencia-cancelada');
    expect(span).not.toBeNull();
    expect(span?.textContent).toContain('Fecha cancelada: no se toma asistencia');
  });

  it('id inexistente muestra error', async () => {
    const f = await render(999);
    const el = f.nativeElement as HTMLElement;
    await f.whenStable();
    f.detectChanges();
    expect(el.textContent).toContain('Curso no encontrado');
  });

  it('curso sin fechas muestra mensaje de vacío', async () => {
    // Crear un curso sin fechas y cargar el detalle para validar el
    // mensaje "no tiene fechas programadas".
    await TestBed.configureTestingModule({
      imports: [CourseDetailPage],
      providers: [
        provideRouter([]),
        { provide: COURSES_SOURCE, useClass: InMemoryCoursesService },
      ],
    }).compileComponents();
    const svc = TestBed.inject(COURSES_SOURCE);
    const nuevo = await svc.crear({ codigo: 'SINFECHAS', nombre: 'Curso sin fechas', estado: 'borrador' });
    const f = TestBed.createComponent(CourseDetailPage);
    f.componentRef.setInput('id', String(nuevo.id));
    f.detectChanges();
    await f.whenStable();
    f.detectChanges();
    const el = f.nativeElement as HTMLElement;
    expect(el.textContent).toContain('no tiene fechas programadas');
  });

  it('BandaEstado es región aria-live única', async () => {
    const f = await render(1);
    const el = f.nativeElement as HTMLElement;
    const live = el.querySelectorAll('[aria-live]');
    expect(live.length).toBe(1);
    expect(live[0].getAttribute('aria-live')).toBe('polite');
  });

  it('no llama fetch', async () => {
    const fetchSpy = spyOn(window, 'fetch').and.callThrough();
    await render(1);
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
