import { TestBed } from '@angular/core/testing';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { COURSES_SOURCE } from './courses.service';
import { HttpCoursesService } from './http-courses.service';

describe('HttpCoursesService', () => {
  let service: HttpCoursesService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: COURSES_SOURCE, useClass: HttpCoursesService },
      ],
    });
    service = TestBed.inject(HttpCoursesService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  const cursoDto = (overrides: Partial<Record<string, unknown>> = {}) => ({
    id: 1,
    codigo: 'CUR-001',
    nombre: 'Curso Demo',
    estado: 'activo',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-02T00:00:00Z',
    cantidadFechas: 0,
    ...overrides,
  });

  const fechaDto = (overrides: Partial<Record<string, unknown>> = {}) => ({
    id: 100,
    cursoId: 1,
    fecha: '2026-03-01',
    descripcion: 'Clase 1',
    orden: 1,
    estado: 'programada',
    ...overrides,
  });

  it('listar hace GET a /admin/cursos y mapea DTOs', async () => {
    const p = service.listar();
    const req = httpMock.expectOne(`${environment.apiBaseUrl}/admin/cursos`);
    expect(req.request.method).toBe('GET');
    req.flush({
      data: {
        items: [cursoDto({ cantidadFechas: 2, alumnosPresentes: 5, certificaciones: 3 })],
      },
      meta: { requestId: 'r1' },
    });
    const result = await p;
    expect(result.length).toBe(1);
    expect(result[0].id).toBe(1);
    expect(result[0].codigo).toBe('CUR-001');
    expect(result[0].nombre).toBe('Curso Demo');
    expect(result[0].estado).toBe('activo');
    expect(result[0].cuatrimestre).toBe('Sin programar');
    expect(result[0].cantidadFechas).toBe(2);
    expect(result[0].alumnosPresentes).toBe(5);
    expect(result[0].certificaciones).toBe(3);
  });

  it('listar deja métricas null si el backend no las envía', async () => {
    const p = service.listar();
    httpMock.expectOne(`${environment.apiBaseUrl}/admin/cursos`).flush({
      data: { items: [cursoDto()] },
      meta: { requestId: 'r1b' },
    });
    const result = await p;
    expect(result[0].alumnosPresentes).toBeNull();
    expect(result[0].certificaciones).toBeNull();
  });

  it('listar hidrata cantidadFechas vía /fechas si el listado la omite', async () => {
    const base = cursoDto({ id: 9 });
    const { cantidadFechas, ...sinCount } = base;
    void cantidadFechas;
    const p = service.listar();
    httpMock.expectOne(`${environment.apiBaseUrl}/admin/cursos`).flush({
      data: { items: [sinCount] },
      meta: { requestId: 'r1c' },
    });
    await Promise.resolve();
    httpMock.expectOne(`${environment.apiBaseUrl}/admin/cursos/9/fechas`).flush({
      data: { items: [fechaDto({ cursoId: 9 }), fechaDto({ id: 101, cursoId: 9 })] },
      meta: { requestId: 'r1c-f' },
    });
    const result = await p;
    expect(result[0].cantidadFechas).toBe(2);
  });

  it('filtro q aplicado client-side', async () => {
    const p = service.listar({ q: 'demo' });
    const req = httpMock.expectOne(`${environment.apiBaseUrl}/admin/cursos`);
    req.flush({ data: { items: [cursoDto({ id: 1, nombre: 'Curso Demo' }), cursoDto({ id: 2, nombre: 'Otro' })] }, meta: { requestId: 'r2' } });
    const result = await p;
    expect(result.length).toBe(1);
    expect(result[0].nombre).toBe('Curso Demo');
  });

  it('filtro estado aplicado client-side', async () => {
    const p = service.listar({ estado: 'cerrado' });
    const req = httpMock.expectOne(`${environment.apiBaseUrl}/admin/cursos`);
    req.flush({ data: { items: [cursoDto({ id: 1, estado: 'activo' }), cursoDto({ id: 2, estado: 'cerrado' })] }, meta: { requestId: 'r3' } });
    const result = await p;
    expect(result.length).toBe(1);
    expect(result[0].estado).toBe('cerrado');
  });

  it('filtro activo=false agrupa no activos client-side', async () => {
    const p = service.listar({ activo: false });
    httpMock.expectOne(`${environment.apiBaseUrl}/admin/cursos`).flush({
      data: {
        items: [
          cursoDto({ id: 1, estado: 'activo' }),
          cursoDto({ id: 2, estado: 'cerrado' }),
          cursoDto({ id: 3, estado: 'borrador' }),
          cursoDto({ id: 4, estado: 'archivado' }),
        ],
      },
      meta: { requestId: 'r3b' },
    });
    const result = await p;
    expect(result.map((c) => c.id)).toEqual([2, 3, 4]);
  });

  it('obtener hace GET a /admin/cursos/:id y /admin/cursos/:id/fechas, mergea', async () => {
    const p = service.obtener(5);
    const reqCurso = httpMock.expectOne(`${environment.apiBaseUrl}/admin/cursos/5`);
    const reqFechas = httpMock.expectOne(`${environment.apiBaseUrl}/admin/cursos/5/fechas`);
    reqCurso.flush({ data: cursoDto({ id: 5 }), meta: { requestId: 'rc' } });
    reqFechas.flush({ data: { items: [fechaDto({ id: 100, cursoId: 5 }), fechaDto({ id: 101, cursoId: 5, fecha: '2026-03-08', orden: 2 })] }, meta: { requestId: 'rf' } });
    const result = await p;
    expect(result.id).toBe(5);
    expect(result.fechas.length).toBe(2);
    expect(result.cantidadFechas).toBe(2);
    expect(result.fechas[0].fecha).toBe('2026-03-01');
  });

  it('obtener cuatrimestre default "Sin programar" cuando backend no lo envía', async () => {
    const p = service.obtener(1);
    httpMock.expectOne(`${environment.apiBaseUrl}/admin/cursos/1`).flush({ data: cursoDto(), meta: { requestId: 'rc' } });
    httpMock.expectOne(`${environment.apiBaseUrl}/admin/cursos/1/fechas`).flush({ data: { items: [] }, meta: { requestId: 'rf' } });
    const result = await p;
    expect(result.cuatrimestre).toBe('Sin programar');
  });

  it('crear hace POST a /admin/cursos con body {codigo,nombre,estado}', async () => {
    const p = service.crear({ codigo: 'CUR-NEW', nombre: 'Nuevo', estado: 'borrador' });
    const req = httpMock.expectOne(`${environment.apiBaseUrl}/admin/cursos`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ codigo: 'CUR-NEW', nombre: 'Nuevo', estado: 'borrador' });
    req.flush({ data: cursoDto({ id: 10, codigo: 'CUR-NEW', nombre: 'Nuevo', estado: 'borrador' }), meta: { requestId: 'r4' } });
    const result = await p;
    expect(result.id).toBe(10);
    expect(result.fechas).toEqual([]);
  });

  it('actualizarEstado hace PATCH a /admin/cursos/:id/estado con body {estado}', async () => {
    const p = service.actualizarEstado(3, 'cerrado');
    const req = httpMock.expectOne(`${environment.apiBaseUrl}/admin/cursos/3/estado`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ estado: 'cerrado' });
    req.flush({ data: cursoDto({ id: 3, estado: 'cerrado' }), meta: { requestId: 'r5' } });
    const result = await p;
    expect(result.estado).toBe('cerrado');
  });

  it('actualizar hace PATCH a /admin/cursos/:id con body {codigo,nombre}', async () => {
    const p = service.actualizar(3, { codigo: 'CUR-X', nombre: 'Renombrado' });
    const req = httpMock.expectOne(`${environment.apiBaseUrl}/admin/cursos/3`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ codigo: 'CUR-X', nombre: 'Renombrado' });
    req.flush({
      data: cursoDto({ id: 3, codigo: 'CUR-X', nombre: 'Renombrado', cantidadFechas: 2 }),
      meta: { requestId: 'r5b' },
    });
    const result = await p;
    expect(result.codigo).toBe('CUR-X');
    expect(result.nombre).toBe('Renombrado');
    expect(result.cantidadFechas).toBe(2);
  });

  it('listarFechas hace GET a /admin/cursos/:id/fechas', async () => {
    const p = service.listarFechas(7);
    const req = httpMock.expectOne(`${environment.apiBaseUrl}/admin/cursos/7/fechas`);
    expect(req.request.method).toBe('GET');
    req.flush({ data: { items: [fechaDto({ cursoId: 7 })] }, meta: { requestId: 'r6' } });
    const result = await p;
    expect(result.length).toBe(1);
    expect(result[0].cursoId).toBe(7);
  });

  it('guardarFecha con dto.id===null hace POST a /admin/cursos/:id/fechas', async () => {
    const p = service.guardarFecha(1, { id: null, fecha: '2026-04-01', descripcion: 'Nueva', orden: 1, estado: 'programada' });
    const req = httpMock.expectOne(`${environment.apiBaseUrl}/admin/cursos/1/fechas`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ fecha: '2026-04-01', descripcion: 'Nueva', orden: 1, estado: 'programada' });
    req.flush({ data: fechaDto({ id: 200, cursoId: 1, fecha: '2026-04-01' }), meta: { requestId: 'r7' } });
    const result = await p;
    expect(result.id).toBe(200);
  });

  it('guardarFecha con dto.id existente hace PATCH a /admin/cursos/:id/fechas/:fid', async () => {
    const p = service.guardarFecha(1, { id: 100, fecha: '2026-04-01', descripcion: 'Editada', orden: 1, estado: 'realizada' });
    const req = httpMock.expectOne(`${environment.apiBaseUrl}/admin/cursos/1/fechas/100`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ fecha: '2026-04-01', descripcion: 'Editada', orden: 1, estado: 'realizada' });
    req.flush({ data: fechaDto({ id: 100, estado: 'realizada' }), meta: { requestId: 'r8' } });
    const result = await p;
    expect(result.estado).toBe('realizada');
  });

  it('reemplazarFechas: PATCH cancelada para removidas, PATCH existentes, POST nuevas, re-read final', async () => {
    // current: [100, 101]; dtos: [{id:100 editada}, {id:null nueva}]
    // → 101 se cancela (PATCH), 100 se edita (PATCH), nueva se crea (POST), re-read.
    const p = service.reemplazarFechas(1, [
      { id: 100, fecha: '2026-05-01', descripcion: 'Editada', orden: 1, estado: 'programada' },
      { id: null, fecha: '2026-05-08', descripcion: 'Nueva', orden: 2, estado: 'programada' },
    ]);

    // 1. GET fechas actuales.
    const reqGet = httpMock.expectOne(`${environment.apiBaseUrl}/admin/cursos/1/fechas`);
    expect(reqGet.request.method).toBe('GET');
    reqGet.flush({ data: { items: [fechaDto({ id: 100 }), fechaDto({ id: 101, fecha: '2026-03-08', orden: 2 })] }, meta: { requestId: 'rg' } });
    // Dar tiempo a que firstValueFrom se resuelva y el servicio continúe.
    await new Promise(resolve => setTimeout(resolve, 0));

    // 2. PATCH 101 → cancelada (fallback a DELETE).
    const reqCancel = httpMock.expectOne(`${environment.apiBaseUrl}/admin/cursos/1/fechas/101`);
    expect(reqCancel.request.method).toBe('PATCH');
    expect(reqCancel.request.body).toEqual({ fecha: '2026-03-08', descripcion: 'Clase 1', orden: 2, estado: 'cancelada' });
    reqCancel.flush({ data: fechaDto({ id: 101, estado: 'cancelada' }), meta: { requestId: 'rc' } });
    await new Promise(resolve => setTimeout(resolve, 0));

    // 3. PATCH 100 → editada.
    const reqPatch = httpMock.expectOne(`${environment.apiBaseUrl}/admin/cursos/1/fechas/100`);
    expect(reqPatch.request.method).toBe('PATCH');
    reqPatch.flush({ data: fechaDto({ id: 100, fecha: '2026-05-01', descripcion: 'Editada' }), meta: { requestId: 'rp' } });
    await new Promise(resolve => setTimeout(resolve, 0));

    // 4. POST nueva fecha.
    const reqPost = httpMock.expectOne(`${environment.apiBaseUrl}/admin/cursos/1/fechas`);
    expect(reqPost.request.method).toBe('POST');
    reqPost.flush({ data: fechaDto({ id: 200, fecha: '2026-05-08', orden: 2 }), meta: { requestId: 'rpn' } });
    await new Promise(resolve => setTimeout(resolve, 0));

    // 5. Re-read final.
    const reqFinal = httpMock.expectOne(`${environment.apiBaseUrl}/admin/cursos/1/fechas`);
    reqFinal.flush({ data: { items: [fechaDto({ id: 100, fecha: '2026-05-01' }), fechaDto({ id: 200, fecha: '2026-05-08', orden: 2 })] }, meta: { requestId: 'rf' } });

    const result = await p;
    expect(result.length).toBe(2);
    httpMock.verify();
  });

  it('reemplazarFechas rechaza toda la operación si un paso falla', async () => {
    const p = service.reemplazarFechas(1, [
      { id: null, fecha: '2026-05-01', descripcion: 'Nueva', orden: 1, estado: 'programada' },
    ]);
    // GET current.
    httpMock.expectOne(`${environment.apiBaseUrl}/admin/cursos/1/fechas`).flush({ data: { items: [] }, meta: { requestId: 'rg' } });
    await new Promise(resolve => setTimeout(resolve, 0));
    // POST nueva fecha falla con 500.
    const reqPost = httpMock.expectOne(`${environment.apiBaseUrl}/admin/cursos/1/fechas`);
    reqPost.flush('crash', { status: 500, statusText: 'Internal Server Error' });
    await expectAsync(p).toBeRejected();
    httpMock.verify();
  });

  it('listar 4xx rechaza con error', async () => {
    const p = service.listar();
    const req = httpMock.expectOne(`${environment.apiBaseUrl}/admin/cursos`);
    req.flush(
      { error: { code: 'UNAUTHORIZED', message: 'No auth', details: [] }, meta: { requestId: 'r401' } },
      { status: 401, statusText: 'Unauthorized' },
    );
    await expectAsync(p).toBeRejected();
    try { await p; } catch (e) { expect(e).toBeInstanceOf(HttpErrorResponse); }
  });

  it('obtener 5xx rechaza con error', async () => {
    const p = service.obtener(1);
    // Promise.all dispara ambos requests en paralelo; flusheamos el de curso con 500.
    const reqCurso = httpMock.expectOne(`${environment.apiBaseUrl}/admin/cursos/1`);
    reqCurso.flush('crash', { status: 500, statusText: 'Internal Server Error' });
    // El request de fechas queda pendiente; lo flusheamos para que verify() no falle.
    const reqFechas = httpMock.expectOne(`${environment.apiBaseUrl}/admin/cursos/1/fechas`);
    reqFechas.flush({ data: { items: [] }, meta: { requestId: 'rf' } });
    await expectAsync(p).toBeRejected();
  });

  it('resuelve vía COURSES_SOURCE token', () => {
    expect(TestBed.inject(COURSES_SOURCE)).toBeInstanceOf(HttpCoursesService);
  });
});