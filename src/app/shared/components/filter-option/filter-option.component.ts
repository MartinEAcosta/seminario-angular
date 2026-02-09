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

  ngOnInit( ) : void {
    console.log(this.filter());
  }

  // getQueryParam = (  )  => {
    // return { [ this.filter().key ] : this.filter().value };
  // }

  onClickFilterOption = ( ) => {
    console.log(this.filter());
  }

}
