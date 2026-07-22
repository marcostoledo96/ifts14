import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  INSTITUTIONAL_CONFIG_LIMITS,
  INSTITUTIONAL_CONFIG_SOURCE,
  InstitutionalConfigWrite,
} from '../institutional-config.service';
import { INSTITUTIONAL_LOGOS } from '../../../../shared/brand/institutional-brand';

// Página de configuración institucional: layout calca v0 (nav sticky +
// secciones). Solo campos del DTO backend son editables; logos son assets
// fijos del frontend; firmas/SMTP/textos extra son presentacionales.
@Component({
  selector: 'app-institutional-config-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
  templateUrl: './institutional-config-page.html',
  styleUrl: './institutional-config-page.css',
})
export class InstitutionalConfigPage {
  private readonly source = inject(INSTITUTIONAL_CONFIG_SOURCE);

  readonly limits = INSTITUTIONAL_CONFIG_LIMITS;

  /** Logos institucionales hardcodeados (sin upload ni persistencia). */
  readonly logos = INSTITUTIONAL_LOGOS;

  /** Valores presentacionales (no DTO / no dirty / no PUT). */
  readonly demo = {
    textoInstitucional:
      'El Instituto de Formación Técnica Superior N.° 14 depende de la Dirección de Formación Técnica Superior del Gobierno de la Ciudad de Buenos Aires.',
    tituloCert: 'Certificado de Aprobación',
    formatoNumero: 'IFTS14-{CURSO}-{AÑO}-{SEC}',
    linkValidacion: 'certificados.ifts14.edu.ar/validar/',
    textoQr:
      'Escaneá el código para verificar la autenticidad de este certificado en el sitio oficial del IFTS N.° 14.',
    emailContacto: 'contacto@example.invalid',
    textoValidacion:
      'Este espacio permite verificar la validez de los certificados emitidos por el IFTS N.° 14.',
    sitioInstituto: 'www.ifts14.edu.ar',
    msgValido: 'Certificado válido y vigente, emitido por el IFTS N.° 14.',
    msgRevocado: 'Este certificado fue revocado por la institución y ya no es válido.',
    msgNoEncontrado: 'No se encontró ningún certificado asociado a este código.',
  } as const;

  readonly institutionName = signal('');
  readonly certificateText = signal('');
  readonly rectorName = signal('');
  readonly rectorRole = signal('');
  readonly advisorName = signal('');
  readonly advisorRole = signal('');

  private readonly snapshot = signal<InstitutionalConfigWrite | null>(null);

  readonly updatedAt = signal<string | null>(null);
  readonly cargando = signal(true);
  readonly guardando = signal(false);
  readonly error = signal('');
  readonly ok = signal('');

  readonly cargado = computed(() => this.snapshot() !== null);

  readonly dirty = computed(() => {
    const snap = this.snapshot();
    if (snap === null) return false;
    const form = this.formValue();
    return (
      form.institutionName !== snap.institutionName ||
      form.certificateText !== snap.certificateText ||
      form.rectorName !== snap.rectorName ||
      form.rectorRole !== snap.rectorRole ||
      form.advisorName !== snap.advisorName ||
      form.advisorRole !== snap.advisorRole
    );
  });

  readonly previewRector = computed(
    () => this.rectorName().trim() || '[Nombre de la autoridad]',
  );
  readonly previewAdvisor = computed(
    () => this.advisorName().trim() || '[Nombre de la autoridad]',
  );

  constructor() {
    void this.cargar();
  }

  private formValue(): InstitutionalConfigWrite {
    return {
      institutionName: this.institutionName(),
      certificateText: this.certificateText(),
      rectorName: this.rectorName(),
      rectorRole: this.rectorRole(),
      advisorName: this.advisorName(),
      advisorRole: this.advisorRole(),
    };
  }

  private applyConfig(config: InstitutionalConfigWrite & { updatedAt: string | null }): void {
    this.institutionName.set(config.institutionName);
    this.certificateText.set(config.certificateText);
    this.rectorName.set(config.rectorName);
    this.rectorRole.set(config.rectorRole);
    this.advisorName.set(config.advisorName);
    this.advisorRole.set(config.advisorRole);
    this.snapshot.set({
      institutionName: config.institutionName,
      certificateText: config.certificateText,
      rectorName: config.rectorName,
      rectorRole: config.rectorRole,
      advisorName: config.advisorName,
      advisorRole: config.advisorRole,
    });
    this.updatedAt.set(config.updatedAt);
  }

  async cargar(): Promise<void> {
    this.cargando.set(true);
    this.error.set('');
    this.ok.set('');
    try {
      const config = await this.source.obtener();
      this.applyConfig(config);
    } catch {
      this.error.set('No se pudo cargar la configuración institucional.');
    } finally {
      this.cargando.set(false);
    }
  }

  onInput(field: keyof InstitutionalConfigWrite, event: Event): void {
    const value = (event.target as HTMLInputElement | HTMLTextAreaElement).value;
    this[field].set(value);
    this.ok.set('');
  }

  descartar(): void {
    const snap = this.snapshot();
    if (snap === null) return;
    this.institutionName.set(snap.institutionName);
    this.certificateText.set(snap.certificateText);
    this.rectorName.set(snap.rectorName);
    this.rectorRole.set(snap.rectorRole);
    this.advisorName.set(snap.advisorName);
    this.advisorRole.set(snap.advisorRole);
    this.error.set('');
    this.ok.set('');
  }

  private validar(): string {
    if (!this.institutionName().trim()) {
      return 'El nombre de la institución es obligatorio.';
    }
    const { name, role, certificateText } = this.limits;
    const checks: readonly [string, number, string][] = [
      [this.institutionName(), name, `El nombre de la institución supera los ${name} caracteres.`],
      [this.rectorName(), name, `El nombre de la autoridad supera los ${name} caracteres.`],
      [this.advisorName(), name, `El nombre de la autoridad supera los ${name} caracteres.`],
      [this.rectorRole(), role, `El cargo supera los ${role} caracteres.`],
      [this.advisorRole(), role, `El cargo supera los ${role} caracteres.`],
      [this.certificateText(), certificateText, `El texto del certificado supera los ${certificateText} caracteres.`],
    ];
    for (const [value, max, message] of checks) {
      if (value.length > max) return message;
    }
    return '';
  }

  async guardar(): Promise<void> {
    this.error.set('');
    this.ok.set('');
    const invalid = this.validar();
    if (invalid) {
      this.error.set(invalid);
      return;
    }
    this.guardando.set(true);
    try {
      const saved = await this.source.guardar(this.formValue());
      this.applyConfig(saved);
      this.ok.set('Configuración guardada correctamente.');
    } catch {
      this.error.set('No se pudo guardar la configuración. Reintentá en unos minutos.');
    } finally {
      this.guardando.set(false);
    }
  }
}
