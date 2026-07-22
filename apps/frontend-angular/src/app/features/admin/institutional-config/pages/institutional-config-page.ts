import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
  WritableSignal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  flattenParameterValues,
  INSTITUTIONAL_CONFIG_LIMITS,
  INSTITUTIONAL_CONFIG_SOURCE,
  InstitutionalConfig,
  InstitutionalConfigWrite,
  SYSTEM_PARAMETER_DEFAULTS,
  SYSTEM_PARAMETER_KEYS,
  SystemParameterKey,
} from '../institutional-config.service';
import { UiSpinner } from '../../../../shared/ui/ui-spinner';
import { INSTITUTIONAL_LOGOS } from '../../../../shared/brand/institutional-brand';

// Página de configuración institucional: layout calca v0 (nav sticky +
// secciones). Persistidos: 6 campos institucionales + 9 parámetros tipados.
// Logos fijos; firmas digitales fuera de este ciclo.
@Component({
  selector: 'app-institutional-config-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, UiSpinner],
  templateUrl: './institutional-config-page.html',
  styleUrl: './institutional-config-page.css',
})
export class InstitutionalConfigPage {
  private readonly source = inject(INSTITUTIONAL_CONFIG_SOURCE);

  readonly limits = INSTITUTIONAL_CONFIG_LIMITS;
  readonly logos = INSTITUTIONAL_LOGOS;
  readonly parameterKeys = SYSTEM_PARAMETER_KEYS;

  readonly institutionName = signal('');
  readonly certificateText = signal('');
  readonly rectorName = signal('');
  readonly rectorRole = signal('');
  readonly advisorName = signal('');
  readonly advisorRole = signal('');

  readonly textoInstitucional = signal(SYSTEM_PARAMETER_DEFAULTS.texto_institucional.value);
  readonly tituloCertificado = signal(SYSTEM_PARAMETER_DEFAULTS.titulo_certificado.value);
  readonly textoQr = signal(SYSTEM_PARAMETER_DEFAULTS.texto_qr.value);
  readonly emailContacto = signal(SYSTEM_PARAMETER_DEFAULTS.email_contacto.value);
  readonly textoValidacion = signal(SYSTEM_PARAMETER_DEFAULTS.texto_validacion.value);
  readonly sitioInstituto = signal(SYSTEM_PARAMETER_DEFAULTS.sitio_instituto.value);
  readonly msgValido = signal(SYSTEM_PARAMETER_DEFAULTS.msg_valido.value);
  readonly msgRevocado = signal(SYSTEM_PARAMETER_DEFAULTS.msg_revocado.value);
  readonly msgNoEncontrado = signal(SYSTEM_PARAMETER_DEFAULTS.msg_no_encontrado.value);

  private readonly paramSignalByKey: Record<SystemParameterKey, WritableSignal<string>> = {
    texto_institucional: this.textoInstitucional,
    titulo_certificado: this.tituloCertificado,
    texto_qr: this.textoQr,
    email_contacto: this.emailContacto,
    texto_validacion: this.textoValidacion,
    sitio_instituto: this.sitioInstituto,
    msg_valido: this.msgValido,
    msg_revocado: this.msgRevocado,
    msg_no_encontrado: this.msgNoEncontrado,
  };

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
    if (
      form.institutionName !== snap.institutionName ||
      form.certificateText !== snap.certificateText ||
      form.rectorName !== snap.rectorName ||
      form.rectorRole !== snap.rectorRole ||
      form.advisorName !== snap.advisorName ||
      form.advisorRole !== snap.advisorRole
    ) {
      return true;
    }
    for (const key of SYSTEM_PARAMETER_KEYS) {
      if ((form.parameters[key] ?? '') !== (snap.parameters[key] ?? '')) return true;
    }
    return false;
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
    const parameters = {} as Record<SystemParameterKey, string>;
    for (const key of SYSTEM_PARAMETER_KEYS) {
      parameters[key] = this.paramSignalByKey[key]();
    }
    return {
      institutionName: this.institutionName(),
      certificateText: this.certificateText(),
      rectorName: this.rectorName(),
      rectorRole: this.rectorRole(),
      advisorName: this.advisorName(),
      advisorRole: this.advisorRole(),
      parameters,
    };
  }

  private applyConfig(config: InstitutionalConfig): void {
    this.institutionName.set(config.institutionName);
    this.certificateText.set(config.certificateText);
    this.rectorName.set(config.rectorName);
    this.rectorRole.set(config.rectorRole);
    this.advisorName.set(config.advisorName);
    this.advisorRole.set(config.advisorRole);
    for (const key of SYSTEM_PARAMETER_KEYS) {
      this.paramSignalByKey[key].set(config.parameters[key]?.value ?? '');
    }
    this.snapshot.set({
      institutionName: config.institutionName,
      certificateText: config.certificateText,
      rectorName: config.rectorName,
      rectorRole: config.rectorRole,
      advisorName: config.advisorName,
      advisorRole: config.advisorRole,
      parameters: flattenParameterValues(config.parameters),
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

  onInput(
    field: Exclude<keyof InstitutionalConfigWrite, 'parameters'>,
    event: Event,
  ): void {
    const value = (event.target as HTMLInputElement | HTMLTextAreaElement).value;
    this[field].set(value);
    this.ok.set('');
  }

  onParameterInput(key: SystemParameterKey, event: Event): void {
    const value = (event.target as HTMLInputElement | HTMLTextAreaElement).value;
    this.paramSignalByKey[key].set(value);
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
    for (const key of SYSTEM_PARAMETER_KEYS) {
      this.paramSignalByKey[key].set(snap.parameters[key] ?? '');
    }
    this.error.set('');
    this.ok.set('');
  }

  private validar(): string {
    if (!this.institutionName().trim()) {
      return 'El nombre de la institución es obligatorio.';
    }
    const { name, role, certificateText, parameterText, parameterTextarea } = this.limits;
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
    for (const key of SYSTEM_PARAMETER_KEYS) {
      const meta = SYSTEM_PARAMETER_DEFAULTS[key];
      const value = this.paramSignalByKey[key]();
      const max = meta.type === 'textarea' ? parameterTextarea : parameterText;
      if (value.length > max) {
        return `${meta.label} supera los ${max} caracteres.`;
      }
      if (meta.type === 'email' && value.trim() !== '') {
        const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
        if (!ok) return 'El email de contacto institucional no es válido.';
      }
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

  /**
   * Anclas internas: con `<base href="/certificados/">` el navegador resuelve
   * `#id` contra la base y navega a `/certificados/#id` → redirect a login.
   * preventDefault + scroll mantiene la sesión y el layout SPA.
   */
  irASeccion(event: Event, sectionId: string): void {
    event.preventDefault();
    const target = document.getElementById(sectionId);
    if (!target) return;
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    target.focus({ preventScroll: true });
  }
}
