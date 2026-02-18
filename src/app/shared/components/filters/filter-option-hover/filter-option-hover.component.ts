import { Component, input } from '@angular/core';
import { FilterOptionHover } from '@utils/filters/filter.interfaces';

@Component({
  selector: 'app-filter-option-hover',
  imports: [],
  templateUrl: './filter-option-hover.component.html',
  styleUrls: [ '../filter-option.component.scss' , './filter-option-hover.component.scss' ]
})
export class FilterOptionHoverComponent {

  filter = input.required<FilterOptionHover>();

  constructor ( ) { }


}
