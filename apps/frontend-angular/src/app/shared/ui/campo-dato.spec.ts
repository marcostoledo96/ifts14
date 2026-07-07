import { Component, input } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { CampoDato } from './campo-dato';

@Component({
  selector: 'app-test-campo-dt',
  template: `<dt appCampoDato [variant]="variant()">Curso</dt>`,
  imports: [CampoDato],
})
class CampoDatoDtHost {
  readonly variant = input<'default' | 'mono' | 'highlight'>('default');
}

@Component({
  selector: 'app-test-campo-dd',
  template: `<dd appCampoDato [variant]="variant()">Valor</dd>`,
  imports: [CampoDato],
})
class CampoDatoDdHost {
  readonly variant = input<'default' | 'mono' | 'highlight'>('default');
}

@Component({
  selector: 'app-test-dl-host',
  template: `
    <dl>
      <dt appCampoDato>Curso</dt>
      <dd appCampoDato>Valor</dd>
      <dt appCampoDato>Estudiante</dt>
      <dd appCampoDato variant="highlight">Nombre</dd>
    </dl>
  `,
  imports: [CampoDato],
})
class CampoDatoDlHost {}

describe('CampoDato (directiva sobre dt/dd nativos)', () => {
  it('no genera wrapper custom: dl contiene solo dt/dd nativos (W2)', async () => {
    await TestBed.configureTestingModule({ imports: [CampoDatoDlHost] }).compileComponents();
    const fixture = TestBed.createComponent(CampoDatoDlHost);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const dl = el.querySelector('dl');
    expect(dl).not.toBeNull();
    expect(dl?.querySelector(':not(dt):not(dd)')).toBeNull();
    expect(dl?.querySelectorAll('dt').length).toBe(2);
    expect(dl?.querySelectorAll('dd').length).toBe(2);
  });

  it('aplica .campo-label a dt', async () => {
    await TestBed.configureTestingModule({ imports: [CampoDatoDtHost] }).compileComponents();
    const fixture = TestBed.createComponent(CampoDatoDtHost);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('dt')?.classList.contains('campo-label')).toBe(true);
  });

  it('aplica .campo-value a dd', async () => {
    await TestBed.configureTestingModule({ imports: [CampoDatoDdHost] }).compileComponents();
    const fixture = TestBed.createComponent(CampoDatoDdHost);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('dd')?.classList.contains('campo-value')).toBe(true);
  });

  it('aplica variante mono en dd', async () => {
    await TestBed.configureTestingModule({ imports: [CampoDatoDdHost] }).compileComponents();
    const fixture = TestBed.createComponent(CampoDatoDdHost);
    fixture.componentRef.setInput('variant', 'mono');
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('dd')?.classList.contains('campo-mono')).toBe(true);
  });

  it('aplica variante highlight en dd', async () => {
    await TestBed.configureTestingModule({ imports: [CampoDatoDdHost] }).compileComponents();
    const fixture = TestBed.createComponent(CampoDatoDdHost);
    fixture.componentRef.setInput('variant', 'highlight');
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('dd')?.classList.contains('campo-highlight')).toBe(true);
  });

  it('default sin clases de variantes', async () => {
    await TestBed.configureTestingModule({ imports: [CampoDatoDdHost] }).compileComponents();
    const fixture = TestBed.createComponent(CampoDatoDdHost);
    fixture.detectChanges();
    const dd = (fixture.nativeElement as HTMLElement).querySelector('dd');
    expect(dd?.classList.contains('campo-mono')).toBe(false);
    expect(dd?.classList.contains('campo-highlight')).toBe(false);
  });
});