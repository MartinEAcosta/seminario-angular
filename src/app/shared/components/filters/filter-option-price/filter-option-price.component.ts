import { Component, computed, inject, input } from '@angular/core';

import { SearchService } from '@shared/services/search/search.service';
import { FilterOptionCompound } from '@utils/filters/filter.interfaces';

type PriceMode = 'all' | 'free' | 'paid';

// El filtro de precio (minPrice/maxPrice) nunca tuvo UI propia: FilterSelectComponent
// solo manejaba 'default'/'hover'. Esto es funcionalidad nueva, no un reestilado —
// un segmentado de 3 posiciones en vez de dos inputs numéricos sueltos.
@Component({
  selector: 'app-filter-option-price',
  templateUrl: './filter-option-price.component.html',
  styleUrl: './filter-option-price.component.scss'
})
export class FilterOptionPriceComponent {

  private searchService = inject(SearchService);

  filter = input.required<FilterOptionCompound>();

  private minKey = computed( () => this.filter().value.find( v => v.key.toLowerCase().includes('min') )?.key ?? 'minPrice' );
  private maxKey = computed( () => this.filter().value.find( v => v.key.toLowerCase().includes('max') )?.key ?? 'maxPrice' );

  mode = computed<PriceMode>( () => {
    const query = this.searchService.queryParams();
    if ( query?.maxPrice === '0' ) return 'free';
    if ( query?.minPrice ) return 'paid';
    return 'all';
  });

  setMode = ( mode : PriceMode ) : void => {
    const minKey = this.minKey();
    const maxKey = this.maxKey();

    // minPrice/maxPrice se tocan juntos: con addFilter/removeFilter
    // separados, la segunda navegación cancelaba a la primera antes de
    // aplicarse. setFilters hace los dos cambios en una sola navegación.
    if ( mode === 'all' ) {
      this.searchService.setFilters({ [minKey] : null , [maxKey] : null });
    }
    else if ( mode === 'free' ) {
      this.searchService.setFilters({ [minKey] : null , [maxKey] : '0' });
    }
    else {
      this.searchService.setFilters({ [minKey] : '1' , [maxKey] : null });
    }
  }

}
