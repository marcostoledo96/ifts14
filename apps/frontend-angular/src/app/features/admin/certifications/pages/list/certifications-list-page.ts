import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CERTIFICATIONS_SOURCE } from '../../certifications.service';
import { Certificacion, EstadoCertificado } from '../../certifications.models';

// Listado de certificaciones con filtros y datos demo. Sin HTTP/storage.
@Component({
  selector: 'app-certifications-list-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  templateUrl: './certifications-list-page.html',
  styleUrl: './certifications-list-page.css',
})
export class CertificationsListPage {
  private readonly certs = inject(CERTIFICATIONS_SOURCE);

  readonly estados: readonly EstadoCertificado[] = ['borrador', 'vigente', 'revocado', 'vencido'];

  // Filtros locales. Inician sin filtro para mostrar todo el seed.
  readonly q = signal('');
  readonly estado = signal<EstadoCertificado | 'todos'>('todos');

  readonly certificados = signal<readonly Certificacion[]>([]);
  readonly cargando = signal(true);
  readonly error = signal('');

  constructor() {
    void this.recargar();
  }

  async recargar(): Promise<void> {
    this.cargando.set(true);
    this.error.set('');
    try {
      const filtros: { estado?: EstadoCertificado; q?: string } = {};
      if (this.estado() !== 'todos') {
        filtros.estado = this.estado() as EstadoCertificado;
      }
      const texto = this.q().trim();
      if (texto) {
        filtros.q = texto;
      }
      const list = await this.certs.listar(filtros);
      this.certificados.set(list);
    } catch (e) {
      this.error.set((e as Error).message);
    } finally {
      this.cargando.set(false);
    }
  }

  onSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.q.set(value);
    void this.recargar();
  }

  onEstado(event: Event): void {
    const value = (event.target as HTMLSelectElement).value as EstadoCertificado | 'todos';
    this.estado.set(value);
    void this.recargar();
  }
}