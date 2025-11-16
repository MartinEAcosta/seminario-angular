import { inject, Injectable, linkedSignal, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';

export interface QueryParams {
  // Los nombres de los parametros los saco del contrato con el back.
  id_category?: string;
  minPrice?: string;
  maxPrice?: string;
  notFullyEnrolled?: string;
};

@Injectable({
  providedIn: 'root',
})
export class SearchService {
  private activatedRoute = inject(ActivatedRoute);

  textParam = this.activatedRoute.snapshot.queryParamMap.get('title') ?? '';
  // LinkedSignal es utilizado para crear una señal que esta vinculada exactamente a otro estado.
  // En vez de pasar un valor por default se toma el mismo de una función computada.
  textSearch = linkedSignal(() => this.textParam);

  query : Signal<QueryParams | undefined> = toSignal(
    this.activatedRoute.queryParamMap.pipe(
      map((params) => {
        return {
          id_category: params.get('id_category')
            ? params.get('id_category')!
            : undefined,
          minPrice: params.get('minPrice')
            ? params.get('minPrice')!
            : undefined,
          maxPrice: params.get('maxPrice')
            ? params.get('maxPrice')!
            : undefined,
          notFullyEnrolled: params.get('notFullyEnrolled')
            ? params.get('notFullyEnrolled')!
            : undefined,
        };
      }),
      map((params) => {
        if ( !params.id_category && !params.maxPrice && !params.minPrice && !params.notFullyEnrolled ) {
          return undefined;
        }
        return params;
      })
    )
  );

  constructor() {}

  // obtainQueryParams = () => {
  //   const queryParams =
  //   return queryParams;
  // };
}
