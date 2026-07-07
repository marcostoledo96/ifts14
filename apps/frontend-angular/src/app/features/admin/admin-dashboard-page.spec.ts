import { TestBed } from '@angular/core/testing';
import { AdminDashboardPage } from './admin-dashboard-page';

describe('AdminDashboardPage', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [AdminDashboardPage] }).compileComponents();
  });

  it('renderiza 3 tarjetas Próximamente', () => {
    const fixture = TestBed.createComponent(AdminDashboardPage);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Próximamente: Cursos');
    expect(el.textContent).toContain('Próximamente: Asistencias');
    expect(el.textContent).toContain('Próximamente: Certificaciones');
  });

  it('indica handoff F2-04..F2-06', () => {
    const fixture = TestBed.createComponent(AdminDashboardPage);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('F2-04');
    expect(el.textContent).toContain('F2-05');
    expect(el.textContent).toContain('F2-06');
  });

  it('no llama fetch', () => {
    const fetchSpy = spyOn(window, 'fetch').and.callThrough();
    const fixture = TestBed.createComponent(AdminDashboardPage);
    fixture.detectChanges();
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});