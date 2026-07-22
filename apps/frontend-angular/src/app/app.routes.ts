import { Routes } from '@angular/router';
import { adminGuard } from './features/admin/admin-guard';
import { COURSES_SOURCE } from './features/admin/courses/courses.service';
import { InMemoryCoursesService } from './features/admin/courses/in-memory-courses.service';
import { HttpCoursesService } from './features/admin/courses/http-courses.service';
import { ATTENDANCE_SOURCE } from './features/admin/attendances/data/attendance.token';
import { AttendanceMockService } from './features/admin/attendances/data/attendance-mock.service';
import { HttpAttendanceService } from './features/admin/attendances/data/http-attendance.service';
import { CERTIFICATIONS_SOURCE } from './features/admin/certifications/certifications.service';
import { InMemoryCertificationsService } from './features/admin/certifications/in-memory-certifications.service';
import { HttpCertificationsService } from './features/admin/certifications/http-certifications.service';
import { STUDENTS_SOURCE } from './features/admin/students/students.service';
import { InMemoryStudentsService } from './features/admin/students/in-memory-students.service';
import { HttpStudentsService } from './features/admin/students/http-students.service';
import { INSTITUTIONAL_CONFIG_SOURCE } from './features/admin/institutional-config/institutional-config.service';
import { HttpInstitutionalConfigService } from './features/admin/institutional-config/http-institutional-config.service';
import { InMemoryInstitutionalConfigService } from './features/admin/institutional-config/in-memory-institutional-config.service';
import { environment } from '../environments/environment';

