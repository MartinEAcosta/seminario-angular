import { Component, input } from '@angular/core';

import { FilterOption } from '@utils/filters/filter.interfaces';
import { FilterOptionHoverComponent } from "../filter-option-hover/filter-option-hover.component";
import { FilterOptionPriceComponent } from "../filter-option-price/filter-option-price.component";

@Component({
  selector: 'app-filter-select',
  imports: [FilterOptionHoverComponent, FilterOptionPriceComponent],
  templateUrl: './filter-select.component.html',
  styleUrl: './filter-select.component.scss'
})
export class FilterSelectComponent {

  filters = input<FilterOption[]>();


}