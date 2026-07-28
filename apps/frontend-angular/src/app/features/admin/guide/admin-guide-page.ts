import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UiBackLink } from '../../../shared/ui/ui-back-link';
import { DASHBOARD_FLUJO_PASOS, FlujoPaso } from '../admin-dashboard-page';

interface GuiaSeccion extends FlujoPaso {
  readonly cuerpo: readonly string[];
  readonly ctaLabel: string;
}

const SECCIONES: readonly GuiaSeccion[] = DASHBOARD_FLUJO_PASOS.map((paso) => {
  switch (paso.id) {
    case 'cursos':
      return {
        ...paso,
        ctaLabel: 'Ir a Cursos',
        cuerpo: [
          'Creá o editá la comisión desde Cursos: código, nombre y estado (borrador, activo, cerrado o archivado).',
          'En el detalle del curso agregá las fechas de cursada, ordenalas y ajustá su estado (programada, realizada o cancelada).',
          'Sin fechas no se puede marcar asistencia ni emitir certificados del curso.',
        ],
      };
    case 'alumnos':
      return {
        ...paso,
        ctaLabel: 'Ir a Alumnos',
        cuerpo: [
          'Registrá alumnos nuevos o actualizá fichas existentes (apellido, nombre, documento).',
          'En la UI administrativa el documento se muestra completo; el email es opcional y sirve para la entrega manual cuando esté disponible.',
          'Mantené las fichas al día antes de cargar asistencias para evitar certificados con datos desactualizados.',
        ],
      };
    case 'asistencias':
      return {
        ...paso,
        ctaLabel: 'Ir a Asistencias',
        cuerpo: [
          'Desde Asistencias (o desde el detalle del curso) elegí el curso y la fecha de la clase.',
          'Marcá quiénes estuvieron presentes y usá «Guardar y generar certificados»: es el camino principal de emisión.',
          'Después podés abrir «Ver certificados del curso» para revisar lo emitido en esa fecha.',
        ],
      };
    case 'certificaciones':
      return {
        ...paso,
        ctaLabel: 'Ir a Certificaciones',
        cuerpo: [
          'El listado muestra cada certificado como Válida o Revocado (no hay estado «vencido» en el panel).',
          'En el expediente podés revisar datos, descargar PDF, copiar el link público y el QR. El token/QR es permanente: regenerar PDF o reenviar no lo rota.',
          'La entrega es manual (copiar link / PDF).',
          'La emisión directa («Nueva certificación») es una alternativa; el flujo habitual sale de Asistencias.',
          'La revocación deja el certificado inválido en la validación pública.',
        ],
      };
    case 'configuracion':
      return {
        ...paso,
        ctaLabel: 'Ir a Configuración',
        cuerpo: [
          'Configurá una sola vez los datos institucionales del folio: autoridades, textos, identidad y firmas.',
          'Los cambios aplican a los certificados nuevos generados después de guardar; los ya compartidos no cambian hasta regenerar el PDF.',
          'Estos datos no se editan en la emisión individual.',
        ],
      };
    default:
      return {
        ...paso,
        ctaLabel: 'Abrir sección',
        cuerpo: [paso.resumen],
      };
  }
});

/** Guía operativa Bedelía: detalle del flujo del dashboard. Sin API. */
@Component({
  selector: 'app-admin-guide-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, UiBackLink],
  templateUrl: './admin-guide-page.html',
  styleUrl: './admin-guide-page.css',
})
export class AdminGuidePage {
  readonly secciones = SECCIONES;
}
