import { Component, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import { SearchService } from '@shared/services/search/search.service';

import { FilterOptionDefault } from '@utils/filters/filter.interfaces';

@Component({
  selector: 'app-filter-option-default',
  templateUrl: './filter-option-default.component.html',
  styleUrl: '../filter-option.component.scss'
})
export class FilterOptionDefaultComponent {

  private router = inject(Router);
  private searchService = inject(SearchService);

  filter = input.required<FilterOptionDefault>();

  constructor( ) {   }

  onClickFilterOption = ( ) => {
    console.log(this.searchService.query());
    // this.router.navigate( [] , { queryParams : { [  this.filter().key ] : this.filter().value } });
    this.searchService.addFilter(this.filter().key!, this.filter().value!);
  }

}
