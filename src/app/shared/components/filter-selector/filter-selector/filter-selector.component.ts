import { Component, input } from '@angular/core';

import { FilterOption } from '@utils/filter-options';
import { FilterDefaultComponent } from "@shared/components/filter-default/filter-default.component";

@Component({
  selector: 'app-filter-selector',
  imports: [FilterDefaultComponent],
  templateUrl: './filter-selector.component.html',
  styleUrl: './filter-selector.component.scss'
})
export class FilterSelectorComponent {

  filters = input<FilterOption[]>();

}
