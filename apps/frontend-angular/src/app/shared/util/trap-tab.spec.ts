import { FOCUSABLE_SEL, listFocusables, trapTabKey } from './trap-tab';

describe('trapTabKey', () => {
  let root: HTMLDivElement;
  let first: HTMLButtonElement;
  let last: HTMLButtonElement;

  beforeEach(() => {
    root = document.createElement('div');
    first = document.createElement('button');
    first.type = 'button';
    first.textContent = 'First';
    last = document.createElement('button');
    last.type = 'button';
    last.textContent = 'Last';
    root.append(first, last);
    document.body.appendChild(root);
  });

  afterEach(() => {
    root.remove();
  });

  it('exporta FOCUSABLE_SEL canónico', () => {
    expect(FOCUSABLE_SEL).toContain('button:not(:disabled)');
    expect(FOCUSABLE_SEL).toContain('[tabindex]:not([tabindex="-1"])');
  });

  it('listFocusables respeta orden de documento', () => {
    expect(listFocusables(root)).toEqual([first, last]);
  });

  it('Tab en el último envuelve al primero', () => {
    last.focus();
    const e = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true });
    Object.defineProperty(e, 'shiftKey', { value: false });
    spyOn(e, 'preventDefault').and.callThrough();
    trapTabKey(e, root);
    expect(e.preventDefault).toHaveBeenCalled();
    expect(document.activeElement).toBe(first);
  });

  it('Shift+Tab en el primero envuelve al último', () => {
    first.focus();
    const e = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true, shiftKey: true });
    spyOn(e, 'preventDefault').and.callThrough();
    trapTabKey(e, root);
    expect(e.preventDefault).toHaveBeenCalled();
    expect(document.activeElement).toBe(last);
  });

  it('no-op si root sin focusables', () => {
    const empty = document.createElement('div');
    document.body.appendChild(empty);
    const e = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true });
    spyOn(e, 'preventDefault');
    trapTabKey(e, empty);
    expect(e.preventDefault).not.toHaveBeenCalled();
    empty.remove();
  });

  it('Tab en medio no preventDefault', () => {
    first.focus();
    const e = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true });
    Object.defineProperty(e, 'shiftKey', { value: false });
    spyOn(e, 'preventDefault');
    trapTabKey(e, root);
    expect(e.preventDefault).not.toHaveBeenCalled();
  });
});
