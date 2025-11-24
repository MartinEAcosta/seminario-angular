import { Component, input } from '@angular/core';

import { RouterLink } from "@angular/router";
import { FilterOption } from '@utils/filter-options';

@Component({
  selector: 'app-filter-default',
  imports: [RouterLink],
  templateUrl: './filter-default.component.html',
  styleUrl: './filter-default.component.scss'
})
export class FilterDefaultComponent {

  filter = input.required<FilterOption>();

  constructor( ) { }

  getQueryParam = (  )  => {
    return { [ this.filter().key ] : this.filter().value };
  }

}
