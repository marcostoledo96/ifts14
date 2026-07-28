import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InstitutionalConfigPage } from './institutional-config-page';
import {
  emptyParameters,
  flattenParameterValues,
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
  rectorSignaturePresent: false,
  advisorSignaturePresent: false,
  parameters: emptyParameters(),
  updatedAt: '2026-01-01T00:00:00Z',
};

class StubInstitutionalConfigService implements InstitutionalConfigService {
  config: InstitutionalConfig = {
    ...BASE,
    parameters: emptyParameters(),
  };
  failGet = false;
  failPut = false;
  obtenerCalls = 0;
  guardarCalls = 0;
  subirFirmaCalls = 0;
  quitarFirmaCalls = 0;
  previewFirmaCalls = 0;
  failPreview = false;
  lastPayload: InstitutionalConfigWrite | null = null;
  lastUpload: { role: string; fileName: string } | null = null;
  lastPreviewRole: string | null = null;

  async obtener(): Promise<InstitutionalConfig> {
    this.obtenerCalls++;
    if (this.failGet) throw new Error('No se pudo cargar la configuración.');
    return {
      ...this.config,
      parameters: { ...this.config.parameters },
    };
  }

  async guardar(payload: InstitutionalConfigWrite): Promise<InstitutionalConfig> {
    this.guardarCalls++;
    this.lastPayload = payload;
    if (this.failPut) throw new Error('No se pudo guardar la configuración.');
    const parameters = emptyParameters();
    const current = flattenParameterValues(this.config.parameters);
    for (const key of Object.keys(parameters) as (keyof typeof parameters)[]) {
      const incoming = payload.parameters[key];
      parameters[key] = {
        ...parameters[key],
        value: typeof incoming === 'string' ? incoming : current[key],
      };
    }
    this.config = {
      ...this.config,
      institutionName: payload.institutionName,
      certificateText: payload.certificateText,
      rectorName: payload.rectorName,
      rectorRole: payload.rectorRole,
      advisorName: payload.advisorName,
      advisorRole: payload.advisorRole,
      parameters,
      updatedAt: '2026-02-02T12:00:00Z',
    };
    return { ...this.config, parameters: { ...parameters } };
  }

  async subirFirma(role: 'rector' | 'asesor', file: File): Promise<InstitutionalConfig> {
    this.subirFirmaCalls++;
    this.lastUpload = { role, fileName: file.name };
    this.config = {
      ...this.config,
      rectorSignaturePresent: role === 'rector' ? true : this.config.rectorSignaturePresent,
      advisorSignaturePresent: role === 'asesor' ? true : this.config.advisorSignaturePresent,
      updatedAt: '2026-03-03T12:00:00Z',
    };
    return { ...this.config, parameters: { ...this.config.parameters } };
  }

  async quitarFirma(role: 'rector' | 'asesor'): Promise<InstitutionalConfig> {
    this.quitarFirmaCalls++;
    this.config = {
      ...this.config,
      rectorSignaturePresent: role === 'rector' ? false : this.config.rectorSignaturePresent,
      advisorSignaturePresent: role === 'asesor' ? false : this.config.advisorSignaturePresent,
      updatedAt: '2026-03-04T12:00:00Z',
    };
    return { ...this.config, parameters: { ...this.config.parameters } };
  }

