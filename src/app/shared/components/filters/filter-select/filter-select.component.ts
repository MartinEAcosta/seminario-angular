import { Component, inject, input, linkedSignal } from '@angular/core';
import { FilterOptionDefaultComponent } from "../filter-option-default/filter-option-default.component";
import { FilterOptionHoverComponent } from "../filter-option-hover/filter-option-hover.component";
import { FilterOption } from '@utils/filters/filter.interfaces';
import { SearchService } from '@shared/services/search/search.service';

@Component({
  selector: 'app-filter-select',
  imports: [FilterOptionDefaultComponent, FilterOptionHoverComponent],
  templateUrl: './filter-select.component.html',
  styleUrl: './filter-select.component.scss'
})
export class FilterSelectComponent {

  searchService = inject(SearchService);

  selectedFilters = linkedSignal(() => {
    const query = this.searchService.query();
    if ( !query ) return [];
    return Object.entries(query).map(([key, value]) => {
      if( !value ) return undefined;
      return { key , value };
    });
  });

  filters = input<FilterOption[]>();

  
}