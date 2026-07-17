import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InstitutionalConfigPage } from './institutional-config-page';
import {
  INSTITUTIONAL_CONFIG_SOURCE,
  InstitutionalConfig,
  InstitutionalConfigService,
  InstitutionalConfigWrite,
} from '../institutional-config.service';

const BASE: InstitutionalConfig = {
  institutionName: 'IFTS N.° 14',
  certificateText: 'Texto base del certificado',
  rectorName: 'Rector Demo',
  rectorRole: 'Rector/a',
  advisorName: 'Asesora Demo',
  advisorRole: 'Asesora pedagógica',
  updatedAt: '2026-01-01T00:00:00Z',
};

class StubInstitutionalConfigService implements InstitutionalConfigService {
  config: InstitutionalConfig = { ...BASE };
  failGet = false;
  failPut = false;
  obtenerCalls = 0;
  guardarCalls = 0;
  lastPayload: InstitutionalConfigWrite | null = null;

  async obtener(): Promise<InstitutionalConfig> {
    this.obtenerCalls++;
    if (this.failGet) throw new Error('No se pudo cargar la configuración.');
    return { ...this.config };
  }

  async guardar(payload: InstitutionalConfigWrite): Promise<InstitutionalConfig> {
    this.guardarCalls++;
    this.lastPayload = payload;
    if (this.failPut) throw new Error('No se pudo guardar la configuración.');
    this.config = { ...payload, updatedAt: '2026-02-02T12:00:00Z' };
    return { ...this.config };
  }
}

