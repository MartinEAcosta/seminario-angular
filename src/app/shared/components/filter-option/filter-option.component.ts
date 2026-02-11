import { Component, input } from '@angular/core';

import { RouterLink } from "@angular/router";
import { FilterOption } from '@utils/filters/filter-options';

@Component({
  selector: 'app-filter-option',
  imports: [RouterLink],
  templateUrl: './filter-option.component.html',
  styleUrl: './filter-option.component.scss'
})
export class FilterOptionComponent {

  filter = input.required<FilterOption>();

  constructor( ) {   }

  onClickFilterOption = ( ) => {
    console.log(this.filter());
  }

}
