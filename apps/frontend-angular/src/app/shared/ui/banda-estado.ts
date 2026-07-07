import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type EstadoBanda = 'valid' | 'revoked' | 'not-verifiable' | 'error' | 'loading';

@Component({
  selector: 'app-banda-estado',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './banda-estado.html',
  styleUrl: './banda-estado.css',
})
export class BandaEstado {
  readonly kind = input.required<EstadoBanda>();
  readonly title = input.required<string>();
  readonly description = input<string>('');
  readonly stateLabel = input<string>('');

  /** `role="alert"` solo para error técnico; resto usa `role="status"`. */
  readonly isAlert = () => this.kind() === 'error';
}