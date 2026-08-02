import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { App } from './app';
import { routes } from './app.routes';
import { ADMIN_AUTH, FakeAdminAuthService } from './features/admin/admin-auth.service';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter(routes),
        provideHttpClient(),
        { provide: ADMIN_AUTH, useClass: FakeAdminAuthService },
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('en ruta pública renderiza shell semántico con header, main#contenido y footer', async () => {
    const router = TestBed.inject(Router);
    await router.navigateByUrl('/ruta-publica-inexistente');
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('header[role="banner"]')).not.toBeNull();
    expect(compiled.querySelector('main#contenido[role="main"]')).not.toBeNull();
    expect(compiled.querySelector('footer[role="contentinfo"]')).not.toBeNull();
  });

  it('en ruta pública el footer muestra logos institucionales asociados', async () => {
    const router = TestBed.inject(Router);
    await router.navigateByUrl('/ruta-publica-inexistente');
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const partners = compiled.querySelectorAll('.site-footer-partners img');
    expect(partners.length).toBe(3);
    const srcs = Array.from(partners).map((img) => img.getAttribute('src') ?? '');
    expect(srcs.some((s) => s.includes('buenos-aires-aprende'))).toBeTrue();
    expect(srcs.some((s) => s.includes('buenos-aires-ciudad'))).toBeTrue();
    expect(srcs.some((s) => s.includes('escudo-caba'))).toBeTrue();
  });

  it('en ruta pública el footer acredita a los autores del proyecto', async () => {
    const router = TestBed.inject(Router);
    await router.navigateByUrl('/ruta-publica-inexistente');
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const credits = compiled.querySelector('.site-footer-credits');
    expect(credits?.textContent).toContain('Marcos Ezequiel Toledo');
    expect(credits?.textContent).toContain('Matías Ríos');
  });

  it('en ruta pública incluye skip link hacia #contenido', async () => {
    const router = TestBed.inject(Router);
    await router.navigateByUrl('/ruta-publica-inexistente');
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const skip = compiled.querySelector('a.skip-link');
    expect(skip?.getAttribute('href')).toBe('#contenido');
  });

  it('en /admin/* NO renderiza header institucional ni footer del root', async () => {
    const router = TestBed.inject(Router);
    // /admin sin sesión redirige a /admin/login, que igual es /admin/*
    await router.navigateByUrl('/admin/login');
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('app-header-institucional')).toBeNull();
    expect(compiled.querySelector('footer[role="contentinfo"]')).toBeNull();
  });
});