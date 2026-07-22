import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { INSTITUTIONAL_BRAND } from '../../shared/brand/institutional-brand';

/** Identificadores de iconos Lucide-like (SVG inline multi-path en template). */
export type NavIconId =
  | 'layout-grid'
  | 'book-open'
  | 'users'
  | 'calendar-check'
  | 'qr-code'
  | 'settings'
  | 'log-out';

interface NavItem {
  readonly label: string;
  // Ruta Angular definida. `null` = placeholder hasta que exista ruta;
  // se renderiza como botón deshabilitado (sin navegación).
  readonly route: string | null;
  readonly iconId: NavIconId;
}

const ITEMS: readonly NavItem[] = [
  { label: 'Inicio', route: '/admin/dashboard', iconId: 'layout-grid' },
  { label: 'Cursos', route: '/admin/cursos', iconId: 'book-open' },
  { label: 'Alumnos', route: '/admin/alumnos', iconId: 'users' },
  { label: 'Asistencias', route: '/admin/asistencias', iconId: 'calendar-check' },
  { label: 'Certificaciones', route: '/admin/certificaciones', iconId: 'qr-code' },
];

const CONFIG_ITEM: NavItem = {
  label: 'Configuración',
  route: '/admin/configuracion',
  iconId: 'settings',
};

@Component({
  selector: 'app-sidebar-admin',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, NgTemplateOutlet],
  templateUrl: './sidebar-admin.html',
  styleUrl: './sidebar-admin.css',
})
export class SidebarAdmin {
  readonly active = input<string>('/admin/dashboard');
  readonly items = ITEMS;
  readonly configItem = CONFIG_ITEM;
  readonly logoSrc = INSTITUTIONAL_BRAND.logoIfts;
  readonly cerrarSesion = output<void>();

  // Inicio usa igualdad exacta; Cursos, Asistencias y Certificaciones usan
  // prefijo para que sus rutas hijas también queden activos. La ruta de
  // marcado /admin/cursos/:id/fechas/:fechaId/asistencias pertenece a
  // Asistencias (no a Cursos): debe verificarse antes del prefijo /admin/cursos.
  isActive(item: NavItem): boolean {
    if (item.route === null) return false;
    const active = this.active().split(/[?#]/, 1)[0];
    const isAttendanceRoute =
      active === '/admin/asistencias' ||
      active.startsWith('/admin/asistencias/') ||
      /^\/admin\/cursos\/[^/]+\/fechas\/[^/]+\/asistencias$/.test(active);
    if (isAttendanceRoute) {
      return item.route === '/admin/asistencias';
    }
    if (
      item.route === '/admin/cursos' ||
      item.route === '/admin/asistencias' ||
      item.route === '/admin/certificaciones' ||
      item.route === '/admin/alumnos' ||
      item.route === '/admin/configuracion'
    ) {
      return active.startsWith(item.route);
    }
    return item.route === active;
  }
}
