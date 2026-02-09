import { Component, input } from '@angular/core';

import { FilterOptionComponent } from "@shared/components/filter-option/filter-option.component";
import { FilterOption } from '@utils/filters/filter-options';

@Component({
  selector: 'app-filter-selector',
  imports: [ FilterOptionComponent],
  templateUrl: './filter-selector.component.html',
  styleUrl: './filter-selector.component.scss'
})
export class FilterSelectorComponent {

  filters = input<FilterOption[]>();
  
}
