import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderInstitucional } from './shared/ui/header-institucional';

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, HeaderInstitucional],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {}