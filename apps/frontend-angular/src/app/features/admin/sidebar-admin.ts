import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';

interface NavItem {
  readonly label: string;
  // Ruta Angular definida. `null` = placeholder hasta que F2-04..F2-06
  // definan la ruta; se renderiza como botón deshabilitado (sin navegación).
  readonly route: string | null;
  readonly icon: string; // SVG path data inline
}

// Solo /admin/dashboard existe hoy (F2-03). El resto queda como placeholder
// deshabilitado para evitar hrefs absolutos que escapen el base href
// /certificados/ y recarguen la app perdiendo la sesión mock en memoria.
const ITEMS: readonly NavItem[] = [
  { label: 'Inicio', route: '/admin/dashboard', icon: 'M3 12l9-9 9 9M5 10v10h5v-6h4v6h5V10' },
  { label: 'Cursos', route: null, icon: 'M4 6h16M4 12h16M4 18h10' },
  { label: 'Alumnos', route: null, icon: 'M16 11a4 4 0 1 0-8 0 4 4 0 0 0 8 0zM4 20a8 8 0 0 1 16 0' },
  { label: 'Asistencias', route: null, icon: 'M5 3v18M9 3v18M5 8h4M5 14h4M19 5l-2 14-4-2' },
  { label: 'Certificaciones', route: null, icon: 'M5 3h9l5 5v13H5zM14 3v5h5M8 13h8M8 17h5' },
];

@Component({
  selector: 'app-sidebar-admin',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  templateUrl: './sidebar-admin.html',
  styleUrl: './sidebar-admin.css',
})
export class SidebarAdmin {
  readonly active = input<string>('/admin/dashboard');
  readonly items = ITEMS;
  readonly cerrarSesion = output<void>();

  isActive(item: NavItem): boolean {
    return item.route !== null && item.route === this.active();
  }
}