export const routes: Routes = [
  // Entrada por /certificados/ → login admin (la validación pública sigue en validar/:token).
  {
    path: '',
    redirectTo: '/admin/login',
    pathMatch: 'full',
  },
  {
    path: 'validar/:tokenCertificacion',
    loadComponent: () =>
      import('./features/public-validation/public-validation-page').then(
        (m) => m.PublicValidationPage,
      ),
  },
  // Rutas admin P5-04: autenticación real contra backend PHP vía cookies.
  {
    path: 'admin/login',
    title: 'Admin · Login — IFTS 14',
    loadComponent: () =>
      import('./features/admin/login-page').then((m) => m.LoginPage),
  },
  {
    // /admin redirige al dashboard; adminGuard del shell manda a /admin/login
    // si no hay sesión mock.
    path: 'admin',
    redirectTo: '/admin/dashboard',
    pathMatch: 'full',
  },
  {
    // Shell admin con rutas hijas: dashboard, cursos (listado, nuevo,
    // editar, detalle). El orden dentro de children importa: rutas estáticas
    // (nuevo, :id/editar) deben ir ANTES que :id y que el listado para no
    // caer en el parámetro.
    path: 'admin',
    canActivate: [adminGuard],
    // ponytail: provee COURSES_SOURCE solo en el árbol admin/cursos; sin
    // HTTP/storage/secretos. Si se saca, /admin/cursos* falla con
    // NullInjectorError en runtime (no en specs, que lo proveen a mano).
    providers: [
      // ponytail: conmutación mock→HTTP vía environment.useRealApi (patrón VALIDATION_SOURCE).
      // useRealApi=false (default) → InMemoryXxx; true → HttpXxx contra environment.apiBaseUrl.
      { provide: COURSES_SOURCE, useClass: environment.useRealApi ? HttpCoursesService : InMemoryCoursesService },
      { provide: ATTENDANCE_SOURCE, useClass: environment.useRealApi ? HttpAttendanceService : AttendanceMockService },
      // Mock: una sola instancia root (useExisting) para que revocar alinee admin ↔ validación pública.
      // API real: HttpCertificationsService en el árbol admin.
      environment.useRealApi
        ? { provide: CERTIFICATIONS_SOURCE, useClass: HttpCertificationsService }
        : { provide: CERTIFICATIONS_SOURCE, useExisting: InMemoryCertificationsService },
      { provide: STUDENTS_SOURCE, useClass: environment.useRealApi ? HttpStudentsService : InMemoryStudentsService },
      { provide: INSTITUTIONAL_CONFIG_SOURCE, useClass: environment.useRealApi ? HttpInstitutionalConfigService : InMemoryInstitutionalConfigService },
    ],
    loadComponent: () =>
      import('./features/admin/admin-shell').then((m) => m.AdminShell),
    children: [
      {
        path: 'dashboard',
        title: 'Admin · Panel de certificaciones — IFTS 14',
        loadComponent: () =>
          import('./features/admin/admin-dashboard-page').then((m) => m.AdminDashboardPage),
      },
      {
        path: 'configuracion',
        title: 'Admin · Configuración institucional — IFTS 14',
        loadComponent: () =>
          import('./features/admin/institutional-config/pages/institutional-config-page').then(
            (m) => m.InstitutionalConfigPage,
          ),
      },
      {
        // Estático ANTES de alumnos/:id para que "nuevo" no caiga en detalle.
        path: 'alumnos/nuevo',
        title: 'Admin · Nuevo alumno — IFTS 14',
        data: { mode: 'create' },
        loadComponent: () =>
          import('./features/admin/students/pages/new/student-editor-page').then((m) => m.StudentEditorPage),
      },
      {
        path: 'alumnos/:id/editar',
        title: 'Admin · Editar alumno — IFTS 14',
        data: { mode: 'edit' },
        loadComponent: () =>
          import('./features/admin/students/pages/new/student-editor-page').then((m) => m.StudentEditorPage),
      },
      {
        path: 'alumnos/:id',
        title: 'Admin · Detalle de Alumno — IFTS 14',
        loadComponent: () =>
          import('./features/admin/students/pages/detail/student-detail-page').then((m) => m.StudentDetailPage),
      },
      {
        path: 'alumnos',
        title: 'Admin · Alumnos — IFTS 14',
        loadComponent: () =>
          import('./features/admin/students/pages/list/students-list-page').then((m) => m.StudentsListPage),
      },
      {
        // Más específica que `asistencias`: intermedia de fechas del curso.
        path: 'asistencias/curso/:id',
        title: 'Admin · Fechas del curso · Asistencias — IFTS 14',
        loadComponent: () =>
          import(
            './features/admin/attendances/pages/course-dates/attendance-course-dates-page'
          ).then((m) => m.AttendanceCourseDatesPage),
      },
      {
        path: 'asistencias',
        title: 'Admin · Asistencias — IFTS 14',
        loadComponent: () =>
          import('./features/admin/attendances/pages/list/attendances-list-page').then(
            (m) => m.AttendancesListPage,
          ),
      },
      {
        path: 'cursos/nuevo',
        data: { mode: 'create' },
        loadComponent: () =>
          import('./features/admin/courses/course-editor-page').then((m) => m.CourseEditorPage),
      },
      {
        // Más específica que …/asistencias: listado de certificados del curso.
        path: 'cursos/:id/fechas/:fechaId/asistencias/certificados',
        title: 'Admin · Certificados del curso — IFTS 14',
        loadComponent: () =>
          import(
            './features/admin/attendances/pages/date-certificates/date-certificates-page'
          ).then((m) => m.DateCertificatesPage),
      },
      {
        // Ruta profunda de marcado por fecha: va ANTES que cursos/:id para
        // que :id no la capture. Orden seguro preserva catch-all admin.
        path: 'cursos/:id/fechas/:fechaId/asistencias',
        title: 'Admin · Fecha · Asistencias y certificados — IFTS 14',
        loadComponent: () =>
          import('./features/admin/attendances/pages/marking/attendance-marking-page').then(
            (m) => m.AttendanceMarkingPage,
          ),
      },
      {
        path: 'cursos/:id/editar',
        data: { mode: 'edit' },
        loadComponent: () =>
          import('./features/admin/courses/course-editor-page').then((m) => m.CourseEditorPage),
      },
      {
        path: 'cursos/:id',
        loadComponent: () =>
          import('./features/admin/courses/course-detail-page').then((m) => m.CourseDetailPage),
      },
      {
        path: 'cursos',
        loadComponent: () =>
          import('./features/admin/courses/courses-list-page').then((m) => m.CoursesListPage),
      },
      {
        // Emisión: ruta estática ANTES de certificaciones/:id (first-wins).
        path: 'certificaciones/nueva',
        title: 'Admin · Nueva certificación — IFTS 14',
        loadComponent: () =>
          import(
            './features/admin/certifications/pages/new/certification-new-page'
          ).then((m) => m.CertificationNewPage),
      },
      {
        // F4-02: ruta PDF ANTES de certificaciones/:id para que :id no
        // capture el sufijo /pdf. Orden seguro first-wins.
        path: 'certificaciones/:id/pdf',
        title: 'Admin · Certificación PDF — IFTS 14',
        loadComponent: () =>
          import(
            './features/admin/certifications/pages/pdf/certification-pdf-preview-page'
          ).then((m) => m.CertificationPdfPreviewPage),
      },
      {
        // F5-04: ruta entrega ANTES de certificaciones/:id
        path: 'certificaciones/:id/entrega',
        title: 'Admin · Entrega manual — IFTS 14',
        loadComponent: () =>
          import(
            './features/admin/certifications/pages/delivery/certification-delivery-page'
          ).then((m) => m.CertificationDeliveryPage),
      },
      {
        // F6-01: ruta revocación ANTES de certificaciones/:id
        path: 'certificaciones/:id/revocar',
        title: 'Admin · Revocar certificación — IFTS 14',
        loadComponent: () =>
          import(
            './features/admin/certifications/pages/revoke/certification-revoke-page'
          ).then((m) => m.CertificationRevokePage),
      },
      {
        path: 'certificaciones/:id',
        title: 'Admin · Certificación — IFTS 14',
        loadComponent: () =>
          import('./features/admin/certifications/pages/preview/certification-preview-page').then(
            (m) => m.CertificationPreviewPage,
          ),
      },
      {
        path: 'certificaciones',
        title: 'Admin · Certificaciones — IFTS 14',
        loadComponent: () =>
          import('./features/admin/certifications/pages/list/certifications-list-page').then(
            (m) => m.CertificationsListPage,
          ),
      },
    ],
  },
  // Aislamiento admin: captura cualquier /admin/* no matcheado arriba
  // (/admin/typo) ANTES de que caiga al wildcard público. pathMatch 'prefix'
  // hace de catch-all admin; el redirect manda al dashboard, donde
  // adminGuard envía sin sesión a /admin/login. Va después del bloque admin
  // con children para no interceptarlo.
  {
    path: 'admin',
    pathMatch: 'prefix',
    redirectTo: '/admin/dashboard',
  },
  // Las URLs inválidas no deben colisionar con un token de demo conocido.
  // Llevan a una página no encontrada que no valida nada.
  {
    path: '**',
    loadComponent: () =>
      import('./features/not-found/not-found-page').then((m) => m.NotFoundPage),
  },
];
