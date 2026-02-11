import { Component, input } from '@angular/core';

import { RouterLink } from "@angular/router";
import { FilterOptionDefault } from '@utils/filters/filter-options';

@Component({
  selector: 'app-filter-option-default',
  imports: [RouterLink],
  templateUrl: './filter-option-default.component.html',
  styleUrl: './filter-option-default.component.scss'
})
export class FilterOptionDefaultComponent {

  filter = input.required<FilterOptionDefault>();

  constructor( ) {   }

  onClickFilterOption = ( ) => {
    return { [  this.filter().key ] : this.filter().value};
  }

}
