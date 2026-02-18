import { Component, input } from '@angular/core';
import { FilterOptionDefault, FilterOptionHover } from '@utils/filters/filter.interfaces';
import { RouterLink } from "@angular/router";

@Component({
  selector: 'app-filter-option-hover',
  imports: [RouterLink],
  templateUrl: './filter-option-hover.component.html',
  styleUrls: [ '../filter-option.component.scss' , './filter-option-hover.component.scss' ]
})
export class FilterOptionHoverComponent {

  filter = input.required<FilterOptionHover>();

  constructor ( ) { }

  onClickFilterOption = ( filter : FilterOptionDefault ) => {
      return { [ filter.key ] : filter.value};
  }  


}
