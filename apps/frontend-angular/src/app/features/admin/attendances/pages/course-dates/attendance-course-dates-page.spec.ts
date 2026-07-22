import { TestBed } from '@angular/core/testing';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { AttendanceCourseDatesPage } from './attendance-course-dates-page';
import { COURSES_SOURCE } from '../../../courses/courses.service';
import { InMemoryCoursesService } from '../../../courses/in-memory-courses.service';
import { ATTENDANCE_SOURCE } from '../../data/attendance.token';
import { AttendanceMockService } from '../../data/attendance-mock.service';

describe('AttendanceCourseDatesPage', () => {
  async function render(id: string) {
    await TestBed.configureTestingModule({
      imports: [AttendanceCourseDatesPage],
      providers: [
        provideRouter([], withComponentInputBinding()),
        { provide: COURSES_SOURCE, useClass: InMemoryCoursesService },
        { provide: ATTENDANCE_SOURCE, useClass: AttendanceMockService },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(AttendanceCourseDatesPage);
    fixture.componentRef.setInput('id', id);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    return fixture;
  }

  function tableRows(el: HTMLElement): NodeListOf<Element> {
    return el.querySelectorAll('[data-testid="curso-fechas-tabla"] tbody tr');
  }

  function cards(el: HTMLElement): NodeListOf<Element> {
    return el.querySelectorAll('.lista-asis .card-asis');
  }

  it('lista solo fechas no canceladas del curso', async () => {
    const f = await render('1');
    const el = f.nativeElement as HTMLElement;
    // CUR-001: 3 realizadas.
    expect(tableRows(el).length).toBe(3);
    expect(cards(el).length).toBe(3);
    expect(el.textContent).toContain('Curso de introducción a la gestión');
    const estados = Array.from(el.querySelectorAll('[data-testid="curso-fechas-tabla"] .estado-chip')).map(
      (n) => n.textContent?.trim().toLowerCase() ?? '',
    );
    expect(estados.every((e) => e !== 'cancelada')).toBeTrue();
  });

  it('expone chips programada/realizada y filtra por estado', async () => {
    const f = await render('6');
    const el = f.nativeElement as HTMLElement;
    expect(el.querySelector('button[data-estado="programada"]')).toBeTruthy();
    expect(el.querySelector('button[data-estado="realizada"]')).toBeTruthy();
    // CUR-006: 3 programadas.
    expect(tableRows(el).length).toBe(3);

    const chipRealizada = el.querySelector(
      'button[data-estado="realizada"]',
    ) as HTMLButtonElement;
    chipRealizada.click();
    f.detectChanges();
    expect(tableRows(el).length).toBe(0);
    expect(el.textContent).toMatch(/Ninguna fecha coincide|No hay fechas que coincidan/i);

    const chipProgramada = el.querySelector(
      'button[data-estado="programada"]',
    ) as HTMLButtonElement;
    chipProgramada.click();
    f.detectChanges();
    expect(tableRows(el).length).toBe(3);
  });

  it('CTA Tomar asistencia apunta al marcado existente', async () => {
    const f = await render('1');
    const el = f.nativeElement as HTMLElement;
    const links = Array.from(
      el.querySelectorAll('[data-testid="curso-fechas-tabla"] .card-asis-link'),
    ) as HTMLAnchorElement[];
    expect(links.length).toBe(3);
    for (const link of links) {
      const href = link.getAttribute('href') ?? '';
      expect(href).toMatch(/^\/admin\/cursos\/1\/fechas\/\d+\/asistencias$/);
      expect(link.textContent).toContain('Tomar asistencia');
    }
  });

  it('empty claro con enlace al detalle del curso cuando no hay fechas asistibles', async () => {
    const f = await render('5');
    const el = f.nativeElement as HTMLElement;
    expect(tableRows(el).length).toBe(0);
    expect(el.textContent).toMatch(/no tiene fechas asistibles|sin fechas asistibles/i);
    const link = el.querySelector('a[href="/admin/cursos/5"]') as HTMLAnchorElement;
    expect(link).toBeTruthy();
  });

  it('curso ausente en el hub muestra error controlado', async () => {
    const f = await render('9999');
    const el = f.nativeElement as HTMLElement;
    expect(el.querySelector('.estado-error')).toBeTruthy();
    expect(el.textContent).toMatch(/no encontrad/i);
  });

  it('id inválido muestra error controlado sin tumbar', async () => {
    const f = await render('abc');
    const el = f.nativeElement as HTMLElement;
    expect(el.querySelector('.estado-error')).toBeTruthy();
    expect(el.textContent).toMatch(/no encontrad/i);
  });
});
