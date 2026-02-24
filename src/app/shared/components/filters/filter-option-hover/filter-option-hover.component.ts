import { Component, inject, input } from '@angular/core';
import { Router } from '@angular/router';

import { FilterOptionDefault, FilterOptionHover } from '@utils/filters/filter.interfaces';

@Component({
  selector: 'app-filter-option-hover',
  templateUrl: './filter-option-hover.component.html',
  styleUrls: [ '../filter-option.component.scss' , './filter-option-hover.component.scss' ]
})
export class FilterOptionHoverComponent {

  private router = inject(Router);

  filter = input.required<FilterOptionHover>();

  constructor ( ) { }

  onClickFilterOption = ( filter : FilterOptionDefault ) => {
    console.log('disparo')

    this.router.navigate([ ] , { queryParams : { [ filter.key ] : filter.value} });
  }  


}
