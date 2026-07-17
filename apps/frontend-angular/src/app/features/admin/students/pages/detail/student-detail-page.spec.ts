import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { StudentDetailPage } from './student-detail-page';
import { STUDENTS_SOURCE } from '../../students.service';
import { InMemoryStudentsService } from '../../in-memory-students.service';
import { ATTENDANCE_SOURCE } from '../../../attendances/data/attendance.token';
import { Asistencia } from '../../../attendances/models/attendance.types';

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
        ]),
        { provide: STUDENTS_SOURCE, useValue: studentsService },
        {
          provide: ATTENDANCE_SOURCE,
          useValue: {
            listarAsistenciasPorAlumno,
            listarAsistenciasPorPar: () => Promise.resolve([]),
            listarAsistencias: () => Promise.resolve([]),
            listarAlumnos: () => Promise.resolve([]),
            marcar: () => Promise.resolve([]),
            anular: () => Promise.resolve(),
          },
        },
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

    expect(textContent).toContain('Persona Uno');
    expect(textContent).toContain('00****01');
    expect(textContent).toContain('2021');

    expect(textContent.toLowerCase()).not.toContain('legajo');
    expect(textContent.toLowerCase()).not.toContain('leg-');
    expect(textContent.toLowerCase()).not.toContain('email@');
    expect(textContent.toLowerCase()).not.toContain('example.invalid');

    expect(textContent).toContain('Curso de introducción a la gestión');
    expect(textContent).toContain('CUR-001');
    expect(textContent).toContain('2/3');
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

  it('mantiene Compartir y Editar disabled con motivos honestos', async () => {
    const harness = await RouterTestingHarness.create('/admin/alumnos/1');
    await harness.detectChanges();
    await harness.fixture.whenStable();
    await harness.detectChanges();

    const rootElement = harness.fixture.nativeElement as HTMLElement;

    const sharingBtn = rootElement.querySelector('[aria-describedby="motivo-compartir"]');
    expect(sharingBtn).not.toBeNull();
    expect(sharingBtn?.getAttribute('disabled')).toBeDefined();

    expect(rootElement.textContent).toContain('expediente de cada certificación');
    expect(rootElement.textContent).toContain('Sin API de actualización de datos personales');
    expect(rootElement.textContent).not.toContain('F2-05');
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
