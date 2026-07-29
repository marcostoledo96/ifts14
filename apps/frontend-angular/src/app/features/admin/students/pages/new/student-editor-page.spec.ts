import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { StudentDuplicateError } from '../../student-duplicate.error';
import { AlumnoDetalle } from '../../students.models';
import { STUDENTS_SOURCE, StudentsService } from '../../students.service';
import { mensajeErrorAlta, StudentEditorPage } from './student-editor-page';

const detalleBase = (overrides: Partial<AlumnoDetalle> = {}): AlumnoDetalle =>
  ({
    id: 1,
    apellido: 'Ficticia',
    nombre: 'Persona Uno',
    dniMostrar: '20111222',
    email: 'persona.uno@example.invalid',
    estado: 'activo',
    tieneEmail: true,
    cursosConAsistencia: 0,
    certificacionesValidas: 0,
    certificacionesRevocadas: 0,
    ingreso: '2021',
    cursos: [],
    ...overrides,
  }) satisfies AlumnoDetalle;

describe('mensajeErrorAlta', () => {
  it('no incluye DNI en mensajes y mapea 409', () => {
    const msg = mensajeErrorAlta({ status: 409, message: 'dup 30111222' });
    expect(msg).toContain('documento');
    expect(msg).not.toContain('30111222');
  });

  it('en edit no incluye DNI ni token', () => {
    const msg = mensajeErrorAlta({ status: 400, message: 'token abc123token dni 30111222' }, 'edit');
    expect(msg).toContain('actualizar');
    expect(msg).not.toContain('30111222');
    expect(msg).not.toContain('abc123token');
  });
});

