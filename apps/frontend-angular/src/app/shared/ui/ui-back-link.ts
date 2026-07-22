import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

/** Botón/enlace «Volver» admin (tinta sólida, paridad entre pantallas). */
@Component({
  selector: 'app-ui-back-link',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <a
      class="ui-back-link"
      [routerLink]="to()"
      [attr.data-testid]="testId() || null"
    >
      <svg
        class="ui-back-link__icon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        aria-hidden="true"
      >
        <path
          d="M19 12H5M12 19l-7-7 7-7"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
      {{ label() }}
    </a>
  `,
  styleUrl: './ui-back-link.css',
})
export class UiBackLink {
  /** Ruta absoluta o comandos de RouterLink. */
  readonly to = input.required<string | readonly unknown[]>();
  readonly label = input.required<string>();
  readonly testId = input('');
}
