import {
  ChangeDetectionStrategy,
  Component,
  computed,
  HostListener,
  inject,
  signal,
} from '@angular/core';
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
  readonly cerrandoSesion = signal(false);

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
        if (e instanceof NavigationStart && this.menuAbierto()) {
          // Cierre sin restaurar foco al menú: la navegación mueve el contexto.
          this.menuAbierto.set(false);
        }
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

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.menuAbierto()) {
      this.cerrarMenu();
    }
  }

  abrirMenu(): void {
    this.menuAbierto.set(true);
    queueMicrotask(() => {
      document
        .querySelector<HTMLElement>('#admin-drawer button.sidebar-close')
        ?.focus();
    });
  }

  cerrarMenu(): void {
    if (!this.menuAbierto()) return;
    this.menuAbierto.set(false);
    queueMicrotask(() => {
      document.querySelector<HTMLElement>('.menu-btn')?.focus();
    });
  }

  async cerrarSesion(): Promise<void> {
    if (this.cerrandoSesion()) return;
    this.cerrandoSesion.set(true);
    try {
      try {
        await this.auth.logout();
      } catch {
        // Fallo de red/CSRF: igual salimos del panel (sesión local ya limpia).
      }
      await this.router.navigate(['/admin/login']);
    } finally {
      this.cerrandoSesion.set(false);
    }
  }
}
