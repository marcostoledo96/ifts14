import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CERTIFICATIONS_SOURCE } from './certifications/certifications.service';
import { STUDENTS_SOURCE } from './students/students.service';

// Dashboard placeholder: sin datos reales ni llamadas a API. F2-04 habilita
// la tarjeta Cursos, F2-05 la tarjeta Asistencias y F2-06 la tarjeta
// Certificaciones como enlaces reales con conteos ficticios.
@Component({
  selector: 'app-admin-dashboard-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  templateUrl: './admin-dashboard-page.html',
  styleUrl: './admin-dashboard-page.css',
})
export class AdminDashboardPage {
  // Conteo ficticio: la UI muestra un número demo, sin persistencia real.
  // ponytail: valor fijo demo; el recuento real llega con la integración backend.
  readonly cursosCount = 6;
  readonly asistenciasCount = 11; // fechas programadas/realizadas en seed
  // Conteo derivado del seam CERTIFICATIONS_SOURCE.contar() (seed mock).
  // Arranca en 0 y se hidrata vía microtask; sin HTTP/fetch/storage.
  readonly certificacionesCount = signal(0);
  readonly alumnosCount = signal(0);

  constructor() {
    const certs = inject(CERTIFICATIONS_SOURCE, { optional: true });
    const students = inject(STUDENTS_SOURCE, { optional: true });
    // ponytail: optional:true protege render fuera del árbol admin; en
    // runtime el provider siempre está colgado en la ruta admin.
    if (certs) {
      // ponytail: catch() deja el conteo en 0; el dashboard sigue renderizable
      // aunque el seam rechace (provider roto o seed corrupto).
      certs.contar().then(
        (n) => this.certificacionesCount.set(n),
        () => this.certificacionesCount.set(0),
      );
    }
    if (students) students.contar().then((n) => this.alumnosCount.set(n), () => this.alumnosCount.set(0));
  }
}
