import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { StudentDuplicateError } from '../../student-duplicate.error';
import { AlumnoDetalle } from '../../students.models';
import { STUDENTS_SOURCE, StudentsService } from '../../students.service';
import { mensajeErrorAlta, StudentEditorPage } from './student-editor-page';

describe('mensajeErrorAlta', () => {
  it('no incluye DNI en mensajes y mapea 409', () => {
    const msg = mensajeErrorAlta({ status: 409, message: 'dup 30111222' });
    expect(msg).toContain('documento');
    expect(msg).not.toContain('30111222');
  });
});

describe('StudentEditorPage', () => {
  async function render(source: Partial<StudentsService> = {}) {
    const students: StudentsService = {
      listar: () => Promise.resolve([]),
      contar: () => Promise.resolve(0),
      obtener: () => Promise.resolve(null),
      crear: jasmine.createSpy('crear').and.resolveTo({
        id: 42,
        apellido: 'Nuevo',
        nombre: 'Alumno',
        dniMostrar: '30111222',
        email: null,
        estado: 'activo',
        tieneEmail: false,
        cursosConAsistencia: 0,
        certificacionesValidas: 0,
        ingreso: '2026',
        cursos: [],
      } satisfies AlumnoDetalle),
      ...source,
    };
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [StudentEditorPage],
      providers: [
        provideRouter([{ path: 'admin/alumnos/:id', children: [] }]),
        { provide: STUDENTS_SOURCE, useValue: students },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(StudentEditorPage);
    fixture.detectChanges();
    return { fixture, students, router: TestBed.inject(Router) };
  }

  it('valida inline y no llama crear si faltan campos', async () => {
    const { fixture, students } = await render();
    const page = fixture.componentInstance;
    await page.guardar();
    fixture.detectChanges();
    expect(page.errorApellido()).toContain('obligatorios');
    expect(page.errorDni()).toContain('obligatorio');
    expect(students.crear).not.toHaveBeenCalled();
  });

  it('crea con body mínimo y navega al detalle', async () => {
    const { fixture, students, router } = await render();
    const navigateSpy = spyOn(router, 'navigate').and.resolveTo(true);
    const page = fixture.componentInstance;
    page.apellidoNombre.set('Nuevo Alumno');
    page.dni.set('30.111.222');
    await page.guardar();
    expect(students.crear).toHaveBeenCalledWith({
      apellidoNombre: 'Nuevo Alumno',
      dni: '30111222',
      email: null,
    });
    expect(navigateSpy).toHaveBeenCalledWith(['/admin/alumnos', 42]);
  });

  it('crea con email opcional cuando se completa', async () => {
    const { fixture, students } = await render();
    const page = fixture.componentInstance;
    page.apellidoNombre.set('Con Email');
    page.dni.set('30111224');
    page.email.set('contacto@example.invalid');
    await page.guardar();
    expect(students.crear).toHaveBeenCalledWith({
      apellidoNombre: 'Con Email',
      dni: '30111224',
      email: 'contacto@example.invalid',
    });
  });

  it('bloquea doble submit y muestra error 409 sin DNI', async () => {
    let resolveCreate!: (v: AlumnoDetalle) => void;
    const pending = new Promise<AlumnoDetalle>((r) => { resolveCreate = r; });
    const crear = jasmine.createSpy('crear').and.returnValue(pending);
    const { fixture } = await render({ crear });
    const page = fixture.componentInstance;
    page.apellidoNombre.set('Dup Test');
    page.dni.set('30111222');
    const first = page.guardar();
    expect(page.guardando()).toBeTrue();
    const second = page.guardar();
    await second;
    expect(crear).toHaveBeenCalledTimes(1);
    resolveCreate({
      id: 1,
      apellido: 'X',
      nombre: 'Y',
      dniMostrar: '30111222',
      email: null,
      estado: 'activo',
      tieneEmail: false,
      cursosConAsistencia: 0,
      certificacionesValidas: 0,
      ingreso: '',
      cursos: [],
    });
    await first;

    const err = new StudentDuplicateError(7);
    const { fixture: f2, students } = await render({
      crear: jasmine.createSpy('crear').and.rejectWith(err),
    });
    const p2 = f2.componentInstance;
    p2.apellidoNombre.set('Dup Test');
    p2.dni.set('30111222');
    await p2.guardar();
    f2.detectChanges();
    expect(p2.errorSubmit()).toContain('documento');
    expect(p2.errorSubmit()).not.toContain('30111222');
    expect(p2.alumnoExistenteId()).toBe(7);
    const link = (f2.nativeElement as HTMLElement).querySelector<HTMLAnchorElement>(
      'a.estado-error-link',
    );
    expect(link?.textContent?.trim()).toBe('Ver perfil del alumno');
    expect(link?.getAttribute('href')).toContain('/admin/alumnos/7');
    expect((f2.nativeElement as HTMLElement).textContent).not.toContain('30111222');
    expect(students.crear).toHaveBeenCalled();
  });

  it('expone campo email opcional y no selector de estado', async () => {
    const { fixture } = await render();
    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('input[name="email"]')).not.toBeNull();
    expect(root.textContent).toContain('(opcional)');
    expect(root.querySelector('select')).toBeNull();
    expect(root.textContent).toContain('activo por defecto');
  });
});
