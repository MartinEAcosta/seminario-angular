import { Component, input, linkedSignal, output } from '@angular/core';

@Component({
  selector: 'app-search-bar',
  templateUrl: './search-bar.component.html',
  styleUrl: './search-bar.component.scss',
})
export class SearchBarComponent {

  initialValue = input<string>();
  value = output<string>();

  inputValue = linkedSignal<string>( () => this.initialValue() ?? '');

  constructor() {}

}
