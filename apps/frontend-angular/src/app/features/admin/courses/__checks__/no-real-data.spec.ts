// Verifica que el seed ficticio no contiene datos plausibles reales.
// Importa el servicio y obtiene la lista en memoria para inspeccionar el
// contenido real (no el código fuente).
import { TestBed } from '@angular/core/testing';
import { COURSES_SOURCE } from '../courses.service';
import { InMemoryCoursesService } from '../in-memory-courses.service';

describe('no-real-data en seed de cursos', () => {
  async function listarNombresYCodigos() {
    TestBed.configureTestingModule({
      providers: [{ provide: COURSES_SOURCE, useClass: InMemoryCoursesService }],
    });
    const svc = TestBed.inject(COURSES_SOURCE);
    const list = await svc.listar();
    return list;
  }

  it('no contiene emails en nombres ni códigos', async () => {
    const list = await listarNombresYCodigos();
    for (const c of list) {
      expect(c.nombre).not.toMatch(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i);
      expect(c.codigo).not.toMatch(/@/);
    }
  });

  it('los códigos siguen el patrón CUR-NNN (no matrículas largas)', async () => {
    const list = await listarNombresYCodigos();
    for (const c of list) {
      expect(c.codigo).toMatch(/^CUR-\d{3}$/);
    }
  });

  it('los ids de curso son pequeños (1..6), no DNIs plausibles', async () => {
    const list = await listarNombresYCodigos();
    for (const c of list) {
      expect(c.id).toBeLessThan(100);
    }
  });

  it('nombres no son nombres propios plausibles', async () => {
    const list = await listarNombresYCodigos();
    const texto = list.map((c) => c.nombre).join(' ');
    expect(texto).not.toMatch(/\b(Juan|María|Carlos|Sofía|Diego|Lucía|Pedro|Ana|Martín|José)\b/);
  });

  it('tiene 6 cursos seed', async () => {
    const list = await listarNombresYCodigos();
    expect(list.length).toBe(6);
  });

  it('no hay tokens tipo UUID en códigos ni nombres', async () => {
    const list = await listarNombresYCodigos();
    const texto = list.map((c) => `${c.codigo} ${c.nombre}`).join(' ');
    expect(texto).not.toMatch(
      /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i,
    );
  });

  it('usa solo cuatrimestres demo aprobados y sin identificadores personales', async () => {
    const list = await listarNombresYCodigos();
    const allowed = ['1.er cuatrimestre 2026', '2.º cuatrimestre 2025', 'Sin programar'];
    for (const c of list) {
      expect(allowed).toContain(c.cuatrimestre ?? '');
      expect(`${c.codigo} ${c.nombre}`).not.toMatch(/\b\d{7,8}\b/);
    }
  });
});
