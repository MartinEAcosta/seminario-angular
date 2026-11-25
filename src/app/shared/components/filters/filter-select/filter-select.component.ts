import { Component, input } from '@angular/core';

import { FilterOption } from '@shared/search/models/filter.model';

@Component({
  selector: 'app-filter-select',
  imports: [],
  templateUrl: './filter-select.component.html',
  styleUrl: './filter-select.component.scss'
})
export class FilterSelectComponent {

  filters = input<FilterOption[]>();


}