import { Component, inject, input } from '@angular/core';
import { Router } from '@angular/router';

import { FilterOptionDefault } from '@utils/filters/filter.interfaces';

@Component({
  selector: 'app-filter-option-default',
  templateUrl: './filter-option-default.component.html',
  styleUrl: '../filter-option.component.scss'
})
export class FilterOptionDefaultComponent {

  private router = inject(Router);

  filter = input.required<FilterOptionDefault>();

  constructor( ) {   }

  onClickFilterOption = ( ) => {
    this.router.navigate( [] , { queryParams : { [  this.filter().key ] : this.filter().value } });
  }

}
