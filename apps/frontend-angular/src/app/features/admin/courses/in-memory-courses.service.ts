// Implementación en memoria de CoursesService.
// Seed ficticio, institucionalmente seguro: sin DNI, emails, tokens,
// matrículas ni nombres reales. Mutaciones viven solo en la instancia
// y se pierden al recargar. Ver spec admin-courses-frontend.
import { Injectable } from '@angular/core';
import {
  Curso,
  CursoDetalle,
  CursoDraft,
  CursoFecha,
  CursoFechaDraft,
  CursosFiltros,
  EstadoCurso,
} from './courses.models';
import { CoursesService } from './courses.service';

// Registro interno mutable: los campos del modelo son readonly para el
// contrato público, pero la implementación en memoria necesita mutar
// estado y fechas durante las operaciones.
interface MutableCurso {
  id: number;
  codigo: string;
  nombre: string;
  estado: EstadoCurso;
  createdAt: string;
  updatedAt: string;
  cuatrimestre: string;
  fechas: CursoFecha[];
}
type CursoRecord = MutableCurso;

// ponytail: seed estático module-level; la instancia lo clona en ctor
// para que cada test arranque con datos limpios sin compartir estado.
function seed(): CursoRecord[] {
  const now = '2026-01-01T00:00:00.000Z';
  return [
    {
      id: 1,
      codigo: 'CUR-001',
      nombre: 'Curso de introducción a la gestión',
      estado: 'activo',
      createdAt: now,
      updatedAt: now,
      cuatrimestre: '1.er cuatrimestre 2026',
      fechas: [
        { id: 11, cursoId: 1, fecha: '2026-03-02', descripcion: 'Clase inaugural', orden: 1, estado: 'programada' },
        { id: 12, cursoId: 1, fecha: '2026-03-09', descripcion: null, orden: 2, estado: 'programada' },
        { id: 13, cursoId: 1, fecha: '2026-03-16', descripcion: null, orden: 3, estado: 'programada' },
      ],
    },
    {
      id: 2,
      codigo: 'CUR-002',
      nombre: 'Curso de herramientas administrativas',
      estado: 'activo',
      createdAt: now,
      updatedAt: now,
      cuatrimestre: '1.er cuatrimestre 2026',
      fechas: [
        { id: 21, cursoId: 2, fecha: '2026-04-05', descripcion: null, orden: 1, estado: 'programada' },
        { id: 22, cursoId: 2, fecha: '2026-04-12', descripcion: null, orden: 2, estado: 'programada' },
      ],
    },
    {
      id: 3,
      codigo: 'CUR-003',
      nombre: 'Curso de prácticas documentales',
      estado: 'borrador',
      createdAt: now,
      updatedAt: now,
      cuatrimestre: '1.er cuatrimestre 2026',
      fechas: [{ id: 31, cursoId: 3, fecha: '2026-05-04', descripcion: null, orden: 1, estado: 'programada' }],
    },
    {
      id: 4,
      codigo: 'CUR-004',
      nombre: 'Curso de procedimientos básicos',
      estado: 'cerrado',
      createdAt: now,
      updatedAt: now,
      cuatrimestre: '2.º cuatrimestre 2025',
      fechas: [
        { id: 41, cursoId: 4, fecha: '2025-09-01', descripcion: null, orden: 1, estado: 'realizada' },
        { id: 42, cursoId: 4, fecha: '2025-09-08', descripcion: null, orden: 2, estado: 'realizada' },
      ],
    },
    {
      id: 5,
      codigo: 'CUR-005',
      nombre: 'Curso de registros y archivo',
      estado: 'archivado',
      createdAt: now,
      updatedAt: now,
      cuatrimestre: 'Sin programar',
      fechas: [{ id: 51, cursoId: 5, fecha: '2025-06-10', descripcion: null, orden: 1, estado: 'cancelada' }],
    },
    {
      id: 6,
      codigo: 'CUR-006',
      nombre: 'Curso de atención al público',
      estado: 'activo',
      createdAt: now,
      updatedAt: now,
      cuatrimestre: 'Sin programar',
      fechas: [
        { id: 61, cursoId: 6, fecha: '2026-06-01', descripcion: null, orden: 1, estado: 'programada' },
        { id: 62, cursoId: 6, fecha: '2026-06-08', descripcion: null, orden: 2, estado: 'programada' },
        { id: 63, cursoId: 6, fecha: '2026-06-15', descripcion: null, orden: 3, estado: 'programada' },
      ],
    },
  ];
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

@Injectable({ providedIn: 'root' })
export class InMemoryCoursesService implements CoursesService {
  // Estado mutable por instancia. Cada instancia arranca con su clon del
  // seed para no compartir mutaciones entre tests ni recargas.
  private nextId = 100;
  private nextFechaId = 1000;
  private cursos: CursoRecord[] = clone(seed());

  listar(filtros?: CursosFiltros): Promise<readonly Curso[]> {
    let list = this.cursos.map((curso) => this.toCurso(curso));
    if (filtros?.estado) {
      list = list.filter((c) => c.estado === filtros.estado);
    }
    if (filtros?.q) {
      const q = filtros.q.trim().toLowerCase();
      if (q) {
        list = list.filter(
          (c) => c.codigo.toLowerCase().includes(q) || c.nombre.toLowerCase().includes(q),
        );
      }
    }
    if (filtros?.conFechas !== undefined) {
      list = list.filter((c) => ((c.cantidadFechas ?? 0) > 0) === filtros.conFechas);
    }
    return Promise.resolve(list);
  }

  obtener(id: number): Promise<CursoDetalle> {
    const found = this.cursos.find((c) => c.id === id);
    if (!found) {
      return Promise.reject(new Error(`Curso no encontrado: ${id}`));
    }
    return Promise.resolve({ ...this.toCurso(found), fechas: clone(found.fechas) });
  }

  crear(dto: CursoDraft): Promise<CursoDetalle> {
    if (!dto.codigo.trim() || !dto.nombre.trim()) {
      return Promise.reject(new Error('Código y nombre son obligatorios'));
    }
    const id = this.nextId++;
    const now = new Date().toISOString();
    const nuevo: CursoRecord = {
      id,
      codigo: dto.codigo.trim(),
      nombre: dto.nombre.trim(),
      estado: dto.estado,
      createdAt: now,
      updatedAt: now,
      cuatrimestre: 'Sin programar',
      fechas: [],
    };
    this.cursos.push(nuevo);
    return Promise.resolve({ ...this.toCurso(nuevo), fechas: [] });
  }

  actualizarEstado(id: number, estado: EstadoCurso): Promise<CursoDetalle> {
    const found = this.cursos.find((c) => c.id === id);
    if (!found) {
      return Promise.reject(new Error(`Curso no encontrado: ${id}`));
    }
    found.estado = estado;
    found.updatedAt = new Date().toISOString();
    return Promise.resolve({ ...this.toCurso(found), fechas: clone(found.fechas) });
  }

  listarFechas(cursoId: number): Promise<readonly CursoFecha[]> {
    const found = this.cursos.find((c) => c.id === cursoId);
    if (!found) {
      return Promise.reject(new Error(`Curso no encontrado: ${cursoId}`));
    }
    return Promise.resolve(clone(found.fechas));
  }

  guardarFecha(cursoId: number, dto: CursoFechaDraft): Promise<CursoFecha> {
    const found = this.cursos.find((c) => c.id === cursoId);
    if (!found) {
      return Promise.reject(new Error(`Curso no encontrado: ${cursoId}`));
    }
    if (!dto.fecha) {
      return Promise.reject(new Error('La fecha es obligatoria'));
    }
    if (dto.id === null) {
      const id = this.nextFechaId++;
      const nueva: CursoFecha = {
        id,
        cursoId,
        fecha: dto.fecha,
        descripcion: dto.descripcion,
        orden: dto.orden,
        estado: dto.estado,
      };
      found.fechas.push(nueva);
      found.updatedAt = new Date().toISOString();
      return Promise.resolve(clone(nueva));
    }
    const idx = found.fechas.findIndex((f) => f.id === dto.id);
    if (idx < 0) {
      return Promise.reject(new Error(`Fecha no encontrada: ${dto.id}`));
    }
    const actualizada: CursoFecha = {
      ...found.fechas[idx],
      fecha: dto.fecha,
      descripcion: dto.descripcion,
      orden: dto.orden,
      estado: dto.estado,
    };
    found.fechas[idx] = actualizada;
    found.updatedAt = new Date().toISOString();
    return Promise.resolve(clone(actualizada));
  }

  // Reemplazo completo: sincroniza el set de fechas del curso contra dtos.
  // Las existentes con id en dtos se actualizan; las nuevas (id null) se
  // crean; las existentes ausentes de dtos se eliminan (quitarFecha real).
  reemplazarFechas(cursoId: number, dtos: CursoFechaDraft[]): Promise<readonly CursoFecha[]> {
    const found = this.cursos.find((c) => c.id === cursoId);
    if (!found) {
      return Promise.reject(new Error(`Curso no encontrado: ${cursoId}`));
    }
    for (const dto of dtos) {
      if (!dto.fecha) {
        return Promise.reject(new Error('La fecha es obligatoria'));
      }
    }
    const resultado: CursoFecha[] = [];
    for (const dto of dtos) {
      if (dto.id === null) {
        resultado.push({
          id: this.nextFechaId++,
          cursoId,
          fecha: dto.fecha,
          descripcion: dto.descripcion,
          orden: dto.orden,
          estado: dto.estado,
        });
      } else {
        const idx = found.fechas.findIndex((f) => f.id === dto.id);
        if (idx < 0) {
          return Promise.reject(new Error(`Fecha no encontrada: ${dto.id}`));
        }
        resultado.push({
          ...found.fechas[idx],
          fecha: dto.fecha,
          descripcion: dto.descripcion,
          orden: dto.orden,
          estado: dto.estado,
        });
      }
    }
    found.fechas = clone(resultado);
    found.updatedAt = new Date().toISOString();
    return Promise.resolve(clone(resultado));
  }

  private toCurso({ fechas, ...curso }: CursoRecord): Curso {
    return {
      ...clone(curso),
      cantidadFechas: fechas.length,
      alumnosPresentes: null,
      certificaciones: null,
    };
  }
}
