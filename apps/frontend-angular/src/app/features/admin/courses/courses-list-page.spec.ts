import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { CoursesListPage } from './courses-list-page';
import { COURSES_SOURCE } from './courses.service';
import { InMemoryCoursesService } from './in-memory-courses.service';

describe('CoursesListPage', () => {
  async function render() {
    await TestBed.configureTestingModule({
      imports: [CoursesListPage],
      providers: [
        provideRouter([]),
        { provide: COURSES_SOURCE, useClass: InMemoryCoursesService },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(CoursesListPage);
    // detectChanges dispara ctor → recargar() async; whenStable espera.
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    return fixture;
  }

  it('muestra título Cursos y enlace Nuevo curso', async () => {
    const f = await render();
    const el = f.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Cursos');
    const nuevoLink = el.querySelector('a[routerLink="/admin/cursos/nuevo"]');
    expect(nuevoLink).not.toBeNull();
  });

  it('muestra banner Datos de demostración', async () => {
    const f = await render();
    const el = f.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Datos de demostración');
  });

  it('expone input type=search y select de estado', async () => {
    const f = await render();
    const el = f.nativeElement as HTMLElement;
    expect(el.querySelector('input[type="search"]')).not.toBeNull();
    expect(el.querySelector('select')).not.toBeNull();
  });

  it('renderiza items del seed (6 cursos)', async () => {
    const f = await render();
    const el = f.nativeElement as HTMLElement;
    const cards = el.querySelectorAll('.card-curso');
    expect(cards.length).toBe(6);
  });

  it('enlaces de detalle apuntan a /admin/cursos/:id', async () => {
    const f = await render();
    const el = f.nativeElement as HTMLElement;
    const link = el.querySelector('.card-curso-link') as HTMLAnchorElement | null;
    expect(link).not.toBeNull();
    expect(link?.getAttribute('href')).toContain('/admin/cursos/');
  });

  it('filtrar por estado=activo reduce la lista', async () => {
    const f = await render();
    const el = f.nativeElement as HTMLElement;
    const select = el.querySelector('select') as HTMLSelectElement;
    select.value = 'activo';
    select.dispatchEvent(new Event('change'));
    f.detectChanges();
    await f.whenStable();
    f.detectChanges();
    const cards = el.querySelectorAll('.card-curso');
    expect(cards.length).toBe(3);
  });

  it('filtrar por texto reduce la lista', async () => {
    const f = await render();
    const el = f.nativeElement as HTMLElement;
    const input = el.querySelector('input[type="search"]') as HTMLInputElement;
    input.value = 'CUR-001';
    input.dispatchEvent(new Event('input'));
    f.detectChanges();
    await f.whenStable();
    f.detectChanges();
    const cards = el.querySelectorAll('.card-curso');
    expect(cards.length).toBe(1);
  });

  it('filtrar sin matches muestra mensaje de vacío', async () => {
    const f = await render();
    const el = f.nativeElement as HTMLElement;
    const input = el.querySelector('input[type="search"]') as HTMLInputElement;
    input.value = 'zzzz-no-existe';
    input.dispatchEvent(new Event('input'));
    f.detectChanges();
    await f.whenStable();
    f.detectChanges();
    expect(el.textContent).toContain('No hay cursos que coincidan');
  });

  it('no llama fetch', async () => {
    const fetchSpy = spyOn(window, 'fetch').and.callThrough();
    await render();
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});