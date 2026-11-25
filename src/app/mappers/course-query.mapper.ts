import { ParamMap, Params } from "@angular/router";
import { CourseSearchQuery } from "@shared/search/models/course-search.model";

// Mismos nombres que espera el backend en `GET courses`, así la URL del
// navegador y el request hablan el mismo vocabulario. Verificado contra el
// backend: `priceMin`/`priceMax` filtran, `minPrice`/`maxPrice` se ignoran
// en silencio y devuelven el catálogo entero.
const URL_KEYS = {
  title: 'title',
  id_category: 'id_category',
  minPrice: 'priceMin',
  maxPrice: 'priceMax',
  onlyWithSpots: 'notFullyEnrolled',
  page: 'page',
  limit: 'limit',
} as const;

// Mismo default que aplica el backend cuando no recibe `limit`.
export const DEFAULT_PAGE_SIZE = 10;
// El backend valida `1 <= limit <= 100` y responde 400 fuera de ese rango
// ("El límite debe estar entre 1 y 100."). 
export const MAX_PAGE_SIZE = 100;

const toNumber = (v: string | null): number | undefined =>
  v === null || v.trim() === '' || isNaN(+v) ? undefined : +v;

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

export class CourseQueryMapper{

    static fromQueryParams ( params : ParamMap ) : CourseSearchQuery {
        const min = toNumber(params.get(URL_KEYS.minPrice));
        const max = toNumber(params.get(URL_KEYS.maxPrice));
        return {
                title: params.get(URL_KEYS.title) || undefined,
                categoryId: params.get(URL_KEYS.id_category) || undefined,
                price: min === undefined && max === undefined ? undefined : { min, max },
                onlyWithSpots: params.get(URL_KEYS.onlyWithSpots) === 'true',
                page: Math.max(1, toNumber(params.get(URL_KEYS.page)) ?? 1),
                limit: clamp(toNumber(params.get(URL_KEYS.limit)) ?? DEFAULT_PAGE_SIZE, 1, MAX_PAGE_SIZE),
        }
    }

    // Solo para `router.navigate`: ahí Angular descarta las claves en
    // `undefined` y las saca de la URL. No sirve para armar un request —
    // `HttpParams` las serializa como el string "undefined" (ver
    // `toRequestParams`).
    static toQueryParams ( query : CourseSearchQuery ) : Params  {
        return {
            [URL_KEYS.title]: query.title || undefined,
            [URL_KEYS.id_category]: query.categoryId,
            [URL_KEYS.minPrice]: query.price?.min,
            [URL_KEYS.maxPrice]: query.price?.max,
            [URL_KEYS.onlyWithSpots]: query.onlyWithSpots || undefined,
            [URL_KEYS.page]: query.page > 1 ? query.page : undefined,
            [URL_KEYS.limit]: query.limit !== DEFAULT_PAGE_SIZE ? query.limit : undefined,
        };
    }

  // Para el request HTTP: cada clave se omite si no tiene valor, porque
  // `HttpParams` hace `String(value)` y mandaría `title=undefined`, que el
  // backend toma como filtro real (devuelve 0 cursos) — y con
  // `notFullyEnrolled=undefined` responde 400. La paginación viaja como
  // `current_page`, no como `page`.
  static toRequestParams(query: CourseSearchQuery): Record<string, string | number> {
    return {
      current_page: Math.max(1, query.page),
      limit: clamp(query.limit, 1, MAX_PAGE_SIZE),
      ...(query.title && { [URL_KEYS.title]: query.title.toLowerCase().trim() }),
      ...(query.categoryId && { [URL_KEYS.id_category]: query.categoryId }),
      ...(query.price?.min !== undefined && { [URL_KEYS.minPrice]: query.price.min }),
      ...(query.price?.max !== undefined && { [URL_KEYS.maxPrice]: query.price.max }),
      ...(query.onlyWithSpots && { [URL_KEYS.onlyWithSpots]: 'true' }),
    };
  }

}
