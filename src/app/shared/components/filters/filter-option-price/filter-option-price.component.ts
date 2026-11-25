import { Component, computed, inject, input } from '@angular/core';

import { SearchState } from '@shared/search/state/search-state';
import { FilterOptionCompound } from '@shared/search/models/filter.model';

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



}
