import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs';
import { MOCK_SESSION } from './mock-session';
import { SidebarAdmin } from './sidebar-admin';

// Shell admin: banner sticky, sidebar fija desktop/drawer mobile,
// main#contenido y footer admin. Asume landmarks únicos en /admin/*.
// F2-04: rutas hijas con <router-outlet> (dashboard, cursos/*).
@Component({
  selector: 'app-admin-shell',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SidebarAdmin, RouterOutlet],
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

  // Ruta actual del router (string post-NavigationEnd). Se pasa como
  // [active] a SidebarAdmin para que marque la sección vigente.
  readonly rutaActual = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map(() => this.router.url),
    ),
    { initialValue: this.router.url },
  );

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