  async previewFirma(role: 'rector' | 'asesor'): Promise<Blob> {
    this.previewFirmaCalls++;
    this.lastPreviewRole = role;
    if (this.failPreview) throw new Error('preview falló');
    return new Blob([new Uint8Array([1, 2, 3])], { type: 'image/png' });
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
    expect(el(f).querySelector('.sticky-meta')?.textContent).toMatch(/\d{2}\/\d{2}\/\d{4}/);
    expect(f.componentInstance.updatedAt()).toBe('2026-01-01T00:00:00Z');
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

  it('irASeccion evita la navegación del ancla (base href no debe mandar al login)', async () => {
    const f = await render();
    const page = f.componentInstance;
    const event = new MouseEvent('click', { bubbles: true, cancelable: true });
    const prevented = spyOn(event, 'preventDefault').and.callThrough();
    const scroll = spyOn(HTMLElement.prototype, 'scrollIntoView');
    page.irASeccion(event, 'identidad');
    expect(prevented).toHaveBeenCalled();
    expect(scroll).toHaveBeenCalled();
  });

  // --- Firmas Opción A: input file real; POST al elegir; sin dirty ---

  it('ofrece input file real para firmas (rector y asesor)', async () => {
    const f = await render();
    expect(el(f).querySelector('#firma-rector')).not.toBeNull();
    expect(el(f).querySelector('#firma-asesor')).not.toBeNull();
    expect(el(f).querySelectorAll('input[type="file"]').length).toBe(2);
  });

  it('al elegir archivo dispara subirFirma sin marcar dirty del formulario', async () => {
    const f = await render();
    const page = f.componentInstance;
    expect(page.dirty()).toBeFalse();
    const canvas = document.createElement('canvas');
    canvas.width = 60;
    canvas.height = 20;
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('blob'))), 'image/png');
    });
    const file = new File([blob], 'rector.png', { type: 'image/png' });
    const inputEl = el(f).querySelector('#firma-rector') as HTMLInputElement;
    Object.defineProperty(inputEl, 'files', { configurable: true, value: [file] });
    await page.onFirmaSeleccionada('rector', { target: inputEl } as unknown as Event);
    f.detectChanges();
    expect(stub.subirFirmaCalls).toBe(1);
    expect(stub.lastUpload?.role).toBe('rector');
    expect(stub.lastUpload?.fileName).toMatch(/\.jpe?g$/i);
    expect(stub.guardarCalls).toBe(0);
    expect(page.dirty()).toBeFalse();
    expect(page.rectorSignaturePresent()).toBeTrue();
    expect(stub.previewFirmaCalls).toBeGreaterThan(0);
    expect(el(f).querySelector('img.firma-img[alt="Firma del rector/a"]')).not.toBeNull();
    expect(page.rectorFirmaUrl()?.startsWith('blob:')).toBeTrue();
  });

  it('quitar firma dispara DELETE y no marca dirty', async () => {
    const f = await render();
    stub.config = { ...stub.config, rectorSignaturePresent: true };
    await f.componentInstance.cargar();
    f.detectChanges();
    await f.whenStable();
    f.detectChanges();
    expect(el(f).querySelector('img.firma-img[alt="Firma del rector/a"]')).not.toBeNull();
    const confirmSpy = spyOn(globalThis, 'confirm').and.returnValue(true);
    const quitar = Array.from(el(f).querySelectorAll('button')).find((b) =>
      /quitar/i.test(b.textContent || ''),
    );
    expect(quitar).toBeTruthy();
    quitar!.dispatchEvent(new Event('click'));
    await f.whenStable();
    f.detectChanges();
    expect(confirmSpy).toHaveBeenCalled();
    expect(stub.quitarFirmaCalls).toBe(1);
    expect(f.componentInstance.dirty()).toBeFalse();
    expect(f.componentInstance.rectorSignaturePresent()).toBeFalse();
    expect(f.componentInstance.rectorFirmaUrl()).toBeNull();
    expect(el(f).querySelector('img.firma-img[alt="Firma del rector/a"]')).toBeNull();
  });

  it('cancelar confirmación de quitar no llama al servicio', async () => {
    const f = await render();
    stub.config = { ...stub.config, rectorSignaturePresent: true };
    await f.componentInstance.cargar();
    f.detectChanges();
    await f.whenStable();
    f.detectChanges();
    spyOn(globalThis, 'confirm').and.returnValue(false);
    const quitar = Array.from(el(f).querySelectorAll('button')).find((b) =>
      /quitar/i.test(b.textContent || ''),
    );
    quitar!.dispatchEvent(new Event('click'));
    await f.whenStable();
    expect(stub.quitarFirmaCalls).toBe(0);
    expect(f.componentInstance.rectorSignaturePresent()).toBeTrue();
  });

  it('error HTTP de firma sin body no expone la URL del endpoint', async () => {
    const { HttpErrorResponse } = await import('@angular/common/http');
    const f = await render();
    const page = f.componentInstance;
    const bare = page['mensajeErrorFirma'](
      new HttpErrorResponse({
        status: 500,
        statusText: 'Server Error',
        url: 'https://certificados-qa.example/api/admin/configuracion-institucional/firmas/rector',
      }),
    );
    expect(bare.toLowerCase()).not.toContain('http');
    expect(bare).not.toContain('firmas/rector');
    expect(bare).toContain('PNG o JPEG');

    const withBody = page['mensajeErrorFirma'](
      new HttpErrorResponse({
        status: 400,
        error: { error: { message: 'La firma debe ser PNG o JPEG.' } },
        url: 'https://example/firmas/rector',
      }),
    );
    expect(withBody).toBe('La firma debe ser PNG o JPEG.');
    expect(withBody).not.toContain('http');
  });

  it('muestra Imagen de la firma (no Firma digital) y formatea updatedAt', async () => {
    const f = await render();
    const text = el(f).textContent ?? '';
    expect(text).toContain('Imagen de la firma');
    expect(text).not.toContain('Firma digital');
    expect(el(f).querySelector('.sticky-meta')?.textContent).toMatch(/\d{2}\/\d{2}\/\d{4}/);
  });

  it('preview fallido no rompe la página: firma presente sin img', async () => {
    stub = new StubInstitutionalConfigService();
    stub.config = { ...stub.config, rectorSignaturePresent: true };
    stub.failPreview = true;
    await TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [InstitutionalConfigPage],
      providers: [{ provide: INSTITUTIONAL_CONFIG_SOURCE, useValue: stub }],
    }).compileComponents();
    const f = TestBed.createComponent(InstitutionalConfigPage);
    f.detectChanges();
    await f.whenStable();
    f.detectChanges();
    expect(f.componentInstance.rectorSignaturePresent()).toBeTrue();
    expect(f.componentInstance.rectorFirmaUrl()).toBeNull();
    expect(el(f).textContent).toContain('Firma cargada');
    expect(el(f).textContent).toContain('Vista previa no disponible');
    expect(el(f).querySelector('img.firma-img[alt="Firma del rector/a"]')).toBeNull();
  });

  it('Guardar envía solo textos JSON (sin multipart de firmas)', async () => {
    const f = await render();
    setValue(f, '#rector-name', 'Rector Editado');
    (el(f).querySelector('.sticky-bar button[type="submit"]') as HTMLButtonElement).click();
    await settle(f);
    expect(stub.guardarCalls).toBe(1);
    expect(stub.lastPayload?.rectorName).toBe('Rector Editado');
    expect(stub.subirFirmaCalls).toBe(0);
  });

  it('logos siguen sin upload; botones de logo ausentes', async () => {
    const f = await render();
    const logoUpload = Array.from(el(f).querySelectorAll('button')).filter((b) =>
      /subir logo|reemplazar logo/i.test(b.textContent || ''),
    );
    expect(logoUpload.length).toBe(0);
    expect(el(f).querySelector('.logos-grid button')).toBeNull();
  });

  it('contacto y validación tienen campos de parámetros editables', async () => {
    const f = await render();
    expect(input(f, '#email-contacto').disabled).toBeFalse();
    expect(input(f, '#texto-validacion').disabled).toBeFalse();
    expect(input(f, '#sitio-instituto').disabled).toBeFalse();
    expect(input(f, '#msg-valido').disabled).toBeFalse();
    expect(el(f).querySelector('#contacto')!.textContent).toContain('no envía correos');
    expect(el(f).querySelector('#contacto')!.textContent).not.toContain('SMTP');
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
    expect(labels[1]).toContain('Logos institucionales');
    expect(labels.some((l) => /Texto institucional base/i.test(l))).toBeTrue();
    expect(el(f).querySelector('.logos-grid')?.children.length).toBe(4);
    expect(el(f).querySelector('.logos-badge')?.textContent).toContain('Fijos del sistema');
    expect(el(f).querySelectorAll('.logos-grid img').length).toBe(4);
    expect(el(f).querySelector('.logos-grid button')).toBeNull();
  });

  it('certificados sigue el orden: título, texto base, QR (sin sello)', async () => {
    const f = await render();
    const body = el(f).querySelector('#certificados .cfg-section-body');
    expect(body).not.toBeNull();
    const ids = Array.from(body!.querySelectorAll('input, textarea, [role="switch"]')).map(
      (n) => n.id || n.getAttribute('aria-label') || '',
    );
    expect(ids[0]).toBe('titulo-cert');
    expect(ids[1]).toBe('certificate-text');
    expect(ids).toContain('texto-qr');
    expect(ids).not.toContain('formato-numero');
    expect(ids).not.toContain('link-validacion');
    expect(el(f).querySelector('#certificados [role="switch"]')).toBeNull();
    expect(el(f).querySelector('.sello-row')).toBeNull();
    expect(input(f, '#certificate-text').disabled).toBeFalse();
    expect(input(f, '#titulo-cert').disabled).toBeFalse();
  });

  it('incluye bloque estático de contacto; parámetros tipados entran al PUT', async () => {
    const f = await render();
    const staticBlocks = el(f).querySelectorAll('.static-info');
    expect(staticBlocks.length).toBeGreaterThanOrEqual(1);
    setValue(f, '#institution-name', 'IFTS editado');
    setValue(f, '#titulo-cert', 'Título persistido');
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
        'parameters',
      ]),
    );
    expect(stub.lastPayload!.parameters['titulo_certificado']).toBe('Título persistido');
  });

  it('editar un parámetro marca dirty', async () => {
    const f = await render();
    const save = el(f).querySelector('.sticky-bar button[type="submit"]') as HTMLButtonElement;
    expect(save.disabled).toBeTrue();
    setValue(f, '#email-contacto', 'nuevo@ifts14.example');
    expect(save.disabled).toBeFalse();
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
    expect(el(f).querySelector('.sticky-meta')?.textContent).toMatch(/\d{2}\/\d{2}\/\d{4}/);
    expect(f.componentInstance.updatedAt()).toBe('2026-02-02T12:00:00Z');
    const save = el(f).querySelector('.sticky-bar button[type="submit"]') as HTMLButtonElement;
    expect(save.disabled).toBeTrue();
  });

  it('error al guardar muestra mensaje y conserva las ediciones locales', async () => {
    const f = await render();
    stub.failPut = true;
    setValue(f, '#institution-name', 'IFTS editado');
    (el(f).querySelector('.sticky-bar button[type="submit"]') as HTMLButtonElement).click();
    await settle(f);
    expect(el(f).querySelector('[role="alert"].estado-error')?.textContent).toContain(
      'No se pudo guardar',
    );
    expect(el(f).querySelector('.sticky-error')?.textContent).toContain('No se pudo guardar');
    expect(el(f).querySelectorAll('[role="alert"].estado-error').length).toBe(1);
    expect(input(f, '#institution-name').value).toBe('IFTS editado');
    setValue(f, '#institution-name', 'IFTS recuperado');
    expect(el(f).querySelector('.sticky-error')).toBeNull();
    expect(el(f).querySelector('.sticky-dirty')?.textContent).toContain('sin guardar');
    const save = el(f).querySelector('.sticky-bar button[type="submit"]') as HTMLButtonElement;
    expect(save.disabled).toBeFalse();
  });

  it('nombre vacío bloquea el PUT y muestra validación', async () => {
    const f = await render();
    setValue(f, '#institution-name', '   ');
    (el(f).querySelector('.sticky-bar button[type="submit"]') as HTMLButtonElement).click();
    await settle(f);
    expect(stub.guardarCalls).toBe(0);
    expect(el(f).querySelector('[role="alert"].estado-error')?.textContent).toContain('obligatorio');
    expect(el(f).querySelector('.sticky-error')?.textContent).toContain('obligatorio');
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
