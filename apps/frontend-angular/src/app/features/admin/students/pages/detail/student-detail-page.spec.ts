import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { StudentDetailPage } from './student-detail-page';
import { STUDENTS_SOURCE } from '../../students.service';
import { InMemoryStudentsService } from '../../in-memory-students.service';
import { ATTENDANCE_SOURCE } from '../../../attendances/data/attendance.token';
import { Asistencia } from '../../../attendances/models/attendance.types';
import { AlumnoDetalle } from '../../students.models';

function detalleStub(overrides: Partial<AlumnoDetalle> = {}): AlumnoDetalle {
  return {
    id: 1,
    apellido: 'Ficticia',
    nombre: 'Persona Uno',
    dniMostrar: '20111222',
    email: 'persona.uno@example.invalid',
    estado: 'activo',
    tieneEmail: true,
    cursosConAsistencia: 4,
    certificacionesValidas: 2,
    certificacionesRevocadas: 0,
    ingreso: '2021',
    cursos: [],
    ...overrides,
  };
}

describe('StudentDetailPage', () => {
  let studentsService: InMemoryStudentsService;
  let listarAsistenciasPorAlumno: jasmine.Spy;

  beforeEach(async () => {
    studentsService = new InMemoryStudentsService();
    listarAsistenciasPorAlumno = jasmine
      .createSpy('listarAsistenciasPorAlumno')
      .and.resolveTo([] as Asistencia[]);

    await TestBed.configureTestingModule({
      imports: [StudentDetailPage],
      providers: [
        provideRouter([
          { path: 'admin/alumnos/:id', component: StudentDetailPage },
          { path: 'admin/alumnos', component: class DummyComponent {} },
          { path: 'admin/certificaciones/nueva', component: class DummyComponent {} },
          { path: 'admin/certificaciones/:id', component: class DummyComponent {} },
        ]),
        { provide: STUDENTS_SOURCE, useValue: studentsService },
        {
          provide: ATTENDANCE_SOURCE,
          useValue: {
            listarAsistenciasPorAlumno,
            listarAsistenciasPorPar: () => Promise.resolve([]),
            listarAsistencias: () => Promise.resolve([]),
            listarAsistenciasDeCurso: () => Promise.resolve([]),
            listarHub: () =>
              Promise.resolve({ cursos: [], fechas: [], asistencias: [], alumnosActivos: 0 }),
            listarAlumnos: () => Promise.resolve([]),
            marcar: () => Promise.resolve([]),
            anular: () => Promise.resolve(),
          },
        },
      ],
    }).compileComponents();
  });

  it('debe renderizar la información de un alumno del seed con DNI completo', async () => {
    const harness = await RouterTestingHarness.create('/admin/alumnos/1');
    await harness.detectChanges();
    await harness.fixture.whenStable();
    await harness.detectChanges();

    const rootElement = harness.fixture.nativeElement as HTMLElement;
    const textContent = rootElement.textContent || '';

    expect(textContent).toContain('Persona Uno');
    expect(textContent).toContain('20111222');
    expect(textContent).toContain('persona.uno@example.invalid');
    expect(textContent).toContain('2021');
    expect(textContent).toContain('Ficha');
    expect(textContent).toContain('#1');

    // Copy sin legajo / legajos inventados LEG-* ni tokens.
    expect(textContent.toLowerCase()).not.toMatch(/legajo/);
    expect(textContent.toLowerCase()).not.toContain('leg-');

    expect(textContent).toContain('Curso de introducción a la gestión');
    expect(textContent).toContain('CUR-001');
    expect(textContent).toContain('2/3');
    expect(textContent).toContain('Ver certificación');
  });

  it('muestra métricas: revocadas 0 literal y sin regresión en válidas/cursos', async () => {
    const harness = await RouterTestingHarness.create();
    const page = await harness.navigateByUrl('/admin/alumnos/1', StudentDetailPage);
    await harness.fixture.whenStable();
    await harness.detectChanges();

    const root = harness.fixture.nativeElement as HTMLElement;

    expect(page.formatoMetrica(0)).toBe('0');
    expect(page.formatoMetrica(null)).toBe('—');
    const resumen = root.querySelector('.resumen-metodologia') as HTMLElement;
    expect(resumen).toBeTruthy();
    const revocadasItem = Array.from(resumen.querySelectorAll('.resumen-item')).find((el) =>
      (el.textContent || '').includes('CERTIFICACIONES REVOCADAS'),
    ) as HTMLElement;
    expect(revocadasItem).toBeTruthy();
    expect(revocadasItem.querySelector('.num')?.textContent?.trim()).toBe('0');
    expect(resumen.textContent).toContain('4');
    expect(resumen.textContent).toContain('2');
  });

  it('muestra «—» cuando certificacionesRevocadas es null', async () => {
    spyOn(studentsService, 'obtener').and.resolveTo(
      detalleStub({ certificacionesRevocadas: null, cursos: [] }),
    );

    const harness = await RouterTestingHarness.create('/admin/alumnos/1');
    await harness.detectChanges();
    await harness.fixture.whenStable();
    await harness.detectChanges();

    const root = harness.fixture.nativeElement as HTMLElement;
    const resumen = root.querySelector('.resumen-metodologia') as HTMLElement;
    expect(resumen).toBeTruthy();
    expect(resumen.textContent).toContain('CERTIFICACIONES REVOCADAS');
    expect(resumen.textContent).toContain('—');
  });

  it('enlaza Ver certificación cuando el curso emitido tiene certificacionId', async () => {
    const harness = await RouterTestingHarness.create('/admin/alumnos/1');
    await harness.detectChanges();
    await harness.fixture.whenStable();
    await harness.detectChanges();

    const rootElement = harness.fixture.nativeElement as HTMLElement;
    const verLinks = Array.from(rootElement.querySelectorAll('a')).filter((a) =>
      (a.textContent || '').includes('Ver certificación'),
    ) as HTMLAnchorElement[];
    // Tabla desktop + tarjeta mobile: misma certificación emitida del seed (#1).
    expect(verLinks.length).toBeGreaterThanOrEqual(2);
    expect(verLinks.every((a) => (a.getAttribute('href') || '').includes('/admin/certificaciones/1'))).toBeTrue();
  });

  it('habilita Nueva certificación y Emitir con query params', async () => {
    const harness = await RouterTestingHarness.create('/admin/alumnos/1');
    await harness.detectChanges();
    await harness.fixture.whenStable();
    await harness.detectChanges();

    const rootElement = harness.fixture.nativeElement as HTMLElement;

    const nueva = rootElement.querySelector('[data-testid="cta-nueva-certificacion"]') as HTMLAnchorElement;
    expect(nueva).toBeTruthy();
    expect(nueva.getAttribute('href')).toContain('/admin/certificaciones/nueva');
    expect(nueva.getAttribute('href')).toContain('alumno=1');

    const emitir = rootElement.querySelector('[data-testid="emitir-certificacion"]') as HTMLAnchorElement;
    expect(emitir).toBeTruthy();
    expect(emitir.getAttribute('href')).toContain('alumno=1');
    expect(emitir.getAttribute('href')).toContain('curso=3');
  });

  it('debe manejar adecuadamente un ID no encontrado sin Reintentar', async () => {
    const harness = await RouterTestingHarness.create();
    const page = await harness.navigateByUrl('/admin/alumnos/999', StudentDetailPage);
    await harness.fixture.whenStable();
    await harness.detectChanges();

    const rootElement = harness.fixture.nativeElement as HTMLElement;
    const text = rootElement.textContent || '';
    expect(text).toContain('Alumno no encontrado');
    expect(text).toContain('Volver a Alumnos');
    expect(text).not.toContain('Reintentar');
    expect(page.errorRecuperable()).toBeFalse();
  });

  it('debe manejar adecuadamente un ID inválido sin Reintentar', async () => {
    const harnessInvalido = await RouterTestingHarness.create();
    const page = await harnessInvalido.navigateByUrl('/admin/alumnos/abc', StudentDetailPage);
    await harnessInvalido.fixture.whenStable();
    await harnessInvalido.detectChanges();

    const rootElementInvalido = harnessInvalido.fixture.nativeElement as HTMLElement;
    const text = rootElementInvalido.textContent || '';
    expect(text).toContain('Identificador de alumno inválido');
    expect(text).toContain('Volver a Alumnos');
    expect(text).not.toContain('Reintentar');
    expect(page.errorRecuperable()).toBeFalse();
  });

  it('id inválido descarta una carga numérica en vuelo y no muestra Reintentar', async () => {
    let resolveObtener!: (value: AlumnoDetalle | null) => void;
    spyOn(studentsService, 'obtener').and.returnValue(
      new Promise<AlumnoDetalle | null>((resolve) => {
        resolveObtener = resolve;
      }),
    );

    const harness = await RouterTestingHarness.create();
    const page = await harness.navigateByUrl('/admin/alumnos/1', StudentDetailPage);
    expect(studentsService.obtener).toHaveBeenCalledWith(1);

    await harness.navigateByUrl('/admin/alumnos/abc', StudentDetailPage);
    await harness.fixture.whenStable();
    harness.detectChanges();

    resolveObtener(detalleStub());
    await Promise.resolve();
    harness.detectChanges();

    const text = (harness.fixture.nativeElement as HTMLElement).textContent || '';
    expect(text).toContain('Identificador de alumno inválido');
    expect(text).not.toContain('Reintentar');
    expect(page.errorRecuperable()).toBeFalse();
    expect(page.alumno()).toBeNull();
  });

  it('fallo recuperable muestra Reintentar y Volver; Reintentar re-llama obtener sin PII', async () => {
    const obtener = spyOn(studentsService, 'obtener').and.returnValues(
      Promise.reject(new Error('network')),
      Promise.resolve(detalleStub()),
    );

    const harness = await RouterTestingHarness.create();
    const page = await harness.navigateByUrl('/admin/alumnos/1', StudentDetailPage);
    await harness.fixture.whenStable();
    await harness.detectChanges();

    let root = harness.fixture.nativeElement as HTMLElement;
    let text = root.textContent || '';
    expect(page.errorRecuperable()).toBeTrue();
    expect(text).toContain('Reintentar');
    expect(text).toContain('Volver a Alumnos');
    expect(text).toContain('No pudimos cargar la ficha');
    expect(text.toLowerCase()).not.toMatch(/legajo/);
    expect(text).not.toContain('20111222');
    expect(text.toLowerCase()).not.toContain('token');
    expect(obtener).toHaveBeenCalledTimes(1);

    page.onReintentar();
    await harness.fixture.whenStable();
    await harness.detectChanges();

    root = harness.fixture.nativeElement as HTMLElement;
    text = root.textContent || '';
    expect(obtener).toHaveBeenCalledTimes(2);
    expect(page.error()).toBe('');
    expect(text).toContain('Persona Uno');
    expect(text).toContain('20111222');
  });

  it('oculta Compartir y habilita Editar datos hacia /editar', async () => {
    const harness = await RouterTestingHarness.create('/admin/alumnos/1');
    await harness.detectChanges();
    await harness.fixture.whenStable();
    await harness.detectChanges();

    const rootElement = harness.fixture.nativeElement as HTMLElement;

    expect(rootElement.textContent).not.toContain('Compartir por canal externo');
    expect(rootElement.querySelector('[aria-describedby="motivo-compartir"]')).toBeNull();
    expect(rootElement.textContent).not.toContain('Sin API de actualización de datos personales');

    const editar = rootElement.querySelector('[data-testid="cta-editar-datos"]') as HTMLAnchorElement;
    expect(editar).toBeTruthy();
    expect(editar.getAttribute('href')).toContain('/admin/alumnos/1/editar');
  });

  it('carga asistencias read-only al expandir Ver asistencias', async () => {
    listarAsistenciasPorAlumno.and.resolveTo([
      {
        id: 9,
        alumnoId: 1,
        cursoId: 3,
        cursoFechaId: 30,
        fecha: '2026-05-04',
        fechaEstado: 'realizada',
        registradoEn: '2026-05-04T12:00:00Z',
      },
    ] satisfies Asistencia[]);

    const harness = await RouterTestingHarness.create('/admin/alumnos/1');
    await harness.detectChanges();
    await harness.fixture.whenStable();
    await harness.detectChanges();

    const root = harness.fixture.nativeElement as HTMLElement;
    const btn = root.querySelector('[data-testid="cta-ver-asistencias"]') as HTMLButtonElement;
    btn.click();
    await harness.fixture.whenStable();
    await harness.detectChanges();

    expect(listarAsistenciasPorAlumno).toHaveBeenCalledWith(1);
    expect(root.textContent).toContain('2026-05-04');
    expect(root.textContent).toContain('CUR-003');
    expect(root.querySelector('a[href*="/admin/asistencias"]')).toBeNull();
  });

  it('muestra empty state cuando Ver asistencias no tiene registros', async () => {
    listarAsistenciasPorAlumno.and.resolveTo([] as Asistencia[]);

    const harness = await RouterTestingHarness.create('/admin/alumnos/1');
    await harness.detectChanges();
    await harness.fixture.whenStable();
    await harness.detectChanges();

    const root = harness.fixture.nativeElement as HTMLElement;
    const btn = root.querySelector('[data-testid="cta-ver-asistencias"]') as HTMLButtonElement;
    btn.click();
    await harness.fixture.whenStable();
    await harness.detectChanges();

    expect(listarAsistenciasPorAlumno).toHaveBeenCalledWith(1);
    expect(root.textContent).toContain('Sin asistencias registradas');
  });

  it('muestra loading mientras carga asistencias', async () => {
    let resolveList!: (value: Asistencia[]) => void;
    listarAsistenciasPorAlumno.and.returnValue(
      new Promise<Asistencia[]>((resolve) => {
        resolveList = resolve;
      }),
    );

    const harness = await RouterTestingHarness.create('/admin/alumnos/1');
    await harness.detectChanges();
    await harness.fixture.whenStable();
    await harness.detectChanges();

    const root = harness.fixture.nativeElement as HTMLElement;
    const btn = root.querySelector('[data-testid="cta-ver-asistencias"]') as HTMLButtonElement;
    btn.click();
    await Promise.resolve();
    await harness.detectChanges();

    expect(root.textContent).toContain('Cargando asistencias');
    expect(root.querySelector('[aria-busy="true"]')).not.toBeNull();

    resolveList([]);
    await harness.fixture.whenStable();
    await harness.detectChanges();

    expect(root.textContent).toContain('Sin asistencias registradas');
  });

  it('muestra error y permite reintentar cuando fallan las asistencias', async () => {
    listarAsistenciasPorAlumno.and.rejectWith(new Error('network'));

    const harness = await RouterTestingHarness.create('/admin/alumnos/1');
    await harness.detectChanges();
    await harness.fixture.whenStable();
    await harness.detectChanges();

    const root = harness.fixture.nativeElement as HTMLElement;
    const btn = root.querySelector('[data-testid="cta-ver-asistencias"]') as HTMLButtonElement;
    btn.click();
    await harness.fixture.whenStable();
    await harness.detectChanges();

    expect(root.textContent).toContain('No se pudieron cargar las asistencias. Reintentá.');

    listarAsistenciasPorAlumno.and.resolveTo([] as Asistencia[]);
    const retry = Array.from(root.querySelectorAll('button')).find((el) =>
      (el.textContent || '').includes('Reintentar'),
    ) as HTMLButtonElement;
    expect(retry).toBeTruthy();
    retry.click();
    await harness.fixture.whenStable();
    await harness.detectChanges();

    expect(listarAsistenciasPorAlumno).toHaveBeenCalledTimes(2);
    expect(root.textContent).toContain('Sin asistencias registradas');
  });
});
