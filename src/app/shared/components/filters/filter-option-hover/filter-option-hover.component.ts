import { Component, inject, input } from '@angular/core';

import { SearchService } from '@shared/services/search/search.service';
import { FilterOptionDefault, FilterOptionHover } from '@utils/filters/filter.interfaces';

@Component({
  selector: 'app-filter-option-hover',
  templateUrl: './filter-option-hover.component.html',
  styleUrls: [ '../filter-option.component.scss' , './filter-option-hover.component.scss' ]
})
export class FilterOptionHoverComponent {

  private searchService = inject(SearchService);

  filter = input.required<FilterOptionHover>();

  constructor ( ) { }

  onClickFilterOption = ( filter : FilterOptionDefault ) => {
    // this.router.navigate([ ] , { queryParams : { [ filter.key ] : filter.value} });
    this.searchService.addFilter(filter.key! , filter.value!); 
  }  


}
