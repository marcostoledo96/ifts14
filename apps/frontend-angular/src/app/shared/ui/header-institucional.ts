import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-header-institucional',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './header-institucional.html',
  styleUrl: './header-institucional.css',
})
export class HeaderInstitucional {
  readonly subtitle = input('Validación oficial de certificados');
  readonly showOnlineBadge = input(true);
}