import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

// Dashboard placeholder: sin datos reales ni llamadas a API. F2-04 habilita
// la tarjeta Cursos y F2-05 la tarjeta Asistencias como enlaces reales;
// Certificaciones sigue como placeholder deshabilitado hasta F2-06.
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
}