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

  it('marcar: DELETE existing + POST present, all-or-nothing', async () => {
    const p = service.marcar(5, 200, [
      { alumnoId: 10, presente: true },
      { alumnoId: 11, presente: false },
    ]);

    // 1. GET asistencias existentes.
    const reqGet = httpMock.expectOne(`${environment.apiBaseUrl}/admin/asistencias?cursoId=5`);
    reqGet.flush({
      data: {
        items: [
          { id: 50, alumnoId: 99, cursoId: 5, cursoFechaId: 200, fecha: '2026-03-01', fechaEstado: 'realizada', registradoEn: '2026-03-01T10:00:00Z' },
        ],
      },
      meta: { requestId: 'rg' },
    });
    // Flush resuelve el firstValueFrom del GET; el servicio continúa al DELETE.
    await new Promise(resolve => setTimeout(resolve, 0));

    // 2. DELETE la asistencia existente.
    const reqDelete = httpMock.expectOne(`${environment.apiBaseUrl}/admin/asistencias/50`);
    expect(reqDelete.request.method).toBe('DELETE');
    reqDelete.flush({ data: { id: 50, voided: true }, meta: { requestId: 'rd' } });
    await new Promise(resolve => setTimeout(resolve, 0));

    // 3. POST solo el presente (alumnoId 10; 11 es false → no se postea).
    const reqPost = httpMock.expectOne(`${environment.apiBaseUrl}/admin/asistencias`);
    expect(reqPost.request.method).toBe('POST');
    expect(reqPost.request.body).toEqual({ alumnoId: 10, cursoId: 5, cursoFechaId: 200 });
    reqPost.flush({
      data: { id: 60, alumnoId: 10, cursoId: 5, cursoFechaId: 200, fecha: '2026-03-01', fechaEstado: 'realizada', registradoEn: '2026-03-01T10:00:00Z' },
      meta: { requestId: 'rp' },
    });

    const result = await p;
    expect(result.length).toBe(1);
    expect(result[0].id).toBe(60);
    expect(result[0].alumnoId).toBe(10);
    httpMock.verify();
  });

  it('marcar rechaza toda la operación si un DELETE falla', async () => {
    const p = service.marcar(5, 200, [{ alumnoId: 10, presente: true }]);

    httpMock.expectOne(`${environment.apiBaseUrl}/admin/asistencias?cursoId=5`).flush({
      data: { items: [{ id: 50, alumnoId: 99, cursoId: 5, cursoFechaId: 200, fecha: '2026-03-01', fechaEstado: 'realizada', registradoEn: '2026-03-01T10:00:00Z' }] },
      meta: { requestId: 'rg' },
    });
    await new Promise(resolve => setTimeout(resolve, 0));

    const reqDelete = httpMock.expectOne(`${environment.apiBaseUrl}/admin/asistencias/50`);
    reqDelete.flush('crash', { status: 500, statusText: 'Internal Server Error' });

    await expectAsync(p).toBeRejected();
    httpMock.verify();
  });

  it('marcar rechaza si un POST falla', async () => {
    const p = service.marcar(5, 200, [{ alumnoId: 10, presente: true }]);

    httpMock.expectOne(`${environment.apiBaseUrl}/admin/asistencias?cursoId=5`).flush({ data: { items: [] }, meta: { requestId: 'rg' } });
    await new Promise(resolve => setTimeout(resolve, 0));

    const reqPost = httpMock.expectOne(`${environment.apiBaseUrl}/admin/asistencias`);
    reqPost.flush('crash', { status: 500, statusText: 'Internal Server Error' });

    await expectAsync(p).toBeRejected();
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

  it('resuelve vía ATTENDANCE_SOURCE token', () => {
    expect(TestBed.inject(ATTENDANCE_SOURCE)).toBeInstanceOf(HttpAttendanceService);
  });
});