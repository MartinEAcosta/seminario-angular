import { Component, input } from '@angular/core';
import { FilterOption } from '@utils/filters/filter-options';
import { FilterOptionDefaultComponent } from "../filter-option-default/filter-option-default.component";

@Component({
  selector: 'app-filter-select',
  imports: [FilterOptionDefaultComponent],
  templateUrl: './filter-select.component.html',
  styleUrl: './filter-select.component.scss'
})
export class FilterSelectComponent {

  filters = input<FilterOption[]>();
  
}