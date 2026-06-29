import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('debe renderizar el shell semántico con header, main#contenido y footer', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('header[role="banner"]')).not.toBeNull();
    expect(compiled.querySelector('main#contenido[role="main"]')).not.toBeNull();
    expect(compiled.querySelector('footer[role="contentinfo"]')).not.toBeNull();
  });

  it('debe incluir un skip link hacia #contenido', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const skip = compiled.querySelector('a.skip-link');
    expect(skip?.getAttribute('href')).toBe('#contenido');
  });
});