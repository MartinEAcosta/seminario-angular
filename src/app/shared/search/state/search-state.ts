import { computed, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { QueryParamsMapper } from '@mappers/query-params.mapper';


export abstract class SearchState<T extends { page : number }>{

  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private params = toSignal( this.route.queryParamMap , { requireSync : true } )

  constructor( private mapper: QueryParamsMapper<T> ) { }

  query = computed(() => this.mapper.fromQueryParams(this.params()));

  patch(changes: Partial<T>): void {
    const next = { ...this.query(), page: 1, ...changes };
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: this.mapper.toQueryParams(next),
      replaceUrl: true,
    });
  }
}
