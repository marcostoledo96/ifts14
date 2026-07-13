// Test de seguridad: valida que la fuente de cursos no exponga secretos ni
// red ni storage. Se ejecuta en browser (Karma): importa las clases y las
// serializa con toString() para inspeccionar su código fuente.
import { InMemoryCoursesService } from '../in-memory-courses.service';
import { CoursesListPage } from '../courses-list-page';
import { CourseDetailPage } from '../course-detail-page';
import { CourseEditorPage } from '../course-editor-page';

const forbidden = [
  'X-Admin-Key',
  'localStorage',
  'sessionStorage',
  'document.cookie',
  'HttpClient',
  'fetch(',
  'XMLHttpRequest',
  'DNI',
  'token',
  'http://',
  'https://',
];

// Fuente de código a inspeccionar: toString() de cada clase devuelve la
// declaración de la clase/métodos con su cuerpo.
function sources(): string[] {
  return [
    InMemoryCoursesService.prototype.constructor.toString(),
    InMemoryCoursesService.prototype.listar.toString(),
    InMemoryCoursesService.prototype.obtener.toString(),
    InMemoryCoursesService.prototype.crear.toString(),
    InMemoryCoursesService.prototype.actualizarEstado.toString(),
    InMemoryCoursesService.prototype.listarFechas.toString(),
    InMemoryCoursesService.prototype.guardarFecha.toString(),
    CoursesListPage.prototype.constructor.toString(),
    CoursesListPage.prototype.recargar.toString(),
    CoursesListPage.prototype.onLimpiarFiltros.toString(),
    CourseDetailPage.prototype.constructor.toString(),
    CourseDetailPage.prototype.cargar.toString(),
    CourseDetailPage.prototype.presentesPorFecha.toString(),
    CourseEditorPage.prototype.constructor.toString(),
  ];
}

describe('no-secrets en features/admin/courses/**', () => {
  it('ningún método/ctor expone secretos, red, storage o DNI', () => {
    for (const src of sources()) {
      const lower = src.toLowerCase();
      for (const needle of forbidden) {
        const lowerNeedle = needle.toLowerCase();
        expect(lower).not.toContain(lowerNeedle);
      }
    }
  });

  it('las clases de cursos no usan HttpClient ni fetch', () => {
    const all = sources().join('\n').toLowerCase();
    expect(all).not.toContain('httpclient');
    expect(all).not.toContain('fetch(');
  });
});
