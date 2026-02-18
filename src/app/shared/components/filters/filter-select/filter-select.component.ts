import { Component, input } from '@angular/core';
import { FilterOptionDefaultComponent } from "../filter-option-default/filter-option-default.component";
import { FilterOptionHoverComponent } from "../filter-option-hover/filter-option-hover.component";
import { FilterOption } from '@utils/filters/filter.interfaces';

@Component({
  selector: 'app-filter-select',
  imports: [FilterOptionDefaultComponent, FilterOptionHoverComponent],
  templateUrl: './filter-select.component.html',
  styleUrl: './filter-select.component.scss'
})
export class FilterSelectComponent {

  filters = input<FilterOption[]>();

  
}