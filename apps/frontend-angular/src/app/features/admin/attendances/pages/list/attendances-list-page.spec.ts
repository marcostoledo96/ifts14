import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AttendancesListPage } from './attendances-list-page';
import { COURSES_SOURCE } from '../../../courses/courses.service';
import { InMemoryCoursesService } from '../../../courses/in-memory-courses.service';
import { ATTENDANCE_SOURCE } from '../../data/attendance.token';
import { AttendanceMockService } from '../../data/attendance-mock.service';

describe('AttendancesListPage', () => {
  async function render() {
    await TestBed.configureTestingModule({
      imports: [AttendancesListPage],
      providers: [
        provideRouter([]),
        { provide: COURSES_SOURCE, useClass: InMemoryCoursesService },
        { provide: ATTENDANCE_SOURCE, useClass: AttendanceMockService },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(AttendancesListPage);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    return fixture;
  }

  it('muestra título Asistencias y banner de demo', async () => {
    const f = await render();
    const el = f.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Asistencias');
    expect(el.textContent).toContain('Datos de demostración');
  });

  it('renderiza tarjetas de fechas del seed (excluye canceladas)', async () => {
    const f = await render();
    const el = f.nativeElement as HTMLElement;
    const cards = el.querySelectorAll('.card-asis');
    // Seed: curso 1 (3), curso 2 (2), curso 3 (1), curso 4 (2), curso 5 (0 cancelada),
    // curso 6 (3) = 11 fechas no canceladas.
    expect(cards.length).toBe(11);
  });

  it('cada tarjeta tiene enlace Tomar asistencia', async () => {
    const f = await render();
    const el = f.nativeElement as HTMLElement;
    const links = el.querySelectorAll('.card-asis-link');
    expect(links.length).toBe(11);
    const first = links[0] as HTMLAnchorElement;
    expect(first.getAttribute('href')).toContain('/admin/cursos/');
    expect(first.getAttribute('href')).toContain('/fechas/');
    expect(first.getAttribute('href')).toContain('/asistencias');
  });

  it('expone input type=search', async () => {
    const f = await render();
    const el = f.nativeElement as HTMLElement;
    expect(el.querySelector('input[type="search"]')).not.toBeNull();
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
    const cards = el.querySelectorAll('.card-asis');
    expect(cards.length).toBe(3); // 3 fechas del curso 1
  });

  it('muestra conteo demostrativo presentes/total por fecha', async () => {
    const f = await render();
    const el = f.nativeElement as HTMLElement;
    const conteos = Array.from(el.querySelectorAll('.card-asis-conteo')).map(
      (d) => d.textContent?.trim() ?? '',
    );
    expect(conteos.length).toBe(11);
    // Todas las tarjetas muestran formato N/M.
    for (const c of conteos) {
      expect(c).toMatch(/^\d+\/\d+$/);
    }
  });

  it('conteo deriva del mock: fecha realizada curso 4 tiene 8 presentes', async () => {
    const f = await render();
    const el = f.nativeElement as HTMLElement;
    // Cada tarjeta: dl con dds [fecha, codigo, (detalle?), conteo].
    const cards = Array.from(el.querySelectorAll('.card-asis'));
    const conteos = cards.map((card) => {
      const dds = Array.from(card.querySelectorAll('.card-asis-meta dd'));
      const codigo = dds[1]?.textContent?.trim() ?? '';
      const conteo = card.querySelector('.card-asis-conteo')?.textContent?.trim() ?? '';
      return { codigo, conteo };
    });
    const cur004 = conteos.filter((c) => c.codigo === 'CUR-004');
    expect(cur004.length).toBe(2);
    const presentes = cur004.map((c) => Number(c.conteo.split('/')[0])).sort();
    expect(presentes).toEqual([7, 8]);
  });

  it('total deriva del mock: curso 1 tiene 13 alumnos (12 + 1)', async () => {
    const f = await render();
    const el = f.nativeElement as HTMLElement;
    const cards = Array.from(el.querySelectorAll('.card-asis'));
    const conteos = cards.map((card) => {
      const dds = Array.from(card.querySelectorAll('.card-asis-meta dd'));
      const codigo = dds[1]?.textContent?.trim() ?? '';
      const total = Number(
        (card.querySelector('.card-asis-conteo')?.textContent?.trim() ?? '').split('/')[1],
      );
      return { codigo, total };
    });
    const cur001 = conteos.filter((c) => c.codigo === 'CUR-001');
    expect(cur001.length).toBe(3);
    for (const c of cur001) {
      expect(c.total).toBe(13);
    }
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
    expect(el.textContent).toContain('No hay fechas que coincidan');
  });

  it('no llama fetch', async () => {
    const fetchSpy = spyOn(window, 'fetch').and.callThrough();
    await render();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('curso sin fechas asistibles no rompe la lista (no llama listarAlumnos)', async () => {
    await TestBed.configureTestingModule({
      imports: [AttendancesListPage],
      providers: [
        provideRouter([]),
        { provide: COURSES_SOURCE, useClass: InMemoryCoursesService },
        { provide: ATTENDANCE_SOURCE, useClass: AttendanceMockService },
      ],
    }).compileComponents();
    const courses = TestBed.inject(COURSES_SOURCE);
    // Crear un curso vacío (sin fechas): antes del fix, listarAlumnos(cursoId)
    // rechazaba y hacía errorar a /admin/asistencias.
    await courses.crear({ codigo: 'VACIO', nombre: 'Curso vacío', estado: 'borrador' });
    const f = TestBed.createComponent(AttendancesListPage);
    f.detectChanges();
    await f.whenStable();
    f.detectChanges();
    const el = f.nativeElement as HTMLElement;
    expect(el.querySelector('.estado-error')).toBeNull();
    expect(el.textContent).not.toContain('Curso no encontrado');
  });

  it('cada enlace Tomar asistencia tiene aria-label contextual con curso y fecha', async () => {
    const f = await render();
    const el = f.nativeElement as HTMLElement;
    const links = Array.from(el.querySelectorAll('.card-asis-link')) as HTMLAnchorElement[];
    expect(links.length).toBeGreaterThan(0);
    for (const link of links) {
      const card = link.closest('.card-asis') as HTMLElement;
      const curso = card.querySelector('.card-asis-title')?.textContent?.trim() ?? '';
      const fecha = card.querySelector('.card-asis-meta dd')?.textContent?.trim() ?? '';
      const label = link.getAttribute('aria-label') ?? '';
      expect(label).toBe(`Tomar asistencia de ${curso} — ${fecha}`);
    }
  });
});
