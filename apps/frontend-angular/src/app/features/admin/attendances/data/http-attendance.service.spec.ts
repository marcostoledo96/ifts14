import { TestBed } from '@angular/core/testing';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { ATTENDANCE_SOURCE } from './attendance.token';
import { HttpAttendanceService } from './http-attendance.service';

describe('HttpAttendanceService', () => {
  let service: HttpAttendanceService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ATTENDANCE_SOURCE, useClass: HttpAttendanceService },
      ],
    });
    service = TestBed.inject(HttpAttendanceService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('listarAlumnos hace GET a /admin/alumnos y filtra solo activos', async () => {
    const p = service.listarAlumnos(1);
    const req = httpMock.expectOne(`${environment.apiBaseUrl}/admin/alumnos`);
    expect(req.request.method).toBe('GET');
    req.flush({
      data: {
        items: [
          { id: 1, apellidoNombre: 'Pérez Juan', dniMostrar: '12345678', estado: 'activo' },
          { id: 2, apellidoNombre: 'García María', dniMostrar: '34567890', estado: 'inactivo' },
        ],
      },
      meta: { requestId: 'r1' },
    });
    const result = await p;
    expect(result.length).toBe(1);
    expect(result[0].id).toBe(1);
    expect(result[0].apellidoNombre).toBe('Pérez Juan');
    expect(result[0].dniMostrar).toBe('12345678');
    expect(result[0].estado).toBe('activo');
  });

  it('listarAsistenciasDeCurso hace GET a /admin/asistencias?cursoId= sin filtrar fecha', async () => {
    const p = service.listarAsistenciasDeCurso(5);
    const req = httpMock.expectOne(`${environment.apiBaseUrl}/admin/asistencias?cursoId=5`);
    expect(req.request.method).toBe('GET');
    req.flush({
      data: {
        items: [
          { id: 1, alumnoId: 10, cursoId: 5, cursoFechaId: 200, fecha: '2026-03-01', fechaEstado: 'realizada', registradoEn: '2026-03-01T12:00:00Z' },
          { id: 2, alumnoId: 11, cursoId: 5, cursoFechaId: 201, fecha: '2026-03-08', fechaEstado: 'programada', registradoEn: '2026-03-08T12:00:00Z' },
        ],
      },
      meta: { requestId: 'req_test' },
    });
    const list = await p;
    expect(list.length).toBe(2);
    expect(list.map((a) => a.cursoFechaId)).toEqual([200, 201]);
  });

  it('listarAsistencias hace GET a /admin/asistencias?cursoId= y filtra por fechaId client-side', async () => {
    const p = service.listarAsistencias(5, 200);
    const req = httpMock.expectOne(`${environment.apiBaseUrl}/admin/asistencias?cursoId=5`);
    expect(req.request.method).toBe('GET');
    req.flush({
      data: {
        items: [
          { id: 1, alumnoId: 10, cursoId: 5, cursoFechaId: 200, fecha: '2026-03-01', fechaEstado: 'realizada', registradoEn: '2026-03-01T10:00:00Z' },
          { id: 2, alumnoId: 11, cursoId: 5, cursoFechaId: 201, fecha: '2026-03-08', fechaEstado: 'realizada', registradoEn: '2026-03-08T10:00:00Z' },
        ],
      },
      meta: { requestId: 'r2' },
    });
    const result = await p;
    expect(result.length).toBe(1);
    expect(result[0].id).toBe(1);
    expect(result[0].cursoFechaId).toBe(200);
  });

  it('listarAsistenciasPorPar hace GET con cursoId y alumnoId', async () => {
    const p = service.listarAsistenciasPorPar(5, 10);
    const req = httpMock.expectOne(
      `${environment.apiBaseUrl}/admin/asistencias?cursoId=5&alumnoId=10`,
    );
    expect(req.request.method).toBe('GET');
    req.flush({
      data: {
        items: [
          { id: 1, alumnoId: 10, cursoId: 5, cursoFechaId: 200, fecha: '2026-03-01', fechaEstado: 'realizada', registradoEn: '2026-03-01T10:00:00Z' },
          { id: 2, alumnoId: 10, cursoId: 5, cursoFechaId: 201, fecha: '2026-03-08', fechaEstado: 'programada', registradoEn: '2026-03-08T10:00:00Z' },
        ],
      },
      meta: { requestId: 'r-par' },
    });
    const result = await p;
    expect(result.length).toBe(2);
    expect(result.every((a) => a.alumnoId === 10 && a.cursoId === 5)).toBeTrue();
  });

  it('listarAsistenciasPorAlumno hace GET solo con alumnoId', async () => {
    const p = service.listarAsistenciasPorAlumno(10);
    const req = httpMock.expectOne(
      `${environment.apiBaseUrl}/admin/asistencias?alumnoId=10`,
    );
    expect(req.request.method).toBe('GET');
    req.flush({
      data: {
        items: [
          { id: 1, alumnoId: 10, cursoId: 5, cursoFechaId: 200, fecha: '2026-03-01', fechaEstado: 'realizada', registradoEn: '2026-03-01T10:00:00Z' },
          { id: 2, alumnoId: 10, cursoId: 7, cursoFechaId: 300, fecha: '2026-03-08', fechaEstado: 'realizada', registradoEn: '2026-03-08T10:00:00Z' },
        ],
      },
      meta: { requestId: 'r-alumno' },
    });
    const result = await p;
    expect(result.length).toBe(2);
    expect(result.every((a) => a.alumnoId === 10)).toBeTrue();
  });

  it('marcar: DELETE y POST en paralelo (all-or-nothing)', async () => {
    const p = service.marcar(5, 200, [
      { alumnoId: 10, presente: true },
      { alumnoId: 11, presente: false },
      { alumnoId: 12, presente: true },
    ]);

    // 1. GET asistencias existentes.
    const reqGet = httpMock.expectOne(`${environment.apiBaseUrl}/admin/asistencias?cursoId=5`);
    reqGet.flush({
      data: {
        items: [
          {
            id: 50,
            alumnoId: 99,
            cursoId: 5,
            cursoFechaId: 200,
            fecha: '2026-03-01',
            fechaEstado: 'realizada',
            registradoEn: '2026-03-01T10:00:00Z',
          },
          {
            id: 51,
            alumnoId: 98,
            cursoId: 5,
            cursoFechaId: 200,
            fecha: '2026-03-01',
            fechaEstado: 'realizada',
            registradoEn: '2026-03-01T10:00:00Z',
          },
          {
            id: 52,
            alumnoId: 97,
            cursoId: 5,
            cursoFechaId: 199,
            fecha: '2026-02-01',
            fechaEstado: 'realizada',
            registradoEn: '2026-02-01T10:00:00Z',
          },
        ],
      },
      meta: { requestId: 'rg' },
    });
    await new Promise((resolve) => setTimeout(resolve, 0));

    // 2. DELETE solo las de fecha 200, en paralelo.
    const deletes = httpMock.match(
      (r) =>
        r.method === 'DELETE' &&
        (r.url === `${environment.apiBaseUrl}/admin/asistencias/50` ||
          r.url === `${environment.apiBaseUrl}/admin/asistencias/51`),
    );
    expect(deletes.length).toBe(2);
    for (const req of deletes) {
      req.flush({ data: { voided: true }, meta: { requestId: 'rd' } });
    }
    await new Promise((resolve) => setTimeout(resolve, 0));

    // 3. POST presentes en paralelo (10 y 12; 11 es false).
    const posts = httpMock.match(
      (r) => r.method === 'POST' && r.url === `${environment.apiBaseUrl}/admin/asistencias`,
    );
    expect(posts.length).toBe(2);
    const bodies = posts
      .map((r) => r.request.body as { alumnoId: number; cursoId: number; cursoFechaId: number })
      .sort((a, b) => a.alumnoId - b.alumnoId);
    expect(bodies).toEqual([
      { alumnoId: 10, cursoId: 5, cursoFechaId: 200 },
      { alumnoId: 12, cursoId: 5, cursoFechaId: 200 },
    ]);
    posts[0].flush({
      data: {
        id: 60,
        alumnoId: (posts[0].request.body as { alumnoId: number }).alumnoId,
        cursoId: 5,
        cursoFechaId: 200,
        fecha: '2026-03-01',
        fechaEstado: 'realizada',
        registradoEn: '2026-03-01T10:00:00Z',
      },
      meta: { requestId: 'rp1' },
    });
    posts[1].flush({
      data: {
        id: 61,
        alumnoId: (posts[1].request.body as { alumnoId: number }).alumnoId,
        cursoId: 5,
        cursoFechaId: 200,
        fecha: '2026-03-01',
        fechaEstado: 'realizada',
        registradoEn: '2026-03-01T10:00:00Z',
      },
      meta: { requestId: 'rp2' },
    });

    const result = await p;
    expect(result.length).toBe(2);
    expect(result.map((a) => a.alumnoId).sort((a, b) => a - b)).toEqual([10, 12]);
    httpMock.verify();
  });

  it('marcar rechaza si un POST falla', async () => {
    const first = service.listarHub();
    httpMock.expectOne(`${environment.apiBaseUrl}/admin/hub/asistencias`).flush(hubPayload);
    await first;

    const p = service.marcar(5, 200, [{ alumnoId: 10, presente: true }]);

    httpMock.expectOne(`${environment.apiBaseUrl}/admin/asistencias?cursoId=5`).flush({ data: { items: [] }, meta: { requestId: 'rg' } });
    await new Promise(resolve => setTimeout(resolve, 0));

    const reqPost = httpMock.expectOne(`${environment.apiBaseUrl}/admin/asistencias`);
    reqPost.flush('crash', { status: 500, statusText: 'Internal Server Error' });

    await expectAsync(p).toBeRejected();

    // Tras fallo de POST (y cualquier mutación parcial), el hub de sesión no debe reusarse.
    const after = service.listarHub();
    const hubReq = httpMock.expectOne(`${environment.apiBaseUrl}/admin/hub/asistencias`);
    expect(hubReq.request.method).toBe('GET');
    hubReq.flush({ ...hubPayload, meta: { requestId: 'hub-after-post-fail' } });
    await after;
  });

  it('marcar rechaza toda la operación si un DELETE falla e invalida hub', async () => {
    const first = service.listarHub();
    httpMock.expectOne(`${environment.apiBaseUrl}/admin/hub/asistencias`).flush(hubPayload);
    await first;

    const p = service.marcar(5, 200, [{ alumnoId: 10, presente: true }]);

    httpMock.expectOne(`${environment.apiBaseUrl}/admin/asistencias?cursoId=5`).flush({
      data: { items: [{ id: 50, alumnoId: 99, cursoId: 5, cursoFechaId: 200, fecha: '2026-03-01', fechaEstado: 'realizada', registradoEn: '2026-03-01T10:00:00Z' }] },
      meta: { requestId: 'rg' },
    });
    await new Promise(resolve => setTimeout(resolve, 0));

    const reqDelete = httpMock.expectOne(`${environment.apiBaseUrl}/admin/asistencias/50`);
    reqDelete.flush('crash', { status: 500, statusText: 'Internal Server Error' });

    await expectAsync(p).toBeRejected();

    const after = service.listarHub();
    const hubReq = httpMock.expectOne(`${environment.apiBaseUrl}/admin/hub/asistencias`);
    expect(hubReq.request.method).toBe('GET');
    hubReq.flush({ ...hubPayload, meta: { requestId: 'hub-after-delete-fail' } });
    await after;
  });

  it('anular hace DELETE a /admin/asistencias/:id y devuelve void', async () => {
    const p = service.anular(77);
    const req = httpMock.expectOne(`${environment.apiBaseUrl}/admin/asistencias/77`);
    expect(req.request.method).toBe('DELETE');
    req.flush({ data: { id: 77, voided: true }, meta: { requestId: 'r1' } });
    await expectAsync(p).toBeResolved();
  });

  it('listarAlumnos 4xx rechaza con error', async () => {
    const p = service.listarAlumnos(1);
    const req = httpMock.expectOne(`${environment.apiBaseUrl}/admin/alumnos`);
    req.flush(
      { error: { code: 'UNAUTHORIZED', message: 'No auth', details: [] }, meta: { requestId: 'r401' } },
      { status: 401, statusText: 'Unauthorized' },
    );
    await expectAsync(p).toBeRejected();
    try { await p; } catch (e) { expect(e).toBeInstanceOf(HttpErrorResponse); }
  });

  it('listarAsistencias 5xx rechaza con error', async () => {
    const p = service.listarAsistencias(1, 1);
    const req = httpMock.expectOne(`${environment.apiBaseUrl}/admin/asistencias?cursoId=1`);
    req.flush('crash', { status: 500, statusText: 'Internal Server Error' });
    await expectAsync(p).toBeRejected();
  });

  it('anular 4xx rechaza con error', async () => {
    const p = service.anular(999);
    const req = httpMock.expectOne(`${environment.apiBaseUrl}/admin/asistencias/999`);
    req.flush(
      { error: { code: 'ATTENDANCE_NOT_FOUND', message: 'No encontrado', details: [] }, meta: { requestId: 'r404' } },
      { status: 404, statusText: 'Not Found' },
    );
    await expectAsync(p).toBeRejected();
  });

  it('listarHub hace GET a /admin/hub/asistencias', async () => {
    const p = service.listarHub();
    const req = httpMock.expectOne(`${environment.apiBaseUrl}/admin/hub/asistencias`);
    expect(req.request.method).toBe('GET');
    req.flush({
      data: {
        cursos: [{ id: 1, codigo: 'CUR-001', nombre: 'Demo', estado: 'activo' }],
        fechas: [
          {
            id: 11,
            cursoId: 1,
            fecha: '2026-03-01',
            descripcion: null,
            orden: 1,
            estado: 'programada',
          },
        ],
        asistencias: [
          {
            id: 1,
            alumnoId: 10,
            cursoId: 1,
            cursoFechaId: 11,
            fecha: '2026-03-01',
            fechaEstado: 'programada',
            registradoEn: '2026-03-01T12:00:00Z',
          },
        ],
        alumnosActivos: 3,
      },
      meta: { requestId: 'hub1' },
    });
    const hub = await p;
    expect(hub.cursos.length).toBe(1);
    expect(hub.fechas[0].id).toBe(11);
    expect(hub.asistencias.length).toBe(1);
    expect(hub.alumnosActivos).toBe(3);
  });

  const hubPayload = {
    data: {
      cursos: [{ id: 1, codigo: 'CUR-001', nombre: 'Demo', estado: 'activo' }],
      fechas: [
        {
          id: 11,
          cursoId: 1,
          fecha: '2026-03-01',
          descripcion: null,
          orden: 1,
          estado: 'programada',
        },
      ],
      asistencias: [] as const,
      alumnosActivos: 2,
    },
    meta: { requestId: 'hub-coalesce' },
  };

  it('listarHub paralelo coalescea a un solo GET', async () => {
    const p1 = service.listarHub();
    const p2 = service.listarHub();
    const reqs = httpMock.match(`${environment.apiBaseUrl}/admin/hub/asistencias`);
    expect(reqs.length).toBe(1);
    expect(reqs[0].request.method).toBe('GET');
    reqs[0].flush(hubPayload);
    const [a, b] = await Promise.all([p1, p2]);
    expect(a).toBe(b);
    expect(a.alumnosActivos).toBe(2);
  });

  it('listarHub reusa Promise de sesión hasta mutación', async () => {
    const first = service.listarHub();
    httpMock.expectOne(`${environment.apiBaseUrl}/admin/hub/asistencias`).flush(hubPayload);
    await first;
    const second = service.listarHub();
    httpMock.expectNone(`${environment.apiBaseUrl}/admin/hub/asistencias`);
    await expectAsync(second).toBeResolved();
  });

  it('marcar invalida hubPending y fuerza GET fresco', async () => {
    const first = service.listarHub();
    httpMock.expectOne(`${environment.apiBaseUrl}/admin/hub/asistencias`).flush(hubPayload);
    await first;

    const marcarP = service.marcar(5, 200, [{ alumnoId: 10, presente: true }]);
    httpMock.expectOne(`${environment.apiBaseUrl}/admin/asistencias?cursoId=5`).flush({
      data: { items: [] },
      meta: { requestId: 'rg' },
    });
    await new Promise((resolve) => setTimeout(resolve, 0));
    httpMock.expectOne(`${environment.apiBaseUrl}/admin/asistencias`).flush({
      data: {
        id: 60,
        alumnoId: 10,
        cursoId: 5,
        cursoFechaId: 200,
        fecha: '2026-03-01',
        fechaEstado: 'realizada',
        registradoEn: '2026-03-01T10:00:00Z',
      },
      meta: { requestId: 'rp' },
    });
    await marcarP;

    const after = service.listarHub();
    const req = httpMock.expectOne(`${environment.apiBaseUrl}/admin/hub/asistencias`);
    expect(req.request.method).toBe('GET');
    req.flush({ ...hubPayload, meta: { requestId: 'hub-after-marcar' } });
    await after;
  });

  it('anular invalida hubPending y fuerza GET fresco', async () => {
    const first = service.listarHub();
    httpMock.expectOne(`${environment.apiBaseUrl}/admin/hub/asistencias`).flush(hubPayload);
    await first;

    const anularP = service.anular(77);
    httpMock.expectOne(`${environment.apiBaseUrl}/admin/asistencias/77`).flush({
      data: { id: 77, voided: true },
      meta: { requestId: 'r1' },
    });
    await anularP;

    const after = service.listarHub();
    const req = httpMock.expectOne(`${environment.apiBaseUrl}/admin/hub/asistencias`);
    expect(req.request.method).toBe('GET');
    req.flush({ ...hubPayload, meta: { requestId: 'hub-after-anular' } });
    await after;
  });

  it('resuelve vía ATTENDANCE_SOURCE token', () => {
    expect(TestBed.inject(ATTENDANCE_SOURCE)).toBeInstanceOf(HttpAttendanceService);
  });
});
