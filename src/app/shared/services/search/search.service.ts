import { computed, inject, Injectable, linkedSignal, Signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { filter, map } from 'rxjs';
import { FilterOption } from '@utils/filters/filter.interfaces';
import { FilterOptions } from '@utils/filters/filter-options';
import { toSignal } from '@angular/core/rxjs-interop';

// Los nombres de los parametros los saco del contrato con el back.
export type QueryParams = {
  id_category?: string;
  minPrice?: string;
  maxPrice?: string;
  notFullyEnrolled?: string;
};

@Injectable({
  providedIn: 'root',
})
export class SearchService {
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);

  textParam = this.activatedRoute.snapshot.queryParamMap.get('title') ?? '';
  // LinkedSignal es utilizado para crear una señal que esta vinculada exactamente a otro estado.
  // En vez de pasar un valor por default se toma el mismo de una función computada.
  textSearch = linkedSignal(() => this.textParam);

  queryParams: Signal<QueryParams | undefined> = toSignal(
    this.activatedRoute.queryParamMap.pipe(
      map(
        (params) => {
          return {
            id_category: params.get('id_category') ?? undefined,
            minPrice: params.get('minPrice') ?? undefined,
            maxPrice: params.get('maxPrice') ?? undefined,
            notFullyEnrolled: params.get('notFullyEnrolled') ?? undefined,
          };
        },
      ),
    ),
    { initialValue : undefined }
  );


  selectedFilters : Signal<FilterOption[]> = computed(() => {
    const queryObject = this.queryParams();
    if (!queryObject) return [];

    const filters = Object.entries(queryObject);
    const selected: FilterOption[] = [];
    filters.forEach(([key, value]) => {
      const filter = FilterOptions.getFilters().find(
        (filter) => filter.key === key,
      );
      if (filter && value) {
        selected.push({
          ...filter,
        });
      }
    });
    return selected;
  });

  constructor() {}

  reset(): void {
    this.textSearch.set('');
    this.textParam = '';
  }

  addFilter(key: string, value: string): void {
    this.router.navigate([], {
      queryParams: {
        ...(this.queryParams() ?? {}),
        [key]: value,
      },
    });
  }

  removeFilter(key: string) {
    this.router.navigate([], {
      queryParams : {
        [key] : null
      },
      queryParamsHandling: 'merge'
    });
  }
}
