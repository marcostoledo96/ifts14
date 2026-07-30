import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

// Ruta segura para URLs inválidas: no valida ningún token de demo.
@Component({
  selector: 'app-not-found-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  templateUrl: './not-found-page.html',
  styleUrl: './not-found-page.css',
})
export class NotFoundPage {}
