import { ChangeDetectionStrategy, Component } from '@angular/core';

// Página de inicio no validante: no inyecta ValidationService ni llama a la API.
// La verificación sólo ocurre en la ruta explícita validar/:tokenCertificacion.
@Component({
  selector: 'app-landing-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section aria-labelledby="landing-title">
      <h1 id="landing-title">Certificados IFTS 14</h1>
      <p>
        Verificación de certificados. Para validar un certificado, utilice el
        enlace provisto por la institución.
      </p>
    </section>
  `,
})
export class LandingPage {}