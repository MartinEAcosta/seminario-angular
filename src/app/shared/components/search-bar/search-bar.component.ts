import { Component, inject, input, linkedSignal, output } from '@angular/core';

import { SearchService } from '@shared/services/search/search.service';
import { SelectedFiltersComponent } from "../filters/selected-filters/selected-filters.component";

@Component({
  selector: 'app-search-bar',
  templateUrl: './search-bar.component.html',
  styleUrl: './search-bar.component.scss',
  imports: [SelectedFiltersComponent],
})
export class SearchBarComponent {

  initialValue = input<string>();
  value = output<string>();

  inputValue = linkedSignal<string>(() => this.initialValue() ?? '');

  constructor() {}
  
}
