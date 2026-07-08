import { fakeAsync, flushMicrotasks, TestBed } from '@angular/core/testing';
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
    // detectChanges dispara el effect que llama recargar() async;
    // whenStable espera a que terminen las promises en memoria.
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    return fixture;
  }

  // Cambiar inputs después del render inicial simula la reutilización de
  // componente que hace Angular Router con withComponentInputBinding() al
  // navegar entre /admin/cursos/1/editar y /admin/cursos/2/editar sin
  // destruir la instancia.
  async function navigateTo(fixture: Awaited<ReturnType<typeof render>>, id: number) {
    fixture.componentRef.setInput('id', String(id));
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  }

  it('modo create muestra formulario con campos vacíos y sin fechas', async () => {
    const f = await render('create');
    const el = f.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Crear curso');
    expect(el.textContent).toContain('No hay fechas cargadas.');
    const inputs = el.querySelectorAll('input[type="text"]');
    expect(inputs.length).toBeGreaterThanOrEqual(2);
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
    // Setear signals directo en el componente (evita fragilidad del DOM).
    f.componentInstance.codigo.set('CUR-NEW');
    f.componentInstance.nombre.set('Curso nuevo');
    f.detectChanges();
    expect(f.componentInstance.codigo()).toBe('CUR-NEW');
    expect(f.componentInstance.nombre()).toBe('Curso nuevo');
    const navSpy = spyOn(TestBed.inject(Router), 'navigate').and.returnValue(
      Promise.resolve(true),
    );
    await f.componentInstance.guardar();
    f.detectChanges();
    expect(navSpy).toHaveBeenCalled();
    const calls = navSpy.calls.all();
    // Buscar la llamada que contiene '/admin/cursos' con un id numérico.
    const navToDetail = calls.find((c) => {
      const arg0 = c.args[0];
      return Array.isArray(arg0) && arg0[0] === '/admin/cursos' && typeof arg0[1] === 'number';
    });
    expect(navToDetail).toBeDefined();
  });

  it('modo edit carga el curso y sus fechas', async () => {
    const f = await render('edit', 1);
    const el = f.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Curso de introducción a la gestión');
    const fechasFieldsets = el.querySelectorAll('.fecha-fieldset');
    expect(fechasFieldsets.length).toBe(3);
  });

  it('modo edit: campos de curso están deshabilitados', async () => {
    const f = await render('edit', 1);
    const el = f.nativeElement as HTMLElement;
    f.detectChanges();
    expect(f.componentInstance.mode()).toBe('edit');
    expect(f.componentInstance.cargando()).toBe(false);
    // Seleccionar solo los inputs del fieldset "Datos del curso" (código,
    // nombre, estado). Las descripciones de fechas NO están deshabilitadas.
    const cursoFieldset = el.querySelector('.curso-fieldset') as HTMLFieldSetElement;
    expect(cursoFieldset).not.toBeNull();
    const inputs = cursoFieldset.querySelectorAll('input[type="text"], select');
    expect(inputs.length).toBeGreaterThanOrEqual(2);
    inputs.forEach((i) => {
      expect((i as HTMLInputElement).disabled).toBe(true);
    });
  });

  it('agregarFecha agrega un fieldset de fecha nuevo', async () => {
    const f = await render('create');
    const el = f.nativeElement as HTMLElement;
    const btn = Array.from(el.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('Agregar fecha'),
    ) as HTMLButtonElement | undefined;
    expect(btn).toBeDefined();
    btn!.click();
    f.detectChanges();
    const fechaFieldsets = el.querySelectorAll('.fecha-fieldset');
    expect(fechaFieldsets.length).toBe(1);
  });

  it('quitarFecha elimina una fecha de la lista', async () => {
    const f = await render('edit', 1);
    const el = f.nativeElement as HTMLElement;
    const antes = el.querySelectorAll('.fecha-fieldset').length;
    const quitarBtn = el.querySelector('.btn-quitar') as HTMLButtonElement;
    quitarBtn.click();
    f.detectChanges();
    const despues = el.querySelectorAll('.fecha-fieldset').length;
    expect(despues).toBe(antes - 1);
  });

  it('input type=date presente en cada fecha', async () => {
    const f = await render('edit', 1);
    const el = f.nativeElement as HTMLElement;
    const dates = el.querySelectorAll('input[type="date"]');
    expect(dates.length).toBe(3);
  });

  it('guardar en modo edit persiste fechas en memoria', async () => {
    const f = await render('edit', 1);
    const el = f.nativeElement as HTMLElement;
    const submitBtn = el.querySelector('button[type="submit"]') as HTMLButtonElement;
    submitBtn.click();
    f.detectChanges();
    await f.whenStable();
    f.detectChanges();
    expect(el.textContent).toContain('Cambios guardados en memoria');
  });

  it('no llama fetch', async () => {
    const fetchSpy = spyOn(window, 'fetch').and.callThrough();
    await render('edit', 1);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  // CRITICAL: route reuse entre /cursos/1/editar -> /cursos/2/editar con la
  // misma route config. Angular NO destruye el componente, solo cambia el
  // input id. Si solo cargamos en ngOnInit, el form retiene las fechas del
  // curso 1 y guardar() sobrescribe el curso 2 con datos stale.
  it('route reuse: navegar de curso 1 a curso 2 recarga fechas del curso 2', async () => {
    const f = await render('edit', 1);
    expect(f.componentInstance.detalle()?.id).toBe(1);
    expect(f.componentInstance.fechas().length).toBe(3);
    await navigateTo(f, 2);
    expect(f.componentInstance.detalle()?.id).toBe(2);
    expect(f.componentInstance.fechas().length).toBe(2);
    const el = f.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Curso de herramientas administrativas');
  });

  it('route reuse: guardar después de navegar usa el id nuevo, no el viejo', async () => {
    const f = await render('edit', 1);
    const svc = TestBed.inject(COURSES_SOURCE);
    const antes1 = await svc.listarFechas(1);
    const antes2 = await svc.listarFechas(2);
    expect(antes1.length).toBe(3);
    expect(antes2.length).toBe(2);
    await navigateTo(f, 2);
    // Quitar la primera fecha del curso 2 en el signal local.
    f.componentInstance.quitarFecha(0);
    f.detectChanges();
    expect(f.componentInstance.fechas().length).toBe(1);
    await f.componentInstance.guardar();
    f.detectChanges();
    await f.whenStable();
    f.detectChanges();
    // Curso 2 ahora tiene 1 fecha (se quitó una). Curso 1 intacto.
    const despues1 = await svc.listarFechas(1);
    const despues2 = await svc.listarFechas(2);
    expect(despues1.length).toBe(3);
    expect(despues2.length).toBe(1);
  });

  it('route reuse: navegar a id inválido muestra error sin retener datos previos', async () => {
    const f = await render('edit', 1);
    expect(f.componentInstance.detalle()?.id).toBe(1);
    await navigateTo(f, 0);
    expect(f.componentInstance.detalle()).toBeNull();
    expect(f.componentInstance.fechas().length).toBe(0);
    expect(f.componentInstance.error()).toContain('Curso no encontrado');
  });

  // CRITICAL: el guard `loadGen` descarta cargas stale cuando el id cambia
  // antes de resolver `obtener`. Sin controles de orden async, la promise
  // de obtener(1) resuelve DESPUÉS de obtener(2) y sobrescribe el form con
  // datos del curso 1. Este fake permite resolver manualmente las promises
  // fuera de orden para verificar el guard de forma determinística.
  it('route reuse: carga stale de curso 1 no sobrescribe form de curso 2', async () => {
    // Fake con promises controlables: cada obtener(id) devuelve una promise
    // que solo resuelve cuando llamamos resolve() manualmente.
    const pending = new Map<number, (d: CursoDetalle) => void>();
    const fake: CoursesService = {
      listar: () => Promise.resolve([]),
      obtener: (id: number) =>
        new Promise<CursoDetalle>((resolve) => {
          pending.set(id, resolve);
        }),
      crear: () => Promise.reject(new Error('noop')),
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
    // obtener(1) quedó pendiente; no avanzar microtasks todavía.
    expect(pending.has(1)).toBe(true);
    // Cambiar id a 2 (route reuse) sin resolver la carga de 1 todavía.
    fixture.componentRef.setInput('id', '2');
    fixture.detectChanges();
    expect(pending.has(2)).toBe(true);
    // Resolver curso 2 PRIMERO (orden correcto de llegada).
    pending.get(2)!(
      { id: 2, codigo: 'CUR-002', nombre: 'Curso de herramientas', estado: 'activo', createdAt: '', updatedAt: '', fechas: [] },
    );
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(fixture.componentInstance.detalle()?.id).toBe(2);
    expect(fixture.componentInstance.nombre()).toBe('Curso de herramientas');
    // Ahora resolver curso 1 TARDE (carga stale). loadGen debe descartarla.
    pending.get(1)!(
      { id: 1, codigo: 'CUR-001', nombre: 'Curso de introducción', estado: 'activo', createdAt: '', updatedAt: '', fechas: [{ id: 11, cursoId: 1, fecha: '2026-03-02', descripcion: null, orden: 1, estado: 'programada' }] },
    );
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    // El form sigue mostrando curso 2; la carga stale de 1 se descartó.
    expect(fixture.componentInstance.detalle()?.id).toBe(2);
    expect(fixture.componentInstance.nombre()).toBe('Curso de herramientas');
    expect(fixture.componentInstance.fechas().length).toBe(0);
  });

  // CRITICAL: quitarFecha debe eliminar la fecha del servicio al guardar, no
  // solo del signal local. Sin reemplazarFechas, la fecha quitada reaparece.
  it('modo edit: quitar una fecha existente y guardar elimina la fecha del servicio', async () => {
    const f = await render('edit', 1);
    const svc = TestBed.inject(COURSES_SOURCE);
    // Curso 1 arranca con 3 fechas (ids 11, 12, 13).
    const antes = await svc.listarFechas(1);
    expect(antes.length).toBe(3);
    // Quitar la primera del signal local (id 11).
    f.componentInstance.quitarFecha(0);
    f.detectChanges();
    expect(f.componentInstance.fechas().length).toBe(2);
    // Guardar debe invocar reemplazarFechas y dejar 2 fechas en el servicio.
    await f.componentInstance.guardar();
    f.detectChanges();
    await f.whenStable();
    f.detectChanges();
    const despues = await svc.listarFechas(1);
    expect(despues.length).toBe(2);
    // La fecha quitada (id 11) ya no está en el servicio.
    expect(despues.find((x) => x.id === 11)).toBeUndefined();
    // El detalle también refleja el estado real del servicio.
    const det = await svc.obtener(1);
    expect(det.fechas.length).toBe(2);
    expect(det.fechas.find((x) => x.id === 11)).toBeUndefined();
  });
});