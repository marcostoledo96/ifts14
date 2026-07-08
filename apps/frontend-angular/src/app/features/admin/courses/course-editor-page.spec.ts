import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { CourseEditorPage } from './course-editor-page';
import { COURSES_SOURCE, CoursesService } from './courses.service';
import { InMemoryCoursesService } from './in-memory-courses.service';

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
    // detectChanges dispara ngOnInit → inicializar() async; whenStable espera.
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    return fixture;
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