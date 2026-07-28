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
        certificacionesRevocadas: 0,
        ingreso: '2026',
        cursos: [],
      } satisfies AlumnoDetalle),
      actualizar: jasmine.createSpy('actualizar').and.resolveTo({
        id: 1,
        apellido: 'Editado',
        nombre: 'Alumno',
        dniMostrar: '20111222',
        email: null,
        estado: 'activo',
        tieneEmail: false,
        cursosConAsistencia: 0,
        certificacionesValidas: 0,
        certificacionesRevocadas: 0,
        ingreso: '2021',
        cursos: [],
      } satisfies AlumnoDetalle),
      ...source,
    };
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [StudentEditorPage],
      providers: [
        provideRouter([
          { path: 'admin/alumnos', children: [] },
          { path: 'admin/alumnos/:id', children: [] },
        ]),
        { provide: STUDENTS_SOURCE, useValue: students },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(StudentEditorPage);
    fixture.detectChanges();
    return { fixture, students, router: TestBed.inject(Router) };
  }

  function setFila(
    page: StudentEditorPage,
    index: number,
    data: { apellido: string; nombre: string; dni: string; email?: string },
  ): void {
    page.filas.update((list) =>
      list.map((row, i) =>
        i === index
          ? {
              ...row,
              apellido: data.apellido,
              nombre: data.nombre,
              dni: data.dni,
              email: data.email ?? '',
              errorApellido: '',
              errorNombre: '',
              errorDni: '',
              errorEmail: '',
            }
          : row,
      ),
    );
  }

  it('valida inline y no llama crear si faltan campos', async () => {
    const { fixture, students } = await render();
    const page = fixture.componentInstance;
    await page.guardar();
    fixture.detectChanges();
    expect(page.filas()[0].errorApellido).toContain('obligatorio');
    expect(page.filas()[0].errorNombre).toContain('obligatorio');
    expect(page.filas()[0].errorDni).toContain('obligatorio');
    expect(students.crear).not.toHaveBeenCalled();
  });

  it('crea con body mínimo y muestra resumen de creados', async () => {
    const { fixture, students, router } = await render();
    const navigateSpy = spyOn(router, 'navigate').and.resolveTo(true);
    const page = fixture.componentInstance;
    setFila(page, 0, { apellido: 'Nuevo', nombre: 'Alumno', dni: '30.111.222' });
    await page.guardar();
    fixture.detectChanges();
    expect(students.crear).toHaveBeenCalledWith({
      apellido: 'Nuevo',
      nombre: 'Alumno',
      dni: '30111222',
      email: null,
    });
    expect(navigateSpy).not.toHaveBeenCalled();
    expect(page.resultadoLote()?.creados).toEqual([
      jasmine.objectContaining({
        id: 42,
        apellido: 'Nuevo',
        nombre: 'Alumno',
        dniMostrar: '30111222',
      }),
    ]);
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Creados correctamente');
  });

  it('crea con email opcional cuando se completa', async () => {
    const { fixture, students } = await render();
    const page = fixture.componentInstance;
    setFila(page, 0, {
      apellido: 'Con',
      nombre: 'Email',
      dni: '30111224',
      email: 'contacto@example.invalid',
    });
    await page.guardar();
    expect(students.crear).toHaveBeenCalledWith({
      apellido: 'Con',
      nombre: 'Email',
      dni: '30111224',
      email: 'contacto@example.invalid',
    });
    expect(page.resultadoLote()?.creados.length).toBe(1);
  });

  it('agrega otra fila y crea varios mostrando resumen sin navegar', async () => {
    let n = 40;
    const crear = jasmine.createSpy('crear').and.callFake(async () => {
      n += 1;
      return {
        id: n,
        apellido: 'A',
        nombre: 'B',
        dniMostrar: '3011122' + String(n % 10),
        email: null,
        estado: 'activo' as const,
        tieneEmail: false,
        cursosConAsistencia: 0,
        certificacionesValidas: 0,
        certificacionesRevocadas: 0,
        ingreso: '2026',
        cursos: [],
      } satisfies AlumnoDetalle;
    });
    const { fixture, router } = await render({ crear });
    const navigateSpy = spyOn(router, 'navigate').and.resolveTo(true);
    const page = fixture.componentInstance;
    page.agregarFila();
    expect(page.cantidad()).toBe(2);
    setFila(page, 0, { apellido: 'Uno', nombre: 'A', dni: '30111221' });
    setFila(page, 1, { apellido: 'Dos', nombre: 'B', dni: '30111222' });
    await page.guardar();
    fixture.detectChanges();
    expect(crear).toHaveBeenCalledTimes(2);
    expect(navigateSpy).not.toHaveBeenCalled();
    expect(page.resultadoLote()?.creados.length).toBe(2);
    expect(page.resultadoLote()?.yaRegistrados.length).toBe(0);
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Creados correctamente');
  });

  it('bloquea doble submit y muestra listados si hay duplicados en el lote', async () => {
    let resolveCreate!: (v: AlumnoDetalle) => void;
    const pending = new Promise<AlumnoDetalle>((r) => { resolveCreate = r; });
    const crear = jasmine.createSpy('crear').and.returnValue(pending);
    const { fixture } = await render({ crear });
    const page = fixture.componentInstance;
    setFila(page, 0, { apellido: 'Dup', nombre: 'Test', dni: '30111222' });
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
        certificacionesRevocadas: 0,
      ingreso: '',
      cursos: [],
    });
    await first;

    let call = 0;
    const crearMixto = jasmine.createSpy('crear').and.callFake(async (draft: { dni: string }) => {
      call += 1;
      if (draft.dni === '30111222') {
        throw new StudentDuplicateError(7);
      }
      return {
        id: 50,
        apellido: 'Nuevo',
        nombre: 'Ok',
        dniMostrar: draft.dni,
        email: null,
        estado: 'activo' as const,
        tieneEmail: false,
        cursosConAsistencia: 0,
        certificacionesValidas: 0,
        certificacionesRevocadas: 0,
        ingreso: '2026',
        cursos: [],
      } satisfies AlumnoDetalle;
    });
    const { fixture: f2, router } = await render({ crear: crearMixto });
    const navigateSpy = spyOn(router, 'navigate').and.resolveTo(true);
    const p2 = f2.componentInstance;
    p2.agregarFila();
    setFila(p2, 0, { apellido: 'Nuevo', nombre: 'Ok', dni: '30999888' });
    setFila(p2, 1, { apellido: 'Dup', nombre: 'Test', dni: '30111222' });
    await p2.guardar();
    f2.detectChanges();

    expect(navigateSpy).not.toHaveBeenCalled();
    const resultado = p2.resultadoLote();
    expect(resultado).not.toBeNull();
    expect(resultado!.creados.length).toBe(1);
    expect(resultado!.creados[0].apellido).toBe('Nuevo');
    expect(resultado!.yaRegistrados.length).toBe(1);
    expect(resultado!.yaRegistrados[0].existingId).toBe(7);
    expect(resultado!.yaRegistrados[0].dniMostrar).toBe('30111222');

    const root = f2.nativeElement as HTMLElement;
    expect(root.textContent).toContain('Creados correctamente');
    expect(root.textContent).toContain('Ya estaban registrados');
    expect(root.textContent).toContain('Nuevo, Ok');
    expect(root.textContent).toContain('Dup, Test');
    const linkDup = root.querySelector<HTMLAnchorElement>('a[href*="/admin/alumnos/7"]');
    expect(linkDup).not.toBeNull();
  });

  it('expone agregar otro alumno y no selector de estado', async () => {
    const { fixture } = await render();
    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('input[name="apellido-0"]')).not.toBeNull();
    expect(root.querySelector('input[name="nombre-0"]')).not.toBeNull();
    expect(root.querySelector('input[name="email-0"]')).not.toBeNull();
    expect(root.textContent).toContain('(opcional)');
    expect(root.textContent).toContain('Agregar otro alumno');
    expect(root.querySelector('select')).toBeNull();
    expect(root.textContent).toContain('activo por defecto');
  });
});
