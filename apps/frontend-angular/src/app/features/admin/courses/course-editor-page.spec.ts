import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { CourseEditorPage } from './course-editor-page';
import { COURSES_SOURCE, CoursesService } from './courses.service';
import { InMemoryCoursesService } from './in-memory-courses.service';
import { CursoDetalle } from './courses.models';

describe('CourseEditorPage', () => {
  async function render(mode: 'create' | 'edit', id = 0) {
    await TestBed.configureTestingModule({
      imports: [CourseEditorPage],
      providers: [
        provideRouter([]),
        { provide: COURSES_SOURCE, useClass: InMemoryCoursesService },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(CourseEditorPage);
    fixture.componentRef.setInput('mode', mode);
    if (id) {
      fixture.componentRef.setInput('id', String(id));
    }
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    return fixture;
  }

  async function navigateTo(fixture: Awaited<ReturnType<typeof render>>, id: number) {
    fixture.componentRef.setInput('id', String(id));
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  }

  it('modo create muestra formulario vacío, copy de activo y sin control de estado', async () => {
    const f = await render('create');
    const el = f.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Nuevo curso');
    expect(el.textContent).toContain('se crea en estado activo');
    expect(el.querySelector('[role="switch"]')).toBeNull();
    expect(el.querySelector('#curso-codigo')).not.toBeNull();
    expect(el.querySelector('#curso-nombre')).not.toBeNull();
    expect(el.textContent).toContain('Todavía no hay fechas cargadas');
  });

  it('modo create: guardar sin código/nombre muestra error de validación', async () => {
    const f = await render('create');
    const el = f.nativeElement as HTMLElement;
    const submitBtn = el.querySelector('button[type="submit"]') as HTMLButtonElement;
    submitBtn.click();
    f.detectChanges();
    await f.whenStable();
    f.detectChanges();
    expect(el.textContent).toContain('Código y nombre son obligatorios');
  });

  it('modo create: guardar válido crea el curso y navega al detalle', async () => {
    const f = await render('create');
    f.componentInstance.codigo.set('CUR-NEW');
    f.componentInstance.nombre.set('Curso nuevo');
    f.detectChanges();
    const navSpy = spyOn(TestBed.inject(Router), 'navigate').and.returnValue(Promise.resolve(true));
    await f.componentInstance.guardar();
    f.detectChanges();
    expect(navSpy).toHaveBeenCalled();
    const navToDetail = navSpy.calls.all().find((c) => {
      const arg0 = c.args[0];
      return Array.isArray(arg0) && arg0[0] === '/admin/cursos' && typeof arg0[1] === 'number';
    });
    expect(navToDetail).toBeDefined();
  });

  it('layout: grid + aside sticky presentes', async () => {
    const f = await render('edit', 1);
    const el = f.nativeElement as HTMLElement;
    expect(el.querySelector('.editor-grid')).not.toBeNull();
    expect(el.querySelector('aside.editor-aside')).not.toBeNull();
    expect(el.querySelector('.sticky-actions')).not.toBeNull();
  });

  it('modo edit carga el curso, fechas con índice y metadatos', async () => {
    const f = await render('edit', 1);
    const el = f.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Editar curso');
    expect(el.textContent).toContain('CUR-001');
    expect(el.querySelectorAll('.fecha-row').length).toBe(3);
    expect(el.textContent).toContain('01');
    expect(el.textContent).toContain('02');
    expect(el.textContent).toContain('03');
    expect(el.textContent).toContain('Metadatos del sistema');
    expect(el.textContent).not.toContain('Creado por');
    expect(el.textContent).not.toContain('Firma');
  });

  it('modo edit: código y nombre editables; toggle presente', async () => {
    const f = await render('edit', 1);
    const el = f.nativeElement as HTMLElement;
    const codigo = el.querySelector('#curso-codigo') as HTMLInputElement;
    const nombre = el.querySelector('#curso-nombre') as HTMLInputElement;
    expect(codigo.disabled).toBe(false);
    expect(nombre.disabled).toBe(false);
    expect(el.textContent).toContain('Podés corregir código y nombre');
    const sw = el.querySelector('[role="switch"]') as HTMLButtonElement;
    expect(sw).not.toBeNull();
    expect(sw.getAttribute('aria-checked')).toBe('true');
  });

  it('modo edit: guardar con código/nombre cambiados llama actualizar', async () => {
    const f = await render('edit', 1);
    const svc = TestBed.inject(COURSES_SOURCE);
    const actualizarSpy = spyOn(svc, 'actualizar').and.callThrough();
    f.componentInstance.codigo.set('CUR-EDIT');
    f.componentInstance.nombre.set('Curso editado');
    await f.componentInstance.guardar();
    f.detectChanges();
    expect(actualizarSpy).toHaveBeenCalledWith(1, {
      codigo: 'CUR-EDIT',
      nombre: 'Curso editado',
    });
    expect(f.componentInstance.ok()).toContain('guardados');
  });

  it('sin input type=time ni badges de emitidos', async () => {
    const f = await render('edit', 1);
    const el = f.nativeElement as HTMLElement;
    expect(el.querySelectorAll('input[type="time"]').length).toBe(0);
    expect(el.textContent).not.toContain('Emitidos');
    expect(el.textContent).not.toContain('Sin emitir');
  });

  it('sin campos fantasma de curso: carga horaria, modalidad, descripción de curso, entrega', async () => {
    const f = await render('edit', 1);
    const el = f.nativeElement as HTMLElement;
    const text = el.textContent || '';

    // Fecha.descripcion ES real (REQ-CEDIT-005); la prohibida es descripción de CURSO.
    expect(el.querySelector('#curso-descripcion')).toBeNull();
    expect(el.querySelector('textarea[name="descripcion"]')).toBeNull();
    expect(el.querySelector('label[for="curso-descripcion"]')).toBeNull();

    expect(text.toLowerCase()).not.toContain('carga horaria');
    expect(text.toLowerCase()).not.toContain('modalidad');
    expect(el.querySelectorAll('input[type="time"]').length).toBe(0);
    expect(text).not.toContain('Emitidos');
    expect(text).not.toContain('Sin emitir');
    expect(text.toLowerCase()).not.toContain('nueva entrega');
    expect(el.querySelector('input[type="checkbox"]')).toBeNull();

    // Descripción de fecha (campo API real) sí debe existir en la tabla.
    expect(el.querySelector('.fecha-row input[type="text"], .fecha-row textarea')).not.toBeNull();
  });

  it('curso borrador: guardar sin encender toggle conserva borrador', async () => {
    const f = await render('edit', 3);
    expect(f.componentInstance.activo()).toBe(false);
    expect(f.componentInstance.estadoResultante()).toBe('borrador');
    const svc = TestBed.inject(COURSES_SOURCE);
    const estadoSpy = spyOn(svc, 'actualizarEstado').and.callThrough();
    await f.componentInstance.guardar();
    expect(estadoSpy).not.toHaveBeenCalled();
  });

  it('agregarFecha agrega una fila de fecha nueva', async () => {
    const f = await render('create');
    const el = f.nativeElement as HTMLElement;
    const btn = Array.from(el.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Agregar fecha'),
    ) as HTMLButtonElement;
    btn.click();
    f.detectChanges();
    expect(el.querySelectorAll('.fecha-row').length).toBe(1);
  });

  it('quitarFecha elimina una fecha de la lista', async () => {
    const f = await render('edit', 1);
    const el = f.nativeElement as HTMLElement;
    const antes = el.querySelectorAll('.fecha-row').length;
    const quitarBtn = el.querySelector('.btn-quitar') as HTMLButtonElement;
    quitarBtn.click();
    f.detectChanges();
    expect(el.querySelectorAll('.fecha-row').length).toBe(antes - 1);
  });

  it('input type=date presente en cada fecha', async () => {
    const f = await render('edit', 1);
    const el = f.nativeElement as HTMLElement;
    expect(el.querySelectorAll('input[type="date"]').length).toBe(3);
  });

  it('toggle off en curso activo → guardar llama actualizarEstado(cerrado)', async () => {
    const f = await render('edit', 1);
    const svc = TestBed.inject(COURSES_SOURCE);
    const estadoSpy = spyOn(svc, 'actualizarEstado').and.callThrough();
    f.componentInstance.toggleActivo();
    expect(f.componentInstance.activo()).toBe(false);
    expect(f.componentInstance.estadoResultante()).toBe('cerrado');
    await f.componentInstance.guardar();
    f.detectChanges();
    await f.whenStable();
    expect(estadoSpy).toHaveBeenCalledWith(1, 'cerrado');
    expect((f.nativeElement as HTMLElement).textContent).toContain('Cambios guardados');
  });

  it('guardar sin tocar toggle no llama actualizarEstado', async () => {
    const f = await render('edit', 1);
    const svc = TestBed.inject(COURSES_SOURCE);
    const estadoSpy = spyOn(svc, 'actualizarEstado').and.callThrough();
    await f.componentInstance.guardar();
    f.detectChanges();
    await f.whenStable();
    expect(estadoSpy).not.toHaveBeenCalled();
    expect((f.nativeElement as HTMLElement).textContent).toContain('Cambios guardados');
  });

  it('toggle on en curso cerrado → guardar llama actualizarEstado(activo)', async () => {
    const f = await render('edit', 4);
    expect(f.componentInstance.activo()).toBe(false);
    const svc = TestBed.inject(COURSES_SOURCE);
    const estadoSpy = spyOn(svc, 'actualizarEstado').and.callThrough();
    f.componentInstance.toggleActivo();
    expect(f.componentInstance.estadoResultante()).toBe('activo');
    await f.componentInstance.guardar();
    f.detectChanges();
    await f.whenStable();
    expect(estadoSpy).toHaveBeenCalledWith(4, 'activo');
  });

  it('curso archivado: guardar sin encender toggle conserva archivado', async () => {
    const f = await render('edit', 5);
    expect(f.componentInstance.activo()).toBe(false);
    expect(f.componentInstance.estadoResultante()).toBe('archivado');
    const svc = TestBed.inject(COURSES_SOURCE);
    const estadoSpy = spyOn(svc, 'actualizarEstado').and.callThrough();
    await f.componentInstance.guardar();
    expect(estadoSpy).not.toHaveBeenCalled();
  });

  it('aviso impacto: quitar fecha realizada muestra banner; sin cambios no', async () => {
    const f = await render('edit', 4);
    const el = f.nativeElement as HTMLElement;
    expect(el.querySelector('.impact-banner')).toBeNull();
    f.componentInstance.quitarFecha(0);
    f.detectChanges();
    expect(el.querySelector('.impact-banner')).not.toBeNull();
    expect(el.textContent).toContain('impacto en certificados');
  });

  it('modo edit: quitar una fecha existente y guardar elimina del servicio', async () => {
    const f = await render('edit', 1);
    const svc = TestBed.inject(COURSES_SOURCE);
    const antes = await svc.listarFechas(1);
    expect(antes.length).toBe(3);
    f.componentInstance.quitarFecha(0);
    f.detectChanges();
    await f.componentInstance.guardar();
    f.detectChanges();
    await f.whenStable();
    const despues = await svc.listarFechas(1);
    expect(despues.length).toBe(2);
    expect(despues.find((x) => x.id === 11)).toBeUndefined();
  });

  it('no llama fetch', async () => {
    const fetchSpy = spyOn(window, 'fetch').and.callThrough();
    await render('edit', 1);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('route reuse: navegar de curso 1 a curso 2 recarga fechas del curso 2', async () => {
    const f = await render('edit', 1);
    expect(f.componentInstance.detalle()?.id).toBe(1);
    expect(f.componentInstance.fechas().length).toBe(3);
    await navigateTo(f, 2);
    expect(f.componentInstance.detalle()?.id).toBe(2);
    expect(f.componentInstance.fechas().length).toBe(2);
    expect((f.nativeElement as HTMLElement).textContent).toContain('CUR-002');
  });

  it('route reuse: guardar después de navegar usa el id nuevo', async () => {
    const f = await render('edit', 1);
    const svc = TestBed.inject(COURSES_SOURCE);
    await navigateTo(f, 2);
    f.componentInstance.quitarFecha(0);
    f.detectChanges();
    await f.componentInstance.guardar();
    f.detectChanges();
    await f.whenStable();
    expect((await svc.listarFechas(1)).length).toBe(3);
    expect((await svc.listarFechas(2)).length).toBe(1);
  });

  it('route reuse: navegar a id inválido muestra error sin retener datos previos', async () => {
    const f = await render('edit', 1);
    await navigateTo(f, 0);
    expect(f.componentInstance.detalle()).toBeNull();
    expect(f.componentInstance.fechas().length).toBe(0);
    expect(f.componentInstance.error()).toContain('Curso no encontrado');
  });

  it('route reuse: carga stale de curso 1 no sobrescribe form de curso 2', async () => {
    const pending = new Map<number, (d: CursoDetalle) => void>();
    const fake: CoursesService = {
      listar: () => Promise.resolve([]),
      obtener: (id: number) =>
        new Promise<CursoDetalle>((resolve) => {
          pending.set(id, resolve);
        }),
      crear: () => Promise.reject(new Error('noop')),
      actualizar: () => Promise.reject(new Error('noop')),
      actualizarEstado: () => Promise.reject(new Error('noop')),
      listarFechas: () => Promise.resolve([]),
      guardarFecha: () => Promise.reject(new Error('noop')),
      reemplazarFechas: () => Promise.reject(new Error('noop')),
    };
    await TestBed.configureTestingModule({
      imports: [CourseEditorPage],
      providers: [provideRouter([]), { provide: COURSES_SOURCE, useValue: fake }],
    }).compileComponents();
    const fixture = TestBed.createComponent(CourseEditorPage);
    fixture.componentRef.setInput('mode', 'edit');
    fixture.componentRef.setInput('id', '1');
    fixture.detectChanges();
    expect(pending.has(1)).toBe(true);
    fixture.componentRef.setInput('id', '2');
    fixture.detectChanges();
    expect(pending.has(2)).toBe(true);
    pending.get(2)!({
      id: 2,
      codigo: 'CUR-002',
      nombre: 'Curso de herramientas',
      estado: 'activo',
      createdAt: '',
      updatedAt: '',
      cuatrimestre: '1.er cuatrimestre 2026',
      cantidadFechas: 0,
      fechas: [],
    });
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(fixture.componentInstance.detalle()?.id).toBe(2);
    pending.get(1)!({
      id: 1,
      codigo: 'CUR-001',
      nombre: 'Curso de introducción',
      estado: 'activo',
      createdAt: '',
      updatedAt: '',
      cuatrimestre: '1.er cuatrimestre 2026',
      cantidadFechas: 1,
      fechas: [
        {
          id: 11,
          cursoId: 1,
          fecha: '2026-03-02',
          descripcion: null,
          orden: 1,
          estado: 'programada',
        },
      ],
    });
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(fixture.componentInstance.detalle()?.id).toBe(2);
    expect(fixture.componentInstance.nombre()).toBe('Curso de herramientas');
    expect(fixture.componentInstance.fechas().length).toBe(0);
  });
});
