import { Component, computed, inject, input } from '@angular/core';

import { QueryParams, SearchService } from '@shared/services/search/search.service';
import { FilterOptionHover } from '@utils/filters/filter.interfaces';
import { FilterOptionDefaultComponent } from '../filter-option-default/filter-option-default.component';

// Pasó de "hover revela lista anidada" a una fila de pills siempre visible
// (el mockup no tiene desplegables) — mismo wiring a SearchService, solo
// cambia cómo se presenta. Cada opción se delega en FilterOptionDefaultComponent
// (misma pill que usa cualquier filtro 'default' suelto) en vez de duplicar su
// lógica acá.
@Component({
  selector: 'app-filter-option-hover',
  imports: [ FilterOptionDefaultComponent ],
  templateUrl: './filter-option-hover.component.html',
  styleUrls: [ '../filter-option.component.scss' , './filter-option-hover.component.scss' ]
})
export class FilterOptionHoverComponent {

  private searchService = inject(SearchService);

  filter = input.required<FilterOptionHover>();

  // Las opciones hijas comparten todas la misma key (ej. 'id_category'); se
  // toma de la primera para saber qué limpiar con la pill "Todas".
  private groupKey = computed( () => this.filter().value?.[0]?.key );

  isAllActive = computed( () => {
    const key = this.groupKey() as keyof QueryParams | undefined;
    return !key || !this.searchService.queryParams()?.[key];
  });

  onClickAll = ( ) => {
    const key = this.groupKey();
    if ( key ) this.searchService.removeFilter( key );
  }

}
