import { paginasVisiblesWindow } from './paginas-visibles-window';

describe('paginasVisiblesWindow', () => {
  it('devuelve todas las páginas cuando total ≤ 5', () => {
    expect(paginasVisiblesWindow(1, 1)).toEqual([1]);
    expect(paginasVisiblesWindow(5, 3)).toEqual([1, 2, 3, 4, 5]);
  });

  it('ventana de inicio cuando actual ≤ 3 y total > 5', () => {
    expect(paginasVisiblesWindow(10, 1)).toEqual([1, 2, 3, 4, 5]);
    expect(paginasVisiblesWindow(10, 3)).toEqual([1, 2, 3, 4, 5]);
  });

  it('ventana intermedia cuando actual está lejos de los bordes', () => {
    expect(paginasVisiblesWindow(10, 5)).toEqual([3, 4, 5, 6, 7]);
    expect(paginasVisiblesWindow(20, 10)).toEqual([8, 9, 10, 11, 12]);
  });

  it('ventana de fin cuando actual ≥ total − 2', () => {
    expect(paginasVisiblesWindow(10, 8)).toEqual([6, 7, 8, 9, 10]);
    expect(paginasVisiblesWindow(10, 10)).toEqual([6, 7, 8, 9, 10]);
  });
});
