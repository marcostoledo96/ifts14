/** Selector canónico alineado al trap P6-05 (diálogos + drawer). */
export const FOCUSABLE_SEL =
  'a[href], button:not(:disabled), textarea, input, select, [tabindex]:not([tabindex="-1"])';

/** Focusables tabulables dentro de `root` (orden de documento). */
export function listFocusables(root: HTMLElement): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE_SEL));
}

/**
 * Atrapa Tab / Shift+Tab dentro de `root`.
 * No-op si root vacío o sin focusables.
 */
export function trapTabKey(e: KeyboardEvent, root: HTMLElement): void {
  const focusable = listFocusables(root);
  if (focusable.length === 0) return;

  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  const active = document.activeElement;

  if (e.shiftKey) {
    if (active === first || !root.contains(active)) {
      e.preventDefault();
      last.focus();
    }
  } else if (active === last) {
    e.preventDefault();
    first.focus();
  }
}
