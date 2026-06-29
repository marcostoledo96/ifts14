import { ChangeDetectionStrategy, Component } from '@angular/core';

// Ruta segura para URLs inválidas: no valida ningún token de demo.
@Component({
  selector: 'app-not-found-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section aria-labelledby="nf-title">
      <h1 id="nf-title">Página no encontrada</h1>
      <p>La dirección solicitada no existe.</p>
    </section>
  `,
})
export class NotFoundPage {}