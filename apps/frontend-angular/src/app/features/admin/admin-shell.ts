import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import {
  NavigationCancel,
  NavigationEnd,
  NavigationError,
  NavigationStart,
  Router,
  RouterOutlet,
} from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map, tap } from 'rxjs';
import { ADMIN_AUTH } from './admin-auth.service';
import { SidebarAdmin } from './sidebar-admin';

// Shell admin: sidebar fija desktop / drawer mobile, main#contenido y footer.
// Barra de progreso al navegar entre rutas lazy (links del menú y internos).
@Component({
  selector: 'app-admin-shell',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SidebarAdmin, RouterOutlet],
  templateUrl: './admin-shell.html',
  styleUrl: './admin-shell.css',
})
export class AdminShell {
  private readonly auth = inject(ADMIN_AUTH);
  private readonly router = inject(Router);

  readonly menuAbierto = signal(false);

  readonly rutaActual = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map(() => this.router.url),
    ),
    { initialValue: this.router.url },
  );

  private readonly navTransit = toSignal(
    this.router.events.pipe(
      tap((e) => {
        if (e instanceof NavigationStart) this.menuAbierto.set(false);
      }),
      map((e) => {
        if (e instanceof NavigationStart) {
          return { active: true as const, url: e.url };
        }
        if (
          e instanceof NavigationEnd ||
          e instanceof NavigationCancel ||
          e instanceof NavigationError
        ) {
          return { active: false as const, url: null as string | null };
        }
        return null;
      }),
      filter((v): v is NonNullable<typeof v> => v !== null),
    ),
    { initialValue: { active: false as const, url: null as string | null } },
  );

  readonly navegando = computed(() => this.navTransit().active);
  readonly rutaPendiente = computed(() => this.navTransit().url);

  abrirMenu(): void {
    this.menuAbierto.set(true);
  }

  cerrarMenu(): void {
    this.menuAbierto.set(false);
  }

  cerrarSesion(): void {
    void this.auth.logout().then(() => {
      void this.router.navigate(['/admin/login']);
    });
  }
}
