import { Component } from '@angular/core';

// Pasó de "hover revela lista anidada" a una fila de pills siempre visible
// (el mockup no tiene desplegables) — mismo wiring a SearchState, solo
// cambia cómo se presenta. Cada opción se delega en FilterOptionDefaultComponent
// (misma pill que usa cualquier filtro 'default' suelto) en vez de duplicar su
// lógica acá.
@Component({
  selector: 'app-filter-option-hover',
  imports: [  ],
  templateUrl: './filter-option-hover.component.html',
  styleUrls: [ '../filter-option.component.scss' , './filter-option-hover.component.scss' ]
})
export class FilterOptionHoverComponent {



}
