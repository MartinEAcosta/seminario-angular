import { Component, input, linkedSignal, output } from '@angular/core';
import { RouterLink } from "@angular/router";
import { FilterOption } from '@payment/filter-options';

@Component({
  selector: 'app-search-filter-bar',
  imports: [RouterLink],
  templateUrl: './search-filter-bar.component.html',
  styleUrl: './search-filter-bar.component.scss'
})
export class SearchFilterBarComponent {

  filters = input<FilterOption[]>();
  initialValue = input<string>();
  value = output<string>();

  inputValue = linkedSignal<string>( () => this.initialValue() ?? '');

  constructor() {}

}