describe('StudentEditorPage', () => {
  async function render(source: Partial<StudentsService> = {}) {
    const students: StudentsService = {
      listar: () => Promise.resolve([]),
      contar: () => Promise.resolve(0),
      obtener: () => Promise.resolve(null),
      crear: jasmine.createSpy('crear').and.resolveTo(
        detalleBase({
          id: 42,
          apellido: 'Nuevo',
          nombre: 'Alumno',
          dniMostrar: '30111222',
          email: null,
          tieneEmail: false,
          ingreso: '2026',
        }),
      ),
      actualizar: jasmine.createSpy('actualizar').and.resolveTo(
        detalleBase({
          id: 1,
          apellido: 'Editado',
          nombre: 'Alumno',
          dniMostrar: '20111222',
          email: null,
          tieneEmail: false,
        }),
      ),
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

  async function renderEdit(
    id: string,
    source: Partial<StudentsService> = {},
  ): Promise<{
    fixture: Awaited<ReturnType<typeof render>>['fixture'];
    students: StudentsService;
    router: Router;
  }> {
    const ctx = await render(source);
    ctx.fixture.componentRef.setInput('mode', 'edit');
    ctx.fixture.componentRef.setInput('id', id);
    ctx.fixture.detectChanges();
    await ctx.fixture.whenStable();
    ctx.fixture.detectChanges();
    return ctx;
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

  it('copy de ayuda email sin legajo ni legajos', async () => {
    const { fixture } = await render();
    const text = ((fixture.nativeElement as HTMLElement).textContent || '').toLowerCase();
    expect(text).not.toContain('legajo');
    expect(text).not.toContain('legajos');
    expect(text).toContain('ficha del alumno');
  });

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
    const root = fixture.nativeElement as HTMLElement;
    expect(root.textContent).toContain('Creados correctamente');
    expect(root.textContent).toContain('DNI 30111222');
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
      return detalleBase({
        id: n,
        apellido: 'A',
        nombre: 'B',
        dniMostrar: '3011122' + String(n % 10),
        email: null,
        tieneEmail: false,
        ingreso: '2026',
      });
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
    const pending = new Promise<AlumnoDetalle>((r) => {
      resolveCreate = r;
    });
    const crear = jasmine.createSpy('crear').and.returnValue(pending);
    const { fixture } = await render({ crear });
    const page = fixture.componentInstance;
    setFila(page, 0, { apellido: 'Dup', nombre: 'Test', dni: '30111222' });
    const first = page.guardar();
    expect(page.guardando()).toBeTrue();
    const second = page.guardar();
    await second;
    expect(crear).toHaveBeenCalledTimes(1);
    resolveCreate(
      detalleBase({
        id: 1,
        apellido: 'X',
        nombre: 'Y',
        dniMostrar: '30111222',
        email: null,
        tieneEmail: false,
        ingreso: '',
      }),
    );
    await first;

    const crearMixto = jasmine.createSpy('crear').and.callFake(async (draft: { dni: string }) => {
      if (draft.dni === '30111222') {
        throw new StudentDuplicateError(7);
      }
      return detalleBase({
        id: 50,
        apellido: 'Nuevo',
        nombre: 'Ok',
        dniMostrar: draft.dni,
        email: null,
        tieneEmail: false,
        ingreso: '2026',
      });
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
    expect(root.textContent).toContain('DNI 30111222');
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

  it('edit carga OK y rellena el formulario', async () => {
    const obtener = jasmine.createSpy('obtener').and.resolveTo(detalleBase());
    const { fixture } = await renderEdit('1', { obtener });
    const page = fixture.componentInstance;
    expect(obtener).toHaveBeenCalledWith(1);
    expect(page.errorCarga()).toBe('');
    expect(page.filas()[0].apellido).toBe('Ficticia');
    expect(page.filas()[0].nombre).toBe('Persona Uno');
    expect(page.filas()[0].dni).toBe('20111222');
    expect(page.filas()[0].email).toBe('persona.uno@example.invalid');
  });

  it('edit con alumno null muestra no encontrado sin Reintentar', async () => {
    const obtener = jasmine.createSpy('obtener').and.resolveTo(null);
    const { fixture } = await renderEdit('99', { obtener });
    const page = fixture.componentInstance;
    const root = fixture.nativeElement as HTMLElement;
    expect(page.errorCarga()).toContain('no encontrado');
    expect(page.errorCargaRecuperable()).toBeFalse();
    expect(root.textContent).toContain('Volver a Alumnos');
    expect(root.textContent).not.toContain('Reintentar');
  });

  it('edit con id inválido solo ofrece Volver a Alumnos', async () => {
    const obtener = jasmine.createSpy('obtener');
    const { fixture } = await renderEdit('abc', { obtener });
    const page = fixture.componentInstance;
    const root = fixture.nativeElement as HTMLElement;
    expect(obtener).not.toHaveBeenCalled();
    expect(page.errorCarga()).toContain('inválido');
    expect(page.errorCargaRecuperable()).toBeFalse();
    expect(root.textContent).toContain('Volver a Alumnos');
    expect(root.textContent).not.toContain('Reintentar');
  });

  it('edit con fallo recuperable muestra Reintentar y Volver; Reintentar re-llama obtener', async () => {
    const obtener = jasmine
      .createSpy('obtener')
      .and.returnValues(Promise.reject(new Error('network')), Promise.resolve(detalleBase()));
    const { fixture } = await renderEdit('1', { obtener });
    const page = fixture.componentInstance;
    let root = fixture.nativeElement as HTMLElement;
    expect(page.errorCargaRecuperable()).toBeTrue();
    expect(root.textContent).toContain('Reintentar');
    expect(root.textContent).toContain('Volver a Alumnos');
    expect(obtener).toHaveBeenCalledTimes(1);

    page.onReintentar();
    await fixture.whenStable();
    fixture.detectChanges();
    root = fixture.nativeElement as HTMLElement;
    expect(obtener).toHaveBeenCalledTimes(2);
    expect(page.errorCarga()).toBe('');
    expect(page.filas()[0].apellido).toBe('Ficticia');
    expect(root.querySelector('input[name="apellido-0"]')).not.toBeNull();
  });

  it('edit descarta una respuesta de carga anterior al cambiar de id', async () => {
    const resolvers: Array<(value: ReturnType<typeof detalleBase> | null) => void> = [];
    const obtener = jasmine.createSpy('obtener').and.callFake(
      () => new Promise<ReturnType<typeof detalleBase> | null>((resolve) => resolvers.push(resolve)),
    );
    const { fixture } = await renderEdit('1', { obtener });
    const page = fixture.componentInstance;
    expect(obtener).toHaveBeenCalledTimes(1);

    fixture.componentRef.setInput('id', '2');
    fixture.detectChanges();
    await Promise.resolve();
    expect(obtener).toHaveBeenCalledTimes(2);

    resolvers[1](detalleBase({ id: 2, apellido: 'Nueva', nombre: 'Carga', dniMostrar: '20999888' }));
    await Promise.resolve();
    expect(page.filas()[0].apellido).toBe('Nueva');
    expect(page.filas()[0].dni).toBe('20999888');

    resolvers[0](detalleBase({ id: 1, apellido: 'Vieja', nombre: 'Carga', dniMostrar: '20111222' }));
    await Promise.resolve();
    expect(page.filas()[0].apellido).toBe('Nueva');
    expect(page.filas()[0].dni).toBe('20999888');
  });

  it('edit guarda con actualizar y navega al detalle', async () => {
    const obtener = jasmine.createSpy('obtener').and.resolveTo(detalleBase());
    const actualizar = jasmine.createSpy('actualizar').and.resolveTo(
      detalleBase({ apellido: 'Editado', nombre: 'Alumno' }),
    );
    const { fixture, router } = await renderEdit('1', { obtener, actualizar });
    const navigateSpy = spyOn(router, 'navigate').and.resolveTo(true);
    const page = fixture.componentInstance;
    setFila(page, 0, { apellido: 'Editado', nombre: 'Alumno', dni: '20111222' });
    await page.guardar();
    expect(actualizar).toHaveBeenCalledWith(1, {
      apellido: 'Editado',
      nombre: 'Alumno',
      dni: '20111222',
      email: null,
    });
    expect(navigateSpy).toHaveBeenCalledWith(['/admin/alumnos', 1]);
  });

  it('edit 409 muestra conflicto sin PII y enlace al perfil existente', async () => {
    const obtener = jasmine.createSpy('obtener').and.resolveTo(detalleBase());
    const actualizar = jasmine
      .createSpy('actualizar')
      .and.rejectWith(new StudentDuplicateError(7));
    const { fixture, router } = await renderEdit('1', { obtener, actualizar });
    const navigateSpy = spyOn(router, 'navigate').and.resolveTo(true);
    const page = fixture.componentInstance;
    setFila(page, 0, { apellido: 'Dup', nombre: 'Edit', dni: '30111222' });
    await page.guardar();
    fixture.detectChanges();
    expect(navigateSpy).not.toHaveBeenCalled();
    expect(page.errorSubmit()).toContain('documento');
    expect(page.errorSubmit()).not.toContain('30111222');
    expect(page.alumnoExistenteId()).toBe(7);
    const root = fixture.nativeElement as HTMLElement;
    expect(root.textContent).toContain('Ver perfil del alumno');
    expect(root.querySelector('a[href*="/admin/alumnos/7"]')).not.toBeNull();
  });
});
