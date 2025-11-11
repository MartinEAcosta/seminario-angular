import { Component, input, linkedSignal, output } from '@angular/core';

@Component({
  selector: 'app-search-filter-bar',
  imports: [],
  templateUrl: './search-filter-bar.component.html',
  styleUrl: './search-filter-bar.component.scss'
})
export class SearchFilterBarComponent {

  initialValue = input<string>();
  
  value = output<string>();

  inputValue = linkedSignal<string>( () => this.initialValue() ?? '');

}
