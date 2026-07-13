import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { StudentDetailPage } from './student-detail-page';
import { STUDENTS_SOURCE } from '../../students.service';
import { InMemoryStudentsService } from '../../in-memory-students.service';

describe('StudentDetailPage', () => {
  let studentsService: InMemoryStudentsService;

  beforeEach(async () => {
    studentsService = new InMemoryStudentsService();

    await TestBed.configureTestingModule({
      imports: [StudentDetailPage],
      providers: [
        provideRouter([
          { path: 'admin/alumnos/:id', component: StudentDetailPage },
          { path: 'admin/alumnos', component: class DummyComponent {} },
        ]),
        { provide: STUDENTS_SOURCE, useValue: studentsService },
      ],
    }).compileComponents();
  });

  it('debe renderizar la información de un alumno del seed con privacidad rígida', async () => {
    const harness = await RouterTestingHarness.create('/admin/alumnos/1');
    await harness.detectChanges();
    await harness.fixture.whenStable();
    await harness.detectChanges();

    const rootElement = harness.fixture.nativeElement as HTMLElement;
    const textContent = rootElement.textContent || '';

    // Debe mostrar nombre y datos autorizados
    expect(textContent).toContain('Persona Uno');
    expect(textContent).toContain('00****01');
    expect(textContent).toContain('2021');

    // NINGÚN dato sensible debe filtrarse (legajo, email literal, matrícula, etc.)
    expect(textContent.toLowerCase()).not.toContain('legajo');
    expect(textContent.toLowerCase()).not.toContain('leg-');
    expect(textContent.toLowerCase()).not.toContain('email@');
    expect(textContent.toLowerCase()).not.toContain('example.invalid');

    // Debe mostrar sus cursos y presentes
    expect(textContent).toContain('Curso de introducción a la gestión');
    expect(textContent).toContain('CUR-001');
    expect(textContent).toContain('2/3'); // presentes: ['2026-03-02', '2026-03-09', '2026-03-16']
  });

  it('debe mostrar los controles deshabilitados para emisión de certificación', async () => {
    const harness = await RouterTestingHarness.create('/admin/alumnos/1');
    await harness.detectChanges();
    await harness.fixture.whenStable();
    await harness.detectChanges();

    const rootElement = harness.fixture.nativeElement as HTMLElement;

    // Para el curso 3 (pendiente), debe existir un botón deshabilitado para emitir
    const emitirCertBtn = Array.from(rootElement.querySelectorAll('button')).find(el => el.textContent?.includes('Emitir certificación'));
    expect(emitirCertBtn).toBeDefined();
    expect(emitirCertBtn?.hasAttribute('disabled')).toBeTrue();
    
    // El CTA de Nueva certificación también debe estar deshabilitado
    const nuevaCertBtn = Array.from(rootElement.querySelectorAll('button')).find(el => el.textContent?.includes('Nueva certificación'));
    expect(nuevaCertBtn).toBeDefined();
    expect(nuevaCertBtn?.hasAttribute('disabled')).toBeTrue();
  });

  it('debe manejar adecuadamente un ID no encontrado', async () => {
    const harness = await RouterTestingHarness.create('/admin/alumnos/999');
    await harness.detectChanges();
    await harness.fixture.whenStable();
    await harness.detectChanges();

    const rootElement = harness.fixture.nativeElement as HTMLElement;
    expect(rootElement.textContent).toContain('Alumno no encontrado');
  });

  it('debe manejar adecuadamente un ID inválido', async () => {
    const harnessInvalido = await RouterTestingHarness.create('/admin/alumnos/abc');
    await harnessInvalido.detectChanges();
    await harnessInvalido.fixture.whenStable();
    await harnessInvalido.detectChanges();

    const rootElementInvalido = harnessInvalido.fixture.nativeElement as HTMLElement;
    expect(rootElementInvalido.textContent).toContain('Identificador de alumno inválido');
  });

  it('debe proveer controles deshabilitados con explicaciones claras de handoff', async () => {
    const harness = await RouterTestingHarness.create('/admin/alumnos/1');
    await harness.detectChanges();
    await harness.fixture.whenStable();
    await harness.detectChanges();

    const rootElement = harness.fixture.nativeElement as HTMLElement;

    const sharingBtn = rootElement.querySelector('[aria-describedby="motivo-compartir"]');
    expect(sharingBtn).not.toBeNull();
    expect(sharingBtn?.getAttribute('disabled')).toBeDefined();

    expect(rootElement.textContent).toContain('Disponible en F5-04');
    expect(rootElement.textContent).toContain('Disponible en F2-05');
  });
});
