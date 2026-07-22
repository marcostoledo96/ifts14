import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** Ruedita de carga reutilizable (acciones, cabeceras de listado, nav). */
@Component({
  selector: 'app-ui-spinner',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span
      class="ui-spinner"
      [class.ui-spinner--sm]="size() === 'sm'"
      [class.ui-spinner--lg]="size() === 'lg'"
      [attr.aria-hidden]="decorative() ? 'true' : null"
      [attr.role]="decorative() ? null : 'status'"
      [attr.aria-label]="decorative() ? null : label()"
    >
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2.5" opacity="0.22" />
        <path
          d="M21 12a9 9 0 0 0-9-9"
          stroke="currentColor"
          stroke-width="2.5"
          stroke-linecap="round"
        />
      </svg>
    </span>
  `,
  styleUrl: './ui-spinner.css',
})
export class UiSpinner {
  readonly size = input<'sm' | 'md' | 'lg'>('md');
  readonly label = input('Cargando');
  /** true = solo visual (el texto vecino ya comunica el estado). */
  readonly decorative = input(true);
}
