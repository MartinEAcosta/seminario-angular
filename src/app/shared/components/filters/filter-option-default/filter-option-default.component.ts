import { Component, inject, input } from '@angular/core';

import { SearchService } from '@shared/services/search/search.service';
import { FilterOptionDefault } from '@utils/filters/filter.interfaces';

@Component({
  selector: 'app-filter-option-default',
  templateUrl: './filter-option-default.component.html',
  styleUrl: '../filter-option.component.scss'
})
export class FilterOptionDefaultComponent {

  private searchService = inject(SearchService);

  filter = input.required<FilterOptionDefault>();

  constructor( ) {   }

  onClickFilterOption = ( ) => {
    this.searchService.addFilter(this.filter().key!, this.filter().value!);
  }

}
