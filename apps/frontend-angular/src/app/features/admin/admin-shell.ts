import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { MOCK_SESSION } from './mock-session';
import { SidebarAdmin } from './sidebar-admin';
import { AdminDashboardPage } from './admin-dashboard-page';

// Shell admin: banner sticky, sidebar fija desktop/drawer mobile,
// main#contenido y footer admin. Asume landmarks únicos en /admin/*.
// Renderiza el dashboard inline (F2-03 placeholder). F2-04..F2-06 migrarán
// a rutas hijas con <router-outlet> cuando haya más de una página admin.
@Component({
  selector: 'app-admin-shell',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SidebarAdmin, AdminDashboardPage],
  templateUrl: './admin-shell.html',
  styleUrl: './admin-shell.css',
})
export class AdminShell {
  private readonly session = inject(MOCK_SESSION);
  private readonly router = inject(Router);

  // Drawer mobile: cerrado por defecto. El botón hamburguesa abre;
  // click en overlay cierra. Render condicional para evitar exponer
  // nav/logout a teclado/screen readers cuando está cerrado.
  readonly menuAbierto = signal(false);

  abrirMenu(): void {
    this.menuAbierto.set(true);
  }

  cerrarMenu(): void {
    this.menuAbierto.set(false);
  }

  cerrarSesion(): void {
    this.session.signOut();
    void this.router.navigate(['/admin/login']);
  }
}