import { Component, input, linkedSignal, output } from '@angular/core';

@Component({
  selector: 'app-search-bar',
  templateUrl: './search-bar.component.html',
  styleUrl: './search-bar.component.scss',
  imports: [],
})
export class SearchBarComponent {

  initialValue = input<string>();
  value = output<string>();

  // El selector "Ordenar por" no aplica en todas las páginas que usan esta
  // barra (ej. "Tu biblioteca" no tiene nada que ordenar) — se muestra solo
  // cuando el consumidor lo pide explícitamente.
  showSort = input(false);

  inputValue = linkedSignal<string>(() => this.initialValue() ?? '');

  constructor() {  }

}
