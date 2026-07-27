import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { INSTITUTIONAL_BRAND } from '../../shared/brand/institutional-brand';
import { UiSpinner } from '../../shared/ui/ui-spinner';

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
  imports: [RouterLink, NgTemplateOutlet, UiSpinner],
  templateUrl: './sidebar-admin.html',
  styleUrl: './sidebar-admin.css',
})
export class SidebarAdmin {
  readonly active = input<string>('/admin/dashboard');
  /** true mientras el router carga una ruta lazy. */
  readonly navegando = input(false);
  /** URL de destino durante la navegación (NavigationStart). */
  readonly rutaPendiente = input<string | null>(null);
  /** Muestra la X de cierre (drawer mobile). */
  readonly mostrarCerrar = input(false);
  readonly items = ITEMS;
  readonly configItem = CONFIG_ITEM;
  readonly logoSrc = INSTITUTIONAL_BRAND.logoIfts;
  readonly cerrarSesion = output<void>();
  readonly cerrarMenu = output<void>();

  // Inicio usa igualdad exacta; Cursos, Asistencias y Certificaciones usan
  // prefijo para que sus rutas hijas también queden activos. La ruta de
  // marcado /admin/cursos/:id/fechas/:fechaId/asistencias pertenece a
  // Asistencias (no a Cursos): debe verificarse antes del prefijo /admin/cursos.
  isActive(item: NavItem): boolean {
    return this.matchesRoute(item, this.active());
  }

  /** Ruedita en el ítem de menú hacia el que se está navegando. */
  isNavigatingTo(item: NavItem): boolean {
    if (!this.navegando()) return false;
    const pending = this.rutaPendiente();
    if (!pending) return false;
    return this.matchesRoute(item, pending);
  }

  private matchesRoute(item: NavItem, url: string): boolean {
    if (item.route === null) return false;
    const path = url.split(/[?#]/, 1)[0];
    const isAttendanceRoute =
      path === '/admin/asistencias' ||
      path.startsWith('/admin/asistencias/') ||
      /^\/admin\/cursos\/[^/]+\/fechas\/[^/]+\/asistencias(?:\/|$)/.test(path);
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
      return path === item.route || path.startsWith(`${item.route}/`);
    }
    return item.route === path;
  }
}
