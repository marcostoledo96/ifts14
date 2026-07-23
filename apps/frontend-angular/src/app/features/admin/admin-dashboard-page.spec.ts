import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AdminDashboardPage } from './admin-dashboard-page';
import { COURSES_SOURCE } from './courses/courses.service';
import type { CoursesService } from './courses/courses.service';
import { InMemoryCoursesService } from './courses/in-memory-courses.service';
import { CERTIFICATIONS_SOURCE } from './certifications/certifications.service';
import type { CertificationsService } from './certifications/certifications.service';
import { InMemoryCertificationsService } from './certifications/in-memory-certifications.service';
import { STUDENTS_SOURCE } from './students/students.service';
import type { StudentsService } from './students/students.service';
import { InMemoryStudentsService } from './students/in-memory-students.service';
import type { Certificacion } from './certifications/certifications.models';
import type { Curso } from './courses/courses.models';

describe('AdminDashboardPage', () => {
  async function render(providers: unknown[] = []) {
    await TestBed.configureTestingModule({
      imports: [AdminDashboardPage],
      providers: [
        provideRouter([]),
        { provide: COURSES_SOURCE, useClass: InMemoryCoursesService },
        { provide: CERTIFICATIONS_SOURCE, useClass: InMemoryCertificationsService },
        { provide: STUDENTS_SOURCE, useClass: InMemoryStudentsService },
        ...providers,
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(AdminDashboardPage);
    fixture.detectChanges();
    await Promise.resolve();
    await Promise.resolve();
    fixture.detectChanges();
    return fixture;
  }

  async function settle(fixture: { detectChanges: () => void }): Promise<void> {
    await Promise.resolve();
    await Promise.resolve();
    fixture.detectChanges();
  }

  it('muestra el encabezado de mesa de trabajo y no las 4 cards placeholder', async () => {
    const f = await render();
    const el = f.nativeElement as HTMLElement;
    expect(el.querySelector('#dash-title')?.textContent?.trim()).toBe('Panel de certificaciones');
    expect(el.textContent).toContain('Gestión de cursos, asistencias y certificados con QR');
    expect(el.querySelector('.cards')).toBeNull();
    expect(el.textContent).not.toContain('Vista placeholder sin datos reales');
    expect(el.textContent).not.toContain('Abrir Cursos');
    expect(el.textContent).not.toContain('Abrir Asistencias');
  });

  it('enlaza las cinco tiles v0 y deja Carga masiva deshabilitada', async () => {
    const f = await render();
    const el = f.nativeElement as HTMLElement;
    const links = Array.from(el.querySelectorAll('.acciones-grid a')) as HTMLAnchorElement[];
    const labels = links.map((a) => a.querySelector('.accion-label')?.textContent?.trim());
    expect(labels).toEqual([
      'Nueva certificación',
      'Nuevo curso',
      'Cargar asistencias',
      'Entrega manual',
    ]);

    const nueva = links.find((a) => a.textContent?.includes('Nueva certificación'));
    const curso = links.find((a) => a.textContent?.includes('Nuevo curso'));
    const asist = links.find((a) => a.textContent?.includes('Cargar asistencias'));
    const entrega = links.find((a) => a.textContent?.includes('Entrega manual'));

    expect(nueva?.getAttribute('href')).toContain('/admin/certificaciones/nueva');
    expect(nueva?.classList.contains('accion--primary')).toBeTrue();
    expect(curso?.getAttribute('href')).toContain('/admin/cursos/nuevo');
    expect(asist?.getAttribute('href')).toContain('/admin/asistencias');
    expect(entrega?.getAttribute('href')).toContain('/admin/certificaciones');
    // Configuración / Alumnos no son tiles de Acciones (sí se mencionan en el instructivo).
    const accionLabels = Array.from(el.querySelectorAll('.acciones-grid .accion-label')).map(
      (n) => n.textContent?.trim(),
    );
    expect(accionLabels).not.toContain('Configuración');
    expect(accionLabels).not.toContain('Alumnos');

    const carga = el.querySelector('button.accion--disabled') as HTMLButtonElement | null;
    expect(carga).toBeTruthy();
    expect(carga?.disabled).toBeTrue();
    expect(carga?.getAttribute('aria-disabled')).toBe('true');
    expect(carga?.getAttribute('title')).toContain('no está disponible');
    expect(carga?.textContent).toContain('Carga masiva');
    expect(carga?.textContent).toContain('Importar padrón desde CSV');
  });

  it('muestra instructivo antes de Pendientes con CTA Ver guía (sin navegación a módulos)', async () => {
    const f = await render();
    const el = f.nativeElement as HTMLElement;
    const flujo = el.querySelector('[data-testid="flujo-trabajo"]');
    const pendientes = el.querySelector('.pendientes');
    expect(flujo).not.toBeNull();
    expect(pendientes).not.toBeNull();
    expect(flujo!.compareDocumentPosition(pendientes!) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();

    expect(el.querySelector('#flujo-titulo')?.textContent).toContain('Flujo de trabajo');
    expect(flujo!.textContent).toContain('Cómo usar el panel');
    expect(flujo!.querySelectorAll('a').length).toBe(1);

    const guia = el.querySelector('[data-testid="flujo-ver-guia"]') as HTMLAnchorElement;
    expect(guia.getAttribute('href')).toContain('/admin/guia');
    expect(guia.textContent).toMatch(/Ver guía de trabajo/i);
    expect(guia.classList.contains('instructivo-cta')).toBeTrue();

    const labels = Array.from(el.querySelectorAll('.instructivo-paso-label')).map((n) =>
      n.textContent?.trim(),
    );
    expect(labels).toEqual(['Cursos', 'Alumnos', 'Asistencias', 'Certificaciones', 'Configuración']);
    expect(flujo!.querySelectorAll('a[href*="/admin/cursos"], a[href*="/admin/alumnos"], a[href*="/admin/asistencias"], a[href*="/admin/certificaciones"], a[href*="/admin/configuracion"]').length).toBe(0);
    expect(flujo!.querySelector('.flujo-abrir')).toBeNull();
  });

  it('bandeja v0: iconos por tono, links Revisar y solo sin-fechas con conteo real', async () => {
    const f = await render();
    await settle(f);
    const el = f.nativeElement as HTMLElement;
    expect(el.querySelector('#pendientes-titulo')?.textContent).toContain('Pendientes de resolución');
    // Total agregado sin fuente: se muestra "— tareas", nunca el "22 tareas" seed de v0.
    expect(el.querySelector('.pendientes .panel-meta')?.textContent).toContain('— tareas');
    expect(el.textContent).not.toContain('22 tareas');

    const rows = Array.from(el.querySelectorAll('.pendientes-list a.pendiente-row'));
    expect(rows.length).toBe(4);
    for (const row of rows) {
      expect(row.querySelector('.pendiente-icon svg')).not.toBeNull();
      expect(row.querySelector('.pendiente-revisar')?.textContent).toContain('Revisar');
    }
    expect(rows[0].getAttribute('href')).toContain('/admin/cursos');
    expect(rows[1].getAttribute('href')).toContain('/admin/alumnos');
    expect(rows[2].getAttribute('href')).toContain('/admin/certificaciones');

    // Conteo real derivado de cantidadFechas para "Cursos sin fechas asignadas".
    const courses = TestBed.inject(COURSES_SOURCE);
    const cursos = await courses.listar();
    const sinFechas = cursos.filter((c) => c.cantidadFechas === 0).length;
    const badges = Array.from(el.querySelectorAll('.pendiente-badge'));
    expect(badges.length).toBe(4);
    expect(badges[0].textContent?.trim()).toBe(String(sinFechas));
    for (const b of badges.slice(1)) {
      expect(b.textContent?.trim()).toBe('—');
    }
  });

  it('actividad v0: tabla con columnas y estado vacío sin PII ni eventos seed', async () => {
    const f = await render();
    const el = f.nativeElement as HTMLElement;
    expect(el.querySelector('#actividad-titulo')?.textContent).toContain('Actividad reciente');
    const ths = Array.from(el.querySelectorAll('.actividad-table th')).map((th) =>
      th.textContent?.trim(),
    );
    expect(ths).toEqual(['Hora', 'ID', 'Tipo', 'Detalle', 'Autor']);
    expect(el.textContent).toContain('Sin registro de actividad disponible');
    // Link presentacional deshabilitado (sin API de bitácora): no es <a>.
    const verRegistro = el.querySelector('.actividad .panel-link--disabled');
    expect(verRegistro?.textContent).toContain('Ver registro completo');
    expect(verRegistro?.tagName).not.toBe('A');
    expect(el.textContent).not.toContain('Vega');
    expect(el.textContent).not.toContain('EVT-9921');
    expect(el.textContent).not.toContain('bedelia.mpereyra');
    expect(el.textContent).not.toMatch(/\d{7,}/); // sin DNI-like
  });

  it('hidrata el resumen operativo desde los seams', async () => {
    const f = await render();
    await settle(f);
    const el = f.nativeElement as HTMLElement;

    const courses = TestBed.inject(COURSES_SOURCE);
    const students = TestBed.inject(STUDENTS_SOURCE);
    const certs = TestBed.inject(CERTIFICATIONS_SOURCE);
    const cursos = await courses.listar();
    const alumnos = await students.contar();
    const list = await certs.listar();
    const emitidas = list.filter((c) => c.estado === 'vigente' || c.estado === 'vencido').length;
    const revocadas = list.filter((c) => c.estado === 'revocado').length;

    expect(el.querySelector('[data-metric="cursos"]')?.textContent?.trim()).toBe(String(cursos.length));
    expect(el.querySelector('[data-metric="alumnos"]')?.textContent?.trim()).toBe(String(alumnos));
    expect(el.querySelector('[data-metric="emitidas"]')?.textContent?.trim()).toBe(String(emitidas));
    expect(el.querySelector('[data-metric="revocadas"]')?.textContent?.trim()).toBe(String(revocadas));
  });

  it('si los seams rechazan, muestra "—" e indicador de error', async () => {
    const rejectingCourses: Pick<CoursesService, 'listar'> = {
      listar: () => Promise.reject(new Error('fail')),
    };
    const rejectingStudents: Pick<StudentsService, 'contar'> = {
      contar: () => Promise.reject(new Error('fail')),
    };
    const rejectingCerts: Pick<CertificationsService, 'listar'> = {
      listar: () => Promise.reject(new Error('fail')),
    };

    await TestBed.configureTestingModule({
      imports: [AdminDashboardPage],
      providers: [
        provideRouter([]),
        { provide: COURSES_SOURCE, useValue: rejectingCourses },
        { provide: STUDENTS_SOURCE, useValue: rejectingStudents },
        { provide: CERTIFICATIONS_SOURCE, useValue: rejectingCerts },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(AdminDashboardPage);
    fixture.detectChanges();
    await settle(fixture);
    await settle(fixture);

    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('[data-metric="cursos"]')?.textContent?.trim()).toBe('—');
    expect(el.querySelector('[data-metric="alumnos"]')?.textContent?.trim()).toBe('—');
    expect(el.querySelector('[data-metric="emitidas"]')?.textContent?.trim()).toBe('—');
    expect(el.querySelector('[data-metric="revocadas"]')?.textContent?.trim()).toBe('—');
    expect(el.querySelector('.metricas-error')?.textContent).toContain('No se pudieron cargar');
  });

  it('usa OnPush', () => {
    const annotations = (AdminDashboardPage as unknown as { ɵcmp?: { onPush?: boolean } }).ɵcmp;
    expect(annotations?.onPush).toBeTrue();
  });

  it('acepta fakes tipados para conteos controlados', async () => {
    const cursosFake: readonly Curso[] = [
      {
        id: 1,
        codigo: 'C1',
        nombre: 'Curso 1',
        estado: 'activo',
        createdAt: '2026-01-01',
        updatedAt: '2026-01-01',
        cuatrimestre: 'Sin programar',
        cantidadFechas: 0,
        alumnosPresentes: null,
        certificaciones: null,
      },
      {
        id: 2,
        codigo: 'C2',
        nombre: 'Curso 2',
        estado: 'activo',
        createdAt: '2026-01-01',
        updatedAt: '2026-01-01',
        cuatrimestre: 'Sin programar',
        cantidadFechas: 0,
        alumnosPresentes: null,
        certificaciones: null,
      },
    ];
    const certsFake: readonly Certificacion[] = [
      {
        id: 1,
        numero: 'A',
        nombreAlumno: 'Demo',
        cursoNombre: 'C',
        estado: 'vigente',
        documentMasked: '12345678',
        tokenPrefix: 'abc',
        emitidoEn: '2026-01-01',
        venceEn: null,
      },
      {
        id: 2,
        numero: 'B',
        nombreAlumno: 'Demo',
        cursoNombre: 'C',
        estado: 'revocado',
        documentMasked: '12345678',
        tokenPrefix: 'def',
        emitidoEn: '2026-01-01',
        venceEn: null,
      },
      {
        id: 3,
        numero: 'C',
        nombreAlumno: 'Demo',
        cursoNombre: 'C',
        estado: 'vencido',
        documentMasked: '12345678',
        tokenPrefix: 'ghi',
        emitidoEn: '2026-01-01',
        venceEn: '2025-01-01',
      },
    ];

    await TestBed.configureTestingModule({
      imports: [AdminDashboardPage],
      providers: [
        provideRouter([]),
        { provide: COURSES_SOURCE, useValue: { listar: () => Promise.resolve(cursosFake) } },
        { provide: STUDENTS_SOURCE, useValue: { contar: () => Promise.resolve(9) } },
        { provide: CERTIFICATIONS_SOURCE, useValue: { listar: () => Promise.resolve(certsFake) } },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(AdminDashboardPage);
    fixture.detectChanges();
    await settle(fixture);

    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('[data-metric="cursos"]')?.textContent?.trim()).toBe('2');
    expect(el.querySelector('[data-metric="alumnos"]')?.textContent?.trim()).toBe('9');
    expect(el.querySelector('[data-metric="emitidas"]')?.textContent?.trim()).toBe('2');
    expect(el.querySelector('[data-metric="revocadas"]')?.textContent?.trim()).toBe('1');
  });
});
