import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-folio-shell',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './folio-shell.html',
  styleUrl: './folio-shell.css',
})
export class FolioShell {
  readonly title = input.required<string>();
  readonly kicker = input('ACTA DE VALIDACIÓN ACADÉMICA');
  readonly description = input<string>('');
  readonly certificateCode = input<string>('');
}