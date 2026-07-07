import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { HeaderInstitucional } from './shared/ui/header-institucional';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs';

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, HeaderInstitucional],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  // Shell route-aware: en /admin/* AdminShell provee banner/main/footer propios.
  // El root solo conserva header+main+footer en rutas públicas.
  private readonly router = inject(Router);
  readonly esRutaAdmin = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map((e) => e.urlAfterRedirects.startsWith('/admin')),
    ),
    { initialValue: this.router.url.startsWith('/admin') },
  );
}