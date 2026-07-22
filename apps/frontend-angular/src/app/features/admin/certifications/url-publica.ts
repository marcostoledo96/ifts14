/** Límite de visualización de la URL pública para no exponer el token completo. */
export const URL_PUBLICA_MAX = 60;
const URL_PUBLICA_SLICE = URL_PUBLICA_MAX - 3;

export function truncarUrl(url: string): string {
  return url.length <= URL_PUBLICA_MAX ? url : url.slice(0, URL_PUBLICA_SLICE) + '…';
}
