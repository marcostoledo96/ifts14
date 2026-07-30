/** Páginas visibles en el pager numerado (máx. 5 botones + elipsis). */
export function paginasVisiblesWindow(total: number, actual: number): number[] {
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
  if (actual <= 3) return [1, 2, 3, 4, 5];
  if (actual >= total - 2) return [total - 4, total - 3, total - 2, total - 1, total];
  return [actual - 2, actual - 1, actual, actual + 1, actual + 2];
}
