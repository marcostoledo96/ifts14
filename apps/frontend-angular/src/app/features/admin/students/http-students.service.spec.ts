import { TestBed } from '@angular/core/testing';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { STUDENTS_SOURCE } from './students.service';
import { HttpStudentsService } from './http-students.service';

describe('HttpStudentsService', () => {
  let service: HttpStudentsService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: STUDENTS_SOURCE, useClass: HttpStudentsService },
      ],
    });
    service = TestBed.inject(HttpStudentsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('listar hace GET a /admin/alumnos y mapea apellidoNombre→apellido+nombre y email', async () => {
    const p = service.listar();
    const req = httpMock.expectOne(`${environment.apiBaseUrl}/admin/alumnos`);
    expect(req.request.method).toBe('GET');
    req.flush({
      data: {
        items: [
          {
            id: 1,
            apellidoNombre: 'Pérez Juan',
            dniMostrar: '12345678',
            email: 'juan.perez@example.invalid',
            estado: 'activo',
          },
          {
            id: 2,
            apellidoNombre: 'García María Luz',
            dniMostrar: '34567890',
            email: null,
            estado: 'activo',
          },
        ],
      },
      meta: { requestId: 'r1' },
    });
    const result = await p;
    expect(result.length).toBe(2);
    expect(result[0].apellido).toBe('Pérez');
    expect(result[0].nombre).toBe('Juan');
    expect(result[1].apellido).toBe('García');
    expect(result[1].nombre).toBe('María Luz');
    expect(result[0].dniMostrar).toBe('12345678');
    expect(result[0].email).toBe('juan.perez@example.invalid');
    expect(result[0].tieneEmail).toBeTrue();
    expect(result[1].email).toBeNull();
    expect(result[1].tieneEmail).toBeFalse();
    expect(result[0].cursosConAsistencia).toBeNull();
    expect(result[0].certificacionesValidas).toBeNull();
  });

  it('crear hace POST a /admin/alumnos con body exacto y mapea 201', async () => {
    const p = service.crear({
      apellidoNombre: 'Nuevo Alumno',
      dni: '30111222',
      email: 'nuevo.alumno@example.invalid',
    });
    const req = httpMock.expectOne(`${environment.apiBaseUrl}/admin/alumnos`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      apellidoNombre: 'Nuevo Alumno',
      dni: '30111222',
      email: 'nuevo.alumno@example.invalid',
    });
    req.flush({
      data: {
        id: 42,
        apellidoNombre: 'Nuevo Alumno',
        dniMostrar: '30111222',
        email: 'nuevo.alumno@example.invalid',
        estado: 'activo',
      },
      meta: { requestId: 'r-create' },
    });
    const created = await p;
    expect(created.id).toBe(42);
    expect(created.apellido).toBe('Nuevo');
    expect(created.nombre).toBe('Alumno');
    expect(created.dniMostrar).toBe('30111222');
    expect(created.email).toBe('nuevo.alumno@example.invalid');
    expect(created.tieneEmail).toBeTrue();
  });

  it('crear omite email vacío del body POST', async () => {
    const p = service.crear({ apellidoNombre: 'Sin Email', dni: '30111223', email: null });
    const req = httpMock.expectOne(`${environment.apiBaseUrl}/admin/alumnos`);
    expect(req.request.body).toEqual({ apellidoNombre: 'Sin Email', dni: '30111223' });
    expect(Object.keys(req.request.body).sort()).toEqual(['apellidoNombre', 'dni']);
    req.flush({
      data: { id: 43, apellidoNombre: 'Sin Email', dniMostrar: '30111223', estado: 'activo' },
      meta: { requestId: 'r-create-no-email' },
    });
    const created = await p;
    expect(created.email).toBeNull();
    expect(created.tieneEmail).toBeFalse();
  });

  it('crear en 409 con existingStudentId lanza StudentDuplicateError', async () => {
    const p = service.crear({ apellidoNombre: 'Dup', dni: '30111222' });
    const req = httpMock.expectOne(`${environment.apiBaseUrl}/admin/alumnos`);
    req.flush(
      {
        error: {
          code: 'CONFLICT',
          message: 'Duplicado',
          details: { existingStudentId: 12 },
        },
        meta: { requestId: 'r409' },
      },
      { status: 409, statusText: 'Conflict' },
    );
    await expectAsync(p).toBeRejectedWith(
      jasmine.objectContaining({ status: 409, existingStudentId: 12 }),
    );
  });

  it('crear en 409 sin id resuelve por listado', async () => {
    const p = service.crear({ apellidoNombre: 'Dup', dni: '30111222' });
    const createReq = httpMock.expectOne(`${environment.apiBaseUrl}/admin/alumnos`);
    createReq.flush(
      { error: { code: 'CONFLICT', message: 'Duplicado', details: [] }, meta: { requestId: 'r409b' } },
      { status: 409, statusText: 'Conflict' },
    );
    await Promise.resolve();
    const listReq = httpMock.expectOne(`${environment.apiBaseUrl}/admin/alumnos`);
    listReq.flush({
      data: {
        items: [{ id: 9, apellidoNombre: 'Ya Existe', dniMostrar: '30111222', estado: 'activo' }],
      },
      meta: { requestId: 'r409-list' },
    });
    await expectAsync(p).toBeRejectedWith(
      jasmine.objectContaining({ status: 409, existingStudentId: 9 }),
    );
  });

  it('apellidoNombre sin espacio → apellido lleno, nombre vacío', async () => {
    const p = service.listar();
    const req = httpMock.expectOne(`${environment.apiBaseUrl}/admin/alumnos`);
    req.flush({
      data: { items: [{ id: 1, apellidoNombre: 'Mononombre', dniMostrar: '20000000', estado: 'activo' }] },
      meta: { requestId: 'r2' },
    });
    const result = await p;
    expect(result[0].apellido).toBe('Mononombre');
    expect(result[0].nombre).toBe('');
  });

  it('contar devuelve la longitud del listado (consistencia list→count)', async () => {
    const p = service.contar();
    const req = httpMock.expectOne(`${environment.apiBaseUrl}/admin/alumnos`);
    req.flush({
      data: { items: [
        { id: 1, apellidoNombre: 'A B', dniMostrar: '20111111', estado: 'activo' },
        { id: 2, apellidoNombre: 'C D', dniMostrar: '20222222', estado: 'activo' },
        { id: 3, apellidoNombre: 'E F', dniMostrar: '20333333', estado: 'activo' },
      ] },
      meta: { requestId: 'r3' },
    });
    expect(await p).toBe(3);
  });

  it('obtener hace GET a /admin/alumnos/:id y devuelve AlumnoDetalle con defaults', async () => {
    const p = service.obtener(5);
    const req = httpMock.expectOne(`${environment.apiBaseUrl}/admin/alumnos/5`);
    expect(req.request.method).toBe('GET');
    req.flush({
      data: {
        id: 5,
        apellidoNombre: 'López Diego',
        dniMostrar: '99556677',
        email: 'diego.lopez@example.invalid',
        estado: 'activo',
      },
      meta: { requestId: 'r4' },
    });
    const result = await p;
    expect(result).not.toBeNull();
    expect(result!.id).toBe(5);
    expect(result!.apellido).toBe('López');
    expect(result!.nombre).toBe('Diego');
    expect(result!.dniMostrar).toBe('99556677');
    expect(result!.email).toBe('diego.lopez@example.invalid');
    expect(result!.ingreso).toBe('');
    expect(result!.cursos).toEqual([]);
  });

  it('obtener devuelve null en 404', async () => {
    const p = service.obtener(999);
    const req = httpMock.expectOne(`${environment.apiBaseUrl}/admin/alumnos/999`);
    req.flush(
      { error: { code: 'STUDENT_NOT_FOUND', message: 'No encontrado', details: [] }, meta: { requestId: 'r404' } },
      { status: 404, statusText: 'Not Found' },
    );
    expect(await p).toBeNull();
  });

  it('listar 4xx rechaza con error', async () => {
    const p = service.listar();
    const req = httpMock.expectOne(`${environment.apiBaseUrl}/admin/alumnos`);
    req.flush(
      { error: { code: 'UNAUTHORIZED', message: 'No auth', details: [] }, meta: { requestId: 'r401' } },
      { status: 401, statusText: 'Unauthorized' },
    );
    await expectAsync(p).toBeRejected();
    try { await p; } catch (e) { expect(e).toBeInstanceOf(HttpErrorResponse); }
  });

  it('listar 5xx rechaza con error', async () => {
    const p = service.listar();
    const req = httpMock.expectOne(`${environment.apiBaseUrl}/admin/alumnos`);
    req.flush('crash', { status: 500, statusText: 'Internal Server Error' });
    await expectAsync(p).toBeRejected();
  });

  it('obtener 5xx propaga el error (no lo colapsa a null)', async () => {
    const p = service.obtener(5);
    const req = httpMock.expectOne(`${environment.apiBaseUrl}/admin/alumnos/5`);
    req.flush('crash', { status: 500, statusText: 'Internal Server Error' });
    await expectAsync(p).toBeRejected();
  });

  it('contar 4xx rechaza con error', async () => {
    const p = service.contar();
    const req = httpMock.expectOne(`${environment.apiBaseUrl}/admin/alumnos`);
    req.flush(
      { error: { code: 'UNAUTHORIZED', message: 'No auth', details: [] }, meta: { requestId: 'r401' } },
      { status: 401, statusText: 'Unauthorized' },
    );
    await expectAsync(p).toBeRejected();
  });

  it('resuelve vía STUDENTS_SOURCE token', () => {
    expect(TestBed.inject(STUDENTS_SOURCE)).toBeInstanceOf(HttpStudentsService);
  });
});