describe('InstitutionalConfigPage', () => {
  let stub: StubInstitutionalConfigService;

  async function render(): Promise<ComponentFixture<InstitutionalConfigPage>> {
    stub = new StubInstitutionalConfigService();
    await TestBed.configureTestingModule({
      imports: [InstitutionalConfigPage],
      providers: [{ provide: INSTITUTIONAL_CONFIG_SOURCE, useValue: stub }],
    }).compileComponents();
    const fixture = TestBed.createComponent(InstitutionalConfigPage);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    return fixture;
  }

  function el(f: ComponentFixture<InstitutionalConfigPage>): HTMLElement {
    return f.nativeElement as HTMLElement;
  }

  function input(f: ComponentFixture<InstitutionalConfigPage>, selector: string): HTMLInputElement {
    const found = el(f).querySelector(selector);
    expect(found).withContext(`selector ${selector}`).not.toBeNull();
    return found as HTMLInputElement;
  }

  function setValue(
    f: ComponentFixture<InstitutionalConfigPage>,
    selector: string,
    value: string,
  ): void {
    const control = input(f, selector);
    control.value = value;
    control.dispatchEvent(new Event('input'));
    f.detectChanges();
  }

  async function settle(f: ComponentFixture<InstitutionalConfigPage>): Promise<void> {
    f.detectChanges();
    await f.whenStable();
    f.detectChanges();
  }

  // --- REQ-CFG-001: carga ---

  it('carga exitosa popula el formulario y updatedAt como metadata', async () => {
    const f = await render();
    expect(input(f, '#institution-name').value).toBe('IFTS N.° 14');
    expect(input(f, '#certificate-text').value).toBe('Texto base del certificado');
    expect(input(f, '#rector-name').value).toBe('Rector Demo');
    expect(input(f, '#rector-role').value).toBe('Rector/a');
    expect(input(f, '#advisor-name').value).toBe('Asesora Demo');
    expect(input(f, '#advisor-role').value).toBe('Asesora pedagógica');
    expect(el(f).querySelector('.sticky-meta')?.textContent).toContain('2026');
  });

  it('carga fallida muestra error y botón reintentar que recarga', async () => {
    stub = new StubInstitutionalConfigService();
    stub.failGet = true;
    await TestBed.configureTestingModule({
      imports: [InstitutionalConfigPage],
      providers: [{ provide: INSTITUTIONAL_CONFIG_SOURCE, useValue: stub }],
    }).compileComponents();
    const f = TestBed.createComponent(InstitutionalConfigPage);
    await settle(f);
    expect(el(f).querySelector('[role="alert"]')?.textContent).toContain('No se pudo cargar');
    const retry = el(f).querySelector('button.btn-retry') as HTMLButtonElement;
    expect(retry).not.toBeNull();
    stub.failGet = false;
    retry.click();
    await settle(f);
    expect(stub.obtenerCalls).toBe(2);
    expect(input(f, '#institution-name').value).toBe('IFTS N.° 14');
  });

  // --- REQ-CFGLAY-001/002: chrome + impacto ---

  it('muestra folio institucional y subtítulo de emisión global', async () => {
    const f = await render();
    expect(el(f).querySelector('.kicker')?.textContent).toContain('Folio institucional');
    expect(el(f).querySelector('.lede')?.textContent).toContain('no se editan en la pantalla de emisión');
  });

  it('muestra el banner de impacto con documentos nuevos y regeneración', async () => {
    const f = await render();
    const banner = el(f).querySelector('.impact-banner');
    expect(banner).not.toBeNull();
    expect(banner?.textContent).toContain('nuevos documentos');
    expect(banner?.textContent).toContain('regenere el PDF');
    expect(banner?.textContent).toContain('no se editan');
  });

  // --- REQ-CFGLAY-003: nav sticky ---

  it('incluye nav de secciones con anclas a las cinco secciones', async () => {
    const f = await render();
    const nav = el(f).querySelector('nav[aria-label="Secciones de configuración"]');
    expect(nav).not.toBeNull();
    const hrefs = Array.from(nav!.querySelectorAll('a')).map((a) => a.getAttribute('href'));
    expect(hrefs).toEqual([
      '#identidad',
      '#certificados',
      '#autoridades',
      '#contacto',
      '#validacion',
    ]);
    expect(el(f).querySelector('#identidad')).not.toBeNull();
    expect(el(f).querySelector('#certificados')).not.toBeNull();
    expect(el(f).querySelector('#autoridades')).not.toBeNull();
    expect(el(f).querySelector('#contacto')).not.toBeNull();
    expect(el(f).querySelector('#validacion')).not.toBeNull();
  });

  // --- REQ-CFG / CFGLAY-005: sin fantasmas editables ---

  it('no ofrece upload real: sin input file; botones de logo/firma deshabilitados', async () => {
    const f = await render();
    expect(el(f).querySelector('input[type="file"]')).toBeNull();
    const uploadBtns = Array.from(el(f).querySelectorAll('button')).filter((b) =>
      /subir logo|reemplazar|subir firma/i.test(b.textContent || ''),
    );
    expect(uploadBtns.length).toBeGreaterThan(0);
    for (const b of uploadBtns) {
      expect(b.disabled).toBeTrue();
    }
  });

  it('contacto y validación solo tienen controles presentacionales deshabilitados', async () => {
    const f = await render();
    const contacto = el(f).querySelector('#contacto');
    const validacion = el(f).querySelector('#validacion');
    expect(contacto).not.toBeNull();
    expect(validacion).not.toBeNull();
    for (const section of [contacto!, validacion!]) {
      const controls = Array.from(section.querySelectorAll('input, textarea, select'));
      expect(controls.length).toBeGreaterThan(0);
      for (const c of controls) {
        expect((c as HTMLInputElement).disabled).toBeTrue();
      }
    }
    expect(contacto!.textContent).toContain('SMTP');
    expect(validacion!.textContent).toContain('no se editan');
  });

  it('muestra preview tipográfica de autoridades que se actualiza al editar', async () => {
    const f = await render();
    const preview = el(f).querySelector('.signature-preview');
    expect(preview).not.toBeNull();
    expect(preview?.textContent).toContain('Rector Demo');
    setValue(f, '#rector-name', 'Nueva Rectora');
    expect(el(f).querySelector('.signature-preview')?.textContent).toContain('Nueva Rectora');
  });

  it('identidad sigue el orden v0: nombre, logos, texto institucional', async () => {
    const f = await render();
    const body = el(f).querySelector('#identidad .cfg-section-body');
    expect(body).not.toBeNull();
    const labels = Array.from(body!.querySelectorAll('.cfg-label, .logos-head .cfg-label')).map(
      (n) => n.textContent?.replace(/\s+/g, ' ').trim() ?? '',
    );
    expect(labels[0]).toContain('Nombre visible del instituto');
    expect(labels[1]).toContain('Logos y sellos');
    expect(labels.some((l) => /Texto institucional base/i.test(l))).toBeTrue();
    expect(el(f).querySelector('.logos-grid')?.children.length).toBe(5);
    expect(el(f).querySelector('.logos-badge')?.textContent).toContain('1 sin cargar');
  });

  it('certificados sigue el orden v0: título, texto base, formato, QR, sello', async () => {
    const f = await render();
    const body = el(f).querySelector('#certificados .cfg-section-body');
    expect(body).not.toBeNull();
    const ids = Array.from(body!.querySelectorAll('input, textarea, [role="switch"]')).map(
      (n) => n.id || n.getAttribute('aria-label') || '',
    );
    expect(ids[0]).toBe('titulo-cert');
    expect(ids[1]).toBe('certificate-text');
    expect(ids).toContain('formato-numero');
    expect(ids).toContain('texto-qr');
    const sello = el(f).querySelector('#certificados [role="switch"]') as HTMLButtonElement;
    expect(sello.disabled).toBeTrue();
    expect(input(f, '#certificate-text').disabled).toBeFalse();
    expect(input(f, '#titulo-cert').disabled).toBeTrue();
  });

  it('incluye bloque estático de contacto/validación; presentacionales no entran al PUT', async () => {
    const f = await render();
    const staticBlocks = el(f).querySelectorAll('.static-info');
    expect(staticBlocks.length).toBeGreaterThanOrEqual(1);
    setValue(f, '#institution-name', 'IFTS editado');
    (el(f).querySelector('.sticky-bar button[type="submit"]') as HTMLButtonElement).click();
    await settle(f);
    expect(stub.lastPayload).not.toBeNull();
    expect(Object.keys(stub.lastPayload!)).toEqual(
      jasmine.arrayWithExactContents([
        'institutionName',
        'certificateText',
        'rectorName',
        'rectorRole',
        'advisorName',
        'advisorRole',
      ]),
    );
  });

  // --- REQ-CFG-006 / CFGLAY-006: dirty sticky ---

  it('editar un campo marca dirty y habilita Guardar/Descartar en la barra fija', async () => {
    const f = await render();
    const save = el(f).querySelector('.sticky-bar button[type="submit"]') as HTMLButtonElement;
    const discard = el(f).querySelector('.sticky-bar button.btn-discard') as HTMLButtonElement;
    expect(save.disabled).toBeTrue();
    expect(discard.disabled).toBeTrue();
    setValue(f, '#institution-name', 'IFTS editado');
    expect(save.disabled).toBeFalse();
    expect(discard.disabled).toBeFalse();
    expect(el(f).querySelector('.sticky-bar')?.textContent).toContain('cambios sin guardar');
  });

  it('descartar restaura el snapshot y limpia dirty', async () => {
    const f = await render();
    setValue(f, '#institution-name', 'IFTS editado');
    setValue(f, '#certificate-text', 'otro texto');
    (el(f).querySelector('.sticky-bar button.btn-discard') as HTMLButtonElement).click();
    f.detectChanges();
    expect(input(f, '#institution-name').value).toBe('IFTS N.° 14');
    expect(input(f, '#certificate-text').value).toBe('Texto base del certificado');
    const save = el(f).querySelector('.sticky-bar button[type="submit"]') as HTMLButtonElement;
    expect(save.disabled).toBeTrue();
  });

  // --- REQ-CFG-005/007: guardar y validación ---

  it('guardar envía PUT con el payload del contrato, limpia dirty y actualiza updatedAt', async () => {
    const f = await render();
    setValue(f, '#institution-name', 'IFTS editado');
    (el(f).querySelector('.sticky-bar button[type="submit"]') as HTMLButtonElement).click();
    await settle(f);
    expect(stub.guardarCalls).toBe(1);
    expect(stub.lastPayload?.institutionName).toBe('IFTS editado');
    expect(stub.lastPayload && 'updatedAt' in stub.lastPayload).toBeFalse();
    expect(el(f).querySelector('[role="status"].estado-ok')?.textContent).toContain('guardad');
    expect(el(f).querySelector('.sticky-meta')?.textContent).toContain('2026-02-02');
    const save = el(f).querySelector('.sticky-bar button[type="submit"]') as HTMLButtonElement;
    expect(save.disabled).toBeTrue();
  });

  it('error al guardar muestra mensaje y conserva las ediciones locales', async () => {
    const f = await render();
    stub.failPut = true;
    setValue(f, '#institution-name', 'IFTS editado');
    (el(f).querySelector('.sticky-bar button[type="submit"]') as HTMLButtonElement).click();
    await settle(f);
    expect(el(f).querySelector('[role="alert"]')?.textContent).toContain('No se pudo guardar');
    expect(input(f, '#institution-name').value).toBe('IFTS editado');
    const save = el(f).querySelector('.sticky-bar button[type="submit"]') as HTMLButtonElement;
    expect(save.disabled).toBeFalse();
  });

  it('nombre vacío bloquea el PUT y muestra validación', async () => {
    const f = await render();
    setValue(f, '#institution-name', '   ');
    (el(f).querySelector('.sticky-bar button[type="submit"]') as HTMLButtonElement).click();
    await settle(f);
    expect(stub.guardarCalls).toBe(0);
    expect(el(f).querySelector('[role="alert"]')?.textContent).toContain('obligatorio');
  });

  it('longitud excedida bloquea el PUT (160/80/255)', async () => {
    const f = await render();
    setValue(f, '#institution-name', 'x'.repeat(161));
    (el(f).querySelector('.sticky-bar button[type="submit"]') as HTMLButtonElement).click();
    await settle(f);
    expect(stub.guardarCalls).toBe(0);
    expect(el(f).querySelector('[role="alert"]')?.textContent).toContain('160');

    setValue(f, '#institution-name', 'IFTS');
    setValue(f, '#rector-role', 'y'.repeat(81));
    (el(f).querySelector('.sticky-bar button[type="submit"]') as HTMLButtonElement).click();
    await settle(f);
    expect(stub.guardarCalls).toBe(0);
    expect(el(f).querySelector('[role="alert"]')?.textContent).toContain('80');

    setValue(f, '#rector-role', 'Rector/a');
    setValue(f, '#certificate-text', 'z'.repeat(256));
    (el(f).querySelector('.sticky-bar button[type="submit"]') as HTMLButtonElement).click();
    await settle(f);
    expect(stub.guardarCalls).toBe(0);
    expect(el(f).querySelector('[role="alert"]')?.textContent).toContain('255');
  });
});
