import { ChangeDetectionStrategy, Component } from '@angular/core';

// Dashboard placeholder: sin datos reales ni llamadas a API.
@Component({
  selector: 'app-admin-dashboard-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './admin-dashboard-page.html',
  styleUrl: './admin-dashboard-page.css',
})
export class AdminDashboardPage {}