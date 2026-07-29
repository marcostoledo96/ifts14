import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { provideRouter, Router } from '@angular/router';
import {
  CertificationNewPage,
  formatearFechaCorta,
  hoyBuenosAires,
  normalizarTexto,
} from './certification-new-page';
import { CERTIFICATIONS_SOURCE } from '../../certifications.service';
import { COURSES_SOURCE } from '../../../courses/courses.service';
import { STUDENTS_SOURCE } from '../../../students/students.service';
import { ATTENDANCE_SOURCE } from '../../../attendances/data/attendance.token';
import { INSTITUTIONAL_CONFIG_SOURCE } from '../../../institutional-config/institutional-config.service';
import { Curso, CursoFecha } from '../../../courses/courses.models';
import { Alumno } from '../../../students/students.models';
import { Asistencia } from '../../../attendances/models/attendance.types';
import {
  emptyParameters,
  InstitutionalConfig,
} from '../../../institutional-config/institutional-config.service';
import { EmisionResult } from '../../certifications.models';

describe('hoyBuenosAires', () => {
  it('devuelve YYYY-MM-DD', () => {
    expect(hoyBuenosAires(new Date('2026-07-16T15:00:00Z'))).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe('normalizarTexto / formatearFechaCorta', () => {
  it('normaliza acentos', () => {
    expect(normalizarTexto('José')).toBe('jose');
  });

  it('formatea fecha corta es-AR', () => {
    expect(formatearFechaCorta('2025-09-01')).toMatch(/01\/09\/2025/);
  });
});

describe('CertificationNewPage', () => {
  const cursoActivo: Curso = {
    id: 4,
    codigo: 'CUR-004',
    nombre: 'Curso de procedimientos básicos',
    estado: 'activo',
    createdAt: '2025-01-01',
    updatedAt: '2025-01-01',
    cuatrimestre: '2025-2',
    cantidadFechas: 2,
  };
  const cursoSinRealizadas: Curso = {
    ...cursoActivo,
    id: 1,
    codigo: 'CUR-001',
    nombre: 'Curso sin realizadas',
    cuatrimestre: '2025-1',
  };

  const alumnoActivo: Alumno = {
    id: 46,
    apellido: 'Demo',
    nombre: 'Alumno',
    dniMostrar: '46000001',
    email: null,
    estado: 'activo',
    tieneEmail: false,
    cursosConAsistencia: 2,
    certificacionesValidas: 0,
    certificacionesRevocadas: 0,
  };
  const alumnoInactivo: Alumno = {
    ...alumnoActivo,
    id: 99,
    apellido: 'Inactivo',
    estado: 'inactivo',
  };
  const alumnoConEmail: Alumno = {
    ...alumnoActivo,
    id: 47,
    apellido: 'Conmail',
    nombre: 'Persona',
    email: 'persona@example.invalid',
    tieneEmail: true,
  };

  const fechasRealizadas: CursoFecha[] = [
    { id: 41, cursoId: 4, fecha: '2025-09-01', descripcion: 'Clase 1', orden: 1, estado: 'realizada' },
    { id: 42, cursoId: 4, fecha: '2025-09-08', descripcion: null, orden: 2, estado: 'realizada' },
  ];

  const asistencias: Asistencia[] = [
    {
      id: 1,
      alumnoId: 46,
      cursoId: 4,
      cursoFechaId: 41,
      fecha: '2025-09-01',
      fechaEstado: 'realizada',
      registradoEn: '2025-09-01T12:00:00Z',
    },
  ];

  const config: InstitutionalConfig = {
    institutionName: 'IFTS 14 Demo',
    certificateText: 'Certifica que',
    rectorName: 'Rector Demo',
    rectorRole: 'Rector/a',
    advisorName: 'Asesor Demo',
    advisorRole: 'Asesor/a pedagógico/a',
    rectorSignaturePresent: false,
    advisorSignaturePresent: false,
    parameters: emptyParameters(),
    updatedAt: '2026-01-01',
  };

  const RAW_LEAK =
    'Http failure response for https://api.example/admin/cursos: 500 token_secreto_abc123 DNI 46000001';

  let certs: {
    listar: jasmine.Spy;
    emitir: jasmine.Spy;
  };
  let courses: {
    listar: jasmine.Spy;
    listarFechas: jasmine.Spy;
  };
  let students: { listar: jasmine.Spy };
  let attendance: { listarAsistenciasPorPar: jasmine.Spy };
  let institutional: { obtener: jasmine.Spy };

  async function setup(overrides?: {
    fechas?: CursoFecha[];
    asistencias?: Asistencia[];
    vigentes?: unknown[];
    emitirImpl?: () => Promise<EmisionResult>;
    alumnos?: Alumno[];
    catalogosReject?: unknown;
    parReject?: unknown;
  }) {
    certs = {
      listar: jasmine.createSpy('listar').and.resolveTo(overrides?.vigentes ?? []),
      emitir: jasmine
        .createSpy('emitir')
        .and.callFake(
          overrides?.emitirImpl ??
            (() =>
              Promise.resolve({
                id: 77,
                certificateCode: 'IFTS14-CERT-0077',
                status: 'vigente',
                student: { displayName: 'Demo Alumno', documentMasked: '46000001' },
                course: { name: cursoActivo.nombre },
                issuedAt: '2026-07-16',
                expiresAt: null,
                tokenPrefix: 'prefijo_demo_x77',
                publicValidationUrl: 'https://example/validar/x',
                pdfDownloadUrl: '/admin/certificados/77/pdf',
              } satisfies EmisionResult)),
        ),
    };
    courses = {
      listar: jasmine.createSpy('listar').and.callFake(() =>
        overrides?.catalogosReject !== undefined
          ? Promise.reject(overrides.catalogosReject)
          : Promise.resolve([cursoActivo, cursoSinRealizadas]),
      ),
      listarFechas: jasmine.createSpy('listarFechas').and.callFake(async (cursoId: number) => {
        if (overrides?.parReject !== undefined) {
          return Promise.reject(overrides.parReject);
        }
        if (cursoId === 1) return [];
        return overrides?.fechas ?? fechasRealizadas;
      }),
    };
    students = {
      listar: jasmine
        .createSpy('listar')
        .and.resolveTo(overrides?.alumnos ?? [alumnoActivo, alumnoInactivo, alumnoConEmail]),
    };
    attendance = {
      listarAsistenciasPorPar: jasmine
        .createSpy('listarAsistenciasPorPar')
        .and.resolveTo(overrides?.asistencias ?? asistencias),
    };
    institutional = {
      obtener: jasmine.createSpy('obtener').and.resolveTo(config),
    };

    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [CertificationNewPage],
      providers: [
        provideRouter([{ path: 'admin/certificaciones/:id', component: CertificationNewPage }]),
        { provide: CERTIFICATIONS_SOURCE, useValue: certs },
        { provide: COURSES_SOURCE, useValue: courses },
        { provide: STUDENTS_SOURCE, useValue: students },
        { provide: ATTENDANCE_SOURCE, useValue: attendance },
        { provide: INSTITUTIONAL_CONFIG_SOURCE, useValue: institutional },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(CertificationNewPage);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    return fixture;
  }

  function selectCurso(root: HTMLElement, value: string): void {
    const el = root.querySelector('select[aria-label="Seleccionar curso activo"]') as HTMLSelectElement;
    el.value = value;
    el.dispatchEvent(new Event('change'));
  }

  async function elegirAlumnoPorId(
    fixture: Awaited<ReturnType<typeof setup>>,
    id: number,
  ): Promise<void> {
    const page = fixture.componentInstance;
    const alumno = page.alumnos().find((a) => a.id === id);
    expect(alumno).toBeTruthy();
    page.elegirAlumno(alumno!);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  }

  it('no es wizard de 3 pasos', async () => {
    const fixture = await setup();
    const text = ((fixture.nativeElement as HTMLElement).textContent || '').toLowerCase();
    expect(text).not.toContain('paso 1');
    expect(text).not.toContain('paso 2');
    expect(text).not.toContain('paso 3');
    expect(text).toContain('emisión documental');
    expect(text).toContain('nueva certificación');
  });

  it('posiciona rol edge vs Asistencias y no usa «complementario»', async () => {
    const fixture = await setup();
    const root = fixture.nativeElement as HTMLElement;
    const text = root.textContent || '';
    expect(text).toContain('Emisión puntual');
    expect(text).toContain('marcar asistencias');
    expect(text.toLowerCase()).toContain('generar desde ahí');
    expect(text.toLowerCase()).not.toContain('complementario');
    expect(root.querySelector('a[href*="asistencias"]')).toBeNull();
  });

  it('lista solo alumnos activos en el combobox', async () => {
    const fixture = await setup();
    const page = fixture.componentInstance;
    expect(page.alumnos().some((a) => a.apellido === 'Inactivo')).toBeFalse();
    expect(page.alumnos().some((a) => a.apellido === 'Demo')).toBeTrue();
    expect(courses.listar).toHaveBeenCalledWith({ estado: 'activo' });

    const root = fixture.nativeElement as HTMLElement;
    page.abrirBusquedaAlumno();
    fixture.detectChanges();
    const labels = Array.from(root.querySelectorAll('#lista-alumnos .list-name')).map(
      (n) => n.textContent || '',
    );
    expect(labels.some((t) => t.includes('Inactivo'))).toBeFalse();
    expect(labels.some((t) => t.includes('Demo'))).toBeTrue();
  });

  it('muestra preview documental con presentes, firmas tipográficas y sin folio inventado', async () => {
    const fixture = await setup();
    const root = fixture.nativeElement as HTMLElement;
    await elegirAlumnoPorId(fixture, 46);
    selectCurso(root, '4');
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const text = root.textContent || '';
    expect(text).toContain('01/09/2025');
    expect(text).toContain('Clase 1');
    expect(text).toContain('Presente');
    expect(text).toContain('Alumno Demo');
    expect(text).toContain('46000001');
    expect(text).toContain('Curso de procedimientos básicos');
    expect(text).toContain('2025-2');
    expect(text).toContain('Rector Demo');
    expect(text).toContain('Asesor Demo');
    expect(text).toContain('I. REGISTRO DE ASISTENCIA AUDITADO');
    expect(text).toContain('II. AUTORIDADES FIRMANTES');
    expect(text).toContain('Configuración institucional');
    expect(text).toContain('Representación tipográfica');
    expect(text).toContain('Se asigna al emitir');
    expect(text).toContain('Resumen de emisión');
    expect(text).toContain('Sin email');
    expect(text.toLowerCase()).not.toContain('@');
    expect(text.toLowerCase()).not.toContain('folio');
    expect(text.toLowerCase()).not.toContain('prefijo_demo');
    expect(text.toLowerCase()).not.toContain('token_secreto');
    expect(root.querySelector('.qr-decor')).toBeTruthy();
    expect(root.querySelector('.cert-band')).toBeTruthy();
  });

  it('bloquea emitir si el curso no tiene fechas realizadas', async () => {
    const fixture = await setup();
    const root = fixture.nativeElement as HTMLElement;
    await elegirAlumnoPorId(fixture, 46);
    selectCurso(root, '1');
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(root.textContent).toContain('no tiene fechas realizadas');
    const btn = root.querySelector('button.btn-emitir') as HTMLButtonElement;
    expect(btn.disabled).toBeTrue();
  });

  it('bloquea emitir si hay fechas pero el alumno no tiene presentes', async () => {
    const fixture = await setup({ asistencias: [] });
    const root = fixture.nativeElement as HTMLElement;
    await elegirAlumnoPorId(fixture, 46);
    selectCurso(root, '4');
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(root.textContent).toContain('Sin asistencias presentes');
    const btn = root.querySelector('button.btn-emitir') as HTMLButtonElement;
    expect(btn.disabled).toBeTrue();
  });

  it('muestra skeleton mientras carga el par', async () => {
    let resolveAtt!: (v: Asistencia[]) => void;
    const pending = new Promise<Asistencia[]>((r) => {
      resolveAtt = r;
    });
    const fixture = await setup();
    attendance.listarAsistenciasPorPar.and.returnValue(pending);

    const root = fixture.nativeElement as HTMLElement;
    await elegirAlumnoPorId(fixture, 46);
    selectCurso(root, '4');
    fixture.detectChanges();

    expect(root.querySelector('[data-testid="preview-skeleton"]')).toBeTruthy();
    expect(root.querySelector('.cert-doc')?.getAttribute('aria-busy')).toBe('true');

    resolveAtt(asistencias);
    await fixture.whenStable();
    fixture.detectChanges();
    expect(root.querySelector('[data-testid="preview-skeleton"]')).toBeNull();
  });

  it('descarta resultado stale al cambiar de par', async () => {
    let resolveFirst!: (v: Asistencia[]) => void;
    const first = new Promise<Asistencia[]>((r) => {
      resolveFirst = r;
    });
    const fixture = await setup();
    attendance.listarAsistenciasPorPar.and.returnValues(first, Promise.resolve([]));

    const root = fixture.nativeElement as HTMLElement;
    await elegirAlumnoPorId(fixture, 46);
    selectCurso(root, '4');
    fixture.detectChanges();
    selectCurso(root, '1');
    fixture.detectChanges();
    await fixture.whenStable();
    resolveFirst(asistencias);
    await fixture.whenStable();
    fixture.detectChanges();

    expect(root.textContent).not.toContain('Clase 1');
  });

  it('fallo de catálogos: mensaje fijo + Reintentar + flag; sin raw/DNI/token', async () => {
    const fixture = await setup({ catalogosReject: new Error(RAW_LEAK) });
    const page = fixture.componentInstance;
    const root = fixture.nativeElement as HTMLElement;
    const text = root.textContent || '';

    expect(page.errorCatalogosRecuperable()).toBeTrue();
    expect(text).toContain('No se pudieron cargar los catálogos. Reintentá.');
    expect(text).not.toContain('token_secreto');
    expect(text).not.toContain(RAW_LEAK);
    expect(root.querySelector('.estado-error .btn-retry')).toBeTruthy();

    courses.listar.and.resolveTo([cursoActivo, cursoSinRealizadas]);
    (root.querySelector('.estado-error .btn-retry') as HTMLButtonElement).click();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(page.errorCatalogos()).toBe('');
    expect(page.errorCatalogosRecuperable()).toBeFalse();
    expect(root.querySelector('select[aria-label="Seleccionar curso activo"]')).toBeTruthy();
  });

  it('fallo de par: mensaje fijo + Reintentar → cargarPar; sin raw', async () => {
    const fixture = await setup({ parReject: new Error(RAW_LEAK) });
    const page = fixture.componentInstance;
    const root = fixture.nativeElement as HTMLElement;
    await elegirAlumnoPorId(fixture, 46);
    selectCurso(root, '4');
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const text = root.textContent || '';
    expect(page.errorParRecuperable()).toBeTrue();
    expect(text).toContain('No se pudo evaluar la elegibilidad. Reintentá.');
    expect(text).not.toContain('token_secreto');
    expect(text).not.toContain(RAW_LEAK);
    const retry = root.querySelector('[data-testid="error-par"] .btn-retry') as HTMLButtonElement;
    expect(retry).toBeTruthy();

    courses.listarFechas.and.callFake(async (cursoId: number) => {
      if (cursoId === 1) return [];
      return fechasRealizadas;
    });
    const callsBefore = courses.listarFechas.calls.count();
    retry.click();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(courses.listarFechas.calls.count()).toBeGreaterThan(callsBefore);
    expect(page.errorPar()).toBe('');
    expect(page.errorParRecuperable()).toBeFalse();
  });

  it('emit else: mensajeErrorApi/genérico; sin Reintentar de load ni raw Error.message', async () => {
    const fixture = await setup({
      emitirImpl: () =>
        Promise.reject(
          new HttpErrorResponse({
            status: 418,
            statusText: 'I am a teapot',
            error: { error: { message: '  Envelope controlado  ' } },
            url: 'https://api.example/admin/certificados',
          }),
        ),
    });
    const root = fixture.nativeElement as HTMLElement;
    await elegirAlumnoPorId(fixture, 46);
    selectCurso(root, '4');
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    (root.querySelector('button.btn-emitir') as HTMLButtonElement).click();
    await fixture.whenStable();
    fixture.detectChanges();

    const emitBox = root.querySelector('[data-testid="error-emit"]');
    expect(emitBox?.textContent?.trim()).toBe('Envelope controlado');
    expect(root.querySelector('[data-testid="error-emit"] .btn-retry')).toBeNull();
    expect(fixture.componentInstance.errorCatalogosRecuperable()).toBeFalse();
    expect(fixture.componentInstance.errorParRecuperable()).toBeFalse();

    certs.emitir.and.rejectWith(
      Object.assign(new Error('raw leak token_secreto DNI 46000001'), { status: 503 }),
    );
    (root.querySelector('button.btn-emitir') as HTMLButtonElement).click();
    await fixture.whenStable();
    fixture.detectChanges();
    const text = root.textContent || '';
    expect(text).toContain('No se pudo emitir la certificación.');
    expect(text).not.toContain('token_secreto');
    expect(text).not.toContain('raw leak');
    expect(root.querySelector('[data-testid="error-emit"] .btn-retry')).toBeNull();
  });

  it('emite body con issuedAt BA y expiresAt null, deshabilita doble submit y navega', async () => {
    let resolveEmit!: (v: EmisionResult) => void;
    const emitPromise = new Promise<EmisionResult>((r) => {
      resolveEmit = r;
    });
    const fixture = await setup({
      emitirImpl: () => emitPromise,
    });
    const router = TestBed.inject(Router);
    const nav = spyOn(router, 'navigate').and.resolveTo(true);

    const root = fixture.nativeElement as HTMLElement;
    await elegirAlumnoPorId(fixture, 46);
    selectCurso(root, '4');
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const btn = root.querySelector('button.btn-emitir') as HTMLButtonElement;
    expect(btn.disabled).toBeFalse();
    btn.click();
    fixture.detectChanges();
    expect(btn.disabled).toBeTrue();
    btn.click();
    expect(certs.emitir).toHaveBeenCalledTimes(1);
    expect(certs.emitir.calls.mostRecent().args[0]).toEqual({
      alumnoId: 46,
      cursoId: 4,
      issuedAt: hoyBuenosAires(),
      expiresAt: null,
    });

    resolveEmit({
      id: 77,
      certificateCode: 'IFTS14-CERT-0077',
      status: 'vigente',
      student: { displayName: 'Demo Alumno', documentMasked: '46000001' },
      course: { name: cursoActivo.nombre },
      issuedAt: hoyBuenosAires(),
      expiresAt: null,
      tokenPrefix: 'prefijo_demo_x77',
      publicValidationUrl: 'https://example/validar/x',
      pdfDownloadUrl: '/admin/certificados/77/pdf',
    });
    await fixture.whenStable();
    expect(nav).toHaveBeenCalledWith(['/admin/certificaciones', 77]);
  });

  it('muestra error 409, conserva selección y no navega', async () => {
    const fixture = await setup({
      emitirImpl: () => Promise.reject(Object.assign(new Error('dup'), { status: 409 })),
    });
    const router = TestBed.inject(Router);
    const nav = spyOn(router, 'navigate').and.resolveTo(true);

    const root = fixture.nativeElement as HTMLElement;
    await elegirAlumnoPorId(fixture, 46);
    selectCurso(root, '4');
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    (root.querySelector('button.btn-emitir') as HTMLButtonElement).click();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(root.textContent).toContain('Ya existe un certificado vigente');
    expect(fixture.componentInstance.alumnoId()).toBe(46);
    expect(nav).not.toHaveBeenCalled();
    expect(root.querySelector('[data-testid="error-emit"] .btn-retry')).toBeNull();
  });

  it('muestra error 400/500 sin navegar', async () => {
    const fixture = await setup({
      emitirImpl: () => Promise.reject(Object.assign(new Error('bad'), { status: 400 })),
    });
    const nav = spyOn(TestBed.inject(Router), 'navigate').and.resolveTo(true);
    const root = fixture.nativeElement as HTMLElement;
    await elegirAlumnoPorId(fixture, 46);
    selectCurso(root, '4');
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    (root.querySelector('button.btn-emitir') as HTMLButtonElement).click();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(root.textContent).toContain('datos no son válidos');
    expect(nav).not.toHaveBeenCalled();
  });

  async function setupWithQuery(query: Record<string, string>) {
    const fixture = await setup();
    const { convertToParamMap } = await import('@angular/router');
    (
      fixture.componentInstance as unknown as {
        aplicarQueryPreselect: (qp: ReturnType<typeof convertToParamMap>) => void;
      }
    ).aplicarQueryPreselect(convertToParamMap(query));
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    return fixture;
  }

  it('preselecciona alumno y curso válidos desde query', async () => {
    const fixture = await setupWithQuery({ alumno: '46', curso: '4' });
    const page = fixture.componentInstance;
    expect(page.alumnoId()).toBe(46);
    expect(page.cursoId()).toBe(4);
    expect(attendance.listarAsistenciasPorPar).toHaveBeenCalledWith(4, 46);
    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('[data-testid="aviso-query"]')).toBeNull();
  });

  it('ignora alumno inválido con aviso no bloqueante', async () => {
    const fixture = await setupWithQuery({ alumno: '99999', curso: '4' });
    const page = fixture.componentInstance;
    expect(page.alumnoId()).toBeNull();
    expect(page.cursoId()).toBe(4);
    const root = fixture.nativeElement as HTMLElement;
    expect(root.textContent).toContain('no está disponible o no está activo');
  });

  it('muestra DNI completo en chip y preview', async () => {
    const fixture = await setup();
    const root = fixture.nativeElement as HTMLElement;
    await elegirAlumnoPorId(fixture, 46);
    selectCurso(root, '4');
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const text = root.textContent || '';
    expect(text).toContain('46000001');
    expect(text).not.toMatch(/46\*+\d*|••••|masked/i);
  });
});
