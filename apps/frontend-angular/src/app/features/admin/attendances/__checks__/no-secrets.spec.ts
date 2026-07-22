// Test de seguridad: valida que la fuente de asistencias no exponga secretos
// ni red ni storage. Se ejecuta en browser (Karma): importa las clases y las
// serializa con toString() para inspeccionar su código fuente.
import { AttendanceMockService } from '../data/attendance-mock.service';
import { AttendanceCourseDatesPage } from '../pages/course-dates/attendance-course-dates-page';
import { AttendancesListPage } from '../pages/list/attendances-list-page';
import { AttendanceMarkingPage } from '../pages/marking/attendance-marking-page';

const forbidden = [
  'X-Admin-Key',
  'localStorage',
  'sessionStorage',
  'document.cookie',
  'HttpClient',
  'fetch(',
  'XMLHttpRequest',
  'http://',
  'https://',
  // DNI/token como literales sospechosos en código fuente. `dniMostrar`
  // dniMostrar completo (D0 2026-07-20) aparece legítimamente; se valida en no-real-data.
  'documentNumber',
  'dniCompleto',
  'X-Admin-Token',
];

// dniMostrar y documentNumber son palabras del contrato D0; se permite
// "dniMostrar" pero NO "DNI" como string literal de dato completo.
// `cargar` es privado (patrón F2-04); no se incluye aquí.
function sources(): string[] {
  return [
    AttendanceMockService.prototype.constructor.toString(),
    AttendanceMockService.prototype.listarAlumnos.toString(),
    AttendanceMockService.prototype.listarAsistencias.toString(),
    AttendanceMockService.prototype.marcar.toString(),
    AttendanceMockService.prototype.anular.toString(),
    AttendancesListPage.prototype.constructor.toString(),
    AttendanceCourseDatesPage.prototype.constructor.toString(),
    AttendanceCourseDatesPage.prototype.cargar.toString(),
    AttendanceMarkingPage.prototype.constructor.toString(),
    AttendanceMarkingPage.prototype.guardar.toString(),
    AttendanceMarkingPage.prototype.descartar.toString(),
  ];
}

describe('no-secrets en features/admin/attendances/**', () => {
  it('ningún método/ctor expone secretos, red, storage, email, legajo ni matrícula', () => {
    for (const src of sources()) {
      const lower = src.toLowerCase();
      for (const needle of forbidden) {
        const lowerNeedle = needle.toLowerCase();
        expect(lower).not.toContain(lowerNeedle);
      }
    }
  });

  it('las clases de asistencias no usan HttpClient ni fetch', () => {
    const all = sources().join('\n').toLowerCase();
    expect(all).not.toContain('httpclient');
    expect(all).not.toContain('fetch(');
  });

  it('no usa storage ni cookies', () => {
    const all = sources().join('\n').toLowerCase();
    expect(all).not.toContain('localstorage');
    expect(all).not.toContain('sessionstorage');
    expect(all).not.toContain('document.cookie');
    expect(all).not.toContain('indexeddb');
  });
});