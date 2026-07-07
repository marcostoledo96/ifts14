import { Directive, ElementRef, inject, input } from '@angular/core';

export type VarianteCampo = 'default' | 'mono' | 'highlight';

// ponytail: directiva sobre dt/dd nativos para mantener dl/dt/dd válidos (W2).
// Estilos compartidos viven en styles.css global (.campo-*).
@Directive({
  selector: '[appCampoDato]',
  standalone: true,
  host: {
    '[class.campo-label]': 'isDt',
    '[class.campo-value]': 'isDd',
    '[class.campo-mono]': "variant() === 'mono'",
    '[class.campo-highlight]': "variant() === 'highlight'",
  },
})
export class CampoDato {
  readonly variant = input<VarianteCampo>('default');
  private readonly el = inject(ElementRef<HTMLElement>);
  get isDt(): boolean {
    return this.el.nativeElement.tagName === 'DT';
  }
  get isDd(): boolean {
    return this.el.nativeElement.tagName === 'DD';
  }
}