import { Component, input, linkedSignal, output } from '@angular/core';
import { FilterOption } from '@payment/filter-options';
import { FilterSelectorComponent } from "../filter-selector/filter-selector/filter-selector.component";

@Component({
  selector: 'app-search-bar',
  templateUrl: './search-bar.component.html',
  styleUrl: './search-bar.component.scss',
  imports: [FilterSelectorComponent]
})
export class SearchBarComponent {

  filters = input<FilterOption[]>();
  initialValue = input<string>();
  value = output<string>();

  inputValue = linkedSignal<string>( () => this.initialValue() ?? '');

  constructor() {}

}
